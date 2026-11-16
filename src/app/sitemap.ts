import type { MetadataRoute } from 'next';

const BASE_URL = 'https://rcorpo.com';

const STATIC_ROUTES = [
  { url: '', priority: 1.0, changeFrequency: 'daily' as const },
  { url: '/appointment', priority: 0.9, changeFrequency: 'weekly' as const },
  { url: '/contact-us', priority: 0.9, changeFrequency: 'monthly' as const },
  { url: '/forms', priority: 0.9, changeFrequency: 'weekly' as const },
  { url: '/team', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/blog', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/blog/tax-compliance-updates-2024', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/blog/smsf-conveyancing-best-practices', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/nc', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/nc/i-am-purchaser', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/nc/i-am-vendor', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/quote-calculator', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/rental-property-summary', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/new-individual-client-form', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/new-individual-tax-file-number-application', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/new-individual-abn-application', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/new-company-client-form', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/new-company-registration', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/new-trust-client-form', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/new-trust-registration', priority: 0.8, changeFrequency: 'monthly' as const },
  { url: '/new-client-questionnaire-form', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/tax-declaration-form', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/buyer-form', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/form-for-vendor-sales', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/residential-property', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/rideshare-taxi-gst', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/paarthav-family-trust', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/shiva-family-trust', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/shree-ashapuri-unit-trust', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/digital-signature', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/support', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/call-now', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/newsletter', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/appointment-booking-form', priority: 0.7, changeFrequency: 'monthly' as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.url}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

