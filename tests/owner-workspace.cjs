const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const crypto=require('node:crypto');const {createRequire}=require('node:module');
const repo=path.resolve(__dirname,'..');
const requireRepo=createRequire(path.join(repo,'package.json'));
const {createClient}=requireRepo('@supabase/supabase-js');const {createServerClient}=requireRepo('@supabase/ssr');
const {chromium}=require('playwright');
process.loadEnvFile(path.join(repo,'.env.local'));
if(process.env.LOCAL_WORKSPACE_TEST!=='true'||!/^http:\/\/(127\.0\.0\.1|localhost):54321$/.test(process.env.NEXT_PUBLIC_SUPABASE_URL||''))throw new Error('This test is restricted to the local synthetic database.');
const fixturePath=process.env.OWNER_WORKSPACE_FIXTURES||path.join(repo,'.diagnostics/owner-workspace-fixtures.json');
const fixtures=JSON.parse(fs.readFileSync(fixturePath,'utf8'));const base='http://localhost:3000';
const evidence=path.join(repo,'.diagnostics/workspace-evidence');fs.mkdirSync(evidence,{recursive:true});
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const anonKey=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service=createClient(url,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const anonymous=createClient(url,anonKey,{auth:{persistSession:false,autoRefreshToken:false}});
const result={checks:[],pageErrors:[],passed:false};const mark=(name,details)=>{result.checks.push({name,passed:true,details});console.log('PASS '+name);};
const checked=async promise=>{const response=await promise;if(response.error)throw new Error(`Database operation failed (${response.error.code}): ${response.error.message}`);return response.data;};
function totp(secret){let bits='';for(const char of secret.toUpperCase().replace(/=+$/,'')){const index='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.indexOf(char);if(index<0)throw new Error('Invalid test authenticator secret');bits+=index.toString(2).padStart(5,'0');}const key=Buffer.from(bits.match(/.{8}/g).map(byte=>parseInt(byte,2)));const counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(Math.floor(Date.now()/30000)));const digest=crypto.createHmac('sha1',key).update(counter).digest();const offset=digest[digest.length-1]&15;return ((digest.readUInt32BE(offset)&0x7fffffff)%1000000).toString().padStart(6,'0');}
const saveFixtures=()=>fs.writeFileSync(fixturePath,JSON.stringify(fixtures));
async function signedIn(name,mfa=true){const record=fixtures[name];const db=createClient(url,anonKey,{auth:{persistSession:false,autoRefreshToken:false}});await checked(db.auth.signInWithPassword({email:record.email,password:record.password}));if(mfa){const {data:factors}=await db.auth.mfa.listFactors();let factor=factors.totp.find(factor=>factor.status==='verified');if(!factor||!record.secret){for(const f of factors.all)await db.auth.mfa.unenroll({factorId:f.id});const {data,error}=await db.auth.mfa.enroll({factorType:'totp',friendlyName:'Synthetic verification'});if(error)throw error;record.secret=data.totp.secret;record.factorId=data.id;saveFixtures();factor={id:data.id};}await checked(db.auth.mfa.challengeAndVerify({factorId:factor.id,code:totp(record.secret)}));}return db;}
function decrypt(record,cipher='answers_ciphertext',aad=`${record.form_version_id}:${record.reference}`){const meta=record.encryption_meta;const decipher=crypto.createDecipheriv('aes-256-gcm',Buffer.from(process.env.ENCRYPTION_MASTER_KEY,'hex'),Buffer.from(meta.iv,'base64'));decipher.setAAD(Buffer.from(aad));decipher.setAuthTag(Buffer.from(meta.tag,'base64'));return JSON.parse(Buffer.concat([decipher.update(Buffer.from(record[cipher].replace(/^\\x/,''),'hex')),decipher.final()]).toString());}
const post=async(context,path,body)=>context.post(base+path,{headers:{Origin:base,'Content-Type':'application/json'},data:body,timeout:30000});

(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1536,height:960}});const page=await context.newPage();page.on('pageerror',error=>result.pageErrors.push(error.message));
 const stamp=Date.now().toString(36);let owner;let customForm;let customPage;const created=[];
 try{
  await checked(service.from('rate_limit_buckets').delete().neq('key_hash','never-a-real-key'));
  const anonRead=await anonymous.from('submissions').select('*');assert.ok(anonRead.error||anonRead.data.length===0);
  const anonDraft=await anonymous.from('content_items').select('draft_blocks');assert.ok(anonDraft.error);
  const anonCommand=await anonymous.rpc('bootstrap_workspace_owner',{target:fixtures.outsider.id});assert.ok(anonCommand.error);
  const signup=await anonymous.auth.signUp({email:`not-allowed-${stamp}@example.test`,password:crypto.randomBytes(20).toString('hex')});assert.ok(signup.error);
  mark('Anonymous business-data reads, draft access, owner bootstrap and public signup are denied');
  await page.goto(base+'/admin',{waitUntil:'networkidle'});await page.waitForURL('**/admin/login');
  await page.getByLabel('Email address',{exact:true}).fill(fixtures.owner.email);await page.getByLabel('Password',{exact:true}).fill(fixtures.owner.password);await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.waitForURL('**/admin/security');
  const noMfa=await post(context.request,'/api/admin/records',{module:'submissions'});assert.equal(noMfa.status(),403);
  const enrollment=page.waitForResponse(response=>response.url().endsWith('/api/admin/auth')&&response.request().postDataJSON()?.action==='enroll');await page.getByRole('button',{name:'Set up or verify authenticator',exact:true}).click();const setup=await (await enrollment).json();
  if(setup.setupKey){fixtures.owner.secret=setup.setupKey;fixtures.owner.factorId=setup.factorId;saveFixtures();}
  assert.ok(fixtures.owner.secret);await page.getByLabel('Authenticator code',{exact:true}).fill(totp(fixtures.owner.secret));await page.getByRole('button',{name:'Verify and continue',exact:true}).click();await page.waitForURL(base+'/admin',{timeout:30000});await page.getByRole('heading',{name:'A clear view of your day.',exact:true}).waitFor();
  assert.match(await page.locator('body').innerText(),/Local test workspace/);
  const cookieValues=(await context.cookies()).map(({name,value})=>({name,value}));const serverSession=createServerClient(url,anonKey,{cookies:{getAll:()=>cookieValues,setAll:()=>{}}});const {data:{session}}=await serverSession.auth.getSession();assert.ok(session);owner=createClient(url,anonKey,{auth:{persistSession:false,autoRefreshToken:false}});await checked(owner.auth.setSession({access_token:session.access_token,refresh_token:session.refresh_token}));
  mark('Actual owner sign-in, MFA enrollment/verification and server-rendered dashboard; aal1 data access denied');
  const offices=await checked(service.from('branches').select('id,code'));const ade=offices.find(office=>office.code==='ADE').id;const bne=offices.find(office=>office.code==='BNE').id;
  await checked(owner.rpc('admin_set_staff_access',{target:fixtures.staff.id,grants:['dashboard.read','submissions.read','submissions.review','customers.read','bookings.read','documents.read'],branch_ids:[ade],enabled:true}));
  await checked(owner.rpc('admin_set_staff_access',{target:fixtures.editor.id,grants:['dashboard.read','content.edit'],branch_ids:[],enabled:true}));
  const staff=await signedIn('staff');const editor=await signedIn('editor');const outsider=await signedIn('outsider',false);
  await outsider.auth.updateUser({data:{role:'owner',permissions:['submissions.read']}});assert.equal((await outsider.rpc('current_admin_access')).data,null);
  const selfGrant=await staff.rpc('admin_set_staff_access',{target:fixtures.staff.id,grants:['users.manage'],branch_ids:[ade],enabled:true});assert.ok(selfGrant.error);
  mark('Staff branch/permission grants work; self-promotion and editable Auth metadata cannot grant owner access');
  const appointment={branch_code:'ADE',applicant:{name:'Synthetic Ada Example',email:'ada.qa@example.test',phone:'0400000000'},answers:{name:'Synthetic Ada Example',email:'ada.qa@example.test',phone:'0400000000',service:'Conveyancing Consultation',format:'online',preferredDate:'2027-01-20',preferredTimeSlot:'morning',notes:'Synthetic verification message'},idempotency_key:crypto.randomUUID()};
  const first=await post(context.request,'/api/forms/appointment-booking-form/submissions',appointment);assert.equal(first.status(),200);const accepted=await first.json();assert.ok(accepted.reference);created.push(accepted.submission_id);
  const duplicates=await Promise.all(Array.from({length:8},()=>post(context.request,'/api/forms/appointment-booking-form/submissions',appointment)));const duplicateBodies=await Promise.all(duplicates.map(async response=>{assert.equal(response.status(),200);return response.json();}));assert.ok(duplicateBodies.every(item=>item.reference===accepted.reference&&item.submission_id===accepted.submission_id));
  const conflict=await post(context.request,'/api/forms/appointment-booking-form/submissions',{...appointment,answers:{...appointment.answers,notes:'Different information'}});assert.equal(conflict.status(),409);
  const stored=await checked(service.from('submissions').select('*').eq('id',accepted.submission_id).single());assert.equal(stored.answers_json,null);assert.equal(decrypt(stored).notes,appointment.answers.notes);assert.ok(!JSON.stringify(stored.answers_ciphertext).includes('Synthetic'));
  const unchanged=await service.from('submissions').update({answers_json:{tampered:true}}).eq('id',stored.id);assert.ok(unchanged.error);
  const originalCipher=stored.answers_ciphertext;
  mark('Durable encrypted intake, concurrent retry deduplication, conflict rejection and immutable originals');
  const second=await post(context.request,'/api/forms/appointment-booking-form/submissions',{...appointment,branch_code:'BNE',idempotency_key:crypto.randomUUID()});assert.equal(second.status(),200);const bneSubmission=await second.json();created.push(bneSubmission.submission_id);
  const staffRows=await checked(staff.from('submissions').select('id,branch_id'));assert.ok(staffRows.some(row=>row.id===stored.id));assert.ok(staffRows.every(row=>row.branch_id===ade));assert.ok(!staffRows.some(row=>row.id===bneSubmission.submission_id));
  const crossOffice=await staff.rpc('admin_review_submission',{target:bneSubmission.submission_id,expected_revision:1,new_status:'under_review',note:'Not allowed'});assert.ok(crossOffice.error);
  const editorRows=await editor.from('submissions').select('id');assert.ok(editorRows.error||editorRows.data.length===0);
  mark('Direct REST/RPC checks enforce cross-office denial and keep submission data away from content editors');
  const documentKey=`qa/${stamp}/synthetic.pdf`;const pdf=Buffer.from('%PDF-1.4\n% Synthetic verification fixture only\n%%EOF');
  await checked(service.storage.from('verified-documents').upload(documentKey,pdf,{contentType:'application/pdf'}));
  const file=await checked(service.from('file_objects').insert({bucket:'verified-documents',object_key:documentKey,original_name:'Synthetic fixture.pdf',declared_mime:'application/pdf',bytes:pdf.length}).select('id,scan_status').single());
  assert.equal(file.scan_status,'pending');await checked(service.from('submission_files').insert({submission_id:stored.id,file_id:file.id,field_key:'qa_attachment'}));
  const pendingDownload=await post(context.request,'/api/admin/document',{id:file.id});assert.equal(pendingDownload.status(),409);
  const directObject=await anonymous.storage.from('verified-documents').download(documentKey);assert.ok(directObject.error);
  await checked(service.from('file_objects').update({scan_status:'clean'}).eq('id',file.id));
  assert.equal((await post(context.request,'/api/admin/document',{id:file.id})).status(),409);
  // Local QA metadata exercises the verified path; this does not run or represent a malware scanner.
  await checked(service.from('file_objects').update({scan_status:'clean',verified_mime:'application/pdf',scan_engine:'synthetic-local-qa-only',scanned_at:new Date().toISOString()}).eq('id',file.id));
  const permittedDownload=await post(context.request,'/api/admin/document',{id:file.id});assert.equal(permittedDownload.status(),200);
  const downloaded=await context.request.get((await permittedDownload.json()).url);assert.equal(downloaded.status(),200);assert.equal((await downloaded.body()).toString(),pdf.toString());
  assert.ok((await checked(service.from('audit_events').select('id').eq('entity_id',file.id).eq('action','document.download_authorized'))).length);
  await checked(service.from('submission_files').delete().eq('file_id',file.id));await checked(service.from('submission_files').insert({submission_id:bneSubmission.submission_id,file_id:file.id,field_key:'qa_attachment'}));
  const staffFiles=await checked(staff.from('file_objects').select('id').eq('id',file.id));assert.equal(staffFiles.length,0);
  assert.ok((await staff.rpc('admin_record_access',{kind:'document.download_authorized',target:file.id,reason:''})).error);
  await checked(service.from('submission_files').delete().eq('file_id',file.id));await checked(service.from('file_objects').delete().eq('id',file.id));await checked(service.storage.from('verified-documents').remove([documentKey]));
  mark('Pending and unverified files are blocked; private verified fixture downloads are audited and cross-office access is denied');

  const correction={...appointment.answers,notes:'Corrected synthetic message'};
   const blocked=await post(context.request,'/api/admin/command',{action:'review',id:stored.id,revision:1,status:'under_review',note:'Synthetic blocked answer edit.',correction});assert.equal(blocked.status(),400);
   const reviewed=await post(context.request,'/api/admin/command',{action:'review',id:stored.id,revision:1,status:'under_review',note:'Synthetic review without editing answers.'});assert.equal(reviewed.status(),200);
  const stale=await post(context.request,'/api/admin/command',{action:'review',id:stored.id,revision:1,status:'processed',note:'Stale attempt'});assert.equal(stale.status(),409);
  const correctedStored=await checked(service.from('submissions').select('*').eq('id',stored.id).single());assert.equal(correctedStored.answers_ciphertext,originalCipher);assert.equal(correctedStored.revision,2);
   const history=await checked(service.from('submission_corrections').select('*').eq('submission_id',stored.id));assert.equal(history.length,0);
   await page.goto(base+'/admin/submissions/'+stored.id,{waitUntil:'networkidle'});assert.ok((await page.locator('input[readonly],textarea[readonly]').evaluateAll(fields=>fields.map(field=>field.value))).includes('Synthetic verification message'));
  mark('Owner answer edits are blocked; review notes/statuses work, stale writes fail and original encrypted answers remain unchanged');
  const {data:home}=await service.from('content_items').select('id,revision,published_revision_id').eq('path','/').single();const {data:homeVersion}=await service.from('content_revisions').select('blocks').eq('id',home.published_revision_id).single();
  const draftData={...homeVersion.blocks,headline1:'QA draft must stay private.'};
  await checked(editor.rpc('admin_save_content',{target:home.id,expected_revision:home.revision,document:draftData,metadata:{},publish:false}));
  const liveBefore=await context.request.get(base+'/');assert.ok(!(await liveBefore.text()).includes('QA draft must stay private.'));
  const deniedPublish=await editor.rpc('admin_save_content',{target:home.id,expected_revision:home.revision+1,document:draftData,metadata:{},publish:true});assert.ok(deniedPublish.error);
  await checked(owner.rpc('admin_save_content',{target:home.id,expected_revision:home.revision+1,document:homeVersion.blocks,metadata:{},publish:false}));
  mark('Content editor can save a private draft but cannot publish it; public site never exposes draft text');
  await checked(owner.rpc('admin_set_staff_access',{target:fixtures.editor.id,grants:['content.edit'],branch_ids:[],enabled:true}));
  const {data:{session:editorSession}}=await editor.auth.getSession();const editorCookies=new Map();
  const editorSsr=createServerClient(url,anonKey,{cookies:{getAll:()=>Array.from(editorCookies,([name,value])=>({name,value})),setAll:values=>values.forEach(({name,value})=>editorCookies.set(name,value))}});
  await checked(editorSsr.auth.setSession({access_token:editorSession.access_token,refresh_token:editorSession.refresh_token}));
  const editorContext=await browser.newContext();await editorContext.addCookies(Array.from(editorCookies,([name,value])=>({name,value,domain:'localhost',path:'/',sameSite:'Lax'})));
  const editorPage=await editorContext.newPage();await editorPage.goto(base+'/admin',{waitUntil:'networkidle'});await editorPage.waitForURL('**/admin/content');
  await editorPage.goto(base+'/admin/security',{waitUntil:'networkidle'});await editorPage.waitForURL('**/admin/content');
  assert.equal((await post(editorContext.request,'/api/admin/records',{module:'submissions'})).status(),403);
  await editorContext.close();mark('Staff with only content access land on their permitted section and cannot read client records');

  const createPage=await post(context.request,'/api/admin/create',{kind:'page',title:'Synthetic verification page',slug:'qa-page-'+stamp});assert.equal(createPage.status(),200);customPage=(await createPage.json()).next.split('/').pop();
  const doc={title:'Synthetic verification page',summary:'A local-only verification fixture.',body:'<script>window.__qaXss=true</script>\n\nThis is escaped page content.'};
  const pubPage=await post(context.request,'/api/admin/command',{action:'page',id:customPage,revision:0,document:doc,publish:true});assert.equal(pubPage.status(),200);await page.goto(base+'/pages/qa-page-'+stamp,{waitUntil:'networkidle'});assert.equal(await page.evaluate(()=>window.__qaXss),undefined);assert.match(await page.locator('body').innerText(),/<script>/);
  mark('Owner creates and publishes a real page; stored markup renders as text instead of executing');
  const createForm=await post(context.request,'/api/admin/create',{kind:'form',title:'Synthetic verification form',slug:'qa-form-'+stamp,category:'Registration'});assert.equal(createForm.status(),200);customForm=(await createForm.json()).next.split('/').pop();
  const definition={engine:'managed',title:'Synthetic verification form',description:'This form is a synthetic local verification fixture.',reviewedLegacy:true,fields:[{key:'request_details',label:'What would you like help with?',type:'textarea',required:true,options:[]},{key:'contact_method',label:'Contact preference',type:'select',required:true,options:[{value:'email',label:'Email'},{value:'phone',label:'Phone'}]}]};
  const publishForm=await post(context.request,'/api/admin/command',{action:'form',id:customForm,revision:0,definition,publish:true});assert.equal(publishForm.status(),200);
  await page.goto(base+'/apply/qa-form-'+stamp,{waitUntil:'networkidle'});await page.getByLabel('Full name',{exact:true}).fill('Synthetic Managed Example');await page.getByLabel('Email address',{exact:true}).fill('managed.qa@example.test');await page.getByLabel('What would you like help with?').fill('Managed form verification');await page.getByLabel('Contact preference').selectOption('email');await page.getByRole('button',{name:'Submit form',exact:true}).click();await page.getByRole('heading',{name:'Your form has been received.',exact:true}).waitFor();
  const newForm=await checked(service.from('forms').select('current_version_id,revision').eq('id',customForm).single());const managedRows=await checked(service.from('submissions').select('id,form_version_id').eq('form_id',customForm));assert.equal(managedRows.length,1);assert.equal(managedRows[0].form_version_id,newForm.current_version_id);created.push(managedRows[0].id);
  const invalidManaged=await post(context.request,'/api/forms/qa-form-'+stamp+'/submissions',{branch_code:'ADE',applicant:{name:'Synthetic Invalid',email:'invalid.qa@example.test'},answers:{request_details:'',contact_method:'tampered'}});assert.equal(invalidManaged.status(),400);
  const republish=await post(context.request,'/api/admin/command',{action:'form',id:customForm,revision:newForm.revision,definition:{...definition,title:'Updated synthetic verification form'},publish:true});assert.equal(republish.status(),200);const retained=await checked(service.from('submissions').select('form_version_id').eq('id',managedRows[0].id).single());assert.equal(retained.form_version_id,newForm.current_version_id);
  await page.goto(base+'/forms?service=personal-tax',{waitUntil:'networkidle'});await page.getByText('Updated synthetic verification form',{exact:true}).waitFor();
  mark('Owner creates/publishes a form; browser submits it into the database, server rejects tampering, and version history plus directory category stay correct');
  const invalidOrigin=await context.request.post(base+'/api/admin/records',{data:{module:'submissions'}});assert.equal(invalidOrigin.status(),403);
  const oversized=await post(context.request,'/api/forms/appointment-booking-form/submissions',{...appointment,answers:{...appointment.answers,notes:'x'.repeat(150000)}});assert.equal(oversized.status(),413);
  const invalidForm=await post(context.request,'/api/forms/nonexistent-form/submissions',appointment);assert.equal(invalidForm.status(),503);assert.equal((await invalidForm.json()).success,undefined);
  mark('Missing Origin, oversized payload and unavailable form are rejected without a false receipt');
  await checked(owner.rpc('admin_set_staff_access',{target:fixtures.staff.id,grants:[],branch_ids:[],enabled:false}));const revoked=await staff.from('submissions').select('id');assert.ok(revoked.error||revoked.data.length===0);assert.equal((await staff.rpc('current_admin_access')).data,null);
  mark('Suspending staff removes data access even with an existing valid session token');
  await checked(service.from('forms').update({status:'archived'}).eq('id',customForm));
  for(const [serviceName,count] of [['personal-tax',6],['business-accounting',4],['conveyancing',1],['',12]]){
   await page.goto(base+'/forms'+(serviceName?'?service='+serviceName:''),{waitUntil:'networkidle'});
   assert.match(await page.locator('.forms-result-count').innerText(),new RegExp(`^${count} ${count===1?'form':'forms'} found$`));
   assert.equal(await page.locator('.form-links > a').count(),count);
  }
  const catalog=require(path.join(repo,'src/lib/workspace/form-catalog.json'));
  for(const route of [...new Set(catalog.map(form=>form.path)), '/nc']){
   const response=await page.goto(base+route,{waitUntil:'networkidle'});assert.equal(response.status(),200,route);assert.ok(await page.locator('h1').count(),route);
  }
  for(const form of require('../src/lib/workspace/removed-forms.json')){
   const denied=await post(context.request,'/api/forms/'+form.slug+'/submissions',{});assert.equal(denied.status(),404,form.slug);
  }
  mark('Twelve approved public forms load with category counts 6/4/1 plus Appointments; retired submission endpoints reject requests');

  await checked(owner.rpc('admin_set_staff_access',{target:fixtures.staff.id,grants:['dashboard.read','submissions.read','submissions.review','customers.read','bookings.read','documents.read'],branch_ids:[ade],enabled:true}));
  for(const route of ['/admin','/admin/submissions','/admin/customers','/admin/appointments','/admin/documents','/admin/reports','/admin/content','/admin/forms','/admin/staff','/admin/audit','/admin/migration','/admin/settings']){const response=await page.goto(base+route,{waitUntil:'networkidle'});assert.equal(response.status(),200,route);await page.locator('h1').waitFor();assert.ok(!(await page.locator('body').innerText()).includes('This page couldn’t be loaded.'));}
  mark('All twelve workspace sections render using authenticated database queries');
  for(const [width,height] of [[1536,960],[2553,1353],[768,1024],[390,844]]){await page.setViewportSize({width,height});await page.goto(base+'/admin',{waitUntil:'networkidle'});const sizes=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert.ok(sizes.scroll<=sizes.width);await page.screenshot({path:path.join(evidence,`workspace-${width}.png`),fullPage:true,animations:'disabled'});}
  await page.getByRole('button',{name:'Open workspace menu',exact:true}).click();await page.getByRole('navigation',{name:'Workspace navigation'}).getByRole('link',{name:'Submissions',exact:true}).click();await page.waitForURL('**/admin/submissions');assert.equal(await page.getByRole('button',{name:'Open workspace menu',exact:true}).getAttribute('aria-expanded'),'false');
  mark('Laptop, large monitor, tablet and phone layouts have no page overflow; mobile navigation works');
  await page.setViewportSize({width:1536,height:960});await page.goto(base+'/admin/content',{waitUntil:'networkidle'});await page.screenshot({path:path.join(evidence,'content-list.png'),fullPage:true,animations:'disabled'});await page.goto(base+'/admin/content/'+home.id,{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Edit page content',exact:true}).waitFor();await page.getByRole('button',{name:'Save draft',exact:true}).waitFor();await page.screenshot({path:path.join(evidence,'content-editor.png'),fullPage:true,animations:'disabled'});await page.goto(base+'/admin/forms/'+customForm,{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Form & field editor',exact:true}).waitFor();await page.getByRole('button',{name:'Add question',exact:true}).click();assert.equal(await page.locator('.admin-form-field-card').count(),3);await page.getByRole('button',{name:'Remove question 3',exact:true}).click();assert.equal(await page.locator('.admin-form-field-card').count(),2);mark('Content and form editor detail screens open; form builder adds and removes questions');await page.screenshot({path:path.join(evidence,'form-editor.png'),fullPage:true,animations:'disabled'});
  assert.deepEqual(result.pageErrors,[]);mark('No uncaught browser runtime errors');
  result.passed=true;result.createdSyntheticSubmissions=created.length;
 }catch(error){
  let message=String(error.message||error).split('Call log:')[0]+'\n'+String(error.stack||'').split('\n').filter(line=>line.trim().startsWith('at ')).join('\n');for(const value of Object.values(fixtures))for(const key of ['password','secret'])if(value[key])message=message.replaceAll(value[key],'[redacted]');result.failure=message;process.exitCode=1;
  if(!page.url().includes('/security'))await page.screenshot({path:path.join(evidence,'failure.png'),fullPage:true}).catch(()=>{});
 }finally{
  // Remove only the public visibility of test-created content; preserve its records/history.
  if(customForm)await service.from('forms').update({status:'archived'}).eq('id',customForm);
  if(customPage)await service.from('content_items').update({status:'archived'}).eq('id',customPage);
  fs.writeFileSync(path.join(evidence,'results.json'),JSON.stringify(result,null,2));await browser.close();console.log(JSON.stringify({passed:result.passed,checks:result.checks.length,failure:result.failure,pageErrors:result.pageErrors},null,2));
 }
})().catch(error=>{console.error(error.name+': '+error.message);process.exitCode=1;});
