'use client';

import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  MessageSquare,
  ShieldCheck 
} from 'lucide-react';
import ContactEnquiryForm from '@/components/public/ContactEnquiryForm';

export default function ContactUsPage() {
  return (
    <div className="w-full bg-[#fafafa] min-h-screen py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-[#087caa] text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Official Form 697 · 256-Bit SSL Transmission
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-normal text-[#2a2a2a] mb-2">
            Contact Raikan Corporation
          </h1>
          <div className="w-16 h-1 bg-[#087caa] mx-auto mb-4" />
          <p className="text-sm text-[#454545] max-w-xl mx-auto">
            Have questions regarding conveyancing, accounting, or corporate trust setups? Contact our specialists in Adelaide, Brisbane, or Perth.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column (Form 697) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-10 shadow-xs">
              <h2 className="text-2xl font-heading font-medium text-[#2a2a2a] mb-6">
                Send Us an Enquiry
              </h2>
              <ContactEnquiryForm />
            </div>
          </div>

          {/* Branch Offices Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
              <h3 className="text-lg font-heading font-bold text-[#2a2a2a] mb-4 pb-2 border-b border-gray-100">
                Adelaide Branch (Head Office)
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed mb-4">
                Shop 3 160 Hampstead Road, Broadview SA 5083
              </p>
              <div className="space-y-2 text-xs text-[#454545]">
                <div><strong>Phone:</strong> <a href="tel:0870769899" className="text-[#087caa] hover:underline">08 7076 9899</a></div>
                <div><strong>Mobile:</strong> <a href="tel:0452508598" className="text-[#087caa] hover:underline">0452 508 598</a></div>
                <div><strong>Email:</strong> <a href="mailto:info@rcorpo.com" className="text-[#087caa] hover:underline">info@rcorpo.com</a></div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
              <h3 className="text-lg font-heading font-bold text-[#2a2a2a] mb-4 pb-2 border-b border-gray-100">
                Brisbane Branch
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed mb-4">
                22 Van Dieren Road, Pallara QLD 4110
              </p>
              <div className="space-y-2 text-xs text-[#454545]">
                <div><strong>Phone:</strong> <a href="tel:0721029899" className="text-[#087caa] hover:underline">07 2102 9899</a></div>
                <div><strong>Email:</strong> <a href="mailto:info@rcorpo.com" className="text-[#087caa] hover:underline">info@rcorpo.com</a></div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
              <h3 className="text-lg font-heading font-bold text-[#2a2a2a] mb-4 pb-2 border-b border-gray-100">
                Perth Branch
              </h3>
              <p className="text-xs text-[#666666] leading-relaxed mb-4">
                440A Morley Drive, Morley WA 6062
              </p>
              <div className="space-y-2 text-xs text-[#454545]">
                <div><strong>Phone:</strong> <a href="tel:0863735181" className="text-[#087caa] hover:underline">08 6373 5181</a></div>
                <div><strong>Email:</strong> <a href="mailto:info@rcorpo.com" className="text-[#087caa] hover:underline">info@rcorpo.com</a></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
