/* Synthetic local-only integration tests. No LiveSign or SMTP connection. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {createClient}=require('@supabase/supabase-js'),{createServerClient}=require('@supabase/ssr'),{chromium}=require('playwright'),ts=require('typescript');
const root=path.resolve(__dirname,'..');process.loadEnvFile(path.join(root,'.env.local'));
if(process.env.LOCAL_WORKSPACE_TEST!=='true'||!/^http:\/\/(localhost|127\.0\.0\.1):54321$/.test(process.env.NEXT_PUBLIC_SUPABASE_URL||''))throw Error('Restricted to the synthetic local database.');
process.env.LIVESIGN_MODE='disabled';process.env.CONVEYANCING_EMAIL_ENABLED='false';process.env.FIRM_EMAIL='synthetic-firm@example.invalid';
const realFetch=global.fetch;let forbiddenCalls=0;
global.fetch=(url,options)=>{const u=new URL(typeof url==='string'?url:url.url||url.href);if(!['localhost','127.0.0.1'].includes(u.hostname)){forbiddenCalls++;throw Error('EXTERNAL_NETWORK_FORBIDDEN');}return realFetch(url,options);};
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const anon=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});
const base='http://localhost:3000',created=[],results=[],cache=new Map();
function load(name){
 let file=path.resolve(root,name);if(!path.extname(file))file+='.ts';
 if(cache.has(file))return cache.get(file).exports;
 const module={exports:{}};cache.set(file,module);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const localRequire=id=>id==='server-only'?{}:id.startsWith('@/')?load('src/'+id.slice(2)):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):require(id);
 new Function('require','module','exports',code)(localRequire,module,module.exports);return module.exports;
}
const {checkedFormData}=load('src/lib/conveyancing/schema.ts'),{validSignature}=load('src/lib/conveyancing/signature.ts');
const {createInitialFormData}=load('src/conveyancing/components/form/formState.ts');
const {todayIso}=load('src/conveyancing/utils/validation.ts');
const {decryptAnswers}=load('src/lib/workspace/encryption.ts');
const {runConveyancingJobs}=load('src/lib/conveyancing/worker.ts');
const {ProviderError,liveSignProvider}=load('src/lib/conveyancing/provider.ts');
async function checked(promise){const result=await promise;if(result.error)throw Error(result.error.message);return result.data;}
async function test(name,fn){await fn();results.push({name,passed:true});console.log('PASS '+name);}
function totp(secret){const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';let bits='';for(const c of secret.replace(/=+$/,''))bits+=alphabet.indexOf(c).toString(2).padStart(5,'0');const key=Buffer.from(bits.match(/.{8}/g).map(b=>parseInt(b,2)));const message=Buffer.alloc(8);message.writeBigUInt64BE(BigInt(Math.floor(Date.now()/30000)));const h=crypto.createHmac('sha1',key).update(message).digest(),o=h.at(-1)&15;return ((h.readUInt32BE(o)&0x7fffffff)%1000000).toString().padStart(6,'0');}
async function login(browser,name){
 const fixtures=JSON.parse(fs.readFileSync(process.env.OWNER_WORKSPACE_FIXTURES||path.join(root,'.diagnostics/owner-workspace-fixtures.json'),'utf8'));
 const f=fixtures[name],client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});
 await checked(client.auth.signInWithPassword({email:f.email,password:f.password}));await checked(client.auth.mfa.challengeAndVerify({factorId:f.factorId,code:totp(f.secret)}));
 const {data:{session}}=await client.auth.getSession(),cookies=new Map();
 const ssr=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{cookies:{getAll:()=>[...cookies].map(([name,value])=>({name,value})),setAll:values=>values.forEach(c=>cookies.set(c.name,c.value))}});
 await checked(ssr.auth.setSession({access_token:session.access_token,refresh_token:session.refresh_token}));
 const context=await browser.newContext();await context.addCookies([...cookies].map(([name,value])=>({name,value,url:base,sameSite:'Lax'})));return {context,client};
}
async function request(context,url,data,method='post'){return context.request[method](base+url,{headers:{Origin:base},data});}
async function draft(context){const response=await request(context,'/api/conveyancing/session',{});assert.equal(response.status(),200);return response.json();}
function form(signature,role='Purchaser',count=2){
 const data=createInitialFormData();data.role=role;data.roleConfirmed=true;data.partyCount=count;data.parties=Array.from({length:count},(_,i)=>({...data.parties[0],id:'p'+i,firstName:'Synthetic',lastName:'Conveyancing '+i,dob:'1990-03-12',email:'synthetic-person-'+i+'@example.invalid',mobile:'0412345678',addressLine1:'1 Test Street',suburb:'Adelaide',state:'SA',postcode:'5000',residencyStatus:'Australian Citizen',occupation:'Tester'}));
 data.property={addressLine1:'2 Synthetic Street',suburb:'Adelaide',state:'SA',postcode:'5000',purchasePrice:'650000',settlementDate:'',intendedUse:role==='Purchaser'?'To live in':'',ownershipType:role==='Purchaser'?(count>1?'Joint Tenants':'Sole Owner'):''};
 data.finance.mortgageRequired='No';data.stampDuty.reliefEligible=role==='Purchaser'?'No':'';
 data.declaration={coolingOffAcknowledged:role==='Purchaser',authorityToAct:true,signedName:'Synthetic Conveyancing',signedDate:todayIso(),signatureDataUrl:signature};return data;
}
let browser;
(async()=>{try{
 browser=await chromium.launch({headless:true});const context=await browser.newContext(),page=await context.newPage();
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto(base+'/nc');
 const signature=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=400;c.height=120;const x=c.getContext('2d');x.strokeStyle='#171717';x.lineWidth=3;x.beginPath();x.moveTo(30,70);x.lineTo(80,20);x.lineTo(100,90);x.lineTo(260,50);x.stroke();return c.toDataURL();});
 const valid=form(signature);
 await test('Server validates buyer, seller, six people, hidden answers and non-empty signatures',async()=>{
  assert.equal(Object.keys(checkedFormData(valid).errors).length,0);
  assert.equal(Object.keys(checkedFormData(form(signature,'Vendor',6)).errors).length,0);
  assert(checkedFormData({...valid,partyCount:7,parties:[...valid.parties,...valid.parties,...valid.parties,valid.parties[0]]}).data===null);
  const bad=structuredClone(valid);bad.parties[0].occupation='';assert(Object.keys(checkedFormData(bad).errors).length);
  assert(validSignature(signature));assert(!validSignature('data:image/png;base64,AAAA'));
  const blank=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=40;c.height=40;return c.toDataURL();});assert(!validSignature(blank));
  const stale=structuredClone(valid);stale.finance.paysByCash=true;stale.finance.cashAmount='90000';assert.equal(checkedFormData(stale).data.finance.paysByCash,false);
  assert.equal(liveSignProvider(),null);
 });
 await test('Responsive unified form, company contact path and existing unrelated forms remain accessible',async()=>{
  for(const width of [390,768,1536,2560]){await page.setViewportSize({width,height:960});await page.goto(base+'/nc');await page.getByText('Who is buying or selling?',{exact:true}).waitFor();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
  await page.getByText('Company / Trust',{exact:true}).click();await page.getByRole('heading',{name:'How company and trust matters are processed'}).waitFor();
  assert.equal((await page.request.get(base+'/nc/i-am-purchaser')).status(),404);assert.equal((await page.request.get(base+'/nc/i-am-vendor')).status(),404);
  assert.equal((await page.request.get(base+'/buyer-form')).status(),200);assert.equal((await page.request.get(base+'/form-for-vendor-sales')).status(),200);
  await page.goto(base+'/forms?service=conveyancing');assert.equal(await page.locator('a[href="/nc"]').count(),1);assert.equal(await page.locator('a[href="/nc/i-am-purchaser"]').count(),0);
 });
 await test('Buyer and seller browser journeys collect two and three people through a saved local receipt',async()=>{
  for(const role of ['Purchaser','Vendor'])for(const count of [2,3]){
   const c=await browser.newContext({viewport:{width:role==='Vendor'?390:1536,height:960}}),p=await c.newPage();
   await p.goto(base+'/nc');await p.locator('input[name="setup-structure"][value="individual"]').check();await p.locator('input[name="setup-role"][value="'+role+'"]').check();
   const output=path.join(root,'.diagnostics/conveyancing');fs.mkdirSync(output,{recursive:true});
   await p.screenshot({path:path.join(output,role==='Purchaser'?'form-desktop.png':'form-phone.png'),fullPage:true});
   for(let i=1;i<count;i++)await p.getByRole('button',{name:'One more person',exact:true}).click();
   await p.getByRole('button',{name:'Continue',exact:true}).click();
   for(let person=0;person<count;person++){
    assert.match(await p.locator('.rk-screen-head').innerText(),new RegExp(role+' '+(person+1)+' of '+count));
    assert.equal(await p.locator('[id$="-firstName"]').inputValue(),'');assert.equal(await p.locator('[id$="-dob"]').inputValue(),'');
    await p.locator('[id$="-firstName"]').fill('Synthetic browser '+person);await p.locator('[id$="-lastName"]').fill(role);await p.locator('[id$="-dob"]').fill((10+person)+'031990');await p.locator('[id$="-mobile"]').fill('0412345678');await p.locator('[id$="-email"]').fill('synthetic-browser-'+person+'@example.invalid');
    await p.getByRole('button',{name:'Continue to address',exact:true}).click();
    await p.locator('[id$="-addr-addressLine1"]').fill((person+1)+' Synthetic Street');await p.locator('[id$="-addr-suburb"]').fill('Adelaide');await p.locator('[id$="-addr-state"]').selectOption('SA');await p.locator('[id$="-addr-postcode"]').fill('5000');await p.locator('[id$="-residencyStatus"]').selectOption('Australian Citizen');await p.locator('[id$="-occupation"]').fill('Tester');
    await p.locator('.rk-actions .rk-primary').click();
   }
   await p.locator('#property-addressLine1').fill('2 Synthetic Street');await p.locator('#property-suburb').fill('Adelaide');await p.locator('#property-postcode').fill('5000');await p.locator('#property-purchasePrice').fill('650000');
   if(role==='Purchaser'){
    await p.locator('#property-intendedUse').selectOption('To live in');await p.locator('#property-ownershipType').selectOption('Joint Tenants');await p.getByRole('button',{name:'Continue to mortgage',exact:true}).click();await p.locator('#finance-mortgageRequired').selectOption('No');await p.getByRole('button',{name:'Continue to stamp duty',exact:true}).click();await p.locator('input[name="stampDuty-reliefEligible"][value="No"]').check();
   }else await p.locator('#finance-mortgageRequired').selectOption('No');
   await p.getByRole('button',{name:'Continue to review',exact:true}).click();
   await p.getByRole('button',{name:'Upload an image instead'}).click();await p.locator('input[type="file"]').setInputFiles({name:'synthetic-signature.png',mimeType:'image/png',buffer:Buffer.from(signature.slice(22),'base64')});await p.getByText('Signature added',{exact:true}).waitFor();
   await p.locator('#declaration-signedName').fill('Synthetic browser '+role);await p.locator('#declaration-authorityToAct').check();if(role==='Purchaser')await p.locator('#declaration-coolingOffAcknowledged').check();
   await p.getByRole('button',{name:'Send my form',exact:true}).click();const accepted=p.waitForResponse(r=>r.url().endsWith('/api/conveyancing/intake')&&r.request().method()==='POST');await p.getByRole('button',{name:/I understand, submit form/}).click();const response=await accepted;assert.equal(response.status(),200);const receipt=await response.json();created.push(receipt.intakeId);await p.getByRole('heading',{name:'We’ve received your form'}).waitFor();
   const stored=await checked(db.from('submissions').select('*').eq('id',receipt.intakeId).single());const answers=decryptAnswers(stored.answers_ciphertext,stored.encryption_meta,stored.form_version_id+':'+stored.reference);assert.equal(answers.parties.length,count);for(let person=0;person<count;person++){assert.equal(answers.parties[person].firstName,'Synthetic browser '+person);assert.equal(answers.parties[person].dob,'1990-03-'+(10+person));}
   await db.from('conveyancing_jobs').update({state:'done',error_code:'SYNTHETIC_TEST_COMPLETE'}).eq('submission_id',receipt.intakeId);
   await c.close();
  }
 });

 const fresh=await browser.newContext(),session=await draft(fresh);
 await test('Draft save is encrypted, restored only by its owning cookie and rejects stale writes',async()=>{
  const response=await request(fresh,'/api/conveyancing/session',{sessionId:session.id,revision:0,currentStep:2,partyIndex:0,formData:valid},'patch');assert.equal(response.status(),200);
  const stored=await checked(db.from('conveyancing_sessions').select('*').eq('id',session.id).single());assert(!stored.answers_ciphertext.includes('Synthetic'));assert.equal(stored.revision,1);
  const restored=await draft(fresh);assert.equal(restored.formData.parties[0].occupation,'Tester');
  const stale=await request(fresh,'/api/conveyancing/session',{sessionId:session.id,revision:0,currentStep:2,partyIndex:0,formData:valid},'patch');assert.equal(stale.status(),409);
  const stranger=await browser.newContext();await draft(stranger);assert.equal((await request(stranger,'/api/conveyancing/intake',{sessionId:session.id,formData:valid})).status(),403);await stranger.close();
 });
 let receipt;
 await test('Concurrent repeated submits create one encrypted submission, case, person set and send job',async()=>{
  const replies=await Promise.all(Array.from({length:4},()=>request(fresh,'/api/conveyancing/intake',{sessionId:session.id,formData:valid})));
  for(const reply of replies)assert.equal(reply.status(),200);const bodies=await Promise.all(replies.map(r=>r.json()));receipt=bodies[0];created.push(receipt.intakeId);assert.equal(new Set(bodies.map(b=>b.intakeId)).size,1);
  const submission=await checked(db.from('submissions').select('*').eq('id',receipt.intakeId).single());
  assert.equal(decryptAnswers(submission.answers_ciphertext,submission.encryption_meta,submission.form_version_id+':'+submission.reference).parties.length,2);
  assert.equal((await checked(db.from('conveyancing_people').select('id').eq('submission_id',receipt.intakeId))).length,2);
  assert.equal((await checked(db.from('conveyancing_jobs').select('id').eq('submission_id',receipt.intakeId).eq('kind','send'))).length,1);
  const changed=structuredClone(valid);changed.parties[0].occupation='Changed';
  assert.equal((await request(fresh,'/api/conveyancing/intake',{sessionId:session.id,formData:changed})).status(),409);
  const foreign=await fresh.request.post(base+'/api/conveyancing/intake',{headers:{Origin:'https://example.invalid'},data:{sessionId:session.id,formData:valid}});assert.equal(foreign.status(),403);
  assert.equal((await request(fresh,'/api/forms/conveyancing-intake/submissions',{answers:{}})).status(),404);
 });
 const envelopes=new Map(),mails=[],payloads=[];let creates=0,starts=0;
 const provider={options:{partnerId:crypto.randomUUID(),productPackageType:'AMLWithVoi',voiProductId:1,timeZone:'Cen. Australia Standard Time'},async countryCodes(){return [{id:13,phoneCode:'61'}];},async create(payload){creates++;payloads.push(payload);const e={id:crypto.randomUUID(),partnerReference:payload.envelope.partnerReference,status:'Draft',customers:payload.customers.map(c=>({...c,id:crypto.randomUUID(),voiOutcome:'Pending'})),aml:{status:'AwaitingApproval',riskRating:'Medium'}};envelopes.set(e.id,e);return structuredClone(e);},async start(id){starts++;envelopes.get(id).status='SentToClient';},async get(id){assert(envelopes.has(id));return structuredClone(envelopes.get(id));},async find(ref){return structuredClone([...envelopes.values()].find(e=>e.partnerReference===ref)||null);}};
 const deps={db,provider,sendMail:async(event,id)=>mails.push({event,id})};
 await test('Simulated LiveSign creates/starts once and preserves account-holder billing and all people',async()=>{
  await runConveyancingJobs(1,deps);assert.equal(creates,1);assert.equal(starts,1);assert.equal(payloads[0].customers.length,2);assert.equal(payloads[0].envelope.payMethod,'AccountHolderPays');assert.equal(payloads[0].envelope.notificationType,'Email');assert.equal(payloads[0].envelope.hasAml,true);
  const record=await checked(db.from('conveyancing_cases').select('*').eq('submission_id',receipt.intakeId).single());assert.equal(record.send_status,'sent');
  await checked(db.from('conveyancing_jobs').update({state:'pending',run_after:new Date().toISOString()}).eq('submission_id',receipt.intakeId).eq('kind','send'));
  for(let i=0;i<3;i++)await runConveyancingJobs(3,deps);assert.equal(creates,1);assert.equal(starts,1);
 });
 await test('Authenticated callback is replay-safe and does not trust submitted verification results',async()=>{
  const record=await checked(db.from('conveyancing_cases').select('*').eq('submission_id',receipt.intakeId).single());
  const callback='/api/conveyancing/livesign/webhook?token='+encodeURIComponent(process.env.LIVESIGN_WEBHOOK_SECRET);
  for(let i=0;i<2;i++){const response=await request(context,callback,{envelopeId:record.livesign_envelope_id,status:'Verified',voiOutcome:'Passed'});assert.equal(response.status(),200);}
  const unchanged=await checked(db.from('conveyancing_cases').select('*').eq('submission_id',receipt.intakeId).single());assert.equal(unchanged.verification_status,'unverified');
  assert.equal((await checked(db.from('conveyancing_jobs').select('id').eq('submission_id',receipt.intakeId).eq('kind','sync'))).length,1);
  const worker=await context.request.get(base+'/api/conveyancing/worker',{headers:{Authorization:'Bearer '+process.env.CRON_SECRET}});assert.equal(worker.status(),200);assert.equal((await worker.json()).disabled,true);
 });

 await test('Provider identity and AML results sync independently; confirmations are deduplicated',async()=>{
  const envelope=[...envelopes.values()][0];for(const c of envelope.customers)c.voiOutcome='Passed';
  await checked(db.rpc('wake_conveyancing_sync',{target:receipt.intakeId}));
  for(let i=0;i<4;i++)await runConveyancingJobs(3,deps);
  let record=await checked(db.from('conveyancing_cases').select('*').eq('submission_id',receipt.intakeId).single());assert.equal(record.verification_status,'verified');assert.equal(record.aml_status,'AwaitingApproval');
  assert.equal(mails.filter(m=>m.event.kind==='verified').length,2);
  await checked(db.rpc('wake_conveyancing_sync',{target:receipt.intakeId}));await runConveyancingJobs(3,deps);assert.equal(mails.filter(m=>m.event.kind==='verified').length,2);
  envelope.aml.status='Proceeding';await checked(db.rpc('wake_conveyancing_sync',{target:receipt.intakeId}));await runConveyancingJobs(3,deps);
  record=await checked(db.from('conveyancing_cases').select('*').eq('submission_id',receipt.intakeId).single());assert.equal(record.aml_status,'Proceeding');
 });
 await test('Uncertain create result is held for reconciliation instead of a second paid request',async()=>{
  const c=await browser.newContext(),s=await draft(c),reply=await request(c,'/api/conveyancing/intake',{sessionId:s.id,formData:form(signature,'Vendor',1)});assert.equal(reply.status(),200);const body=await reply.json();created.push(body.intakeId);
  let attempts=0;const uncertain={...provider,async create(){attempts++;throw new ProviderError('LIVESIGN_CONNECTION_ERROR',true,true);}};
  for(let i=0;i<3;i++)await runConveyancingJobs(3,{...deps,provider:uncertain});
  assert.equal(attempts,1);const record=await checked(db.from('conveyancing_cases').select('*').eq('submission_id',body.intakeId).single());assert.equal(record.send_status,'needs_reconciliation');await c.close();
 });
 await test('Anonymous/private access, unauthenticated worker/webhook and forged verification results are denied',async()=>{
  for(const table of ['conveyancing_cases','conveyancing_people','conveyancing_sessions','conveyancing_jobs','conveyancing_events']){const result=await anon.from(table).select('*');assert(result.error||result.data.length===0);}
  assert.equal((await context.request.get(base+'/api/conveyancing/worker')).status(),403);
  assert.equal((await request(context,'/api/conveyancing/livesign/webhook',{envelopeId:[...envelopes.keys()][0],verification_status:'verified'})).status(),403);
 });
 await test('Owner sees completed answers, signature and automatic statuses; answer correction is blocked',async()=>{
  const owner=await login(browser,'owner'),p=await owner.context.newPage();await p.goto(base+'/admin/submissions/'+receipt.intakeId);
  await p.getByRole('heading',{name:'LiveSign verification'}).waitFor();assert.equal(await p.locator('img.admin-submitted-signature').count(),1);
  assert.equal(await p.getByLabel('Occupation',{exact:true}).first().inputValue(),'Tester');assert.equal(await p.getByLabel('Occupation',{exact:true}).first().getAttribute('readonly'),'');
  assert.equal(await p.getByText('Record a correction to the submitted information').count(),0);
  const record=await checked(db.from('submissions').select('revision').eq('id',receipt.intakeId).single());
  const corrected=await request(owner.context,'/api/admin/command',{action:'review',id:receipt.intakeId,revision:record.revision,status:'under_review',note:'Synthetic rejected correction',correction:{bad:true}});assert.equal(corrected.status(),400);
  const direct=await owner.client.rpc('admin_review_submission',{target:receipt.intakeId,expected_revision:record.revision,new_status:'under_review',note:'Synthetic blocked correction',correction:'\\x01',correction_meta:{}});assert.equal(direct.error.code,'42501');
  const review=await request(owner.context,'/api/admin/command',{action:'review',id:receipt.intakeId,revision:record.revision,status:'under_review',note:'Synthetic review note'});assert.equal(review.status(),200);
  const stale=await request(owner.context,'/api/admin/command',{action:'review',id:receipt.intakeId,revision:record.revision,status:'processed',note:'Synthetic stale edit'});assert.equal(stale.status(),409);
  const output=path.join(root,'.diagnostics/conveyancing');fs.mkdirSync(output,{recursive:true});await p.screenshot({path:path.join(output,'owner-submission.png'),fullPage:true});
  const staff=await login(browser,'staff');const hidden=await staff.client.from('conveyancing_sessions').select('*');assert(hidden.error||hidden.data.length===0);
  const source=await checked(db.from('submissions').select('branch_id').eq('id',receipt.intakeId).single());
  const access=await checked(staff.client.rpc('current_admin_access'));const scoped=await checked(staff.client.from('conveyancing_cases').select('submission_id').eq('submission_id',receipt.intakeId));assert.equal(scoped.length,access.permissions.includes('submissions.read')&&access.branches.includes(source.branch_id)?1:0);
  const editor=await login(browser,'editor');const denied=await editor.client.from('conveyancing_people').select('*').eq('submission_id',receipt.intakeId);assert(denied.error||denied.data.length===0);
  const form=await checked(db.from('forms').select('id,revision').eq('slug','conveyancing-intake').single());
  const edit=await request(owner.context,'/api/admin/command',{action:'form',id:form.id,revision:form.revision,definition:{engine:'managed',title:'Unsafe replacement',description:'',reviewedLegacy:true,fields:[{key:'name',label:'Name',type:'text',required:true,options:[]}]},publish:true});assert.equal(edit.status(),403);
  await owner.context.close();await staff.context.close();await editor.context.close();
 });
 await test('No browser exceptions, real verification calls or outbound email occurred',async()=>{assert.deepEqual(errors,[]);assert.equal(forbiddenCalls,0);assert.equal(process.env.CONVEYANCING_EMAIL_ENABLED,'false');});
 const output=path.join(root,'docs/owner-workspace/conveyancing-results.json');fs.writeFileSync(output,JSON.stringify({syntheticOnly:true,realLiveSignRequests:0,realEmailsSent:0,results},null,2)+'\n');
 console.log(results.length+' conveyancing checks passed.');
 }finally{
  if(created.length)await db.from('conveyancing_jobs').update({state:'done',error_code:'SYNTHETIC_TEST_COMPLETE',lease_until:null}).in('submission_id',created);
  if(browser)await browser.close();
 }
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
