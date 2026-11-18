import type {Metadata} from 'next';
import '@/styles/admin.css';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:{default:'Owner workspace | Raikan Corporation',template:'%s | Raikan workspace'},robots:{index:false,follow:false}};
export default function AdminLayout({children}:{children:React.ReactNode}){return <div className="admin-root">{children}</div>;}
