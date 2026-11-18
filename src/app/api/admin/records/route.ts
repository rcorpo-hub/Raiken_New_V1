import {z} from 'zod';
import {listRecords,moduleQueries} from '@/lib/workspace/data';
import {checkOrigin,errorResponse,HttpError,readBoundedJson} from '@/lib/workspace/http';
const inputSchema=z.object({module:z.enum(Object.keys(moduleQueries) as [keyof typeof moduleQueries,...(keyof typeof moduleQueries)[]]),page:z.number().int().min(1).max(100000).default(1),search:z.string().max(100).default(''),status:z.string().max(30).default(''),branch:z.union([z.uuid(),z.literal('')]).default('')});
export async function POST(request:Request){try{checkOrigin(request);const input=inputSchema.safeParse(await readBoundedJson(request,4096));if(!input.success)throw new HttpError(400,'Invalid search.');const x=input.data;return Response.json(await listRecords(x.module,x.page,x.search,x.status,x.branch),{headers:{'Cache-Control':'private, no-store'}});}catch(error){return errorResponse(error);}}
