/* Local development only. Keep this process open while using the preview. */
const fs=require('node:fs');
const path=require('node:path');
const net=require('node:net');
const {spawn,execFile}=require('node:child_process');
const {promisify}=require('node:util');
const {setTimeout:delay}=require('node:timers/promises');
const {createClient}=require('@supabase/supabase-js');
const run=promisify(execFile);
const root=path.resolve(__dirname,'..');
let desktopLauncher,nextProcess,stopping=false;

function localConfig(){
 const file=path.join(root,'.env.local');
 if(!fs.existsSync(file))throw Error('Configure .env.local using the local workspace setup instructions first.');
 process.loadEnvFile(file);
 const publicUrl=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const serverUrl=process.env.SUPABASE_URL||publicUrl;
 for(const value of [publicUrl,serverUrl]){
  let url;try{url=new URL(value);}catch{throw Error('The local Supabase URL is missing or invalid.');}
  if(url.protocol!=='http:'||!['localhost','127.0.0.1'].includes(url.hostname)||url.port!=='54321')
   throw Error('This helper only starts the local Supabase workspace. Use npm run dev for an explicitly configured hosted project.');
 }
 if(publicUrl!==serverUrl)throw Error('The public and server Supabase URLs must identify the same local project.');
 const key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!key||!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)throw Error('Configure the local Supabase public and server keys privately first.');
 if(!/^[a-f\d]{64}$/i.test(process.env.ENCRYPTION_MASTER_KEY||'')||/^0+$/.test(process.env.ENCRYPTION_MASTER_KEY||''))
  throw Error('Configure the workspace encryption key before starting a form preview.');
 const config=fs.readFileSync(path.join(root,'supabase/config.toml'),'utf8');
 const project=/^project_id\s*=\s*"([A-Za-z0-9_-]+)"/m.exec(config)?.[1];
 if(!project)throw Error('The local Supabase project identifier is unavailable.');
 process.env.LIVESIGN_MODE='disabled';
 process.env.CONVEYANCING_EMAIL_ENABLED='false';
 process.env.NEXT_PUBLIC_APP_URL='http://localhost:3000';
 process.env.NEXT_PUBLIC_SITE_URL='http://localhost:3000';
 return {url:serverUrl,key,project};
}
async function dockerReady(){
 try{await run('docker',['info','--format','{{.ServerVersion}}'],{windowsHide:true,timeout:5000});return true;}
 catch{return false;}
}
function startDockerDesktop(){
 if(process.platform!=='win32')throw Error('Open Docker Desktop, then run this command again.');
 const exe=path.join(process.env.ProgramFiles||'C:\\Program Files','Docker','Docker','Docker Desktop.exe');
 if(!fs.existsSync(exe))throw Error('Docker Desktop could not be found. Install or open it before starting the local workspace.');
 // Retain the launcher in this long-running preview session. A short, completed
 // agent command can otherwise leave its child process subject to cleanup.
 desktopLauncher=spawn('powershell.exe',['-NoProfile','-NonInteractive','-Command',
  "Start-Process -FilePath '"+exe.replace(/'/g,"''")+"' -WindowStyle Hidden -Wait"
 ],{windowsHide:true,stdio:'ignore'});
 desktopLauncher.on('error',()=>console.error('Docker Desktop could not be opened. Open it manually and check the engine status.'));
}
async function waitUntil(check,message,seconds=180){
 const deadline=Date.now()+seconds*1000;let printed=0;
 while(Date.now()<deadline){
  if(await check())return;
  if(Date.now()-printed>15000){console.log(message);printed=Date.now();}
  await delay(1000);
 }
 throw Error(message+' Startup timed out. Check Docker Desktop before trying again; no database reset was performed.');
}
async function startExistingDatabase(project){
 const required=['db','rest','auth','kong','storage'].map(service=>'supabase_'+service+'_'+project);
 const {stdout}=await run('docker',['ps','-a','--format','{{.Names}}|{{.State}}'],{windowsHide:true,timeout:10000});
 const states=new Map(stdout.trim().split(/\r?\n/).filter(Boolean).map(line=>line.split('|')));
 if(required.some(name=>!states.has(name)))throw Error('The local Supabase containers have not been set up. Follow docs/owner-workspace/SETUP.md; this launcher never creates or resets a database.');
 const stopped=required.filter(name=>states.get(name)!=='running');
 if(stopped.length)await run('docker',['start',...stopped],{windowsHide:true,timeout:60000});
}
function portInUse(){
 return new Promise(resolve=>{
  const socket=net.createConnection({host:'127.0.0.1',port:3000});
  const finish=value=>{socket.destroy();resolve(value);};
  socket.once('connect',()=>finish(true));socket.once('error',()=>finish(false));socket.setTimeout(2000,()=>finish(false));
 });
}
async function main(){
 process.chdir(root);const config=localConfig();
 if(await portInUse())throw Error('Port 3000 is already in use. Stop the other local preview before running this command.');
 if(!await dockerReady()){console.log('Starting Docker Desktop for the local database…');startDockerDesktop();}
 await waitUntil(dockerReady,'Waiting for the Docker engine…');
 await startExistingDatabase(config.project);
 const db=createClient(config.url,config.key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(url,init)=>fetch(url,{...init,signal:AbortSignal.timeout(4000)})}});
 await waitUntil(async()=>{
  try{
   const [{data:form,error},{error:permissionsError},auth]=await Promise.all([
    db.from('forms').select('current_version_id').eq('slug','conveyancing-intake').eq('status','published').maybeSingle(),
    db.from('permissions').select('code').eq('code','submissions.review').single(),
    fetch(config.url+'/auth/v1/health',{headers:{apikey:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY},signal:AbortSignal.timeout(4000)}),
   ]);
   return !error&&!permissionsError&&!!form?.current_version_id&&auth.ok;
  }catch{return false;}
 },'Waiting for local Supabase, authentication and form definitions…');
 console.log('Local Supabase is ready. LiveSign and outgoing email are disabled.');
 const production=process.argv.includes('--production');
 if(production&&!fs.existsSync(path.join(root,'.next/BUILD_ID')))throw Error('Run npm run build before using --production, or omit that flag for development.');
 const args=[require.resolve('next/dist/bin/next'),production?'start':'dev',...(production?[]:['--webpack']),'--hostname','127.0.0.1','--port','3000'];
 nextProcess=spawn(process.execPath,args,{cwd:root,env:process.env,windowsHide:true,stdio:'inherit'});
 console.log('Keep this terminal and Docker Desktop running. Open http://localhost:3000/nc');
 nextProcess.on('error',()=>{console.error('The local website could not be started.');process.exitCode=1;});
 nextProcess.on('exit',code=>{if(!stopping){process.exitCode=code||0;if(desktopLauncher)desktopLauncher.unref();}});
}
function stop(){
 if(stopping)return;stopping=true;
 if(nextProcess)nextProcess.kill('SIGINT');
 if(desktopLauncher)desktopLauncher.unref();
 // Do not stop shared Docker services or delete database volumes on exit.
 process.exit(0);
}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
main().catch(error=>{
 console.error('Local preview: '+error.message);
 if(desktopLauncher)desktopLauncher.unref();
 process.exitCode=1;
});
