import {createServerClient} from '@supabase/ssr';
import type {CookieOptions} from '@supabase/ssr';
import {NextResponse,type NextRequest} from 'next/server';
import {publicDatabaseConfig} from '@/lib/workspace/config';
export async function proxy(request:NextRequest){
  let response=NextResponse.next({request});
  const config=publicDatabaseConfig();
  if(config){
    const db=createServerClient(config.url,config.key,{cookies:{getAll:()=>request.cookies.getAll(),setAll(values:{name:string;value:string;options:CookieOptions}[]){
      for(const {name,value} of values)request.cookies.set(name,value);
      response=NextResponse.next({request});
      for(const {name,value,options} of values)response.cookies.set(name,value,options);
    }}});
    await db.auth.getUser();
  }
  response.headers.set('Cache-Control','private, no-store, max-age=0');
  response.headers.set('X-Robots-Tag','noindex, nofollow');
  response.headers.set('X-Content-Type-Options','nosniff');
  response.headers.set('Referrer-Policy','same-origin');
  return response;
}
export const config={matcher:['/admin/:path*','/api/admin/:path*']};
