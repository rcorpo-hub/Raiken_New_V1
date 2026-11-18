'use client';
import { useFormSubmit } from '@/lib/workspace/submit-form';
import { getApplicant } from '@/lib/workspace/applicant';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Send } from 'lucide-react';

export default function RideshareTaxiGstPage() {
  const submitForm = useFormSubmit();
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
      const res = await submitForm('/api/forms/rideshare-taxi-gst/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_code: formData.branch || 'ADE',
          applicant: getApplicant(formData),
          answers: formData,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setStatus('success');
        setReference(result.reference || 'RC-RID-SUBMITTED');
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
            Official Raikan Form 3235 · 256-Bit SSL Transmission
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">
            Rideshare Taxi Gst
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
                Your submission for <strong>Rideshare Taxi Gst</strong> has been logged with our national advisory team.
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
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData['first_name'] || ''}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    placeholder="First Name"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData['last_name'] || ''}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    placeholder="Last Name"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    value={formData['phonenumber'] || ''}
                    onChange={(e) => handleChange('phonenumber', e.target.value)}
                    placeholder="Phone number"
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
                    step
                  </label>
                  <input
                    type="text"
                    value={formData['BASGST_Quarter'] || ''}
                    onChange={(e) => handleChange('BASGST_Quarter', e.target.value)}
                    placeholder="step"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    may_be_empty
                  </label>
                  <input
                    type="text"
                    value={formData['BASGST_Quarter_Other'] || ''}
                    onChange={(e) => handleChange('BASGST_Quarter_Other', e.target.value)}
                    placeholder="may_be_empty"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    BAS/GST Quarter 
                  </label>
                  <input
                    type="text"
                    value={formData['Upload_Uber_Ola_Monthly_Statements'] || ''}
                    onChange={(e) => handleChange('Upload_Uber_Ola_Monthly_Statements', e.target.value)}
                    placeholder="BAS/GST Quarter "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    BASGST Quarter Other
                  </label>
                  <input
                    type="text"
                    value={formData['Uber_Income_Gross_Before_Comission'] || ''}
                    onChange={(e) => handleChange('Uber_Income_Gross_Before_Comission', e.target.value)}
                    placeholder="BASGST Quarter Other"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Upload Uber / Ola Monthly Statements 
                  </label>
                  <input
                    type="text"
                    value={formData['Ola_Income'] || ''}
                    onChange={(e) => handleChange('Ola_Income', e.target.value)}
                    placeholder="Upload Uber / Ola Monthly Statements "
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Uber Income (Gross Before Comission)	
                  </label>
                  <input
                    type="text"
                    value={formData['Uber_Commission_All_three_months'] || ''}
                    onChange={(e) => handleChange('Uber_Commission_All_three_months', e.target.value)}
                    placeholder="Uber Income (Gross Before Comission)	"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Ola Income
                  </label>
                  <input
                    type="text"
                    value={formData['Fuel'] || ''}
                    onChange={(e) => handleChange('Fuel', e.target.value)}
                    placeholder="Ola Income"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Uber Commission (All three months)
                  </label>
                  <input
                    type="text"
                    value={formData['Car_Service'] || ''}
                    onChange={(e) => handleChange('Car_Service', e.target.value)}
                    placeholder="Uber Commission (All three months)"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Fuel
                  </label>
                  <input
                    type="text"
                    value={formData['Car_Rego'] || ''}
                    onChange={(e) => handleChange('Car_Rego', e.target.value)}
                    placeholder="Fuel"
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Car Service 
                  </label>
                  <input
                    type="text"
                    value={formData['Car_Wash'] || ''}
                    onChange={(e) => handleChange('Car_Wash', e.target.value)}
                    placeholder="Car Service "
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
