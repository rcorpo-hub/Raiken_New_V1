import Link from 'next/link';
import Image from 'next/image';
import {redirect} from 'next/navigation';
import AuthPanel from '@/components/admin/AuthPanel';
import {getAdminSession} from '@/lib/workspace/access';
export default async function LoginPage(){
 const session=await getAdminSession();if(session.state==='ready')redirect('/admin');if(session.state==='mfa')redirect('/admin/security');
 const configured=session.state!=='setup'&&session.state!=='database';
 return <main className="admin-auth-page"><div className="admin-auth-card"><Link href="/"><Image src="/images/redesign/logo-warm.png" alt="Raikan Corporation" width={1871} height={840} sizes="180px" className="admin-auth-logo"/></Link><p className="admin-eyebrow">OWNER WORKSPACE</p><h1>Welcome back.</h1><p className="admin-muted">Your clients, forms and website. One clear place to manage them.</p>{!configured&&<p className="admin-alert">The workspace needs its database setup before sign-in. <Link href="/admin/setup">View setup steps</Link>.</p>}<AuthPanel mode="login" configured={configured}/><Link href="/" className="admin-back-link">← Back to the website</Link></div></main>;
}
