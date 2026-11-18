export function publicDatabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes('your-project') || key.includes('your-anon')) return null;
  return { url, key };
}

export const workspaceModules = [
  { key: 'overview', label: 'Overview', permission: 'dashboard.read', href: '/admin' },
  { key: 'submissions', label: 'Submissions', permission: 'submissions.read', href: '/admin/submissions' },
  { key: 'customers', label: 'Clients', permission: 'customers.read', href: '/admin/customers' },
  { key: 'appointments', label: 'Appointments', permission: 'bookings.read', href: '/admin/appointments' },
  { key: 'documents', label: 'Documents', permission: 'documents.read', href: '/admin/documents' },
  { key: 'reports', label: 'Reports', permission: 'reports.read', href: '/admin/reports' },
  { key: 'content', label: 'Website content', permission: 'content.edit', href: '/admin/content' },
  { key: 'forms', label: 'Forms & fields', permission: 'forms.edit', href: '/admin/forms' },
  { key: 'staff', label: 'People & access', permission: 'users.manage', href: '/admin/staff' },
  { key: 'audit', label: 'Activity log', permission: 'audit.read', href: '/admin/audit' },
  { key: 'migration', label: 'Old website data', permission: 'migrations.manage', href: '/admin/migration' },
  { key: 'settings', label: 'Settings', permission: 'settings.manage', href: '/admin/settings' },
] as const;
export type WorkspaceModule = typeof workspaceModules[number]['key'];
export type AdminAccess = { id: string; name: string; email: string; owner: boolean; permissions: string[]; branches: string[] };
export const hasPermission = (access: AdminAccess, permission: string) => access.permissions.includes(permission);
export const workspaceLanding = (access: AdminAccess) => workspaceModules.find(module => hasPermission(access, module.permission))?.href || '/admin/login';

export const submissionStatuses = ['received','under_review','action_required','processed','archived'] as const;
export function readable(value: string) { return value.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()); }
export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-AU',{day:'numeric',month:'short',year:'numeric',timeZone:'Australia/Adelaide'}).format(new Date(value));
}
