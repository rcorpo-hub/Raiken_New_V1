import 'server-only';
import type {SupabaseClient} from '@supabase/supabase-js';
import {createPrivilegedClient} from '@/lib/supabase/privileged';
import {decryptAnswers} from '@/lib/workspace/encryption';
import {hash} from './session';
import {buildEnvelopePayload,validateEnvelopePayload} from './livesign-payload';
import {envelopeCustomers,findCustomer,overallStatus,personStatusFromCustomer} from './livesign-verdict';
import {liveSignProvider,ProviderError,type VerificationProvider,type ProviderEnvelope} from './provider';
import {sendConveyancingMail,type MailEvent} from './mail';
import type {ClientIntakeFormData} from '@/conveyancing/types';
type Job={id:string;submission_id:string;kind:'send'|'sync'|'email';event_key:string;payload:Record<string,string>;attempts:number;lease_token:string;error_code?:string};
type Dependencies={db:SupabaseClient;provider:VerificationProvider;sendMail:(event:MailEvent,id:string)=>Promise<void>};
function assert(result:{error:any}){if(result.error)throw new Error('DATABASE_WRITE_FAILED');}
async function queueMail(db:SupabaseClient,id:string,key:string,kind:string,partyId?:string,status?:string){
 assert(await db.from('conveyancing_jobs').upsert({submission_id:id,event_key:key,kind:'email',payload:{kind,...(partyId?{partyId}:{}),...(status?{status}:{})}},{onConflict:'event_key',ignoreDuplicates:true}));
}
async function event(db:SupabaseClient,id:string,key:string,kind:string,safe_metadata:Record<string,unknown>={}){
 assert(await db.from('conveyancing_events').upsert({submission_id:id,event_key:key,kind,safe_metadata},{onConflict:'event_key',ignoreDuplicates:true}));
}
async function applyEnvelope(db:SupabaseClient,id:string,data:ClientIntakeFormData,envelope:ProviderEnvelope){
 const {data:people,error}=await db.from('conveyancing_people').select('*').eq('submission_id',id).order('party_index');if(error)throw new Error('DATABASE_READ_FAILED');
 const customers=envelopeCustomers(envelope),states:string[]=[];
 for(const person of people||[]){
  const party=data.parties[person.party_index],match=findCustomer(customers,{...person,email:party.email,full_name:[party.firstName,party.lastName].filter(Boolean).join(' ')});
  const status=personStatusFromCustomer(match);states.push(status);
  const patch={status,livesign_customer_id:match?.id||person.livesign_customer_id,voi_outcome:match?.voiOutcome||null,voi_review_status:match?.voiReviewStatus||null,has_flagged_items:!!match?.hasFlaggedItems,updated_at:new Date().toISOString()};
  if(status==='verified')await queueMail(db,id,'verified:'+id+':'+person.party_id,'verified',person.party_id);
  if(person.status!==status){
   const key='person:'+id+':'+person.party_id+':'+hash(JSON.stringify({...patch,updated_at:undefined})).slice(0,24);
   await event(db,id,key,'person_status_changed',{party_index:person.party_index,status});
   await queueMail(db,id,'firm:'+key,'firm_status',undefined,status);
  }
  assert(await db.from('conveyancing_people').update(patch).eq('id',person.id));
 }
 const verification=overallStatus(states as Array<'unverified'|'verified'|'failed'|'needs_review'>);
 const now=new Date().toISOString();
 assert(await db.from('conveyancing_cases').update({verification_status:verification,envelope_status:envelope.status||null,aml_status:envelope.aml?.status||null,aml_risk_rating:envelope.aml?.riskRating||null,last_synced_at:now,updated_at:now,error_code:null}).eq('submission_id',id));
 return {verification,aml:envelope.aml?.status||null};
}
async function processJob(job:Job,{db,provider,sendMail}:Dependencies){
 // Every write has a checked result. The lease protects work across instances;
 // a persisted create/start intent prevents blind repeats after a worker dies.
 const [{data:record,error:recordError},{data:submission,error:submissionError}]=await Promise.all([
  db.from('conveyancing_cases').select('*').eq('submission_id',job.submission_id).single(),
  db.from('submissions').select('id,reference,answers_ciphertext,encryption_meta,form_version_id,received_at').eq('id',job.submission_id).single(),
 ]);
 if(recordError||submissionError||!record||!submission)throw new Error('DATABASE_READ_FAILED');
 const id=job.submission_id,data=decryptAnswers(submission.answers_ciphertext,submission.encryption_meta,submission.form_version_id+':'+submission.reference) as unknown as ClientIntakeFormData;
 if(job.kind==='email'){
  // SMTP disconnect after acceptance is uncertain. Expired processing mail is
  // held for review instead of automatically sending the same email again.
  if(job.attempts>1&&job.error_code!=='EMAIL_CONFIGURATION_REQUIRED')throw new ProviderError('EMAIL_DELIVERY_NEEDS_RECONCILIATION',false,true);
  const kind=job.payload.kind,party=data.parties.find(p=>p.id===job.payload.partyId)||data.parties[0];
  const recipients=kind.startsWith('firm_')?(process.env.FIRM_EMAIL||'').split(',').map(v=>v.trim()).filter(Boolean):[party.email];
  if(!recipients.length)throw new ProviderError('EMAIL_CONFIGURATION_REQUIRED');
  for(const to of [...new Set(recipients)])await sendMail({kind,reference:submission.reference,role:data.role,name:kind.startsWith('firm_')?'':party.firstName,to,status:job.payload.status},job.id+'-'+hash(to).slice(0,12));
  await event(db,id,'mail:'+job.event_key,'email_accepted',{kind});
  return {state:'done'};
 }
 if(job.kind==='send'){
  let envelope:ProviderEnvelope|null=null;
  if(record.livesign_envelope_id)envelope=await provider.get(record.livesign_envelope_id);
  else if(record.send_phase!=='queued'){
   envelope=await provider.find(submission.reference);
   if(!envelope)throw new ProviderError('LIVESIGN_CREATE_NEEDS_RECONCILIATION',false,true);
  }else{
   const codes=await provider.countryCodes();
   // Do not silently treat an unsupported international dial code as Australia.
   for(const party of data.parties)if(party.phoneCountryCode!=='+61'&&!codes.some(c=>String(c.phoneCode||'').replace(/\D/g,'')===party.phoneCountryCode.slice(1)))throw new ProviderError('LIVESIGN_COUNTRY_CODE_UNAVAILABLE');
   const payload=buildEnvelopePayload({matterReference:submission.reference,role:data.role,parties:data.parties,property:data.property,finance:data.finance},{...provider.options,countryCodes:codes});
   if(validateEnvelopePayload(payload).length)throw new ProviderError('LIVESIGN_INVALID_DETAILS');
   assert(await db.from('conveyancing_cases').update({send_phase:'creating',updated_at:new Date().toISOString()}).eq('submission_id',id));
   try{envelope=await provider.create(payload);}
   catch(error){
    if(error instanceof ProviderError&&!error.ambiguous)assert(await db.from('conveyancing_cases').update({send_phase:'queued'}).eq('submission_id',id));
    throw error;
   }
   assert(await db.from('conveyancing_cases').update({livesign_envelope_id:envelope.id,send_phase:'created',envelope_status:envelope.status||'Draft'}).eq('submission_id',id));
  }
  if(!envelope)throw new ProviderError('LIVESIGN_INVALID_RESPONSE');
  // Recovered envelopes are linked before /start, including after a create timeout.
  assert(await db.from('conveyancing_cases').update({livesign_envelope_id:envelope.id,envelope_status:envelope.status||null}).eq('submission_id',id));
  if(envelope.status==='Draft'){
   if(record.send_phase==='starting')throw new ProviderError('LIVESIGN_START_NEEDS_RECONCILIATION',false,true);
   assert(await db.from('conveyancing_cases').update({send_phase:'starting'}).eq('submission_id',id));
   await provider.start(envelope.id);
   envelope={...envelope,status:'SentToClient'};
  }
  assert(await db.from('conveyancing_cases').update({send_status:'sent',send_phase:'sent',error_code:null,updated_at:new Date().toISOString()}).eq('submission_id',id));
  await applyEnvelope(db,id,data,envelope);
  // Same address can belong to several people: one "sent" confirmation per email.
  const seen=new Set<string>();
  for(const party of data.parties){const address=party.email.toLowerCase();if(seen.has(address))continue;seen.add(address);await queueMail(db,id,'sent:'+id+':'+hash(address).slice(0,24),'sent',party.id);}
  await queueMail(db,id,'firm-received:'+id,'firm_received',undefined,'Sent to LiveSign');
  assert(await db.rpc('wake_conveyancing_sync',{target:id}));
  await event(db,id,'sent:'+id,'sent_to_livesign');
  return {state:'done'};
 }
 if(!record.livesign_envelope_id)return {state:'done'};
 const envelope=await provider.get(record.livesign_envelope_id),status=await applyEnvelope(db,id,data,envelope);
 const terminal=status.verification==='verified'&&['Proceeding','NotProceeding'].includes(status.aml||'');
 if(Date.now()-Date.parse(submission.received_at)>30*86400000){assert(await db.from('conveyancing_cases').update({error_code:'STATUS_CHECK_PAUSED_AFTER_30_DAYS'}).eq('submission_id',id));return {state:'done'};}
 return {state:terminal?'done':'pending',run_after:new Date(Date.now()+120000).toISOString()};
}
export async function runConveyancingJobs(limit=2,dependencies?:Dependencies){
 const database=dependencies?.db||createPrivilegedClient();
 const expired=await database.from('conveyancing_sessions').select('id').lt('expires_at',new Date().toISOString()).not('answers_ciphertext','is',null).limit(100);
 if(expired.error)throw new Error('DRAFT_CLEANUP_FAILED');
 if(expired.data?.length)assert(await database.from('conveyancing_sessions').update({answers_ciphertext:null,encryption_meta:null}).in('id',expired.data.map(s=>s.id)).lt('expires_at',new Date().toISOString()));
 let deps=dependencies;
 if(!deps){const provider=liveSignProvider();if(!provider)return {processed:0,disabled:true};deps={db:database,provider,sendMail:sendConveyancingMail};}
 const {db}=deps;let processed=0;const start=Date.now();
 for(let i=0;i<Math.min(limit,3)&&Date.now()-start<160000;i++){
  const claimed=await db.rpc('claim_conveyancing_jobs',{p_limit:1});if(claimed.error)throw new Error('DATABASE_CLAIM_FAILED');
  const job=claimed.data?.[0] as Job|undefined;if(!job)break;
  let patch:Record<string,unknown>;
  try{patch=await processJob(job,deps);}
  catch(error){
   const code=error instanceof ProviderError?error.code:error instanceof Error&&error.message==='EMAIL_CONFIGURATION_REQUIRED'?'EMAIL_CONFIGURATION_REQUIRED':'PROCESSING_ERROR';
   const uncertain=(error instanceof ProviderError&&error.ambiguous)||job.kind==='email'&&code==='PROCESSING_ERROR';
   const retry=!uncertain&&job.attempts<20&&(code==='EMAIL_CONFIGURATION_REQUIRED'||(error instanceof ProviderError?error.retryable:job.kind!=='email'));
   patch={state:uncertain?'needs_reconciliation':retry?'pending':'failed',error_code:code,run_after:new Date(Date.now()+Math.min(3600000,60000*2**Math.min(job.attempts,6))).toISOString()};
   if(job.kind==='send'){
    assert(await db.from('conveyancing_cases').update({send_status:uncertain?'needs_reconciliation':retry?'pending_send':'send_error',error_code:code,updated_at:new Date().toISOString()}).eq('submission_id',job.submission_id));
    await queueMail(db,job.submission_id,'received:'+job.submission_id,'received');
    await queueMail(db,job.submission_id,'firm-received:'+job.submission_id,'firm_received',undefined,retry?'LiveSign pending':'Needs attention in LiveSign');
   }else if(job.kind==='sync')assert(await db.from('conveyancing_cases').update({error_code:code}).eq('submission_id',job.submission_id));
   await event(db,job.submission_id,'error:'+job.id+':'+job.attempts,'processing_attention',{kind:job.kind,code});
  }
  assert(await db.from('conveyancing_jobs').update({...patch,lease_until:null,updated_at:new Date().toISOString()}).eq('id',job.id).eq('lease_token',job.lease_token));
  processed++;
 }
 return {processed,disabled:false};
}
