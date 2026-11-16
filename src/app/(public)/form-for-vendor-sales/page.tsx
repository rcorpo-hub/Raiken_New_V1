'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Send } from 'lucide-react';

export default function FormForVendorSalesPage() {
  const [formData, setFormData] = useState<Record<string, string>>({
    branch: 'ADE',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [reference, setReference] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/forms/form-for-vendor-sales/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_code: formData.branch || 'ADE',
          applicant: {
            name: formData.first_name ? `${formData.first_name} ${formData.last_name || ''}`.trim() : (formData.name || 'Form For Vendor Sales Applicant'),
            email: formData.email || 'applicant@rcorpo.com',
            phone: formData.phone || formData.Contact_No || '',
          },
          answers: formData,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setStatus('success');
        setReference(result.reference || 'RC-FOR-SUBMITTED');
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Submission failed. Please verify your entries.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('A network error occurred while submitting. Please try again.');
    }
  };

  return (
    <div className="w-full font-sans bg-[#fafafa] min-h-screen py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          href="/forms" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#087caa] hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Forms Directory
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-[#087caa] text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#087caa]" />
            Official Raikan Form 727 · 256-Bit SSL Transmission
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">
            Form For Vendor Sales
          </h1>
          <div className="w-16 h-1 bg-[#087caa] mx-auto mb-4" />
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            Please complete the fields below. All information is handled with statutory privacy compliance.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 shadow-xs">
          {status === 'success' ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Received Successfully</h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
                Your submission for <strong>Form For Vendor Sales</strong> has been logged with our national advisory team.
              </p>
              <div className="inline-block bg-gray-100 border border-gray-200 rounded-lg px-6 py-3 text-sm font-mono text-gray-800 mb-8">
                Reference: <strong className="text-[#087caa]">{reference}</strong>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setStatus('idle');
                    setFormData({ branch: 'ADE' });
                  }}
                  className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#087caa] bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-colors"
                >
                  Submit Another Form
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === 'error' && (
                <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Branch Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Select Branch Office <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.branch || 'ADE'}
                  onChange={(e) => handleChange('branch', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                >
                  <option value="ADE">Adelaide Office (Broadview SA)</option>
                  <option value="BNE">Brisbane Office (Pallara QLD)</option>
                  <option value="PER">Perth Office (Morley WA)</option>
                </select>
              </div>

              {/* Form Input Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Sales of 
                  </label>
                  <input
                    type="text"
                    value={formData['Sales_of'] || ''}
                    onChange={(e) => handleChange('Sales_of', e.target.value)}
                    placeholder="Sales of "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    After settlement 
                  </label>
                  <input
                    type="text"
                    value={formData['After_settlement'] || ''}
                    onChange={(e) => handleChange('After_settlement', e.target.value)}
                    placeholder="After settlement "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Address Line 1
                  </label>
                  <textarea
                    rows={3}
                    value={formData['address_line_1'] || ''}
                    onChange={(e) => handleChange('address_line_1', e.target.value)}
                    placeholder="Address Line 1"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Address Line 2
                  </label>
                  <textarea
                    rows={3}
                    value={formData['Address_Line_2'] || ''}
                    onChange={(e) => handleChange('Address_Line_2', e.target.value)}
                    placeholder="Address Line 2"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Suburb 
                  </label>
                  <input
                    type="text"
                    value={formData['suburb'] || ''}
                    onChange={(e) => handleChange('suburb', e.target.value)}
                    placeholder="Suburb "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Zipcode
                  </label>
                  <input
                    type="text"
                    value={formData['zipcode'] || ''}
                    onChange={(e) => handleChange('zipcode', e.target.value)}
                    placeholder="Zipcode"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData['State'] || ''}
                    onChange={(e) => handleChange('State', e.target.value)}
                    placeholder="State"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Account Name 
                  </label>
                  <input
                    type="text"
                    value={formData['Account_Name'] || ''}
                    onChange={(e) => handleChange('Account_Name', e.target.value)}
                    placeholder="Account Name "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={formData['Account_Number'] || ''}
                    onChange={(e) => handleChange('Account_Number', e.target.value)}
                    placeholder="Account Number"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Bank / Cr Union
                  </label>
                  <input
                    type="text"
                    value={formData['Bank_Cr_Union'] || ''}
                    onChange={(e) => handleChange('Bank_Cr_Union', e.target.value)}
                    placeholder="Bank / Cr Union"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Branch
                  </label>
                  <input
                    type="text"
                    value={formData['Branch'] || ''}
                    onChange={(e) => handleChange('Branch', e.target.value)}
                    placeholder="Branch"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    BSB No
                  </label>
                  <input
                    type="text"
                    value={formData['BSB_No'] || ''}
                    onChange={(e) => handleChange('BSB_No', e.target.value)}
                    placeholder="BSB No"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    I/We are not registered for GST
                  </label>
                  <input
                    type="text"
                    value={formData['IWe_are_not_registered_for_GST'] || ''}
                    onChange={(e) => handleChange('IWe_are_not_registered_for_GST', e.target.value)}
                    placeholder="I/We are not registered for GST"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    ABN Number
                  </label>
                  <input
                    type="text"
                    value={formData['ABN_Number'] || ''}
                    onChange={(e) => handleChange('ABN_Number', e.target.value)}
                    placeholder="ABN Number"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    My/Our current day time phone no. is 
                  </label>
                  <input
                    type="tel"
                    value={formData['MyOur_current_day_time_phone_no_is'] || ''}
                    onChange={(e) => handleChange('MyOur_current_day_time_phone_no_is', e.target.value)}
                    placeholder="My/Our current day time phone no. is "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={formData['field_UPgAz'] || ''}
                    onChange={(e) => handleChange('field_UPgAz', e.target.value)}
                    placeholder="Address Line 1"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={formData['field_avaud'] || ''}
                    onChange={(e) => handleChange('field_avaud', e.target.value)}
                    placeholder="Address Line 2"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Suburb 
                  </label>
                  <input
                    type="text"
                    value={formData['field_awcna'] || ''}
                    onChange={(e) => handleChange('field_awcna', e.target.value)}
                    placeholder="Suburb "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Zipcode
                  </label>
                  <input
                    type="text"
                    value={formData['field_SYVCO'] || ''}
                    onChange={(e) => handleChange('field_SYVCO', e.target.value)}
                    placeholder="Zipcode"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData['field_UNpia'] || ''}
                    onChange={(e) => handleChange('field_UNpia', e.target.value)}
                    placeholder="State"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-bold uppercase tracking-wider text-white bg-[#087caa] hover:bg-[#065b7d] shadow-sm transition-all disabled:opacity-70"
                >
                  <Send className="w-4 h-4" />
                  {status === 'submitting' ? 'Submitting Form...' : 'Submit Form'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
