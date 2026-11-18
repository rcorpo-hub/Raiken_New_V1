import {z} from 'zod';
import {createHash} from 'node:crypto';
import {createPrivilegedClient} from '@/lib/supabase/privileged';
import {checkOrigin,readBoundedJson,errorResponse,HttpError} from '@/lib/workspace/http';
export async function POST(request:Request){try{
 checkOrigin(request);const result=z.object({email:z.email().max(254)}).safeParse(await readBoundedJson(request,2048));if(!result.success)throw new HttpError(400,'A valid email address is required.');
 const db=createPrivilegedClient();const email=result.data.email.trim().toLowerCase();
 const {data:allowed,error:limitError}=await db.rpc('workspace_throttle',{bucket:createHash('sha256').update('newsletter:'+email).digest('hex'),ceiling:3});
 if(limitError)throw new HttpError(503,'Subscriptions are temporarily unavailable.');if(!allowed)throw new HttpError(429,'Please try again in a minute.');
 const {data:existing,error:readError}=await db.from('newsletter_subscriptions').select('id,status').eq('normalised_email',email).maybeSingle();if(readError)throw new HttpError(503,'Your request could not be saved.');
 if(!existing){const {error}=await db.from('newsletter_subscriptions').insert({email,normalised_email:email,status:'subscribed',source:'website'});if(error&&error.code!=='23505')throw new HttpError(503,'Your request could not be saved.');}
 // An old unsubscribe/suppression is never silently overwritten by a public request.
 return Response.json({success:true,message:'Your subscription request has been received.'},{headers:{'Cache-Control':'no-store'}});
}catch(error){return errorResponse(error);}}
