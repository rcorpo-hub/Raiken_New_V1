import {createClient} from '@supabase/supabase-js';
import {readFileSync} from 'node:fs';
const failures=[];const fail=message=>failures.push(message);
const url=process.env.NEXT_PUBLIC_SUPABASE_URL||'';
const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'';
const secret=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SECRET_KEY||'';
const key=process.env.ENCRYPTION_MASTER_KEY||'';
let project;try{project=new URL(url);}catch{fail('NEXT_PUBLIC_SUPABASE_URL is missing or invalid.');}
const local=project&&['localhost','127.0.0.1'].includes(project.hostname);
if(project&&project.protocol!=='https:'&&!local)fail('Hosted Supabase requires an HTTPS project URL.');
if(process.env.SUPABASE_URL&&process.env.SUPABASE_URL!==url)fail('SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL identify different endpoints.');
if(process.env.SUPABASE_SECRET_KEY&&process.env.SUPABASE_SERVICE_ROLE_KEY&&process.env.SUPABASE_SECRET_KEY!==process.env.SUPABASE_SERVICE_ROLE_KEY)fail('Conflicting server key variables are set. Configure one server key consistently.');
let browserRole;try{browserRole=JSON.parse(Buffer.from(anon.split('.')[1]||'','base64url').toString()).role;}catch{}
if(anon.startsWith('sb_secret_')||browserRole==='service_role'||(anon&&anon===secret))fail('A server secret has been assigned to the public browser key. Remove it and rotate the exposed secret.');
if(!anon)fail('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.');
if(!secret)fail('The server-only Supabase service key is missing.');
if(!/^[a-f\d]{64}$/i.test(key)||/^0+$/.test(key))fail('ENCRYPTION_MASTER_KEY must be a nonzero random 32-byte hex key.');
for(const name of ['NEXT_PUBLIC_APP_URL','NEXT_PUBLIC_SITE_URL'])try{const value=new URL(process.env[name]||'');if(!local&&value.protocol!=='https:')fail(name+' must use HTTPS for hosted setup.');if(name==='NEXT_PUBLIC_APP_URL'&&(value.pathname!=='/'||value.search||value.hash))fail(name+' must be an origin without a path, query or fragment.');}catch{fail(name+' is missing or invalid.');}
if(!local&&process.env.LOCAL_WORKSPACE_TEST==='true')fail('LOCAL_WORKSPACE_TEST must not be enabled for hosted projects.');
if(!failures.length){
 const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const publicDb=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
 const [{data:forms,error:formError},{data:offices,error:officeError},{data:buckets,error:bucketError},{data:grants,error:permissionError}]=await Promise.all([
  db.from('forms').select('slug,current_version_id'),db.from('branches').select('code').eq('active',true),db.storage.listBuckets(),db.from('permissions').select('code').eq('code','submissions.correct')
 ]);
 if(formError||officeError||permissionError)fail('Database schema or server key check failed. Apply all migrations and verify that both keys belong to this project.');
 else{
  const catalog=JSON.parse(readFileSync(new URL('../src/lib/workspace/form-catalog.json',import.meta.url),'utf8'));
  if(!catalog.every(item=>forms.some(form=>form.slug===item.slug&&form.current_version_id)))fail('The workspace seed is incomplete: one or more intake definitions are missing.');
  if(!['ADE','BNE','PER'].every(code=>offices.some(office=>office.code===code)))fail('One or more required active offices are missing.');
  if(!grants.length)fail('Owner permission migrations are missing.');
 }
 if(bucketError)fail('Storage settings could not be verified with the server key.');
 else for(const name of ['quarantine-uploads','verified-documents']){const bucket=buckets.find(bucket=>bucket.id===name);if(!bucket||bucket.public)fail(name+' must exist and remain private.');}
 const {data:exposed,error:readError}=await publicDb.from('submissions').select('id').limit(1);
 if(!readError&&exposed?.length)fail('Anonymous submission access is exposed. Stop setup and review database policies.');
 const {error:draftError}=await publicDb.from('content_items').select('draft_blocks').limit(1);
 if(!draftError)fail('Anonymous draft columns are exposed. Stop setup and review column privileges.');
}
if(failures.length){for(const failure of failures)console.error('FAIL: '+failure);process.exitCode=1;}
else console.log('PASS: project configuration, seeded schema, offices and private storage checks. No owner account was created. Auth dashboard settings, email delivery and hosted end-to-end tests still need manual verification.');
