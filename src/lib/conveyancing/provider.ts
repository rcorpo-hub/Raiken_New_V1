import 'server-only';
import {randomUUID} from 'node:crypto';
import type {CountryPhoneCode,EnvelopeOptions} from './livesign-payload';
export type ProviderEnvelope={id:string;status?:string;partnerReference?:string;customers?:Array<Record<string,any>>;aml?:{status?:string;riskRating?:string}};
export interface VerificationProvider{
 options:Omit<EnvelopeOptions,'countryCodes'>;
 countryCodes():Promise<CountryPhoneCode[]>;
 create(payload:unknown):Promise<ProviderEnvelope>;
 start(id:string):Promise<void>;
 get(id:string):Promise<ProviderEnvelope>;
 find(reference:string):Promise<ProviderEnvelope|null>;
}
export class ProviderError extends Error{
 constructor(public code:string,public retryable=false,public ambiguous=false){super(code);}
}
const uuid=/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
export function liveSignProvider():VerificationProvider|null{
 // Explicit opt-in: adding credentials cannot accidentally activate paid requests.
 if(process.env.LIVESIGN_MODE!=='live')return null;
 const key=process.env.LIVESIGN_API_KEY,partner=process.env.LIVESIGN_PARTNER_ID||'',secret=process.env.LIVESIGN_WEBHOOK_SECRET||'';
 if(!key||!uuid.test(partner)||/^0{8}-/.test(partner)||secret.length<32)throw new ProviderError('LIVESIGN_CONFIGURATION_REQUIRED');
 const base=new URL(process.env.LIVESIGN_BASE_URL||'https://api.web.live-sign.com');
 const site=new URL(process.env.NEXT_PUBLIC_APP_URL||'');
 if(base.origin!=='https://api.web.live-sign.com'||site.protocol!=='https:')throw new ProviderError('LIVESIGN_CONFIGURATION_REQUIRED');
 const callback=new URL('/api/conveyancing/livesign/webhook',site);callback.searchParams.set('token',secret);
 async function request(path:string,method='GET',body?:unknown){
  let response:Response;
  try{response=await fetch(new URL(path,base),{method,headers:{'X-API-KEY':key!,'X-Request-Id':randomUUID(),'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(35000),cache:'no-store',redirect:'error'});}
  catch{throw new ProviderError('LIVESIGN_CONNECTION_ERROR',true,method!=='GET');}
  if(!response.ok)throw new ProviderError('LIVESIGN_HTTP_'+response.status,response.status===429||response.status>=500,method!=='GET'&&response.status>=500);
  const text=await response.text();if(text.length>2000000)throw new ProviderError('LIVESIGN_INVALID_RESPONSE',false,method!=='GET');
  if(!text)return null;
  try{return JSON.parse(text);}catch{throw new ProviderError('LIVESIGN_INVALID_RESPONSE',false,method!=='GET');}
 }
 function envelope(raw:any):ProviderEnvelope{if(!uuid.test(raw?.id||''))throw new ProviderError('LIVESIGN_INVALID_RESPONSE');return raw;}
 const timeZones:Record<string,string>={'Australia/Adelaide':'Cen. Australia Standard Time','Australia/Brisbane':'E. Australia Standard Time','Australia/Perth':'W. Australia Standard Time'};
 const zone=process.env.LIVESIGN_TIMEZONE||'Cen. Australia Standard Time';
 return {
  options:{partnerId:partner,productPackageType:process.env.LIVESIGN_PRODUCT_PACKAGE||'AMLWithVoi',voiProductId:Number(process.env.LIVESIGN_VOI_PRODUCT_ID||1),timeZone:timeZones[zone]||zone,webhookUrl:callback.toString()},
  async countryCodes(){const raw=await request('/api/Utilities/country-codes');const values=Array.isArray(raw)?raw:raw?.items||raw?.data||[];if(!Array.isArray(values)||!values.length)throw new ProviderError('LIVESIGN_COUNTRY_CODES_UNAVAILABLE',true);return values;},
  async create(payload){return envelope(await request('/api/Envelopes/express','POST',payload));},
  async start(id){await request('/api/Envelopes/'+id+'/start','POST');},
  async get(id){return envelope(await request('/api/Envelopes/'+id));},
  async find(reference){const raw=await request('/api/Envelopes?search='+encodeURIComponent(reference)+'&pageSize=50');const rows=Array.isArray(raw)?raw:raw?.items||raw?.data||raw?.results||[];if(!Array.isArray(rows))throw new ProviderError('LIVESIGN_INVALID_RESPONSE');const matches=rows.filter((r:any)=>r.partnerReference===reference);if(matches.length>1)throw new ProviderError('LIVESIGN_MULTIPLE_REQUESTS');return matches.length?this.get(envelope(matches[0]).id):null;},
 };
}
