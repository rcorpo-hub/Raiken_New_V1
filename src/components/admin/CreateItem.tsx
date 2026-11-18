'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Plus} from 'lucide-react';
export default function CreateItem({kind}:{kind:'form'|'content'}){
 const router=useRouter();const [open,setOpen]=useState(false);const [title,setTitle]=useState('');const [slug,setSlug]=useState('');const [category,setCategory]=useState('General');const [type,setType]=useState('page');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 return <div className="admin-invite"><button className="admin-button" onClick={()=>setOpen(!open)}><Plus size={17}/>{kind==='form'?'Create a form':'Create a page or post'}</button>{open&&<form className="admin-panel admin-inline-form" onSubmit={async event=>{event.preventDefault();setBusy(true);setError('');try{const response=await fetch('/api/admin/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:kind==='form'?'form':type,title,slug,category})});const data=await response.json();if(!response.ok)throw new Error(data.error);router.push(data.next);router.refresh();}catch(error){setError(error instanceof Error?error.message:'Please try again.');}finally{setBusy(false);}}}>
  <label className="admin-field">Title<input required maxLength={160} value={title} onChange={event=>{setTitle(event.target.value);if(!slug)setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));}}/></label>
  {kind==='content'&&<label className="admin-field">Content type<select value={type} onChange={event=>setType(event.target.value)}><option value="page">Website page</option><option value="post">Insight / blog post</option></select></label>}
  <label className="admin-field">URL name<input required maxLength={80} pattern="[a-z][a-z0-9-]*" value={slug} onChange={event=>setSlug(event.target.value)}/><small>Public URL: /{kind==='form'?'apply':type==='post'?'blog':'pages'}/{slug||'your-page-name'}</small></label>
  {kind==='form'&&<label className="admin-field">Forms directory section<select value={category} onChange={event=>setCategory(event.target.value)}><option value="Registration">Personal tax</option><option value="Corporate">Business — Company</option><option value="Trusts">Business — Trust</option><option value="Conveyancing">Conveyancing</option><option value="General">General</option></select></label>}
  {error&&<p className="admin-alert admin-alert-error" role="alert">{error}</p>}<button className="admin-button admin-button-primary" disabled={busy}>{busy?'Creating…':'Create private draft'}</button>
 </form>}</div>;
}
