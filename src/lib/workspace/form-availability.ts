import removed from './removed-forms.json';

// URL tombstones only; removed forms have no renderer or stored definition.
export function isRemovedForm(slug: string) {
  return removed.some(form => form.slug === slug);
}
export function isRemovedPublicPath(path: string) {
  return path === '/newsletter' || removed.some(form => form.path === path && path !== '/contact-us');
}
