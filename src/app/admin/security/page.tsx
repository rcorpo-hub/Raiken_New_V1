import {redirect} from 'next/navigation';
import AuthPanel from '@/components/admin/AuthPanel';
import SignOut from '@/components/admin/SignOut';
import {getAdminSession} from '@/lib/workspace/access';
import {workspaceLanding} from '@/lib/workspace/config';
export default async function SecurityPage(){const session=await getAdminSession();if(session.state==='ready')redirect(workspaceLanding(session.access));if(session.state!=='mfa')redirect('/admin/login');return <main className="admin-auth-page"><div className="admin-auth-card"><p className="admin-eyebrow">TWO-STEP VERIFICATION</p><h1>One more step.</h1><p className="admin-muted">Confirm it’s you before opening private client information.</p><AuthPanel mode="mfa"/><SignOut/></div></main>;}
