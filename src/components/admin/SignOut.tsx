'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {LogOut} from 'lucide-react';
export default function SignOut(){
 const router=useRouter();const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 async function signOut(){setBusy(true);setError('');try{
  const response=await fetch('/api/admin/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});
  if(!response.ok)throw new Error('Sign-out failed. Please try again.');
  router.replace('/admin/login');router.refresh();
 }catch{setError('Could not sign out. Check your connection and try again.');}finally{setBusy(false);}}
 return <div><button type="button" className="admin-signout" disabled={busy} onClick={signOut}><LogOut size={17}/>{busy?'Signing out…':'Sign out'}</button>{error&&<p role="alert" className="admin-small">{error}</p>}</div>;
}
