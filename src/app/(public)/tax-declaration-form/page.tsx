'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Send } from 'lucide-react';

export default function TaxDeclarationFormPage() {
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
      const res = await fetch('/api/forms/tax-declaration-form/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_code: formData.branch || 'ADE',
          applicant: {
            name: formData.first_name ? `${formData.first_name} ${formData.last_name || ''}`.trim() : (formData.name || 'Tax Declaration Form Applicant'),
            email: formData.email || 'applicant@rcorpo.com',
            phone: formData.phone || formData.Contact_No || '',
          },
          answers: formData,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setStatus('success');
        setReference(result.reference || 'RC-TAX-SUBMITTED');
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
            Official Raikan Form 3057 · 256-Bit SSL Transmission
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">
            Tax Declaration Form
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
                Your submission for <strong>Tax Declaration Form</strong> has been logged with our national advisory team.
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
                    Do You Have TFN No? 
                  </label>
                  <input
                    type="text"
                    value={formData['Do_have_TFN'] || ''}
                    onChange={(e) => handleChange('Do_have_TFN', e.target.value)}
                    placeholder="Do You Have TFN No? "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    TFN
                  </label>
                  <input
                    type="text"
                    value={formData['TFN'] || ''}
                    onChange={(e) => handleChange('TFN', e.target.value)}
                    placeholder="TFN"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Option
                  </label>
                  <input
                    type="text"
                    value={formData['If_Not_TFN_No'] || ''}
                    onChange={(e) => handleChange('If_Not_TFN_No', e.target.value)}
                    placeholder="Option"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Title 
                  </label>
                  <input
                    type="text"
                    value={formData['title'] || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Title "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Surname or family name 
                  </label>
                  <input
                    type="text"
                    value={formData['Surname_or_family_name'] || ''}
                    onChange={(e) => handleChange('Surname_or_family_name', e.target.value)}
                    placeholder="Surname or family name "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    First given name 
                  </label>
                  <input
                    type="text"
                    value={formData['First_given_name'] || ''}
                    onChange={(e) => handleChange('First_given_name', e.target.value)}
                    placeholder="First given name "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Other given names 
                  </label>
                  <input
                    type="text"
                    value={formData['Other_given_names'] || ''}
                    onChange={(e) => handleChange('Other_given_names', e.target.value)}
                    placeholder="Other given names "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    What is your home address in Australia? 
                  </label>
                  <textarea
                    rows={3}
                    value={formData['What_is_your_home_address_in_Australia'] || ''}
                    onChange={(e) => handleChange('What_is_your_home_address_in_Australia', e.target.value)}
                    placeholder="What is your home address in Australia? "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Suburb/town/locality 
                  </label>
                  <input
                    type="text"
                    value={formData['Suburb_town_locality'] || ''}
                    onChange={(e) => handleChange('Suburb_town_locality', e.target.value)}
                    placeholder="Suburb/town/locality "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    State / territory 
                  </label>
                  <input
                    type="text"
                    value={formData['State_territory'] || ''}
                    onChange={(e) => handleChange('State_territory', e.target.value)}
                    placeholder="State / territory "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Postcode 
                  </label>
                  <input
                    type="text"
                    value={formData['Postcode'] || ''}
                    onChange={(e) => handleChange('Postcode', e.target.value)}
                    placeholder="Postcode "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    If you have changed your name since you last dealt with the ATO, provide your previous family name. 
                  </label>
                  <input
                    type="text"
                    value={formData['If_you_have_changed_your_name_since_you_last_dealt_with_the_ATO_provide_your_previous_family_name_'] || ''}
                    onChange={(e) => handleChange('If_you_have_changed_your_name_since_you_last_dealt_with_the_ATO_provide_your_previous_family_name_', e.target.value)}
                    placeholder="If you have changed your name since you last dealt with the ATO, provide your previous family name. "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Date of birth? 
                  </label>
                  <input
                    type="date"
                    value={formData['date_of_birth'] || ''}
                    onChange={(e) => handleChange('date_of_birth', e.target.value)}
                    placeholder="Date of birth? "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    On what basis are you paid? 
                  </label>
                  <input
                    type="text"
                    value={formData['On_what_basis_are_you_paid'] || ''}
                    onChange={(e) => handleChange('On_what_basis_are_you_paid', e.target.value)}
                    placeholder="On what basis are you paid? "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Are you 
                  </label>
                  <input
                    type="text"
                    value={formData['Are_you'] || ''}
                    onChange={(e) => handleChange('Are_you', e.target.value)}
                    placeholder="Are you "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Do you want to claim the tax-free threshold from this payer? 
                  </label>
                  <input
                    type="text"
                    value={formData['Do_you_want_to_claim_the_tax-free_threshold_from_this_payer'] || ''}
                    onChange={(e) => handleChange('Do_you_want_to_claim_the_tax-free_threshold_from_this_payer', e.target.value)}
                    placeholder="Do you want to claim the tax-free threshold from this payer? "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    (a) Do you have a Higher Education Loan Program (HELP), Student Start-up Loan (SSL) or Trade Support Loan (TSL) debt? 
                  </label>
                  <input
                    type="text"
                    value={formData['a_Do_you_have_a_Higher_Education_Loan_Program_HELP_Student_Start-up_Loan_SSL_or_Trade_Support_Loan_TSL_debt'] || ''}
                    onChange={(e) => handleChange('a_Do_you_have_a_Higher_Education_Loan_Program_HELP_Student_Start-up_Loan_SSL_or_Trade_Support_Loan_TSL_debt', e.target.value)}
                    placeholder="(a) Do you have a Higher Education Loan Program (HELP), Student Start-up Loan (SSL) or Trade Support Loan (TSL) debt? "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    (b) Do you have a Financial Supplement debt? 
                  </label>
                  <input
                    type="text"
                    value={formData['b_Do_you_have_a_Financial_Supplement_debt'] || ''}
                    onChange={(e) => handleChange('b_Do_you_have_a_Financial_Supplement_debt', e.target.value)}
                    placeholder="(b) Do you have a Financial Supplement debt? "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Phone number 
                  </label>
                  <input
                    type="tel"
                    value={formData['phone_number'] || ''}
                    onChange={(e) => handleChange('phone_number', e.target.value)}
                    placeholder="Phone number "
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
