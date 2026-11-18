'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {createClient} from '@/lib/supabase/client';
export default function ConfirmAccess(){const router=useRouter();const [error,setError]=useState('');useEffect(()=>{let active=true;async function confirm(){try{const db=createClient();const params=new URLSearchParams(window.location.search);const code=params.get('code');const token=params.get('token_hash');const type=params.get('type');
 if(code){const {error}=await db.auth.exchangeCodeForSession(code);if(error)throw error;}
 else if(token&&(type==='invite'||type==='recovery')){const {error}=await db.auth.verifyOtp({token_hash:token,type});if(error)throw error;}
 // The browser client also consumes the implicit session from a standard Auth invitation.
 const {data:{user},error:identityError}=await db.auth.getUser();if(identityError||!user)throw new Error('The invitation or recovery link is invalid or has expired.');
 if(active){router.replace('/admin/activate');router.refresh();}
 }catch{if(active)setError('This link is invalid or has expired. Ask the owner to send a new invitation.');}}void confirm();return()=>{active=false;};},[router]);return <main className="new-page editorial-page"><section className="page-intro"><h1>{error?'This link couldn’t be verified.':'Verifying your access…'}</h1><p role={error?'alert':'status'}>{error||'Please wait while your account is confirmed.'}</p><Link href="/admin/login" className="text-link">Go to workspace sign-in</Link></section></main>;}
