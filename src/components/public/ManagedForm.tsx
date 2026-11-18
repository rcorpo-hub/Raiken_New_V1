'use client';
import '@/styles/managed-forms.css';
import {useState} from 'react';
import Link from 'next/link';
import {ArrowRight,CheckCircle2} from 'lucide-react';
import {FormVersionContext,useFormSubmit} from '@/lib/workspace/submit-form';
import type {ManagedForm as Definition} from '@/lib/workspace/validation';

export function FormVersionProvider({slug,versionId,children}:{slug:string;versionId:string;children:React.ReactNode}){return <FormVersionContext.Provider value={{slug,versionId}}>{children}</FormVersionContext.Provider>;}
export default function ManagedForm({definition,slug,versionId,compact=false}:{definition:Definition;slug:string;versionId:string;compact?:boolean}){
 const submit=useFormSubmit();const [values,setValues]=useState<Record<string,string|boolean>>(()=>Object.fromEntries(definition.fields.map(field=>[field.key,field.type==='checkbox'?false:''])));
 const [applicant,setApplicant]=useState({name:'',email:'',phone:''});const [branch,setBranch]=useState('ADE');
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [fields,setFields]=useState<Record<string,string>>({});const [reference,setReference]=useState('');
 async function send(event:React.FormEvent){event.preventDefault();setBusy(true);setError('');setFields({});try{
   const response=await submit(`/api/forms/${slug}/submissions`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({applicant,branch_code:branch,answers:values,version_id:versionId})});const data=await response.json();
   if(!response.ok){setFields(data.fields||{});throw new Error(data.error||'Please try again.');}setReference(data.reference);
 }catch(error){setError(error instanceof Error?error.message:'Please try again.');}finally{setBusy(false);}}
 return <div className={compact?'managed-form-compact':'new-page editorial-page managed-form-page'}>
  {!compact&&<><Link href="/forms" className="text-link">← All client forms</Link><header className="page-intro"><p className="eyebrow">CLIENT FORM</p><h1>{definition.title}</h1><p>{definition.description}</p></header></>}
  {reference?<section className="managed-form-success" role="status"><CheckCircle2 size={36}/><h2>Your form has been received.</h2><p>Keep your reference: <strong>{reference}</strong></p><p>Our team will review your information.</p><Link href="/forms" className="text-link">Return to client forms<ArrowRight size={18}/></Link></section>:
  <form className="managed-form-fields" onSubmit={send}>
   {error&&<p role="alert" className="managed-form-error">{error}</p>}
   <fieldset><legend>Your contact details</legend><label htmlFor="applicant-name">Full name<input id="applicant-name" required maxLength={200} autoComplete="name" value={applicant.name} onChange={event=>setApplicant({...applicant,name:event.target.value})}/></label><label htmlFor="applicant-email">Email address<input id="applicant-email" type="email" required maxLength={254} autoComplete="email" value={applicant.email} onChange={event=>setApplicant({...applicant,email:event.target.value})}/></label><label htmlFor="applicant-phone">Phone<input id="applicant-phone" type="tel" autoComplete="tel" maxLength={60} value={applicant.phone} onChange={event=>setApplicant({...applicant,phone:event.target.value})}/></label><label htmlFor="applicant-branch">Office<select id="applicant-branch" value={branch} onChange={event=>setBranch(event.target.value)}><option value="ADE">Adelaide</option><option value="BNE">Brisbane</option><option value="PER">Perth</option></select></label></fieldset>
   <fieldset><legend>Form details</legend>{definition.fields.map(field=><div key={field.key} className="managed-field"><label htmlFor={`field-${field.key}`} className={field.type==='checkbox'?'managed-checkbox':''}>
     {field.type==='checkbox'?<input id={`field-${field.key}`} type="checkbox" required={field.required} checked={values[field.key]===true} onChange={event=>setValues({...values,[field.key]:event.target.checked})}/>:null}
     <span>{field.label}{field.required&&<span aria-hidden="true"> *</span>}</span>
     {field.type==='textarea'?<textarea id={`field-${field.key}`} rows={4} required={field.required} maxLength={12000} value={String(values[field.key]||'')} onChange={event=>setValues({...values,[field.key]:event.target.value})} aria-invalid={!!fields[field.key]} aria-describedby={fields[field.key]?`error-${field.key}`:undefined}/>:field.type==='select'?<select id={`field-${field.key}`} required={field.required} value={String(values[field.key]||'')} onChange={event=>setValues({...values,[field.key]:event.target.value})}><option value="">Choose an option</option>{field.options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select>:field.type!=='checkbox'?<input id={`field-${field.key}`} type={field.type} required={field.required} maxLength={12000} value={String(values[field.key]||'')} onChange={event=>setValues({...values,[field.key]:event.target.value})} aria-invalid={!!fields[field.key]} aria-describedby={fields[field.key]?`error-${field.key}`:undefined}/>:null}
    </label>{fields[field.key]&&<p id={`error-${field.key}`} className="managed-field-error">{fields[field.key]}</p>}</div>)}</fieldset>
   <button className="button button-orange" disabled={busy}>{busy?'Submitting…':'Submit form'}<ArrowRight size={20}/></button>
  </form>}
 </div>;
}
