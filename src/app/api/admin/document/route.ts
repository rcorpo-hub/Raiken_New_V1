import {z} from 'zod';
import {requireAdmin} from '@/lib/workspace/access';
import {checkOrigin,readBoundedJson,HttpError,errorResponse} from '@/lib/workspace/http';
import {createPrivilegedClient} from '@/lib/supabase/privileged';
export async function POST(request:Request){try{
 checkOrigin(request);const body=z.object({id:z.uuid()}).safeParse(await readBoundedJson(request,1024));if(!body.success)throw new HttpError(400,'Invalid document.');
 const session=await requireAdmin('documents.download');const {data:file,error}=await session.db.from('file_objects').select('id,bucket,object_key,original_name,scan_status,scan_engine,scanned_at,verified_mime').eq('id',body.data.id).maybeSingle();
 if(error||!file)throw new HttpError(404,'Document not found or access denied.');if(file.scan_status!=='clean'||!file.scan_engine||!file.scanned_at||!file.verified_mime)throw new HttpError(409,'This file has not passed verification.');
 if(!['verified-documents'].includes(file.bucket))throw new HttpError(403,'This document is not in the verified storage area.');
 const {error:logError}=await session.db.rpc('admin_record_access',{kind:'document.download_authorized',target:file.id,reason:''});if(logError)throw new HttpError(403,'Download access could not be verified.');
 const db=createPrivilegedClient();const {data,error:storageError}=await db.storage.from(file.bucket).createSignedUrl(file.object_key,60,{download:file.original_name.replace(/[^a-zA-Z0-9_. -]/g,'_').slice(0,180)});
 if(storageError||!data?.signedUrl)throw new HttpError(404,'The document file is unavailable.');return Response.json({url:data.signedUrl},{headers:{'Cache-Control':'private, no-store'}});
}catch(error){return errorResponse(error);}}
