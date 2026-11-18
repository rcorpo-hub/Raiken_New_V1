import {createClient} from '@supabase/supabase-js';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const source=readFileSync(new URL('../src/lib/workspace/content-definitions.ts',import.meta.url),'utf8');
const module={exports:{}};
new Function('module','exports',ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(module,module.exports);
const {contentDefinitions,defaultContent}=module.exports;
const catalog=JSON.parse(readFileSync(new URL('../src/lib/workspace/form-catalog.json',import.meta.url),'utf8'));
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SECRET_KEY;
if(!url||!key)throw new Error('Configure the project environment first.');
const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const check=({data,error})=>{if(error)throw new Error(error.message);return data;};
let forms=0,pages=0;
for(const item of catalog){
 const existing=check(await db.from('forms').select('id,current_version_id').eq('slug',item.slug).maybeSingle());
 const form=existing||check(await db.from('forms').insert({slug:item.slug,title:item.title,status:'published'}).select('id,current_version_id').single());
 if(!form.current_version_id){
  const definition={engine:'legacy',title:item.title,description:item.description,fields:item.fields,path:item.path,migrationWarnings:item.migrationWarnings};
  const old=check(await db.from('form_versions').select('id').eq('form_id',form.id).order('version',{ascending:false}).limit(1).maybeSingle());
  const version=old||check(await db.from('form_versions').insert({form_id:form.id,version:1,schema_json:definition,schema_hash:createHash('sha256').update(JSON.stringify(definition)).digest('hex'),state:'published',is_partial_legacy:true}).select('id').single());
  check(await db.from('forms').update({current_version_id:version.id}).eq('id',form.id));
 }
 forms++;
}
for(const [name,definition] of Object.entries(contentDefinitions)){
 const existing=check(await db.from('content_items').select('id,published_revision_id').eq('path',definition.path).maybeSingle());
 const page=existing||check(await db.from('content_items').insert({kind:'page',path:definition.path,title:definition.title,status:'published'}).select('id,published_revision_id').single());
 if(!page.published_revision_id){
  const version=check(await db.from('content_revisions').insert({content_id:page.id,revision:1,blocks:defaultContent(name),seo:{}}).select('id').single());
  check(await db.from('content_items').update({published_revision_id:version.id,revision:1}).eq('id',page.id));
 }
 pages++;
}
const posts=JSON.parse(readFileSync(new URL('../src/lib/workspace/legacy-posts.json',import.meta.url),'utf8'));
for(const post of posts){
 const path='/blog/'+post.slug;const existing=check(await db.from('content_items').select('id,published_revision_id').eq('path',path).maybeSingle());
 const item=existing||check(await db.from('content_items').insert({path,title:post.title,kind:'post',status:'published'}).select('id,published_revision_id').single());
 if(!item.published_revision_id){const blocks={title:post.title,summary:post.body.slice(0,240),body:post.body};const version=check(await db.from('content_revisions').insert({content_id:item.id,revision:1,blocks}).select('id').single());check(await db.from('content_items').update({published_revision_id:version.id,revision:1}).eq('id',item.id));}
 pages++;
}
for(const id of ['quarantine-uploads','verified-documents']){
 const {error}=await db.storage.createBucket(id,{public:false,fileSizeLimit:4194304,allowedMimeTypes:['application/pdf','image/jpeg','image/png']});
 if(error&&!error.message.toLowerCase().includes('already exists'))throw error;
}
console.log(`Workspace initialized: ${forms} form registrations, ${pages} editable content regions, private document buckets. No accounts or submissions created.`);
