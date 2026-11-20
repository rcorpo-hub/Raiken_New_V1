import {createHash,randomUUID} from 'node:crypto';
import {createPrivilegedClient} from '@/lib/supabase/privileged';
import {checkOrigin,readBoundedJson,errorResponse,HttpError} from '@/lib/workspace/http';
import {intakeSchema,managedFormSchema,validateAnswers,validateJsonBounds} from '@/lib/workspace/validation';
import {encryptAnswers} from '@/lib/workspace/encryption';
import {validateLegacy} from '@/lib/workspace/legacy-validation';
import {isRemovedForm} from '@/lib/workspace/form-availability';

export async function POST(request:Request,{params}:{params:Promise<{slug:string}>}){try{
 checkOrigin(request);const {slug}=await params;if(!/^[a-z0-9-]{1,100}$/.test(slug))throw new HttpError(404,'Form not found.');
 if(isRemovedForm(slug))throw new HttpError(404,'This form is no longer available.');
 if(slug==='conveyancing-intake')throw new HttpError(404,'Use the new conveyancing form at /nc.');
 const raw=await readBoundedJson(request);if(!validateJsonBounds(raw))throw new HttpError(400,'Invalid or excessive submission data.');
 const input=intakeSchema.safeParse(raw);if(!input.success)throw new HttpError(400,'Check the applicant details and form answers.');
 const value=input.data;const db=createPrivilegedClient();
 const ip=process.env.VERCEL==='1'?request.headers.get('x-vercel-forwarded-for')?.split(',')[0]||'unknown':'local';
 const {data:allowed,error:limitError}=await db.rpc('workspace_throttle',{bucket:createHash('sha256').update(`${slug}:${ip}`).digest('hex'),ceiling:30});
 if(limitError)throw new HttpError(503,'Submissions are temporarily unavailable. Your form has not been received.');
 if(!allowed)throw new HttpError(429,'Too many attempts. Please try again in a minute.');
 const [{data:form,error:formError},{data:branch}]=await Promise.all([
   db.from('forms').select('id,current_version_id').eq('slug',slug).eq('status','published').maybeSingle(),
   db.from('branches').select('id').eq('code',value.branch_code).eq('active',true).maybeSingle(),
 ]);
 if(formError||!form?.current_version_id||!branch)throw new HttpError(503,'This form is not ready to accept submissions. Nothing has been recorded.');
 const versionId=value.version_id||form.current_version_id;
 const {data:version}=await db.from('form_versions').select('id,schema_json,created_at').eq('id',versionId).eq('form_id',form.id).eq('state','published').maybeSingle();
 if(!version)throw new HttpError(400,'The submitted form version is unavailable. Refresh the form.');
 // An old version may complete for a bounded grace window after publication.
 if(versionId!==form.current_version_id){const {data:current}=await db.from('form_versions').select('created_at').eq('id',form.current_version_id).single();if(!current||Date.now()-Date.parse(current.created_at)>2*60*60*1000)throw new HttpError(409,'The form has changed. Refresh it before submitting.');}
 let answers=value.answers;
 if(version.schema_json?.engine==='managed'){
   const schema=managedFormSchema.safeParse(version.schema_json);if(!schema.success)throw new HttpError(503,'This form is unavailable.');
   if(!value.applicant.name||!value.applicant.email)throw new HttpError(400,'Your name and email address are required.');
   const checked=validateAnswers(schema.data,answers);if(Object.keys(checked.errors).length)return Response.json({error:'Please check the highlighted fields.',fields:checked.errors},{status:400});answers=checked.answers;
 }else{
   let checked;try{checked=validateLegacy(slug,answers,version.schema_json?.fields||[]);}catch(error){throw new HttpError(400,error instanceof Error?error.message:'Invalid form values.');}
   if(Object.keys(checked.errors).length)return Response.json({error:'Check the required fields in your form.',fields:checked.errors},{status:400});answers=checked.answers;
 }
 const reference=`RC-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${randomUUID().slice(0,8).toUpperCase()}`;
 const envelope=encryptAnswers(answers,`${versionId}:${reference}`);
 const summary={applicant_name:value.applicant.name||'Contact details in form',applicant_email:value.applicant.email,applicant_phone:value.applicant.phone||''};
 const payloadHash=createHash('sha256').update(JSON.stringify({form:form.id,version:versionId,branch:branch.id,answers,applicant:value.applicant})).digest('hex');
 const {data:accepted,error}=await db.rpc('accept_workspace_submission',{
   p_form:form.id,p_version:versionId,p_branch:branch.id,p_reference:reference,p_summary:summary,
   p_cipher:envelope.ciphertext,p_meta:envelope.meta,p_key:value.idempotency_key||null,p_hash:payloadHash,
   p_preferences:slug==='appointment-booking-form'?{service:answers.service,format:answers.format,preferredDate:answers.preferredDate,preferredTimeSlot:answers.preferredTimeSlot}:null,
 });
 if(error){if(error.code==='23505')throw new HttpError(409,'This retry identifier was already used for different answers.');throw new HttpError(503,'Your form could not be saved. Please try again.');}
 if(!accepted?.id)throw new HttpError(503,'Your form has not been recorded. Please try again.');
 return Response.json({success:true,reference:accepted.reference,status:'received',submission_id:accepted.id,message:'Your submission has been recorded. Our team will review it.'},{headers:{'Cache-Control':'no-store'}});
}catch(error){return errorResponse(error);}}
