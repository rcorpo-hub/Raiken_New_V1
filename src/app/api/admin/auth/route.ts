import {z} from 'zod';
import {createClient} from '@/lib/supabase/server';
import {checkOrigin,readBoundedJson,errorResponse,HttpError} from '@/lib/workspace/http';
import {getAdminSession} from '@/lib/workspace/access';
import {workspaceLanding} from '@/lib/workspace/config';

const authRequest=z.discriminatedUnion('action',[
  z.object({action:z.literal('login'),email:z.email().max(254),password:z.string().min(1).max(256)}),
  z.object({action:z.literal('logout')}),z.object({action:z.literal('enroll')}),
  z.object({action:z.literal('verify'),factorId:z.uuid(),code:z.string().regex(/^\d{6}$/)}),
]);
export async function POST(request:Request){try{
  checkOrigin(request);const input=authRequest.safeParse(await readBoundedJson(request,4096));
  if(!input.success)throw new HttpError(400,'Check your sign-in details.');
  const db=await createClient();const value=input.data;
  if(value.action==='login'){
    const {error}=await db.auth.signInWithPassword({email:value.email,password:value.password});
    if(error)throw new HttpError(401,'Sign-in failed. Check your details and try again.');
    const {data:access}=await db.rpc('current_admin_access');
    if(!access?.permissions?.length){await db.auth.signOut();throw new HttpError(403,'This account has no workspace access.');}
    return Response.json({next:'/admin/security'},{headers:{'Cache-Control':'no-store'}});
  }
  if(value.action==='logout'){const {error}=await db.auth.signOut();if(error)throw new HttpError(503,'Could not sign out. Please try again.');return Response.json({next:'/admin/login'});}
  const session=await getAdminSession();
  if(session.state!=='ready'&&session.state!=='mfa')throw new HttpError(403,'Workspace access is required.');
  if(value.action==='enroll'){
    const {data:factors,error}=await db.auth.mfa.listFactors();if(error)throw new HttpError(503,'Two-step verification is unavailable.');
    const verified=factors.totp.find(factor=>factor.status==='verified');
    if(verified)return Response.json({factorId:verified.id});
    for(const factor of factors.all.filter(factor=>factor.status==='unverified'))await db.auth.mfa.unenroll({factorId:factor.id});
    const {data,error:enrollError}=await db.auth.mfa.enroll({factorType:'totp',friendlyName:'Raikan owner workspace'});
    if(enrollError)throw new HttpError(400,'Could not create an authenticator. Please try again.');
    return Response.json({factorId:data.id,qrCode:data.totp.qr_code,setupKey:data.totp.secret},{headers:{'Cache-Control':'no-store'}});
  }
  const {error}=await db.auth.mfa.challengeAndVerify({factorId:value.factorId,code:value.code});
  if(error)throw new HttpError(400,'That code could not be verified. Try the current code in your authenticator.');
  return Response.json({next:workspaceLanding(session.access)});
}catch(error){return errorResponse(error);}}
