// Browser regressions for restored and edited participant counts. All intake
// APIs are simulated here; this suite cannot submit to Supabase or LiveSign.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ts=require('typescript'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),cache=new Map(),results=[];
function load(file){
 if(!path.extname(file))file+='.ts';file=path.resolve(root,file);
 if(cache.has(file))return cache.get(file).exports;
 const module={exports:{}};cache.set(file,module);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 new Function('require','module','exports',code)(name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name)):require(name),module,module.exports);return module.exports;
}
const {createInitialFormData,createParty}=load('src/conveyancing/components/form/formState.ts');
const base='http://localhost:3000';
function saved(role,count){
 const data=createInitialFormData();data.role=role;data.roleConfirmed=true;data.partyCount=count;
 data.parties=Array.from({length:count},(_,i)=>({...createParty('person'+i),firstName:'Synthetic person '+(i+1),lastName:'Example '+i,dob:'1990-03-'+(10+i),mobile:'0412345678',email:'person'+i+'@example.invalid',addressLine1:(i+1)+' Synthetic Street',suburb:'Adelaide',state:'SA',postcode:'5000',residencyStatus:'Australian Citizen',occupation:'Tester'}));
 return data;
}
async function check(name,fn){await fn();results.push({name,passed:true});console.log('PASS '+name);}
(async()=>{
 const browser=await chromium.launch({headless:true});const pageErrors=[];
 try{
 for(const role of ['Purchaser','Vendor'])for(const count of [2,3]){
  await check(role+' restores '+count+' people and asks for every person before property details',async()=>{
   const context=await browser.newContext(),page=await context.newPage();page.on('pageerror',e=>pageErrors.push(e.message));
   const initial=saved(role,count),writes=[];
   await context.route('**/api/conveyancing/**',async route=>{
    const req=route.request();assert(req.url().endsWith('/session'),'No final submission is allowed in this suite.');
    if(req.method()==='POST'){await new Promise(resolve=>setTimeout(resolve,250));return route.fulfill({json:{id:'00000000-0000-4000-8000-000000000001',revision:0,currentStep:1,partyIndex:0,formData:initial,hasAnswers:true,updatedAt:new Date().toISOString()}});}
    const input=req.postDataJSON();writes.push(input);
    return route.fulfill({json:{revision:input.revision+1,updatedAt:new Date().toISOString()}});
   });
   await page.goto(base+'/nc');await page.getByRole('heading',{name:'Your property matter'}).waitFor();
   assert.equal(await page.locator('input[name="setup-structure"][value="individual"]').isChecked(),true,'Restored choices must be applied before the setup is interactive.');
   assert.equal(await page.locator('.rk-counter-value strong').innerText(),String(count),'The setup must show the restored participant count.');
   await page.getByRole('button',{name:'Save choices',exact:true}).click();
   for(let i=0;i<count;i++){
    assert.match(await page.locator('.rk-screen-head').innerText(),new RegExp(role+' '+(i+1)+' of '+count));
    assert.equal(await page.locator('[id$="-firstName"]').inputValue(),initial.parties[i].firstName);
    const expected=(10+i)+' / 03 / 1990';assert.equal(await page.locator('[id$="-dob"]').inputValue(),expected);
    await page.getByRole('button',{name:'Continue to address',exact:true}).click();
    assert.equal(await page.locator('[id$="-addr-addressLine1"]').inputValue(),initial.parties[i].addressLine1);
    assert.equal(await page.locator('[id$="-occupation"]').inputValue(),'Tester');
    await page.locator('.rk-actions .rk-primary').click();
   }
   await page.locator('#property-addressLine1').waitFor();
   await page.locator('.rk-actions .rk-back').click();
   assert.equal(await page.locator('[id$="-addr-addressLine1"]').inputValue(),initial.parties.at(-1).addressLine1);
   await page.locator('.rk-matter-summary button').click();
   assert.equal(await page.locator('.rk-counter-value strong').innerText(),String(count));
   await page.getByRole('button',{name:'One more person',exact:true}).click();
   await page.getByRole('button',{name:'Save choices',exact:true}).click();
   for(let i=0;i<count;i++){await page.getByRole('button',{name:'Continue to address',exact:true}).click();await page.locator('.rk-actions .rk-primary').click();}
   assert.equal(await page.locator('[id$="-firstName"]').inputValue(),'');
   assert.equal(await page.locator('[id$="-dob"]').inputValue(),'');
   assert.match(await page.locator('.rk-screen-head').innerText(),new RegExp(role+' '+(count+1)+' of '+(count+1)));
   await page.waitForTimeout(900);
   assert.equal(writes.at(-1).formData.parties.length,count+1);
   assert.equal(writes.at(-1).formData.parties[0].firstName,initial.parties[0].firstName);
   await context.close();
  });
 }
 await check('A failed initial load can be retried without showing or overwriting a one-person fallback',async()=>{
  const context=await browser.newContext(),page=await context.newPage();let requests=0;
  await context.route('**/api/conveyancing/session',async route=>{
   if(route.request().method()==='PATCH')return route.fulfill({json:{revision:1,updatedAt:new Date().toISOString()}});
   requests++;if(requests===1)return route.fulfill({status:503,json:{error:'Saved forms are temporarily unavailable.'}});
   return route.fulfill({json:{id:'00000000-0000-4000-8000-000000000002',revision:0,currentStep:1,partyIndex:0,formData:saved('Vendor',3),hasAnswers:true}});
  });
  await page.goto(base+'/nc');await page.getByRole('button',{name:'Try again',exact:true}).waitFor();
  assert.equal(await page.locator('.rk-counter').count(),0);
  await page.getByRole('button',{name:'Try again',exact:true}).click();
  await page.getByRole('heading',{name:'Your property matter'}).waitFor();assert.equal(await page.locator('.rk-counter-value strong').innerText(),'3');
  await context.close();
 });
 assert.deepEqual(pageErrors,[]);
 fs.writeFileSync(path.join(root,'docs/owner-workspace/conveyancing-people-results.json'),JSON.stringify({simulatedApiOnly:true,realSubmissions:0,results},null,2)+'\n');
 console.log(results.length+' participant checks passed.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
