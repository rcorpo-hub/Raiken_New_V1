import {randomUUID} from 'node:crypto';
import {after} from 'next/server';
import {z} from 'zod';
import {checkOrigin,readBoundedJson,errorResponse,HttpError} from '@/lib/workspace/http';
import {encryptAnswers} from '@/lib/workspace/encryption';
import {checkedFormData} from '@/lib/conveyancing/schema';
import {validSignature} from '@/lib/conveyancing/signature';
import {ownedSession,hash,throttle} from '@/lib/conveyancing/session';
import {runConveyancingJobs} from '@/lib/conveyancing/worker';
export const maxDuration=300;
export async function POST(request:Request){try{
 checkOrigin(request);await throttle(request,'submit',30);
 const raw=z.object({sessionId:z.uuid(),formData:z.unknown()}).strict().safeParse(await readBoundedJson(request,400000));
 if(!raw.success)throw new HttpError(400,'Check the form and session before submitting.');
 const {db,session:s,credential}=await ownedSession(request);
 if(s.id!==raw.data.sessionId)throw new HttpError(403,'This form belongs to another session.');
 const checked=checkedFormData(raw.data.formData);
 if(!checked.data||Object.keys(checked.errors).length)return Response.json({success:false,error:'Please check the form before submitting.',fields:checked.errors},{status:400});
 const data=checked.data;
 if(!validSignature(data.declaration.signatureDataUrl))throw new HttpError(400,'Please draw or upload a valid, non-empty signature.');
 const primary=data.parties[0],reference='RK-'+new Date().getUTCFullYear()+'-'+randomUUID().slice(0,8).toUpperCase();
 const payloadHash=hash(JSON.stringify(data)),encrypted=encryptAnswers(data,s.form_version_id+':'+reference);
 const result=await db.rpc('accept_conveyancing_submission',{p_session:s.id,p_token_hash:credential.tokenHash,p_hash:payloadHash,p_reference:reference,p_summary:{applicant_name:[primary.firstName,primary.lastName].filter(Boolean).join(' '),applicant_email:primary.email,applicant_phone:primary.phoneCountryCode+' '+primary.mobile},p_cipher:encrypted.ciphertext,p_meta:encrypted.meta,p_people:data.parties.map(p=>({id:p.id}))});
 if(result.error){if(result.error.code==='23505')throw new HttpError(409,'This form has already been received with different answers.');if(result.error.code==='42501')throw new HttpError(403,'Your form session is unavailable.');throw new HttpError(503,'Your form could not be saved. Keep this page open and try again.');}
 if(!result.data?.id)throw new HttpError(503,'Your form has not been recorded.');
 // Persisted work survives the response. No provider calls run while disabled.
 after(async()=>{try{await runConveyancingJobs(2);}catch{console.error('Conveyancing background work remains queued.');}});
 return Response.json({success:true,matterReference:result.data.reference,intakeId:result.data.id,emailDispatched:false,verificationStatus:'unverified',sentToLiveSign:false,message:'Your form has been recorded. Our team will arrange the next steps.',clientEmail:primary.email},{headers:{'Cache-Control':'private, no-store'}});
}catch(error){return errorResponse(error);}}
