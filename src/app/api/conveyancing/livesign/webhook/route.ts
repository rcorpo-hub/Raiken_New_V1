import {timingSafeEqual} from 'node:crypto';
import {after} from 'next/server';
import {z} from 'zod';
import {readBoundedJson,errorResponse,HttpError} from '@/lib/workspace/http';
import {createPrivilegedClient} from '@/lib/supabase/privileged';
import {runConveyancingJobs} from '@/lib/conveyancing/worker';
export const maxDuration=300;
export async function POST(request:Request){try{
 const secret=process.env.LIVESIGN_WEBHOOK_SECRET||'';
 const token=new URL(request.url).searchParams.get('token')||request.headers.get('x-webhook-secret')||'';
 if(secret.length<32||token.length!==secret.length||!timingSafeEqual(Buffer.from(token),Buffer.from(secret)))throw new HttpError(403,'Access denied.');
 const body=await readBoundedJson(request,65536) as Record<string,any>;
 const candidates=[new URL(request.url).searchParams.get('envelopeId'),body?.envelopeId,body?.EnvelopeId,body?.envelope?.id,body?.Envelope?.Id,body?.data?.envelopeId,body?.id,body?.Id];
 const envelope=candidates.find(value=>z.uuid().safeParse(value).success);
 if(!envelope)throw new HttpError(400,'A valid envelope identifier is required.');
 const db=createPrivilegedClient();const {data:record,error}=await db.from('conveyancing_cases').select('submission_id').eq('livesign_envelope_id',envelope).maybeSingle();
 if(error)throw new HttpError(503,'The notification could not be saved.');
 // Unknown IDs reveal no matter details. Never trust the callback's result fields.
 if(record){const queued=await db.rpc('wake_conveyancing_sync',{target:record.submission_id});if(queued.error)throw new HttpError(503,'The notification could not be saved.');after(async()=>{try{await runConveyancingJobs(2);}catch{console.error('Conveyancing notification remains queued.');}});}
 return Response.json({received:true},{headers:{'Cache-Control':'private, no-store'}});
}catch(error){return errorResponse(error);}}
