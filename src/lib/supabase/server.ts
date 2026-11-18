import 'server-only';
import {createServerClient} from '@supabase/ssr';
import type {CookieOptions} from '@supabase/ssr';
import {cookies} from 'next/headers';
import {publicDatabaseConfig} from '@/lib/workspace/config';
export async function createClient(){
  const config=publicDatabaseConfig();if(!config)throw new Error('Supabase is not configured');
  const store=await cookies();
  return createServerClient(config.url,config.key,{cookies:{getAll:()=>store.getAll(),setAll(values:{name:string;value:string;options:CookieOptions}[]){
    try{for(const {name,value,options} of values)store.set(name,value,options);}catch{/* Proxy persists refreshed cookies for Server Components. */}
  }}});
}
