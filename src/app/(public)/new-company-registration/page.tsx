'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Send } from 'lucide-react';

export default function NewCompanyRegistrationPage() {
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
      const res = await fetch('/api/forms/new-company-registration/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_code: formData.branch || 'ADE',
          applicant: {
            name: formData.first_name ? `${formData.first_name} ${formData.last_name || ''}`.trim() : (formData.name || 'New Company Registration Applicant'),
            email: formData.email || 'applicant@rcorpo.com',
            phone: formData.phone || formData.Contact_No || '',
          },
          answers: formData,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setStatus('success');
        setReference(result.reference || 'RC-NEW-SUBMITTED');
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
            Official Raikan Form 995 · 256-Bit SSL Transmission
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">
            New Company Registration
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
                Your submission for <strong>New Company Registration</strong> has been logged with our national advisory team.
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
                    Branch Office
                  </label>
                  <input
                    type="text"
                    value={formData['Select_Branch_Office'] || ''}
                    onChange={(e) => handleChange('Select_Branch_Office', e.target.value)}
                    placeholder="Branch Office"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    email
                  </label>
                  <input
                    type="email"
                    value={formData['email'] || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="email"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Name_of_the_company
                  </label>
                  <input
                    type="text"
                    value={formData['Name_of_the_Company'] || ''}
                    onChange={(e) => handleChange('Name_of_the_Company', e.target.value)}
                    placeholder="Name_of_the_company"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    autosuggest_items
                  </label>
                  <input
                    type="text"
                    value={formData['The_registration_State_of_the_company'] || ''}
                    onChange={(e) => handleChange('The_registration_State_of_the_company', e.target.value)}
                    placeholder="autosuggest_items"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Name of the Company ( Subject to availability) 
                  </label>
                  <textarea
                    rows={3}
                    value={formData['Address_Line_1'] || ''}
                    onChange={(e) => handleChange('Address_Line_1', e.target.value)}
                    placeholder="Name of the Company ( Subject to availability) "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    The registration State of the company 
                  </label>
                  <textarea
                    rows={3}
                    value={formData['Address_Line_2'] || ''}
                    onChange={(e) => handleChange('Address_Line_2', e.target.value)}
                    placeholder="The registration State of the company "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Address Line 1 
                  </label>
                  <input
                    type="text"
                    value={formData['Suburb'] || ''}
                    onChange={(e) => handleChange('Suburb', e.target.value)}
                    placeholder="Address Line 1 "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Address Line 2 
                  </label>
                  <input
                    type="text"
                    value={formData['zipcode'] || ''}
                    onChange={(e) => handleChange('zipcode', e.target.value)}
                    placeholder="Address Line 2 "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Suburb 
                  </label>
                  <input
                    type="text"
                    value={formData['State'] || ''}
                    onChange={(e) => handleChange('State', e.target.value)}
                    placeholder="Suburb "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Zipcode 
                  </label>
                  <input
                    type="email"
                    value={formData['Companys_email'] || ''}
                    onChange={(e) => handleChange('Companys_email', e.target.value)}
                    placeholder="Zipcode "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    State 
                  </label>
                  <input
                    type="tel"
                    value={formData['Companys_contact_number'] || ''}
                    onChange={(e) => handleChange('Companys_contact_number', e.target.value)}
                    placeholder="State "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Main_business_activity
                  </label>
                  <input
                    type="text"
                    value={formData['Main_Business_Activity'] || ''}
                    onChange={(e) => handleChange('Main_Business_Activity', e.target.value)}
                    placeholder="Main_business_activity"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    autosuggest_items
                  </label>
                  <input
                    type="date"
                    value={formData['From_which_date_you_require_your_Australian_Business_Number_to_be_activated_'] || ''}
                    onChange={(e) => handleChange('From_which_date_you_require_your_Australian_Business_Number_to_be_activated_', e.target.value)}
                    placeholder="autosuggest_items"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Main Business Activity 
                  </label>
                  <input
                    type="text"
                    value={formData['Principal_Place_of_Business'] || ''}
                    onChange={(e) => handleChange('Principal_Place_of_Business', e.target.value)}
                    placeholder="Main Business Activity "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    From which date you require your Australian Business Number to be activated? 
                  </label>
                  <textarea
                    rows={3}
                    value={formData['Principal_Address_Line_1'] || ''}
                    onChange={(e) => handleChange('Principal_Address_Line_1', e.target.value)}
                    placeholder="From which date you require your Australian Business Number to be activated? "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Principal Place of Business 
                  </label>
                  <textarea
                    rows={3}
                    value={formData['Principal_Address_Line_2'] || ''}
                    onChange={(e) => handleChange('Principal_Address_Line_2', e.target.value)}
                    placeholder="Principal Place of Business "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Principal Address Line 1 
                  </label>
                  <input
                    type="text"
                    value={formData['Principal_Suburb'] || ''}
                    onChange={(e) => handleChange('Principal_Suburb', e.target.value)}
                    placeholder="Principal Address Line 1 "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Principal Address Line 2 
                  </label>
                  <input
                    type="text"
                    value={formData['Principal_Zipcode'] || ''}
                    onChange={(e) => handleChange('Principal_Zipcode', e.target.value)}
                    placeholder="Principal Address Line 2 "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Principal Suburb 
                  </label>
                  <input
                    type="text"
                    value={formData['Principal_State'] || ''}
                    onChange={(e) => handleChange('Principal_State', e.target.value)}
                    placeholder="Principal Suburb "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Principal Zipcode 
                  </label>
                  <input
                    type="text"
                    value={formData['Directors_first_name'] || ''}
                    onChange={(e) => handleChange('Directors_first_name', e.target.value)}
                    placeholder="Principal Zipcode "
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
