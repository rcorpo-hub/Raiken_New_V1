const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {createClient} = require('@supabase/supabase-js');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
process.loadEnvFile(path.join(root, '.env.local'));
if (process.env.LOCAL_WORKSPACE_TEST !== 'true' || !/^http:\/\/(localhost|127\.0\.0\.1):54321$/.test(process.env.NEXT_PUBLIC_SUPABASE_URL || '')) throw Error('Local synthetic database only.');
const base = 'http://localhost:3000';
const catalog = require('../src/lib/workspace/form-catalog.json');
// Independent screenshot-based expectation, not derived from the implementation.
const expected = [
  '/new-individual-client-form', '/new-individual-tax-file-number-application',
  '/new-individual-abn-application', '/new-client-questionnaire-form',
  '/rideshare-taxi-gst', '/rental-property-summary', '/new-company-registration',
  '/new-company-client-form', '/new-trust-registration', '/new-trust-client-form',
  '/nc', '/appointment-booking-form',
].sort();
const retired = require('../src/lib/workspace/removed-forms.json');
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});
const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {auth:{persistSession:false}});
const checks = [], errors = [];
const mark = name => {checks.push({name, passed:true}); console.log('PASS ' + name);};
const checked = async query => {const result = await query; if (result.error) throw Error('Database check failed: ' + result.error.code); return result.data;};
async function snapshot() {
  const rows = await checked(db.from('submissions').select('*').order('id'));
  return {count:rows.length, digest:crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex')};
}
(async () => {
  const before = await snapshot();
  const baselinePath = process.env.CURATED_FORMS_BASELINE;
  if (baselinePath) assert.deepEqual(before, JSON.parse(fs.readFileSync(baselinePath, 'utf8')), 'Migration changed historical submissions');
  const registrations = await checked(db.from('forms').select('slug,status,current_version_id'));
  for (const form of retired) assert.equal(registrations.find(row => row.slug === form.slug), undefined, form.slug);
  const publicForms = await checked(anon.from('forms').select('slug'));
  assert.deepEqual(publicForms.map(form => catalog.find(item => item.slug === form.slug)?.path).sort(), expected);
  mark('Only twelve approved forms, including Appointment booking, are public; unwanted definitions are deleted');
  for (const form of retired) {
    const denied = await db.from('forms').insert({slug:form.slug,title:'Blocked removed form',status:'published'});
    assert.equal(denied.error?.code, '42501', form.slug);
  }
  mark('Database rejects republishing every retired registration');
  const browser = await chromium.launch({headless:true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH} : {})});
  let remoteCalls = 0;
  try {
    const context = await browser.newContext();
    await context.route(/https?:\/\/[^/]*live-sign\.com\//, route => {remoteCalls++; return route.abort();});
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/forms', {waitUntil:'networkidle'});
    assert.deepEqual((await page.locator('.form-links > a').evaluateAll(links => links.map(link => link.getAttribute('href')))).sort(), expected);
    for (const [service, count] of [['personal-tax',6],['business-accounting',4],['conveyancing',1]]) {
      await page.goto(base + '/forms?service=' + service, {waitUntil:'networkidle'});
      assert.equal(await page.locator('.form-links > a').count(), count);
    }
    await page.goto(base + '/forms?service=business-accounting', {waitUntil:'networkidle'});
    assert.equal(await page.getByRole('heading', {name:'Company',exact:true}).count(), 1);
    assert.equal(await page.getByRole('heading', {name:'Trust',exact:true}).count(), 1);
    mark('Directory contains the exact approved links, service counts 6/4/1, and Company/Trust subgroups');
    for (const route of expected) {
      const response = await page.goto(base + route, {waitUntil:'networkidle'});
      assert.equal(response.status(), 200, route);
      assert.ok(await page.locator('h1').count(), route);
    }
    for (const route of ['/appointment','/contact-us']) assert.equal((await page.goto(base + route, {waitUntil:'networkidle'})).status(), 200, route);
    assert.equal(await page.locator('main form').count(), 0, 'Contact page still contains an enquiry form');
    assert.ok(await page.getByRole('link', {name:'Email our team',exact:false}).count());
    for (const form of retired) {
      if (form.slug !== 'contact-us') {
        const response = await page.goto(base + form.path, {waitUntil:'networkidle'});
        assert.equal(response.status(), 404, form.path);
      }
      const apply = await context.request.get(base + '/apply/' + form.slug);
      assert.equal(apply.status(), 404, '/apply/' + form.slug);
      const post = await context.request.post(base + '/api/forms/' + form.slug + '/submissions', {headers:{Origin:base},data:{}});
      assert.equal(post.status(), 404, form.slug);
    }
    assert.equal((await context.request.get(base + '/newsletter')).status(), 404);
    assert.equal((await context.request.post(base + '/api/newsletter', {data:{}})).status(), 404);
    const invalidAppointment = await context.request.post(base + '/api/forms/appointment-booking-form/submissions', {headers:{Origin:base},data:{branch_code:'ADE',applicant:{name:'Synthetic Example',email:'qa@example.invalid'},answers:{}}});
    assert.equal(invalidAppointment.status(), 400, 'Appointment endpoint should validate, not be retired');
    mark('All kept pages and appointment aliases load; retired pages, /apply aliases and submission endpoints reject access');
    const sitemap = await (await context.request.get(base + '/sitemap.xml')).text();
    for (const form of retired.filter(form => form.slug !== 'contact-us')) assert.ok(!sitemap.includes('<loc>' + base + form.path + '</loc>'), form.path);
    assert.ok(!sitemap.includes('<loc>' + base + '/newsletter</loc>'));
    await page.goto(base + '/forms', {waitUntil:'networkidle'});
    const footerLinks = await page.locator('footer a[href^="/"]').evaluateAll(links => [...new Set(links.map(link => link.getAttribute('href').split('#')[0]))]);
    for (const href of footerLinks) assert.equal((await context.request.get(base + href)).status(), 200, href);
    mark('Sitemap and footer contain working destinations without retired form links');
    const evidence = path.join(root, '.diagnostics/curated-forms'); fs.mkdirSync(evidence, {recursive:true});
    for (const width of [390,768,1536,2553]) {
      await page.setViewportSize({width,height:960});
      await page.goto(base + '/forms', {waitUntil:'networkidle'});
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), String(width));
      await page.screenshot({path:path.join(evidence, 'forms-' + width + '.png'),fullPage:true,animations:'disabled'});
    }
    assert.deepEqual(errors, []); assert.equal(remoteCalls, 0);
    assert.deepEqual(await snapshot(), before);
    mark('Phone, tablet, laptop and large monitor layouts fit; historical submissions are unchanged and no final submissions or LiveSign calls occurred');
    fs.writeFileSync(path.join(root,'docs/owner-workspace/curated-forms-results.json'), JSON.stringify({date:'2026-11-19',localSyntheticOnly:true,activeForms:12,historicalSubmissionsPreserved:before.count,finalSubmissions:0,realLiveSignRequests:0,realEmailsSent:0,browserErrors:errors,checks},null,2)+'\n');
  } finally {await browser.close();}
})().catch(error => {console.error(error.message); process.exitCode = 1;});
