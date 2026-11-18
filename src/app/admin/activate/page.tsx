import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import SetPassword from '@/components/admin/SetPassword';
export default async function ActivatePage(){const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/admin/login');return <main className="admin-auth-page"><section className="admin-auth-card"><p className="admin-eyebrow">ACCOUNT SETUP</p><h1>Make it yours.</h1><p className="admin-muted">Choose a private password. The owner must also grant your permissions before you can open workspace records.</p><SetPassword/></section></main>;}
