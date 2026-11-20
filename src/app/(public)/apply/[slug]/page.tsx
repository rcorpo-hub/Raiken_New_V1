import {notFound} from 'next/navigation';
import {publicDatabaseConfig} from '@/lib/workspace/config';
import {createClient} from '@supabase/supabase-js';
import ManagedFormPage from '@/components/public/ManagedFormPage';
import {isRemovedForm} from '@/lib/workspace/form-availability';
export default async function ApplyPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(isRemovedForm(slug)||slug==='conveyancing-intake')notFound();const config=publicDatabaseConfig();if(!config)notFound();const db=createClient(config.url,config.key,{auth:{persistSession:false}});const {data:form}=await db.from('forms').select('id').eq('slug',slug).eq('status','published').maybeSingle();if(!form)notFound();return <ManagedFormPage slug={slug}><section className="new-page editorial-page"><h1>This form is not available.</h1><p>Please contact our team for assistance.</p></section></ManagedFormPage>;}
