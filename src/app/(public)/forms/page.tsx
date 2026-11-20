import { createClient } from '@supabase/supabase-js';
import { publicDatabaseConfig } from '@/lib/workspace/config';
import catalog from '@/lib/workspace/form-catalog.json';
import FormsDirectory from '@/components/public/FormsDirectory';
import { resolveFormService, categoriesForService } from '@/components/public/form-services';

interface FormDef {
  id: number | string;
  title: string;
  category: string;
  description: string;
  href: string;
}

// The catalog is also used for route/API retirement and migration seeding.
const ALL_FORMS: FormDef[] = catalog.map(form => ({
  id: form.id ?? form.slug,
  title: form.title,
  category: form.category,
  description: form.description,
  href: form.path,
}));

export default async function FormsPage({ searchParams }: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const service = resolveFormService((await searchParams).service);
  const categories = service ? categoriesForService(service) : undefined;
  let directory: FormDef[] = [...ALL_FORMS];
  const config=publicDatabaseConfig();
  if(config){
    const db=createClient(config.url,config.key,{auth:{persistSession:false},global:{fetch:(url,init)=>fetch(url,{...init,cache:'no-store'})}});
    const {data:registered}=await db.from('forms').select('id,slug,title,directory_category,current_version_id').eq('status','published');
    const ids=(registered||[]).map(form=>form.current_version_id).filter(Boolean);
    const {data:versions}=ids.length?await db.from('form_versions').select('id,schema_json').in('id',ids):{data:[]};
    const schemas=new Map((versions||[]).filter(version=>version.schema_json?.engine==='managed').map(version=>[version.id,version.schema_json]));
    directory=directory.map(item=>{const match=catalog.find(form=>form.path===item.href);const record=registered?.find(form=>form.slug===match?.slug);const schema=record?schemas.get(record.current_version_id):null;return schema?{...item,title:schema.title,description:schema.description}:item;});
    for(const record of registered||[]){const schema=schemas.get(record.current_version_id);if(schema&&!catalog.some(form=>form.slug===record.slug))directory.push({id:record.id,title:schema.title,description:schema.description,category:record.directory_category,href:'/apply/'+record.slug});}
  }
  const forms = categories ? directory.filter(form => categories.includes(form.category)) : directory;
  return <FormsDirectory key={service || 'all'} forms={forms} service={service} />;
}
