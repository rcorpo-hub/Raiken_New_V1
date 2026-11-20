import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {createPrivilegedClient} from '@/lib/supabase/privileged';
import {checkOrigin,readBoundedJson,errorResponse,HttpError} from '@/lib/workspace/http';
import {encryptAnswers,decryptAnswers} from '@/lib/workspace/encryption';
import {sessionInput} from '@/lib/conveyancing/schema';
import {ownedSession,sessionCredential,newCredential,sessionCookie,throttle} from '@/lib/conveyancing/session';
const headers={'Cache-Control':'private, no-store'};
export async function POST(request:Request){try{
 checkOrigin(request);await throttle(request,'session',60);
 const input=z.object({startNew:z.boolean().optional()}).strict().safeParse(await readBoundedJson(request,1024));if(!input.success)throw new HttpError(400,'Invalid session request.');
 if(!input.data.startNew&&sessionCredential(request)){
  try{const {session:s}=await ownedSession(request);
   if(!s.submitted_submission_id)return Response.json({id:s.id,revision:s.revision,currentStep:s.current_step,partyIndex:s.party_index,formData:s.answers_ciphertext?decryptAnswers(s.answers_ciphertext,s.encryption_meta,'conveyancing-draft:'+s.id):null,hasAnswers:!!s.answers_ciphertext,updatedAt:s.answers_ciphertext?s.updated_at:null},{headers});
  }catch(error){if(!(error instanceof HttpError)||error.status===503)throw error;}
 }
 const db=createPrivilegedClient();const {data:form,error}=await db.from('forms').select('current_version_id').eq('slug','conveyancing-intake').eq('status','published').maybeSingle();
 if(error||!form?.current_version_id)throw new HttpError(503,'This form is not ready to save answers. Please contact our team.');
 const id=randomUUID(),credential=newCredential();
 const {error:saveError}=await db.from('conveyancing_sessions').insert({id,token_hash:credential.tokenHash,form_version_id:form.current_version_id});
 if(saveError)throw new HttpError(503,'Your form session could not be created.');
 const secure=new URL(request.url).protocol==='https:'?'; Secure':'';
 return Response.json({id,revision:0,currentStep:1,partyIndex:0,formData:null,hasAnswers:false,updatedAt:null},{headers:{...headers,'Set-Cookie':sessionCookie+'='+id+'.'+credential.token+'; Path=/api/conveyancing; HttpOnly; SameSite=Strict; Max-Age=86400'+secure}});
}catch(error){return errorResponse(error);}}
export async function PATCH(request:Request){try{
 checkOrigin(request);await throttle(request,'save',240);
 const input=sessionInput.safeParse(await readBoundedJson(request,400000));if(!input.success)throw new HttpError(400,'Check the form data before saving.');
 const {db,session:s}=await ownedSession(request),value=input.data;
 if(value.sessionId!==s.id)throw new HttpError(403,'This saved form belongs to another session.');
 if(s.submitted_submission_id)throw new HttpError(409,'This form was already submitted. Its answers are read-only.');
 const envelope=encryptAnswers(value.formData,'conveyancing-draft:'+s.id),updatedAt=new Date().toISOString();
 const {data,error}=await db.from('conveyancing_sessions').update({answers_ciphertext:envelope.ciphertext,encryption_meta:envelope.meta,current_step:value.currentStep,party_index:Math.min(value.partyIndex,value.formData.parties.length-1),revision:s.revision+1,updated_at:updatedAt}).eq('id',s.id).eq('revision',value.revision).is('submitted_submission_id',null).select('revision').maybeSingle();
 if(error)throw new HttpError(503,'Your answers could not be saved. Keep this page open.');
 if(!data)throw new HttpError(409,'This saved form changed in another tab. Reload it before continuing.');
 return Response.json({revision:data.revision,updatedAt},{headers});
}catch(error){return errorResponse(error);}}
