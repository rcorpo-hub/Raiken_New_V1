import React from 'react';
import Link from 'next/link';
import { Home, Tag, ArrowRight, ShieldCheck, FileCheck } from 'lucide-react';

export default function NewClientConveyancingPage() {
  return (
    <div className="w-full font-sans bg-[#fafafa] py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-[#087caa] text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Licensed Australian Legal Conveyancing
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-normal text-[#2a2a2a] mb-2">
            New Client Conveyancing Form
          </h1>
          <div className="w-16 h-1 bg-[#087caa] mx-auto mb-4" />
          <p className="text-sm text-[#454545] max-w-xl mx-auto">
            Please choose your role below to complete your secure legal conveyancing intake with Raikan Corporation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Purchaser Option */}
          <div className="bg-white border border-[#e5e5e5] rounded-xl p-8 text-center shadow-xs hover:shadow-md transition-shadow flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-cyan-50 border border-cyan-100 text-[#087caa] flex items-center justify-center mb-6">
              <Home className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-heading font-medium text-[#2a2a2a] mb-2">Purchaser Form</h2>
            <p className="text-sm text-[#666666] mb-8 leading-relaxed">
              Purchasing residential or commercial property in South Australia, Queensland, or Western Australia.
            </p>
            <div className="mt-auto w-full">
              <Link
                href="/nc/i-am-purchaser"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-[#087caa] hover:bg-[#065b7d] rounded transition-colors shadow-xs"
              >
                Start Purchaser Form <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Vendor Option */}
          <div className="bg-white border border-[#e5e5e5] rounded-xl p-8 text-center shadow-xs hover:shadow-md transition-shadow flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-cyan-50 border border-cyan-100 text-[#087caa] flex items-center justify-center mb-6">
              <Tag className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-heading font-medium text-[#2a2a2a] mb-2">Vendor Form</h2>
            <p className="text-sm text-[#666666] mb-8 leading-relaxed">
              Selling residential or commercial real estate and requiring contract preparation and settlement representation.
            </p>
            <div className="mt-auto w-full">
              <Link
                href="/nc/i-am-vendor"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-[#087caa] hover:bg-[#065b7d] rounded transition-colors shadow-xs"
              >
                Start Vendor Form <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Security and Trust Banner */}
        <div className="mt-16 p-6 bg-white border border-gray-200 rounded-xl flex items-center gap-4 text-xs text-[#666666] max-w-2xl mx-auto shadow-xs">
          <ShieldCheck className="w-6 h-6 text-[#087caa] shrink-0" />
          <span>
            Transmissions are encrypted using 256-bit SSL certificate security in compliance with the Privacy Act 1988 (Cth) and Australian Legal Practice Standards.
          </span>
        </div>
      </div>
    </div>
  );
}
