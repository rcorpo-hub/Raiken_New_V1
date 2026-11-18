'use client';
import Link from 'next/link';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {useState} from 'react';
import {LayoutDashboard,Files,Users,CalendarDays,FolderLock,ChartNoAxesCombined,PanelsTopLeft,ListChecks,UserCog,History,Database,Settings,ArrowUpRight,Menu,X,ShieldCheck} from 'lucide-react';
import {workspaceModules,type AdminAccess} from '@/lib/workspace/config';
import SignOut from './SignOut';
const icons={overview:LayoutDashboard,submissions:Files,customers:Users,appointments:CalendarDays,documents:FolderLock,reports:ChartNoAxesCombined,content:PanelsTopLeft,forms:ListChecks,staff:UserCog,audit:History,migration:Database,settings:Settings};
export default function AdminShell({access,children,localTest=false}:{access:AdminAccess;children:React.ReactNode;localTest?:boolean}){
 const path=usePathname();const [open,setOpen]=useState(false);
 return <div className="admin-workspace"><a href="#admin-main" className="admin-skip">Skip to workspace</a>
  <aside className={`admin-sidebar${open?' is-open':''}`}>
   <Link href="/admin" className="admin-logo" onClick={()=>setOpen(false)}><Image src="/images/redesign/logo-warm.png" alt="Raikan Corporation" width={1871} height={840} sizes="150px"/></Link>
   <p className="admin-sidebar-label">OWNER WORKSPACE</p>
   <nav aria-label="Workspace navigation">{workspaceModules.filter(item=>access.permissions.includes(item.permission)).map(item=>{const Icon=icons[item.key];const active=item.href==='/admin'?path==='/admin':path.startsWith(item.href);return <Link href={item.href} aria-current={active?'page':undefined} key={item.key} onClick={()=>setOpen(false)}><Icon size={18}/>{item.label}</Link>;})}</nav>
   <div className="admin-sidebar-bottom"><div className="admin-account"><span className="admin-avatar">{(access.name||'O').charAt(0).toUpperCase()}</span><span><strong>{access.name||'Owner'}</strong><small>{access.owner?'Owner · full access':'Staff · restricted access'}</small></span></div><SignOut/></div>
  </aside>
  {open&&<button className="admin-scrim" aria-label="Close workspace menu" onClick={()=>setOpen(false)}/>}
  <div className="admin-main-column"><header className="admin-topbar"><div><button className="admin-menu-toggle" aria-expanded={open} aria-label={open?'Close workspace menu':'Open workspace menu'} onClick={()=>setOpen(!open)}>{open?<X size={22}/>:<Menu size={22}/>}</button><span><ShieldCheck size={16}/>Private workspace</span></div><Link href="/" target="_blank" rel="noopener noreferrer">View website<ArrowUpRight size={16}/><span className="sr-only"> (opens in a new tab)</span></Link></header><main id="admin-main" className="admin-main">{localTest&&<p className="admin-alert admin-local-banner">Local test workspace — synthetic records only. The hosted project and real owner account will be connected in the final setup.</p>}{children}</main></div>
 </div>;
}
