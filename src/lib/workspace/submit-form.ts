'use client';
import {createContext,useContext} from 'react';
export const FormVersionContext=createContext<{slug:string;versionId:string}|null>(null);
const attempts=new Map<string,string>();
// Retry identifiers live only in memory; no answers are persisted in browser storage.
async function submitForm(url:string,options:RequestInit,version:{slug:string;versionId:string}|null):Promise<Response>{
 const text=String(options.body||'{}');const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));
 const hash=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
 const cacheKey=url+hash;let key=attempts.get(cacheKey);
 if(!key){key=crypto.randomUUID();if(attempts.size>=32)attempts.delete(attempts.keys().next().value!);attempts.set(cacheKey,key);}
 const body={...JSON.parse(text),idempotency_key:key,...(version&&url.includes(`/forms/${version.slug}/`)?{version_id:version.versionId}:{})};
 const response=await fetch(url,{...options,body:JSON.stringify(body)});
 if(response.ok)attempts.delete(cacheKey);
 return response;
}
export function useFormSubmit(){const version=useContext(FormVersionContext);return (url:string,options:RequestInit)=>submitForm(url,options,version);}
