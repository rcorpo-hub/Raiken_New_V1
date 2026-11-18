import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {cache} from 'react';
import {publicDatabaseConfig} from './config';
import {contentDefinitions,defaultContent,type ContentKey} from './content-definitions';
export const getSiteContent=cache(async(key:ContentKey)=>{
  const defaults=defaultContent(key);const config=publicDatabaseConfig();if(!config)return defaults;
  const db=createClient(config.url,config.key,{auth:{persistSession:false},global:{fetch:(url,init)=>fetch(url,{...init,cache:'no-store'})}});
  const {data:item,error}=await db.from('content_items').select('published_revision_id').eq('path',contentDefinitions[key].path).eq('status','published').maybeSingle();
  if(error||!item?.published_revision_id)return defaults;
  const {data:revision}=await db.from('content_revisions').select('blocks').eq('id',item.published_revision_id).maybeSingle();
  if(!revision?.blocks||Array.isArray(revision.blocks)||typeof revision.blocks!=='object')return defaults;
  return Object.fromEntries(Object.entries(defaults).map(([name,value])=>[name,typeof revision.blocks[name]==='string'?revision.blocks[name]:value]));
});
export const getPublicOffices=cache(async()=>{
  const content=await getSiteContent('contact');
  return ['adelaide','brisbane','perth'].map(id=>({id,city:id.charAt(0).toUpperCase()+id.slice(1),address:content[id+'Address'],phone:content[id+'Phone'],tel:content[id+'Phone'].replace(/[^+\d]/g,'')}));
});
export const getPublishedDocument=cache(async(path:string)=>{
 const config=publicDatabaseConfig();if(!config)return null;
 const db=createClient(config.url,config.key,{auth:{persistSession:false},global:{fetch:(url,init)=>fetch(url,{...init,cache:'no-store'})}});
 const {data:item}=await db.from('content_items').select('id,published_revision_id').eq('path',path).eq('status','published').maybeSingle();if(!item?.published_revision_id)return null;
 const {data:revision}=await db.from('content_revisions').select('blocks,revision').eq('id',item.published_revision_id).maybeSingle();
 if(!revision||!revision.blocks||typeof revision.blocks!=='object'||Array.isArray(revision.blocks))return null;
 const blocks=revision.blocks as Record<string,unknown>;
 if(typeof blocks.title!=='string'||typeof blocks.body!=='string')return null;
 return {revision:revision.revision,blocks:{title:blocks.title,summary:typeof blocks.summary==='string'?blocks.summary:'',body:blocks.body}};
});
export const getPublishedPosts=cache(async()=>{
 const config=publicDatabaseConfig();if(!config)return [];
 const db=createClient(config.url,config.key,{auth:{persistSession:false},global:{fetch:(url,init)=>fetch(url,{...init,cache:'no-store'})}});
 const {data:items}=await db.from('content_items').select('path,title,published_revision_id').eq('kind','post').eq('status','published').order('published_at',{ascending:false}).limit(100);
 return Promise.all((items||[]).map(async item=>{const document=await getPublishedDocument(item.path);return {path:item.path,title:document?.blocks.title||item.title,summary:document?.blocks.summary||''};}));
});
