'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {ArrowRight,LockKeyhole,ShieldCheck} from 'lucide-react';

export default function AuthPanel({mode,configured=true}:{mode:'login'|'mfa';configured?:boolean}){
 const router=useRouter();const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [code,setCode]=useState('');
 const [factor,setFactor]=useState('');const [qr,setQr]=useState('');const [setupKey,setSetupKey]=useState('');
 async function send(body:Record<string,unknown>){const response=await fetch('/api/admin/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const value=await response.json();if(!response.ok)throw new Error(value.error||'Please try again.');return value;}
 async function submit(event:React.FormEvent){event.preventDefault();setBusy(true);setError('');try{
   const value=await send(mode==='login'?{action:'login',email,password}:factor?{action:'verify',factorId:factor,code}:{action:'enroll'});
   if(value.next){router.replace(value.next);router.refresh();}
   else{setFactor(value.factorId);setQr(value.qrCode||'');setSetupKey(value.setupKey||'');}
 }catch(error){setError(error instanceof Error?error.message:'Please try again.');}finally{setBusy(false);}}
 return <form className="admin-auth-form" onSubmit={submit}>
   {error&&<p role="alert" className="admin-alert admin-alert-error">{error}</p>}
   {mode==='login'?<>
    <label>Email address<input type="email" autoComplete="username" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} /></label>
    <label>Password<input type="password" autoComplete="current-password" required maxLength={256} value={password} onChange={e=>setPassword(e.target.value)} /></label>
   </>:factor?<>
    {qr&&<div className="admin-qr"><img src={qr.startsWith('data:')?qr:`data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr)}`} width={210} height={210} alt="Scan this QR code with your authenticator app"/><p>Scan with your authenticator, then enter its six-digit code.</p>{setupKey&&<details><summary>Enter a setup key instead</summary><code style={{overflowWrap:'anywhere'}}>{setupKey}</code><p>Keep this key private. It is only shown during enrollment.</p></details>}</div>}
    <label>Authenticator code<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))}/></label>
   </>:<p className="admin-muted">Use an authenticator app for the extra verification required to access client information.</p>}
   <button className="admin-button admin-button-primary" disabled={busy||!configured} type="submit">{mode==='login'?<LockKeyhole size={17}/>:<ShieldCheck size={17}/>} {busy?'Please wait…':mode==='login'?'Sign in':factor?'Verify and continue':'Set up or verify authenticator'}<ArrowRight size={17}/></button>
   {mode==='login'&&<p className="admin-small admin-muted">Owner and invited staff only. There is no public registration.</p>}
 </form>;
}
