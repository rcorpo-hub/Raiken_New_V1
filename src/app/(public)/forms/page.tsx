import FormsDirectory from '@/components/public/FormsDirectory';
import { resolveFormService, categoriesForService } from '@/components/public/form-services';

interface FormDef {
  id: number;
  title: string;
  category: string;
  description: string;
  href: string;
}

const ALL_FORMS: FormDef[] = [
  // Conveyancing & Property
  { id: 5116, title: "I am Purchaser (Form 5116)", category: "Conveyancing", description: "Comprehensive conveyancing intake for buyers of residential/commercial property in Australia.", href: "/nc/i-am-purchaser" },
  { id: 5121, title: "I am Vendor (Form 5121)", category: "Conveyancing", description: "Conveyancing intake for property sellers and vendors.", href: "/nc/i-am-vendor" },
  { id: 3561, title: "New Client Conveyancing Form", category: "Conveyancing", description: "General conveyancing enquiry and document submission.", href: "/nc" },
  { id: 724, title: "Residential Property Form", category: "Conveyancing", description: "Property and vendor details, agent information and payment instructions.", href: "/residential-property" },
  { id: 727, title: "Form For Vendor (Sales)", category: "Conveyancing", description: "Seller settlement, forwarding-address and bank-account instructions.", href: "/form-for-vendor-sales" },
  { id: 732, title: "Buyer Form", category: "Conveyancing", description: "Buyer ownership type and purchaser details.", href: "/buyer-form" },
  { id: 3992, title: "Quote Calculator", category: "Conveyancing", description: "Instant fee estimate for accounting, conveyancing, and statutory disbursements.", href: "/quote-calculator" },

  // Individual & Business Client Registration
  { id: 627, title: "New Individual Client Form", category: "Registration", description: "Onboarding questionnaire for individual personal accounting and legal matters.", href: "/new-individual-client-form" },
  { id: 704, title: "New Individual TFN Application", category: "Taxation", description: "Application assistance and ATO documentation for Tax File Numbers.", href: "/new-individual-tax-file-number-application" },
  { id: 713, title: "New Individual ABN Application", category: "Taxation", description: "Australian Business Number registration for sole traders and contractors.", href: "/new-individual-abn-application" },
  { id: 716, title: "New Company Client Form", category: "Corporate", description: "Corporate client onboarding for Pty Ltd and public companies.", href: "/new-company-client-form" },
  { id: 995, title: "New Company Registration", category: "Corporate", description: "ASIC company incorporation with constitutions and share register.", href: "/new-company-registration" },
  { id: 719, title: "New Trust Client Form", category: "Trusts", description: "Discretionary family trust establishment and trustee verification.", href: "/new-trust-client-form" },
  { id: 1055, title: "New Trust Registration", category: "Trusts", description: "Registration of business, unit, and investment trust structures.", href: "/new-trust-registration" },

  // Tax & Summary Schedules
  { id: 2549, title: "New Client Questionnaire", category: "Registration", description: "Individual client questionnaire, identity and contact details.", href: "/new-client-questionnaire-form" },
  { id: 3057, title: "Tax Declaration Form", category: "Taxation", description: "Provide TFN, employment and tax-free-threshold details for your payer.", href: "/tax-declaration-form" },
  { id: 3235, title: "Rideshare / Taxi GST Form", category: "Taxation", description: "Quarterly BAS and GST registration for Uber/taxi drivers.", href: "/rideshare-taxi-gst" },
  { id: 3283, title: "Rental Property Summary", category: "Taxation", description: "Annual rental income, depreciation, and expense calculation schedule.", href: "/rental-property-summary" },
  { id: 3202, title: "Shiva Family Trust", category: "Trusts", description: "TFN and employment tax declaration for Shiva Family Trust.", href: "/shiva-family-trust" },
  { id: 3211, title: "Shree Ashapuri Unit Trust", category: "Trusts", description: "TFN and employment tax declaration for Shree Ashapuri Unit Trust.", href: "/shree-ashapuri-unit-trust" },
  { id: 3957, title: "Paarthav Family Trust", category: "Trusts", description: "TFN and employment tax declaration for Paarthav Family Trust.", href: "/paarthav-family-trust" },
  { id: 3127, title: "Digital Signature Portal", category: "General", description: "Secure electronic signing and document consent verification.", href: "/digital-signature" },
  { id: 697, title: "Contact Us & Enquiry Form", category: "General", description: "Direct enquiry and support requests to our Australian branch offices.", href: "/contact-us" },
  { id: 5251, title: "Appointment Booking Form", category: "General", description: "Consultation schedule preferences for Adelaide, Brisbane, and Perth.", href: "/appointment-booking-form" },
];

export default async function FormsPage({ searchParams }: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const service = resolveFormService((await searchParams).service);
  const categories = service ? categoriesForService(service) : undefined;
  const forms = categories ? ALL_FORMS.filter(form => categories.includes(form.category)) : ALL_FORMS;
  return <FormsDirectory key={service || 'all'} forms={forms} service={service} />;
}
