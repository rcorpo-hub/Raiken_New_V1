'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {submissionStatuses,readable} from '@/lib/workspace/config';
export default function ReviewEditor({id,revision,status}:{id:string;revision:number;status:string}){
 const router=useRouter(),[currentStatus,setStatus]=useState(status),[note,setNote]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 async function save(event:React.FormEvent){event.preventDefault();setBusy(true);setError('');try{
  const response=await fetch('/api/admin/command',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'review',id,revision,status:currentStatus,note})});
  const body=await response.json();if(!response.ok)throw new Error(body.error);
  setMessage('Review saved. Submitted answers remain read-only.');setNote('');router.refresh();
 }catch(error){setError(error instanceof Error?error.message:'Please try again.');}finally{setBusy(false);}}
 return <form className="admin-panel admin-editor" onSubmit={save}><h2>Review & follow up</h2><p className="admin-muted">Update your internal work status and notes. Submitted answers are read-only.</p>
 {error&&<p role="alert" className="admin-alert admin-alert-error">{error}</p>}{message&&<p role="status" className="admin-alert admin-alert-success">{message}</p>}
 <label className="admin-field">Review status<select value={currentStatus} onChange={e=>setStatus(e.target.value)}>{submissionStatuses.map(s=><option key={s} value={s}>{readable(s)}</option>)}</select></label>
 <label className="admin-field">Private review note<textarea rows={3} maxLength={2000} value={note} onChange={e=>setNote(e.target.value)}/></label>
 <button className="admin-button admin-button-primary" disabled={busy}>{busy?'Saving…':'Save review'}</button></form>;
}
