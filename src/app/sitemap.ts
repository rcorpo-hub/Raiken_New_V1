import type {MetadataRoute} from 'next';
import {createClient} from '@supabase/supabase-js';
import {publicDatabaseConfig} from '@/lib/workspace/config';
import catalog from '@/lib/workspace/form-catalog.json';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const base=(process.env.NEXT_PUBLIC_SITE_URL||'https://rcorpo.com').replace(/\/$/,'');
 const paths=new Set(['','/appointment','/contact-us','/forms','/team','/blog','/nc','/call-now','/newsletter',...catalog.map(item=>item.path),'/blog/conveyancers','/blog/to-do-when-selling-property-adelaide-conveyancing']);
 const config=publicDatabaseConfig();if(config){const db=createClient(config.url,config.key,{auth:{persistSession:false}});const [{data:pages},{data:forms}]=await Promise.all([db.from('content_items').select('path').eq('status','published'),db.from('forms').select('slug').eq('status','published')]);for(const page of pages||[])if(!page.path.startsWith('/_'))paths.add(page.path);for(const form of forms||[])if(!catalog.some(item=>item.slug===form.slug))paths.add('/apply/'+form.slug);}
 return [...paths].map(path=>({url:base+path,changeFrequency:path===''?'weekly':'monthly',priority:path===''?1:.7}));
}
