import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import {requireAdmin} from '@/lib/workspace/access';
import {checkOrigin,readBoundedJson,errorResponse,HttpError} from '@/lib/workspace/http';
import {managedFormSchema,validateJsonBounds} from '@/lib/workspace/validation';
import {contentDefinitions,cleanContent,type ContentKey} from '@/lib/workspace/content-definitions';

import {createPrivilegedClient} from '@/lib/supabase/privileged';
import {submissionStatuses} from '@/lib/workspace/config';
import {isRemovedForm} from '@/lib/workspace/form-availability';

const id=z.uuid();const revision=z.number().int().nonnegative();
const commandSchema=z.discriminatedUnion('action',[
 z.object({action:z.literal('review'),id,revision,status:z.enum(submissionStatuses),note:z.string().max(2000)}).strict(),
 z.object({action:z.literal('content'),id,revision,key:z.enum(Object.keys(contentDefinitions) as [ContentKey,...ContentKey[]]),document:z.unknown(),publish:z.boolean()}),
 z.object({action:z.literal('page'),id,revision,document:z.object({title:z.string().trim().min(1).max(160),summary:z.string().max(1500),body:z.string().trim().min(1).max(24000)}),publish:z.boolean()}),
 z.object({action:z.literal('form'),id,revision,definition:managedFormSchema,publish:z.boolean()}),
 z.object({action:z.literal('appointment'),id,status:z.enum(['pending','contacted','closed']),note:z.string().max(2000)}),
 z.object({action:z.literal('customer'),id,revision,name:z.string().trim().min(1).max(200),status:z.enum(['active','inactive']),branch:id}),
 z.object({action:z.literal('staff'),id,permissions:z.array(z.string().max(80)).max(40),branches:z.array(id).max(3),enabled:z.boolean()}),
 z.object({action:z.literal('invite'),email:z.email().max(254),name:z.string().trim().min(1).max(100)}),
]);
export async function POST(request:Request){try{
 checkOrigin(request);const raw=await readBoundedJson(request);
 if(!validateJsonBounds(raw))throw new HttpError(400,'This request contains invalid or excessive data.');
 const input=commandSchema.safeParse(raw);if(!input.success)throw new HttpError(400,input.error.issues[0]?.message||'Check the entered information.');
 const value=input.data;
 const permissions={review:'submissions.review',content:'content.edit',page:'content.edit',form:'forms.edit',appointment:'bookings.manage',customer:'customers.manage',staff:'users.manage',invite:'users.manage'};
 const session=await requireAdmin(permissions[value.action]);let result;
 if(value.action==='review'){
   result=await session.db.rpc('admin_review_submission',{target:value.id,expected_revision:value.revision,new_status:value.status,note:value.note,correction:null,correction_meta:null});
 }else if(value.action==='content'){
   let document:Record<string,string>;try{document=cleanContent(value.key,value.document);}catch(error){throw new HttpError(400,error instanceof Error?error.message:'Invalid content');}
   const {data:item}=await session.db.from('content_items').select('path').eq('id',value.id).maybeSingle();
   if(item?.path!==contentDefinitions[value.key].path)throw new HttpError(400,'The content page does not match.');
   result=await session.db.rpc('admin_save_content',{target:value.id,expected_revision:value.revision,document,metadata:{},publish:value.publish});
   if(!result.error&&value.publish){revalidatePath(contentDefinitions[value.key].path.startsWith('/_site')?'/':contentDefinitions[value.key].path);revalidatePath('/','layout');}
 }else if(value.action==='page'){
   const {data:item}=await session.db.from('content_items').select('path').eq('id',value.id).maybeSingle();
   if(!item||!/^\/(pages|blog)\/[a-z][a-z0-9-]{0,79}$/.test(item.path))throw new HttpError(400,'This content page is not supported.');
   result=await session.db.rpc('admin_save_content',{target:value.id,expected_revision:value.revision,document:value.document,metadata:{title:value.document.title,description:value.document.summary},publish:value.publish});
   if(!result.error&&value.publish){revalidatePath(item.path);revalidatePath('/blog');}
 }else if(value.action==='form'){
   const {data:protectedForm}=await session.db.from('forms').select('slug').eq('id',value.id).maybeSingle();
   if(protectedForm&&isRemovedForm(protectedForm.slug))throw new HttpError(403,'This form has been removed.');
   if(protectedForm?.slug==='conveyancing-intake')throw new HttpError(403,'The conveyancing workflow has protected verification questions.');
   if(value.publish&&!value.definition.reviewedLegacy)throw new HttpError(400,'Review the original form before publishing its replacement.');
   result=await session.db.rpc('admin_save_form',{target:value.id,expected_revision:value.revision,definition:value.definition,publish:value.publish});
   if(!result.error&&value.publish)revalidatePath('/','layout');
 }else if(value.action==='appointment')result=await session.db.rpc('admin_resolve_request',{target:value.id,new_status:value.status,note:value.note});
 else if(value.action==='customer')result=await session.db.rpc('admin_save_customer',{target:value.id,expected_revision:value.revision,new_name:value.name,new_status:value.status,target_branch:value.branch});
 else if(value.action==='staff'){
   if(!session.access.owner)throw new HttpError(403,'Only the owner can change access.');
   result=await session.db.rpc('admin_set_staff_access',{target:value.id,grants:[...new Set(value.permissions)],branch_ids:[...new Set(value.branches)],enabled:value.enabled});
 }else{
   if(!session.access.owner)throw new HttpError(403,'Only the owner can invite staff.');
   const privileged=createPrivilegedClient();
   const {data,error}=await privileged.auth.admin.inviteUserByEmail(value.email,{data:{display_name:value.name},redirectTo:`${new URL(request.url).origin}/auth/confirm`});
   if(error||!data.user)throw new HttpError(400,'An invitation could not be sent. Check your Auth email configuration and existing accounts.');
   // New accounts have no grants until the owner saves their explicit permissions.
   return Response.json({success:true,message:'Invitation sent. Set this staff member’s access before they can enter the workspace.'});
 }
 if(result?.error){const code=result.error.code;if(code==='42501')throw new HttpError(403,'Access denied for this action or office.');if(code==='PT409'||code==='40001')throw new HttpError(409,'This record changed. Refresh it before saving again.');throw new HttpError(400,'The change could not be saved. Check the information and try again.');}
 revalidatePath('/admin','layout');return Response.json({success:true});
}catch(error){return errorResponse(error);}}
