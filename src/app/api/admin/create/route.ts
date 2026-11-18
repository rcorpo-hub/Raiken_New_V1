import {z} from 'zod';
import {requireAdmin} from '@/lib/workspace/access';
import {checkOrigin,readBoundedJson,errorResponse,HttpError} from '@/lib/workspace/http';
export async function POST(request:Request){try{
 checkOrigin(request);const parsed=z.object({kind:z.enum(['form','page','post']),slug:z.string().regex(/^[a-z][a-z0-9-]{0,79}$/),title:z.string().trim().min(1).max(160),category:z.enum(['Registration','Taxation','Corporate','Trusts','Conveyancing','General']).default('General')}).safeParse(await readBoundedJson(request,4096));
 if(!parsed.success)throw new HttpError(400,'Enter a title and a URL using lowercase letters, numbers and hyphens.');
 const value=parsed.data;const session=await requireAdmin(value.kind==='form'?'forms.edit':'content.edit');
 const {data,error}=await session.db.rpc('admin_create_item',value);
 if(error){if(error.code==='23505')throw new HttpError(409,'This URL is already in use. Choose another one.');throw new HttpError(400,'The draft could not be created.');}
 return Response.json({next:`/admin/${value.kind==='form'?'forms':'content'}/${data}`});
}catch(error){return errorResponse(error);}}
