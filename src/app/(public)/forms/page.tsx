import React from 'react';
import Link from 'next/link';
import {
  FileText,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';

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
  { id: 724, title: "Residential Property Form", category: "Conveyancing", description: "Specific residential property transfer and disclosure details.", href: "/residential-property" },
  { id: 727, title: "Form For Vendor (Sales)", category: "Conveyancing", description: "Detailed seller asset and encumbrance information.", href: "/form-for-vendor-sales" },
  { id: 732, title: "Buyer Form", category: "Conveyancing", description: "Buyer mortgage details and settlement instructions.", href: "/buyer-form" },
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
  { id: 2549, title: "New Client Questionnaire", category: "Accounting", description: "In-depth multi-step financial, assets, debts, and income analysis.", href: "/new-client-questionnaire-form" },
  { id: 3057, title: "Tax Declaration Form", category: "Taxation", description: "Official electronic declaration of income, deductions, and tax compliance.", href: "/tax-declaration-form" },
  { id: 3235, title: "Rideshare / Taxi GST Form", category: "Taxation", description: "Quarterly BAS and GST registration for Uber/taxi drivers.", href: "/rideshare-taxi-gst" },
  { id: 3283, title: "Rental Property Summary", category: "Taxation", description: "Annual rental income, depreciation, and expense calculation schedule.", href: "/rental-property-summary" },
  { id: 3202, title: "Shiva Family Trust", category: "Trusts", description: "Trust asset schedule and distribution resolution.", href: "/shiva-family-trust" },
  { id: 3211, title: "Shree Ashapuri Unit Trust", category: "Trusts", description: "Unit trust subscriber register and asset allocations.", href: "/shree-ashapuri-unit-trust" },
  { id: 3957, title: "Paarthav Family Trust", category: "Trusts", description: "Specific trust record administration and member declarations.", href: "/paarthav-family-trust" },
  { id: 3127, title: "Digital Signature Portal", category: "General", description: "Secure electronic signing and document consent verification.", href: "/digital-signature" },
  { id: 697, title: "Contact Us & Enquiry Form", category: "General", description: "Direct enquiry and support requests to our Australian branch offices.", href: "/contact-us" },
  { id: 5251, title: "Appointment Booking Form", category: "General", description: "Consultation schedule preferences for Adelaide, Brisbane, and Perth.", href: "/appointment-booking-form" },
];

export default function FormsDirectoryPage() {
  return (
    <div className="w-full bg-[#fafafa] font-sans min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-[#087caa] text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Official Super Forms Register · 256-Bit SSL Transmission
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-normal text-[#2a2a2a] mb-3">
            Online Client Forms Directory
          </h1>
          <div className="w-16 h-1 bg-[#087caa] mx-auto mb-4" />
          <p className="text-sm text-[#454545] max-w-xl mx-auto">
            Submit your lodgements, registration schedules, and conveyancing documentation securely online.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ALL_FORMS.map((form) => (
            <div
              key={form.id}
              className="bg-white border border-[#e5e5e5] rounded-xl p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-50 text-[#087caa] border border-cyan-100">
                    {form.category}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    #{form.id}
                  </span>
                </div>
                <h3 className="text-lg font-heading font-medium text-[#2a2a2a] mb-2 leading-snug">
                  {form.title}
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed mb-6">
                  {form.description}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Link
                  href={form.href}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#087caa] hover:text-[#065b7d] transition-colors"
                >
                  Open Online Form <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
