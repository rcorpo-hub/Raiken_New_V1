import {timingSafeEqual} from 'node:crypto';
import {runConveyancingJobs} from '@/lib/conveyancing/worker';
export const maxDuration=300;
export async function GET(request:Request){
 const secret=process.env.CRON_SECRET||'',provided=request.headers.get('authorization')||'',expected='Bearer '+secret;
 if(secret.length<32||provided.length!==expected.length||!timingSafeEqual(Buffer.from(provided),Buffer.from(expected)))return Response.json({error:'Access denied.'},{status:403});
 try{return Response.json(await runConveyancingJobs(2),{headers:{'Cache-Control':'private, no-store'}});}
 catch{return Response.json({error:'Pending work could not be processed. It remains saved.'},{status:503});}
}
export const POST=GET;
