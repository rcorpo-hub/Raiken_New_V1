import Link from 'next/link';
import {notFound} from 'next/navigation';
import {z} from 'zod';
import {requireAdminPage} from '@/lib/workspace/access';
import {moduleQueries,getRecord,branches,type DataModule} from '@/lib/workspace/data';
import {formatDate,readable} from '@/lib/workspace/config';
import {decryptAnswers} from '@/lib/workspace/encryption';
import {contentDefinitions,defaultContent,type ContentKey} from '@/lib/workspace/content-definitions';
import {managedFormSchema,type ManagedForm} from '@/lib/workspace/validation';
import SubmissionAnswers from '@/components/admin/SubmissionAnswers';
import {registeredFormService} from '@/lib/workspace/submission-forms';
import {submissionServiceLabel} from '@/lib/workspace/submission-categories';
import catalog from '@/lib/workspace/form-catalog.json';
import ContentEditor from '@/components/admin/ContentEditor';
import FormEditor from '@/components/admin/FormEditor';
import ReviewEditor from '@/components/admin/ReviewEditor';
import RecordEditor from '@/components/admin/RecordEditor';
import {StatusBadge} from '@/components/admin/RecordsTable';
import DownloadDocument from '@/components/admin/DownloadDocument';

function AnswerList({answers,labels={}}:{answers:Record<string,unknown>;labels?:Record<string,string>}){return <dl className="admin-answer-list">{Object.entries(answers).map(([key,value])=><div key={key}><dt>{labels[key]||readable(key)}</dt><dd>{typeof value==='boolean'?(value?'Yes':'No'):typeof value==='object'?<pre>{JSON.stringify(value,null,2)}</pre>:String(value||'—')}</dd></div>)}</dl>;}
export default async function RecordPage({params}:{params:Promise<{module:string;id:string}>}){
 const {module,id}=await params;if(!(module in moduleQueries)||!z.uuid().safeParse(id).success)notFound();
 const key=module as DataModule;const config=moduleQueries[key];const session=await requireAdminPage(config.permission);const row=await getRecord(key,id);
 const heading=(title:string,description:string)=><div className="admin-page-heading"><div><Link href={`/admin/${module}`} className="admin-back-link">← Back to {module==='customers'?'clients':module}</Link><h1>{title}</h1><p>{description}</p></div></div>;
 if(module==='submissions'){
  const {error:logError}=await session.db.rpc('admin_record_access',{kind:'submission.read_authorized',target:id,reason:''});if(logError)throw new Error('Record access could not be recorded.');
  const [{data:reviews,error:reviewError},{data:corrections,error:correctionError},{data:version,error:versionError},{data:form,error:formError},offices]=await Promise.all([
    session.db.from('submission_reviews').select('id,note_text,status_to,created_at').eq('submission_id',id).order('created_at',{ascending:false}),
    session.db.from('submission_corrections').select('*').eq('submission_id',id).order('revision',{ascending:false}),
    session.db.from('form_versions').select('schema_json,version').eq('id',row.form_version_id).maybeSingle(),
    session.db.from('forms').select('id,title,slug,directory_category').eq('id',row.form_id).maybeSingle(),
    branches(),
  ]);
  if(reviewError||correctionError||versionError||formError)throw new Error('Submission details unavailable.');
  const original=row.answers_ciphertext?decryptAnswers(String(row.answers_ciphertext),row.encryption_meta as {iv:string;tag:string},`${row.form_version_id}:${row.reference}`):(row.answers_json||{}) as Record<string,unknown>;
  const latest=corrections?.[0];const working=latest?decryptAnswers(latest.answers_ciphertext,latest.encryption_meta,`${id}:correction:${latest.revision}`):original;
  const title=typeof version?.schema_json?.title==='string'?version.schema_json.title:form?.title||'Client form';
  const category=form?submissionServiceLabel(registeredFormService(form)):'Uncategorised';
  const summary=(row.safe_summary||{}) as Record<string,unknown>;
  const contact={name:summary.applicant_name,email:summary.applicant_email,phone:summary.applicant_phone,office:offices.find(office=>office.id===row.branch_id)?.name};
  return <>{heading(title,`${row.reference} · ${category} · Received ${formatDate(String(row.received_at))} · Form version ${version?.version||'recorded'}`)}
   <div className="admin-record-layout"><div>
    <section className="admin-panel admin-submission-entry">
     <div className="admin-panel-heading"><div><h2>{latest?'Current working information':'Submitted information'}</h2><p>This completed form is read-only. Original submitted answers are preserved.</p></div><StatusBadge value={String(row.status)}/></div>
     <SubmissionAnswers idPrefix={`submission-${id}-working`} answers={working} schema={version?.schema_json} contact={contact}/>
    </section>
    {latest&&<details className="admin-panel admin-original-entry"><summary>Original submitted answers — preserved</summary><SubmissionAnswers idPrefix={`submission-${id}-original`} answers={original} schema={version?.schema_json} contact={contact} caption="Original submitted answers"/></details>}
    <section className="admin-panel admin-editor"><h2>Review history</h2>{reviews?.length?<ul className="admin-timeline">{reviews.map(review=><li key={review.id}><strong>{readable(review.status_to||'Reviewed')}</strong><time>{formatDate(review.created_at)}</time><p>{review.note_text||'Status updated.'}</p></li>)}</ul>:<p className="admin-muted">No review notes yet.</p>}{!!corrections?.length&&<p className="admin-small">{corrections.length} correction version{corrections.length===1?'':'s'} retained. Original answers have not been replaced.</p>}</section>
   </div>{session.access.permissions.includes('submissions.review')&&<ReviewEditor id={id} revision={Number(row.revision)} status={String(row.status)} answers={working} canCorrect={session.access.permissions.includes('submissions.correct')}/>}</div>
  </>;

 }
 if(module==='content'){
  const contentKey=Object.keys(contentDefinitions).find(key=>contentDefinitions[key as ContentKey].path===row.path) as ContentKey|undefined;if(!contentKey&&!/^\/(pages|blog)\/[a-z][a-z0-9-]{0,79}$/.test(String(row.path)))notFound();
  const [{data:draft,error},{data:history,error:historyError}]=await Promise.all([session.db.rpc('admin_draft',{kind:'content',target:id}),session.db.from('content_revisions').select('id,revision,created_at,blocks').eq('content_id',id).order('revision',{ascending:false}).limit(20)]);
  if(error||historyError||!draft)throw new Error('Content editor unavailable.');
  const current=(history||[]).find(item=>item.id===row.published_revision_id);
  const genericDefinition={path:String(row.path),fields:{title:['Page title',String(row.title)] as const,summary:['Short introduction',''] as const,body:['Page content — separate paragraphs with a blank line',''] as const}};
  return <>{heading(String(row.title),'Drafts remain private. Publishing updates the public website.')}<ContentEditor id={id} revision={Number(row.revision)} contentKey={contentKey} genericDefinition={genericDefinition} initial={draft.draft_blocks||current?.blocks||(contentKey?defaultContent(contentKey):{title:String(row.title),summary:'',body:''})} canPublish={session.access.permissions.includes('content.publish')} history={history||[]}/></>;
 }
 if(module==='forms'){
  const [{data:draft,error},{data:history,error:historyError}]=await Promise.all([session.db.rpc('admin_draft',{kind:'forms',target:id}),session.db.from('form_versions').select('id,version,schema_json').eq('form_id',id).order('version',{ascending:false}).limit(20)]);
  if(error||historyError||!draft)throw new Error('Form editor unavailable.');
  const registration=catalog.find(item=>item.slug===row.slug);const current=(history||[]).find(item=>item.id===row.current_version_id);const published=managedFormSchema.safeParse(current?.schema_json);
  const initial=draft.draft_schema|| (published.success?published.data:{engine:'managed',title:row.title,description:registration?.description||'',fields:registration?.fields||[],reviewedLegacy:false}) as ManagedForm;
  return <>{heading(String(row.title),'Edit questions, preview the fields, then publish a new version.')}<FormEditor id={id} revision={Number(row.revision)} initial={initial} path={registration?.path||`/apply/${row.slug}`} canPublish={session.access.permissions.includes('forms.publish')} legacy={!!registration&&!published.success} history={history||[]}/></>;
 }
 if(module==='customers'){
  const [offices,{data:contacts},{data:submissions}]=await Promise.all([branches(),session.db.from('customer_contacts').select('id,kind,value').eq('customer_id',id),session.db.from('submissions').select('id,reference,status').eq('customer_id',id).order('received_at',{ascending:false}).limit(30)]);
  return <>{heading(String(row.display_name),'Client profile changes do not replace information in earlier submissions.')}<div className="admin-record-layout"><section className="admin-panel admin-editor"><h2>Contact information</h2><dl className="admin-definition-list">{contacts?.map(contact=><div key={contact.id}><dt>{readable(contact.kind)}</dt><dd>{contact.value||'Not supplied'}</dd></div>)}</dl><h2>Related submissions</h2>{submissions?.length?<ul className="admin-link-list">{submissions.map(item=><li key={item.id}><Link href={`/admin/submissions/${item.id}`} prefetch={false}>{item.reference}</Link><StatusBadge value={item.status}/></li>)}</ul>:<p className="admin-muted">No related submissions within your access.</p>}</section>{session.access.permissions.includes('customers.manage')&&<RecordEditor module="customers" row={row} offices={offices}/>}</div></>;
 }
 if(module==='appointments')return <>{heading('Appointment request','Confirm a time with the client before making a reservation.')}<div className="admin-record-layout"><section className="admin-panel admin-editor"><h2>Preferred arrangements</h2><AnswerList answers={(row.preferences||{}) as Record<string,unknown>}/>{!!row.submission_id&&<Link className="admin-text-link" href={`/admin/submissions/${row.submission_id}`} prefetch={false}>Open the related submission</Link>}</section>{session.access.permissions.includes('bookings.manage')&&<RecordEditor module="appointments" row={row} offices={[]}/>}</div></>;
 if(module==='documents')return <>{heading(String(row.original_name),'Files remain private. Only permitted, verified clean documents can be downloaded.')}<section className="admin-panel admin-editor"><h2>Document status</h2><StatusBadge value={String(row.scan_status)}/><p>{row.scan_status==='clean'&&!!row.scan_engine&&!!row.scanned_at&&!!row.verified_mime?'This document is marked as verified clean.':'This document cannot be downloaded until its scan has completed successfully.'}</p>{row.scan_status==='clean'&&!!row.scan_engine&&!!row.scanned_at&&!!row.verified_mime&&session.access.permissions.includes('documents.download')&&<DownloadDocument id={id}/>}</section></>;
 if(module==='staff'){
  const [offices,{data:permissions},{data:grants},{data:assigned},{data:roles}]=await Promise.all([branches(),session.db.from('permissions').select('code,description').order('code'),session.db.from('user_permissions').select('permission_code').eq('user_id',id),session.db.from('user_branch_access').select('branch_id').eq('user_id',id),session.db.from('user_roles').select('role_id').eq('user_id',id)]);
  const isOwner=roles?.some(role=>role.role_id==='owner');
  return <>{heading(String(row.display_name||'Team member'),String(row.email||''))}{isOwner||id===session.access.id?<section className="admin-panel admin-editor"><h2>Protected owner access</h2><p>The owner’s full access cannot be changed in this screen. This prevents accidental lockout.</p></section>:<RecordEditor module="staff" row={row} offices={offices} permissions={permissions||[]} selectedPermissions={grants?.map(grant=>grant.permission_code)||[]} selectedBranches={assigned?.map(assignment=>assignment.branch_id)||[]} owner={session.access.owner}/>}</>;
 }
 notFound();
}
