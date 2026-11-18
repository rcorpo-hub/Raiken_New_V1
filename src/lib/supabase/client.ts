'use client';
import {createBrowserClient} from '@supabase/ssr';
import {publicDatabaseConfig} from '@/lib/workspace/config';
export function createClient(){const config=publicDatabaseConfig();if(!config)throw new Error('Supabase is not configured');return createBrowserClient(config.url,config.key);}
