'use client';
import {useState} from 'react';
import Link from 'next/link';
import {Search,ChevronLeft,ChevronRight,ArrowUpRight,Inbox} from 'lucide-react';
import type {DataModule,DataRow} from '@/lib/workspace/data';
import {formatDate,readable} from '@/lib/workspace/config';
type Result={rows:DataRow[];count:number;page:number};
type Office={id:string;name:string;code:string};
export function StatusBadge({value}:{value:string}){return <span className={`admin-status status-${value}`}>{readable(value)}</span>;}
export default function RecordsTable({module,initial,offices=[],formNames={}}:{module:DataModule;initial:Result;offices?:Office[];formNames?:Record<string,string>}){
 const [result,setResult]=useState(initial);const [search,setSearch]=useState('');const [status,setStatus]=useState('');const [branch,setBranch]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 async function load(page=1){setBusy(true);setError('');try{const response=await fetch('/api/admin/records',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({module,page,search,status,branch})});const data=await response.json();if(!response.ok){if(response.status===401||response.status===403)setResult({rows:[],count:0,page:1});throw new Error(data.error||'Records could not be loaded.');}setResult(data);}catch(error){setError(error instanceof Error?error.message:'Please try again.');}finally{setBusy(false);}}
 const columns:Record<DataModule,string[]>={submissions:['Reference / form','Client','Status','Office','Received'],customers:['Client','Type','Office','Status','Added'],appointments:['Request','Preferred date','Office','Status','Received'],documents:['Document','Size','Status','Added'],content:['Page','Website path','Status','Updated'],forms:['Form','Public form','Status','Updated'],staff:['Name','Email','Access','Added'],audit:['Activity','Record type','When']};
 const officeName=(id:unknown)=>offices.find(office=>office.id===id)?.code||'—';
 function cells(row:DataRow){const s=(key:string)=>String(row[key]??'');const summary=(row.safe_summary||{}) as Record<string,string>;const preferences=(row.preferences||{}) as Record<string,string>;
 const detail=(text:string,subtext?:string)=><Link href={`/admin/${module}/${row.id}`} prefetch={false} className="admin-record-link"><strong>{text}</strong>{subtext&&<small>{subtext}</small>}</Link>;
 if(module==='submissions')return [detail(s('reference'),formNames[s('form_id')]||'Client form'),summary.applicant_name||'Details in form',<StatusBadge value={s('status')}/>,officeName(row.branch_id),formatDate(s('received_at'))];
 if(module==='customers')return [detail(s('display_name')),readable(s('kind')),officeName(row.branch_id),<StatusBadge value={s('status')}/>,formatDate(s('created_at'))];
 if(module==='appointments')return [detail(preferences.service||'Consultation request'),preferences.preferredDate||'To be arranged',officeName(row.branch_id),<StatusBadge value={s('status')}/>,formatDate(s('created_at'))];
 if(module==='documents')return [detail(s('original_name')),`${Math.ceil(Number(row.bytes||0)/1024)} KB`,<StatusBadge value={s('scan_status')}/>,formatDate(s('created_at'))];
 if(module==='content')return [detail(s('title')),s('path').startsWith('/_site')?'Shared website content':s('path'),<StatusBadge value={s('status')}/>,formatDate(s('updated_at'))];
 if(module==='forms')return [detail(s('title')),s('slug'),<StatusBadge value={s('status')}/>,formatDate(s('updated_at'))];
 if(module==='staff')return [detail(s('display_name')),s('email'),<StatusBadge value={s('status')}/>,formatDate(s('created_at'))];
 return [readable(s('action').replaceAll('.',' ')),readable(s('entity_type')),formatDate(s('occurred_at'))];
 }
 return <section className="admin-panel admin-records">
  <form className="admin-table-tools" onSubmit={event=>{event.preventDefault();void load();}}>
   {['submissions','customers','content','forms'].includes(module)&&<label className="admin-search"><Search size={17}/><span className="sr-only">{module==='submissions'?'Search reference':'Search records'}</span><input placeholder={module==='submissions'?'Search reference…':'Search records…'} value={search} onChange={event=>setSearch(event.target.value)} maxLength={100}/></label>}
   {['submissions','customers','appointments'].includes(module)&&<><label><span className="sr-only">Status</span><select value={status} onChange={event=>setStatus(event.target.value)}><option value="">All statuses</option>{(module==='submissions'?['received','under_review','action_required','processed','archived']:module==='customers'?['active','inactive']:['pending','contacted','booked','closed']).map(value=><option key={value} value={value}>{readable(value)}</option>)}</select></label><label><span className="sr-only">Office</span><select value={branch} onChange={event=>setBranch(event.target.value)}><option value="">All permitted offices</option>{offices.map(office=><option key={office.id} value={office.id}>{office.name}</option>)}</select></label></>}
   <button className="admin-button admin-button-small" disabled={busy}>{busy?'Loading…':'Apply filters'}</button><span className="admin-result-count" role="status">{result.count} {result.count===1?'record':'records'}</span>
  </form>
  {error&&<p className="admin-alert admin-alert-error" role="alert">{error}</p>}
  {result.rows.length?<div className="admin-table-scroll"><table><thead><tr>{columns[module].map(label=><th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{result.rows.map(row=><tr key={row.id}>{cells(row).map((cell,index)=><td key={index}>{cell}</td>)}</tr>)}</tbody></table></div>:<div className="admin-empty"><Inbox size={30}/><h2>{search||status||branch?'No matching records.':'Nothing here yet.'}</h2><p>{search||status||branch?'Try another filter.':'New records will appear here when they are received. No sample records are included in these counts.'}</p></div>}
  <div className="admin-pagination"><span>Page {result.page} of {Math.max(1,Math.ceil(result.count/25))}</span><div><button className="admin-icon-button" aria-label="Previous page" disabled={busy||result.page<=1} onClick={()=>load(result.page-1)}><ChevronLeft size={18}/></button><button className="admin-icon-button" aria-label="Next page" disabled={busy||result.page*25>=result.count} onClick={()=>load(result.page+1)}><ChevronRight size={18}/></button></div></div>
 </section>;
}
