import {createClient} from '@supabase/supabase-js';
const email=process.argv.find(value=>value.startsWith('--email='))?.slice(8).trim().toLowerCase();
if(!email)throw new Error('Provide --email=the-exact-existing-owner-account. This command does not create accounts or send email.');
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SECRET_KEY;
if(!url||!key)throw new Error('Configure the project environment first.');
const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
let user=null;
for(let page=1;page<=100;page++){const {data,error}=await db.auth.admin.listUsers({page,perPage:100});if(error)throw new Error('Could not read Auth accounts.');user=data.users.find(user=>user.email?.toLowerCase()===email);if(user||data.users.length<100)break;}
if(!user||!user.email_confirmed_at)throw new Error('Create and confirm this exact account in Supabase Auth first.');
const {error}=await db.rpc('bootstrap_workspace_owner',{target:user.id});if(error)throw new Error(error.message);
console.log('Owner access provisioned. Sign in and enroll an authenticator to open private records.');
