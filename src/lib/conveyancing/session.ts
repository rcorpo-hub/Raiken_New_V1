import 'server-only';
import {createHash,randomBytes} from 'node:crypto';
import {createPrivilegedClient} from '@/lib/supabase/privileged';
import {HttpError} from '@/lib/workspace/http';
export const sessionCookie='rc_conveyancing_session';
export const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
export function sessionCredential(request:Request){
 const raw=request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(sessionCookie+'='))?.slice(sessionCookie.length+1)||'';
 const [id,token]=raw.split('.');
 if(!/^[a-f\d-]{36}$/i.test(id||'')||!/^[a-f\d]{64}$/i.test(token||''))return null;
 return {id,tokenHash:hash(token)};
}
export async function ownedSession(request:Request){
 const credential=sessionCredential(request);if(!credential)throw new HttpError(403,'Your form session is unavailable. Reload this page.');
 const db=createPrivilegedClient();
 const {data,error}=await db.from('conveyancing_sessions').select('*').eq('id',credential.id).eq('token_hash',credential.tokenHash).gt('expires_at',new Date().toISOString()).maybeSingle();
 if(error)throw new HttpError(503,'Saved forms are temporarily unavailable.');
 if(!data)throw new HttpError(403,'Your saved form has expired or is unavailable. Start a new form.');
 return {db,session:data,credential};
}
export async function throttle(request:Request,action:string,ceiling:number){
 const db=createPrivilegedClient();
 const ip=process.env.VERCEL==='1'?request.headers.get('x-vercel-forwarded-for')?.split(',')[0]||'unknown':'local';
 const result=await db.rpc('workspace_throttle',{bucket:hash('conveyancing:'+action+':'+ip),ceiling});
 if(result.error)throw new HttpError(503,'This service is temporarily unavailable.');
 if(!result.data)throw new HttpError(429,'Too many attempts. Please try again shortly.');
}
export function newCredential(){const token=randomBytes(32).toString('hex');return {token,tokenHash:hash(token)};}
