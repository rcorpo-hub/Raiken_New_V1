import 'server-only';
import {z} from 'zod';
import {requireAdmin,type getAdminSession} from './access';
import {HttpError} from './http';
import {submissionFormOptions} from './submission-forms';
import type {SubmissionService} from './submission-categories';

export const moduleQueries={
  submissions:{table:'submissions',select:'id,reference,status,received_at,safe_summary,branch_id,form_id,revision',permission:'submissions.read',order:'received_at'},
  customers:{table:'customers',select:'id,display_name,kind,status,branch_id,created_at,revision',permission:'customers.read',order:'created_at'},
  appointments:{table:'appointment_requests',select:'id,status,branch_id,created_at,preferences,submission_id,owner_note',permission:'bookings.read',order:'created_at'},
  documents:{table:'file_objects',select:'id,original_name,bytes,scan_status,created_at',permission:'documents.read',order:'created_at'},
  content:{table:'content_items',select:'id,title,path,status,revision,updated_at,published_revision_id',permission:'content.edit',order:'updated_at'},
  forms:{table:'forms',select:'id,title,slug,status,revision,current_version_id,updated_at',permission:'forms.edit',order:'updated_at'},
  staff:{table:'profiles',select:'id,display_name,email,status,created_at',permission:'users.manage',order:'created_at'},
  audit:{table:'audit_events',select:'id,action,entity_type,occurred_at,actor_id,branch_id,safe_metadata',permission:'audit.read',order:'occurred_at'},
} as const;
export type DataModule=keyof typeof moduleQueries;
export type DataRow=Record<string,unknown> & {id:string};
export async function listRecords(module:DataModule,page=1,search='',status='',branch='',service:SubmissionService|''='',form=''){
  const config=moduleQueries[module];const {db}=await requireAdmin(config.permission);
  const current=Math.max(1,Math.min(100000,Math.trunc(page)||1));
  const table:string=config.table;const selectedColumns:string=config.select;
  let query=db.from(table).select(selectedColumns,{count:'exact'}).order(config.order,{ascending:false});
  if(search){const column=module==='submissions'?'reference':module==='customers'?'display_name':module==='forms'?'title':module==='content'?'title':null;
    if(column)query=query.ilike(column,`%${search.replace(/[%_\\]/g,'').slice(0,100)}%`);
  }
  if(status&&['submissions','customers','appointments'].includes(module))query=query.eq('status',status);
  if(branch&&['submissions','customers','appointments'].includes(module))query=query.eq('branch_id',branch);
  if(module==='submissions'&&(service||form)){
    const permitted=await submissionFormOptions();
    const ids=permitted.filter(item=>(!service||item.service===service)&&(!form||item.id===form)).map(item=>item.id);
    if(!ids.length)return {rows:[] as DataRow[],count:0,page:current};
    query=query.in('form_id',ids);
  }
  const {data,error,count}=await query.range((current-1)*25,current*25-1);
  if(error)throw new HttpError(503,'Records could not be loaded. Please try again.');
  return {rows:(data||[]) as unknown as DataRow[],count:count||0,page:current};
}
export async function workspaceOverview(){
  const session=await requireAdmin();
  const count=async(table:string,permission:string,status?:string)=>{
    if(!session.access.permissions.includes(permission))return null;
    let query=session.db.from(table).select('id',{count:'exact',head:true});
    if(status)query=query.eq('status',status);
    const {count,error}=await query;if(error)throw new HttpError(503,'Dashboard data could not be loaded.');return count||0;
  };
  const [submissions,review,clients,appointments,recent]=await Promise.all([
    count('submissions','submissions.read'),count('submissions','submissions.read','received'),
    count('customers','customers.read'),count('appointment_requests','bookings.read','pending'),
    session.access.permissions.includes('submissions.read')?listRecords('submissions'):Promise.resolve(null),
  ]);
  return {submissions,review,clients,appointments,recent};
}
export async function getRecord(module:DataModule,id:string){
  const config=moduleQueries[module];const {db}=await requireAdmin(config.permission);
  const columns:string=module==='content'||module==='forms'?config.select:'*';
  const {data,error}=await db.from(config.table).select(columns).eq('id',id).maybeSingle();
  if(error)throw new HttpError(503,'This record could not be loaded.');
  if(!data)throw new HttpError(404,'Record not found or access denied.');
  const row=z.object({id:z.uuid()}).catchall(z.unknown()).safeParse(data);
  if(!row.success)throw new HttpError(503,'This record returned an invalid response.');
  return row.data;
}
export async function branches(){const {db}=await requireAdmin();const {data,error}=await db.from('branches').select('id,code,name').order('name');if(error)throw new HttpError(503,'Offices could not be loaded.');return data||[];}
