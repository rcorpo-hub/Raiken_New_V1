import AdminShell from '@/components/admin/AdminShell';
import {requireAdminPage} from '@/lib/workspace/access';
export default async function WorkspaceLayout({children}:{children:React.ReactNode}){const {access}=await requireAdminPage();return <AdminShell access={access} localTest={process.env.LOCAL_WORKSPACE_TEST==='true'}>{children}</AdminShell>;}
