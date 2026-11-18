'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {Save,ArrowUpRight,History} from 'lucide-react';
import {contentDefinitions,type ContentKey} from '@/lib/workspace/content-definitions';
export default function ContentEditor({id,revision,contentKey,genericDefinition,initial,canPublish,history}:{id:string;revision:number;contentKey?:ContentKey;genericDefinition?:{path:string;fields:Record<string,readonly[string,string]>};initial:Record<string,string>;canPublish:boolean;history:{id:string;revision:number;created_at:string;blocks:unknown}[]}){
 const router=useRouter();const [values,setValues]=useState(initial);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [error,setError]=useState('');const [currentRevision,setCurrentRevision]=useState(revision);
 async function save(publish:boolean){setBusy(true);setError('');setMessage('');try{
  const response=await fetch('/api/admin/command',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:contentKey?'content':'page',id,revision:currentRevision,key:contentKey,document:values,publish})});const data=await response.json();if(!response.ok)throw new Error(data.error);setCurrentRevision(currentRevision+1);setMessage(publish?'Published. Your website now uses this content.':'Draft saved. The live website is unchanged.');router.refresh();
 }catch(error){setError(error instanceof Error?error.message:'Please try again.');}finally{setBusy(false);}}
 const definition=contentKey?contentDefinitions[contentKey]:genericDefinition!;
 return <div className="admin-editor-grid"><form className="admin-panel admin-editor" onSubmit={event=>{event.preventDefault();void save(false);}}>
  <div className="admin-panel-heading"><div><h2>Edit page content</h2><p>Save a draft first, then publish when it is ready.</p></div>{!definition.path.startsWith('/_site')&&<Link href={definition.path} target="_blank" rel="noopener noreferrer" className="admin-text-link">View page<ArrowUpRight size={16}/></Link>}</div>
  {error&&<p className="admin-alert admin-alert-error" role="alert">{error}</p>}{message&&<p className="admin-alert admin-alert-success" role="status">{message}</p>}
  {Object.entries(definition.fields).map(([key,field])=><label key={key} className="admin-field">{field[0]}{key==='body'||key==='summary'||key==='members'||key.endsWith('Text')||key==='intro'||key==='leadBio'?<textarea rows={key==='members'||key==='body'?8:3} maxLength={key==='body'?24000:key==='members'?6000:1500} required={key!=='summary'} value={values[key]||''} onChange={event=>setValues({...values,[key]:event.target.value})}/>:<input type={key==='email'?'email':'text'} maxLength={300} required value={values[key]||''} onChange={event=>setValues({...values,[key]:event.target.value})}/>}</label>)}
  <div className="admin-editor-actions"><button type="submit" className="admin-button" disabled={busy}><Save size={17}/>Save draft</button><button type="button" className="admin-button admin-button-primary" disabled={busy||!canPublish} onClick={()=>save(true)}>{busy?'Saving…':'Publish to website'}</button></div>
 </form><aside className="admin-panel admin-editor-help"><History size={22}/><h2>Previous versions</h2><p>Restoring a version loads it into this editor. Review it, then publish it as a new version.</p>{history.length?<ul>{history.map(version=><li key={version.id}><span>Version {version.revision}</span><button type="button" className="admin-text-link" disabled={busy} onClick={()=>{setValues(version.blocks as Record<string,string>);setMessage('Previous version loaded. Save a draft or publish to apply it.');}}>Load into editor</button></li>)}</ul>:<p>No published versions yet.</p>}</aside></div>;
}
