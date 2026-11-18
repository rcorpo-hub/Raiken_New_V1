const {createRequire}=require('node:module');
const fs=require('node:fs');const path=require('node:path');const {randomBytes}=require('node:crypto');
const repo=path.resolve(__dirname,'..');
process.loadEnvFile(path.join(repo,'.env.local'));
if(process.env.LOCAL_WORKSPACE_TEST!=='true'||!/^http:\/\/(127\.0\.0\.1|localhost):54321$/.test(process.env.NEXT_PUBLIC_SUPABASE_URL||''))throw new Error('Synthetic fixture setup is restricted to the isolated local database.');
const requireRepo=createRequire(path.join(repo,'package.json'));const {createClient}=requireRepo('@supabase/supabase-js');
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const file=path.join(repo,'.diagnostics/owner-workspace-fixtures.json');
fs.mkdirSync(path.dirname(file),{recursive:true});
(async()=>{
 const fixtures=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};
 for(const [key,name] of [['owner','Test owner'],['staff','Test Adelaide reviewer'],['editor','Test website editor'],['outsider','Test unassigned account']]){
  if(!fixtures[key]){const password=randomBytes(24).toString('base64url')+'-aA9';const email=`${key}.workspace.qa@example.test`;
   const {data,error}=await db.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{display_name:name}});
   if(error)throw new Error('Could not create synthetic fixture account: '+error.message);
   fixtures[key]={id:data.user.id,email,password,name};fs.writeFileSync(file,JSON.stringify(fixtures));
  }
 }
 const {data:roles,error}=await db.from('user_roles').select('user_id').eq('role_id','owner');if(error)throw error;
 if(!roles.length){const {error}=await db.rpc('bootstrap_workspace_owner',{target:fixtures.owner.id});if(error)throw error;}
 else if(!roles.some(role=>role.user_id===fixtures.owner.id))throw new Error('A different owner exists; no access was changed.');
 console.log('Prepared four synthetic local accounts. No hosted owner account or email delivery was used.');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
