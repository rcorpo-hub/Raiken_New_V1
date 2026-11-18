import 'server-only';
export class HttpError extends Error { constructor(public status:number,message:string){super(message);} }
export function checkOrigin(request:Request) {
  const origin=request.headers.get('origin');
  const expected=new URL(process.env.NEXT_PUBLIC_APP_URL||request.url).origin;
  if(!origin || origin!==expected) throw new HttpError(403,'This request must come from this website.');
}
export async function readBoundedJson(request:Request,maxBytes=131072):Promise<unknown> {
  if(!request.headers.get('content-type')?.includes('application/json')) throw new HttpError(415,'JSON is required.');
  if(Number(request.headers.get('content-length'))>maxBytes) throw new HttpError(413,'This request is too large.');
  const reader=request.body?.getReader();
  if(!reader) throw new HttpError(400,'A request body is required.');
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();throw new HttpError(413,'This request is too large.');}chunks.push(value);}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new HttpError(400,'Invalid JSON.');}
}
export function errorResponse(error:unknown) {
  if(error instanceof HttpError) return Response.json({error:error.message},{status:error.status,headers:{'Cache-Control':'private, no-store'}});
  console.error('Workspace request failed:',error instanceof Error?error.name:'UnknownError');
  return Response.json({error:'The service is unavailable. Please try again later.'},{status:503,headers:{'Cache-Control':'private, no-store'}});
}
