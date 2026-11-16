'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Send, Calculator, DollarSign } from 'lucide-react';

export default function QuoteCalculatorPage() {
  const [formData, setFormData] = useState<Record<string, string>>({
    branch: 'ADE',
    i_am: 'Buyer',
    Property_Price: '',
    Our_Fees: '990',
    Stamp_Duty: '',
    Lodgement_Fees: '286',
    Transaction_fees: '88',
    LTO_Mortgage_Registration_Fees: '187',
    Priority_Notices_optional: '0',
    New_Title_post_settlement_optional: '0',
    total_buyer: '1551.00',
    Vendor_Fees: '770',
    LTO_Discharge_of_Mortgage_Registration: '187',
    Special_Water_Meter_Reading: '35',
    Torrens_Title_Form_1: '250',
    Community_Lot_Form_1: '0',
    Strata_Unit_Form_1: '0',
    Vendor_Total: '1242.00',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [reference, setReference] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Clean parse number helper
  const parseNum = (val: string | undefined): number => {
    if (!val) return 0;
    const clean = val.replace(/[^0-9.-]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  // Live recalculate buyer total
  const buyerSubtotal = 
    parseNum(formData.Our_Fees) +
    parseNum(formData.Stamp_Duty) +
    parseNum(formData.Lodgement_Fees) +
    parseNum(formData.Transaction_fees) +
    parseNum(formData.LTO_Mortgage_Registration_Fees) +
    parseNum(formData.Priority_Notices_optional) +
    parseNum(formData.New_Title_post_settlement_optional);

  // Live recalculate vendor total
  const vendorSubtotal =
    parseNum(formData.Vendor_Fees) +
    parseNum(formData.LTO_Discharge_of_Mortgage_Registration) +
    parseNum(formData.Special_Water_Meter_Reading) +
    parseNum(formData.Torrens_Title_Form_1) +
    parseNum(formData.Community_Lot_Form_1) +
    parseNum(formData.Strata_Unit_Form_1);

  // Synchronize computed totals into formData state
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      total_buyer: buyerSubtotal.toFixed(2),
      Vendor_Total: vendorSubtotal.toFixed(2),
    }));
  }, [buyerSubtotal, vendorSubtotal]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/forms/quote-calculator/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_code: formData.branch || 'ADE',
          applicant: {
            name: formData.name || 'Conveyancing Quote Applicant',
            email: formData.email || 'quote@rcorpo.com',
            phone: formData.phone || formData.Contact_No || '',
          },
          answers: {
            ...formData,
            computed_buyer_total_aud: buyerSubtotal.toFixed(2),
            computed_vendor_total_aud: vendorSubtotal.toFixed(2),
          },
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setStatus('success');
        setReference(result.reference || 'RC-QUO-SUBMITTED');
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

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-[#087caa] text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#087caa]" />
            Official Raikan Form 3992 · Real-Time Dynamic Calculation
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">
            Quote Calculator
          </h1>
          <div className="w-16 h-1 bg-[#087caa] mx-auto mb-4" />
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            Calculate accurate conveyancing settlement figures, statutory stamp duties, and registration disbursements instantly.
          </p>
        </div>

        {/* Live Calculation Display Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#087caa] to-[#05506e] rounded-xl p-5 text-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold opacity-80">Buyer Total Estimate</span>
              <Calculator className="w-5 h-5 opacity-70" />
            </div>
            <div className="text-3xl font-extrabold tracking-tight">
              ${buyerSubtotal.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] opacity-80 mt-1">Includes legal fees, LTO lodgement & disbursements</p>
          </div>

          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1c1c1c] rounded-xl p-5 text-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">Vendor Total Estimate</span>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-extrabold tracking-tight">
              ${vendorSubtotal.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Includes vendor legal fees, mortgage discharge & Form 1</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 shadow-xs">
          {status === 'success' ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Quote Saved & Lodged Successfully</h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
                Your conveyancing quote calculation has been sent to our settlement specialists for formal review.
              </p>
              <div className="inline-block bg-gray-100 border border-gray-200 rounded-lg px-6 py-3 text-sm font-mono text-gray-800 mb-8">
                Reference: <strong className="text-[#087caa]">{reference}</strong>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setStatus('idle');
                    setFormData({ branch: 'ADE', total_buyer: '1551.00', Vendor_Total: '1242.00' });
                  }}
                  className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#087caa] bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-colors"
                >
                  Recalculate Another Quote
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === 'error' && (
                <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
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

              {/* Client / Property Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Phone / Mobile
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="0400 000 000"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                  />
                </div>
              </div>

              {/* Buyer Breakdown Section */}
              <div className="border border-cyan-100 rounded-xl p-5 bg-cyan-50/30">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#087caa]"></span>
                  Purchaser Disbursements & Conveyancing
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Property Purchase Price ($)
                    </label>
                    <input
                      type="text"
                      value={formData['Property_Price'] || ''}
                      onChange={(e) => handleChange('Property_Price', e.target.value)}
                      placeholder="e.g. 650000"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Legal Conveyancing Fees ($)
                    </label>
                    <input
                      type="text"
                      value={formData['Our_Fees'] || ''}
                      onChange={(e) => handleChange('Our_Fees', e.target.value)}
                      placeholder="990.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Estimated Stamp Duty ($)
                    </label>
                    <input
                      type="text"
                      value={formData['Stamp_Duty'] || ''}
                      onChange={(e) => handleChange('Stamp_Duty', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Lodgement Fees ($)
                    </label>
                    <input
                      type="text"
                      value={formData['Lodgement_Fees'] || ''}
                      onChange={(e) => handleChange('Lodgement_Fees', e.target.value)}
                      placeholder="286.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Transaction Fees ($)
                    </label>
                    <input
                      type="text"
                      value={formData['Transaction_fees'] || ''}
                      onChange={(e) => handleChange('Transaction_fees', e.target.value)}
                      placeholder="88.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      LTO Mortgage Registration ($)
                    </label>
                    <input
                      type="text"
                      value={formData['LTO_Mortgage_Registration_Fees'] || ''}
                      onChange={(e) => handleChange('LTO_Mortgage_Registration_Fees', e.target.value)}
                      placeholder="187.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Priority Notices (Optional) ($)
                    </label>
                    <input
                      type="text"
                      value={formData['Priority_Notices_optional'] || ''}
                      onChange={(e) => handleChange('Priority_Notices_optional', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      New Title Post Settlement (Optional) ($)
                    </label>
                    <input
                      type="text"
                      value={formData['New_Title_post_settlement_optional'] || ''}
                      onChange={(e) => handleChange('New_Title_post_settlement_optional', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1">
                      Computed Buyer Total ($)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`$${buyerSubtotal.toFixed(2)}`}
                      className="w-full bg-cyan-100 border border-cyan-300 rounded-lg px-3.5 py-2 text-sm font-bold text-[#087caa] focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Vendor Breakdown Section */}
              <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-700"></span>
                  Vendor Disbursements & Form 1
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Vendor Legal Fees ($)
                    </label>
                    <input
                      type="text"
                      value={formData['Vendor_Fees'] || ''}
                      onChange={(e) => handleChange('Vendor_Fees', e.target.value)}
                      placeholder="770.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      LTO Discharge of Mortgage ($)
                    </label>
                    <input
                      type="text"
                      value={formData['LTO_Discharge_of_Mortgage_Registration'] || ''}
                      onChange={(e) => handleChange('LTO_Discharge_of_Mortgage_Registration', e.target.value)}
                      placeholder="187.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Special Water Meter Reading ($)
                    </label>
                    <input
                      type="text"
                      value={formData['Special_Water_Meter_Reading'] || ''}
                      onChange={(e) => handleChange('Special_Water_Meter_Reading', e.target.value)}
                      placeholder="35.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Torrens Title Form 1 ($)
                    </label>
                    <input
                      type="text"
                      value={formData['Torrens_Title_Form_1'] || ''}
                      onChange={(e) => handleChange('Torrens_Title_Form_1', e.target.value)}
                      placeholder="250.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Community Lot Form 1 ($)
                    </label>
                    <input
                      type="text"
                      value={formData['Community_Lot_Form_1'] || ''}
                      onChange={(e) => handleChange('Community_Lot_Form_1', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1">
                      Computed Vendor Total ($)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`$${vendorSubtotal.toFixed(2)}`}
                      className="w-full bg-gray-200 border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-bold text-gray-800 focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Estimates include GST where applicable. Subject to statutory government disbursement adjustments.
                </span>
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-bold uppercase tracking-wider text-white bg-[#087caa] hover:bg-[#065b7d] shadow-sm transition-all disabled:opacity-70"
                >
                  <Send className="w-4 h-4" />
                  {status === 'submitting' ? 'Submitting Quote...' : 'Submit Quote Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
