import {useCallback,useEffect,useRef,useState} from 'react';
import type {ClientIntakeFormData} from '../../types';
import {normalizeFormData} from './formState';
export type SyncStatus='loading'|'idle'|'saving'|'saved'|'offline'|'error';
type Snapshot={formData:ClientIntakeFormData;currentStep:number;partyIndex:number};
type Restored=Snapshot&{hasAnswers:boolean};
// Answers are held in memory and an encrypted server draft. The browser stores
// only a random session credential in an HttpOnly cookie, never personal data.
export function useSessionSync(enabled:boolean){
 const [status,setStatus]=useState<SyncStatus>('loading'),[lastSavedAt,setLastSavedAt]=useState<string|null>(null);
 const [errorMessage,setErrorMessage]=useState('');
 const session=useRef<string|null>(null),revision=useRef(0),pending=useRef<Snapshot|null>(null);
 const saving=useRef<Promise<void>|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null),submitted=useRef(false),alive=useRef(true);
 const restorePromise=useRef<Promise<Restored|null>|null>(null);
 const updateStatus=useCallback((s:SyncStatus)=>{if(alive.current)setStatus(s);},[]);
 const restore=useCallback(()=>{
  if(restorePromise.current)return restorePromise.current;
  restorePromise.current=(async()=>{
   const response=await fetch('/api/conveyancing/session',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(15000)});
   const body=await response.json();
   if(!response.ok){updateStatus('error');throw new Error(body.error||'Saved answers could not be loaded.');}
   session.current=body.id;revision.current=body.revision;submitted.current=false;updateStatus('idle');
   if(alive.current)setErrorMessage('');
   const formData=normalizeFormData(body.formData);if(!formData)return null;
   if(body.updatedAt&&alive.current)setLastSavedAt(body.updatedAt);
   return {formData,currentStep:body.currentStep,partyIndex:body.partyIndex,hasAnswers:body.hasAnswers} as Restored;
  })().catch(error=>{restorePromise.current=null;throw error;});
  return restorePromise.current;
 },[updateStatus]);
 const saveNow=useCallback(async function flush():Promise<void>{
  if(timer.current){clearTimeout(timer.current);timer.current=null;}
  if(submitted.current)return;
  if(saving.current){await saving.current;if(pending.current)return flush();return;}
  if(!pending.current)return;
  saving.current=(async()=>{
   const snapshot=pending.current!;pending.current=null;updateStatus('saving');
   try{
    if(!session.current)await restore();
    const response=await fetch('/api/conveyancing/session',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({...snapshot,sessionId:session.current,revision:revision.current}),signal:AbortSignal.timeout(15000)});
    const body=await response.json();if(!response.ok)throw new Error(body.error||'Answers could not be saved.');
    revision.current=body.revision;if(alive.current){setLastSavedAt(body.updatedAt);setErrorMessage('');}updateStatus('saved');
   }catch(error){if(!pending.current)pending.current=snapshot;if(alive.current)setErrorMessage(error instanceof Error?error.message:'Your answers could not be saved. Keep this page open.');updateStatus(navigator.onLine?'error':'offline');throw error;}
  })();
  try{await saving.current;}finally{saving.current=null;}
 },[restore,updateStatus]);
 const queueSave=useCallback((value:Snapshot,immediate=false)=>{
  if(submitted.current)return;pending.current=value;if(timer.current)clearTimeout(timer.current);
  timer.current=setTimeout(()=>{void saveNow().catch(()=>{});},immediate?0:800);
 },[saveNow]);
 useEffect(()=>{
  alive.current=true;const retry=()=>{if(enabled&&pending.current)void saveNow().catch(()=>{});};
  const interval=setInterval(retry,15000);window.addEventListener('online',retry);
  return()=>{alive.current=false;clearInterval(interval);window.removeEventListener('online',retry);if(timer.current)clearTimeout(timer.current);};
 },[enabled,saveNow]);
 const startNewSession=useCallback(async()=>{
  if(saving.current)await saving.current.catch(()=>{});if(timer.current)clearTimeout(timer.current);pending.current=null;
  const response=await fetch('/api/conveyancing/session',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"startNew":true}',signal:AbortSignal.timeout(15000)});
  const body=await response.json();if(!response.ok)throw new Error(body.error||'Could not start a new form.');
  session.current=body.id;revision.current=body.revision;submitted.current=false;restorePromise.current=null;
  if(alive.current){setLastSavedAt(null);setErrorMessage('');}updateStatus('idle');
 },[updateStatus]);
 return {status,lastSavedAt,errorMessage,restore,saveNow,queueSave,startNewSession,getSessionId:()=>session.current,markSubmitted:()=>{submitted.current=true;pending.current=null;if(timer.current)clearTimeout(timer.current);}};
}
