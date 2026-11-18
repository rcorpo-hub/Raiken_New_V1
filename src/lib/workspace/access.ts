import 'server-only';
import {cache} from 'react';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {publicDatabaseConfig,type AdminAccess} from './config';
import {HttpError} from './http';

export const getAdminSession=cache(async()=>{
  if(!publicDatabaseConfig()) return {state:'setup' as const};
  const db=await createClient();
  const {data:{user},error}=await db.auth.getUser();
  if(error || !user) return {state:'login' as const};
  const {data:access,error:accessError}=await db.rpc('current_admin_access');
  if(accessError) return {state:'database' as const};
  if(!access?.permissions?.length) return {state:'denied' as const};
  const assurance=await db.auth.mfa.getAuthenticatorAssuranceLevel();
  return {state:assurance.data?.currentLevel==='aal2'?'ready' as const:'mfa' as const,access:access as AdminAccess,db,user};
});
export async function requireAdmin(permission?:string) {
  const session=await getAdminSession();
  if(session.state==='setup'||session.state==='database') throw new HttpError(503,'The owner workspace is not configured yet.');
  if(session.state==='login') throw new HttpError(401,'Sign in to continue.');
  if(session.state==='denied') throw new HttpError(403,'This account has no workspace access.');
  if(session.state==='mfa') throw new HttpError(403,'Complete two-step verification to continue.');
  if(permission&&!session.access.permissions.includes(permission)) throw new HttpError(403,'You do not have access to this feature.');
  return session;
}
export async function requireAdminPage(permission?:string) {
  const session=await getAdminSession();
  if(session.state==='setup'||session.state==='database') redirect('/admin/setup');
  if(session.state==='login'||session.state==='denied') redirect('/admin/login');
  if(session.state==='mfa') redirect('/admin/security');
  if(permission&&!session.access.permissions.includes(permission)) throw new HttpError(403,'You do not have access to this feature.');
  return session;
}
