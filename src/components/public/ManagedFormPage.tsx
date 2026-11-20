import {createClient} from '@supabase/supabase-js';
import {publicDatabaseConfig} from '@/lib/workspace/config';
import {managedFormSchema} from '@/lib/workspace/validation';
import ManagedForm,{FormVersionProvider} from './ManagedForm';
import {notFound} from 'next/navigation';
import {isRemovedForm} from '@/lib/workspace/form-availability';
export default async function ManagedFormPage({slug,children,compact=false}:{slug:string;children:React.ReactNode;compact?:boolean}){
 if(isRemovedForm(slug))notFound();
 const config=publicDatabaseConfig();if(!config)return children;
 const db=createClient(config.url,config.key,{auth:{persistSession:false},global:{fetch:(url,init)=>fetch(url,{...init,cache:'no-store'})}});
 const {data:form}=await db.from('forms').select('id,current_version_id').eq('slug',slug).eq('status','published').maybeSingle();
 if(!form?.current_version_id)return <section className="new-page editorial-page"><h1>This form is temporarily unavailable.</h1><p>Please contact our team for assistance. No information has been submitted.</p></section>;
 const {data:version}=await db.from('form_versions').select('id,schema_json').eq('id',form.current_version_id).maybeSingle();
 if(!version)return children;
 const parsed=managedFormSchema.safeParse(version.schema_json);
 return <FormVersionProvider slug={slug} versionId={version.id}>{parsed.success?<ManagedForm definition={parsed.data} slug={slug} versionId={version.id} compact={compact}/>:children}</FormVersionProvider>;
}
