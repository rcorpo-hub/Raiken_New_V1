'use client';
import { useFormSubmit } from '@/lib/workspace/submit-form';
import { getApplicant } from '@/lib/workspace/applicant';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Send, Calculator, TrendingUp, TrendingDown } from 'lucide-react';

export default function RentalPropertySummaryPage() {
  const submitForm = useFormSubmit();
  const [formData, setFormData] = useState<Record<string, string>>({
    branch: 'ADE',
    officeemail: 'info@rcorpo.com',
    first_name: '',
    last_name: '',
    email: '',
    phonenumber: '',
    Property_Address: '',
    Suburb_town_locality: '',
    State_territory: 'SA',
    Postcode: '',
    Number_of_Weeks_Property_Was_rented: '52',
    Number_of_weeks_property_was_available_for_rent: '52',
    Number_of_Owners: '1',
    Name_of_Owners: '',
    Ownership_: '100',
    // Income
    Gross_Rent: '',
    Other_Income_i_e_water_charges_etc: '',
    Total_Income: '0.00',
    // Expenses
    Advertising: '',
    Body_corporate_fees: '',
    Borrowing_expenses: '',
    Cleaning: '',
    Council_rates: '',
    Depreciable_items: '',
    Gardeninglawn_mowing: '',
    Insurance: '',
    Interest_on_loans: '',
    Land_tax: '',
    Legal_fees: '',
    Pest_control: '',
    Property_management_feescommissions: '',
    Repairs_and_maintenance: '',
    Stationery_telephone_and_postage: '',
    Water_charges: '',
    Sundry_rental_expenses: '',
    Total_Expenses: '0.00',
    Net_Rental_Income: '0.00',
    signature: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [reference, setReference] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const parseNum = (val: string | undefined): number => {
    if (!val) return 0;
    const clean = val.replace(/[^0-9.-]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  // Live recalculate Total Income
  const calculatedTotalIncome = 
    parseNum(formData.Gross_Rent) + 
    parseNum(formData.Other_Income_i_e_water_charges_etc);

  // Live recalculate Total Expenses
  const calculatedTotalExpenses =
    parseNum(formData.Advertising) +
    parseNum(formData.Body_corporate_fees) +
    parseNum(formData.Borrowing_expenses) +
    parseNum(formData.Cleaning) +
    parseNum(formData.Council_rates) +
    parseNum(formData.Depreciable_items) +
    parseNum(formData.Gardeninglawn_mowing) +
    parseNum(formData.Insurance) +
    parseNum(formData.Interest_on_loans) +
    parseNum(formData.Land_tax) +
    parseNum(formData.Legal_fees) +
    parseNum(formData.Pest_control) +
    parseNum(formData.Property_management_feescommissions) +
    parseNum(formData.Repairs_and_maintenance) +
    parseNum(formData.Stationery_telephone_and_postage) +
    parseNum(formData.Water_charges) +
    parseNum(formData.Sundry_rental_expenses);

  const calculatedNetIncome = calculatedTotalIncome - calculatedTotalExpenses;

  // Sync calculations into formData
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      Total_Income: calculatedTotalIncome.toFixed(2),
      Total_Expenses: calculatedTotalExpenses.toFixed(2),
      Net_Rental_Income: calculatedNetIncome.toFixed(2),
    }));
  }, [calculatedTotalIncome, calculatedTotalExpenses, calculatedNetIncome]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await submitForm('/api/forms/rental-property-summary/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_code: formData.branch || 'ADE',
          applicant: getApplicant(formData),
          answers: {
            ...formData,
            computed_total_income_aud: calculatedTotalIncome.toFixed(2),
            computed_total_expenses_aud: calculatedTotalExpenses.toFixed(2),
            computed_net_rental_aud: calculatedNetIncome.toFixed(2),
          },
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setStatus('success');
        setReference(result.reference || 'RC-RENTAL-SUBMITTED');
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
            Official Raikan Form 3283 · Real-Time Dynamic Tax Formula
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">
            Rental Property Summary
          </h1>
          <div className="w-16 h-1 bg-[#087caa] mx-auto mb-4" />
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            Annual investment property income, tax deductions, and depreciation schedules calculated in compliance with statutory ATO regulations.
          </p>
        </div>

        {/* Live Calculation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs uppercase font-semibold">Total Gross Income</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              ${calculatedTotalIncome.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Rental receipts & tenant recharges</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs uppercase font-semibold">Total Deductions</span>
              <TrendingDown className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold text-rose-600">
              ${calculatedTotalExpenses.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Interest, maintenance, rates & fees</p>
          </div>

          <div className={`rounded-xl p-5 text-white shadow-md ${calculatedNetIncome >= 0 ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : 'bg-gradient-to-br from-rose-600 to-red-700'}`}>
            <div className="flex items-center justify-between mb-1 opacity-90">
              <span className="text-xs uppercase font-semibold">Net Rental Position</span>
              <Calculator className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold tracking-tight">
              ${calculatedNetIncome.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] opacity-80 mt-1">
              {calculatedNetIncome >= 0 ? 'Taxable Net Rental Profit' : 'Net Rental Loss (Negative Gearing)'}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 shadow-xs">
          {status === 'success' ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule Lodged Successfully</h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
                Your rental property financial schedule has been securely transmitted to our CPA tax accountants.
              </p>
              <div className="inline-block bg-gray-100 border border-gray-200 rounded-lg px-6 py-3 text-sm font-mono text-gray-800 mb-8">
                Reference: <strong className="text-[#087caa]">{reference}</strong>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setStatus('idle');
                    setFormData({ branch: 'ADE', officeemail: 'info@rcorpo.com', State_territory: 'SA', date: new Date().toISOString().split('T')[0] });
                  }}
                  className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#087caa] bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-colors"
                >
                  Submit Another Property Summary
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {status === 'error' && (
                <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Branch Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Select Servicing Branch <span className="text-rose-500">*</span>
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

              {/* Owner Details */}
              <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                <h3 className="text-base font-bold text-gray-900 mb-4">1. Owner & Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => handleChange('first_name', e.target.value)}
                      placeholder="First Name"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => handleChange('last_name', e.target.value)}
                      placeholder="Last Name"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="email@example.com"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phonenumber}
                      onChange={(e) => handleChange('phonenumber', e.target.value)}
                      placeholder="0400 000 000"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                <h3 className="text-base font-bold text-gray-900 mb-4">2. Rental Property Identification</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Property Street Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.Property_Address}
                      onChange={(e) => handleChange('Property_Address', e.target.value)}
                      placeholder="e.g. 12 Smith Street"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Suburb / Locality</label>
                    <input
                      type="text"
                      value={formData.Suburb_town_locality}
                      onChange={(e) => handleChange('Suburb_town_locality', e.target.value)}
                      placeholder="Suburb"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                      <select
                        value={formData.State_territory}
                        onChange={(e) => handleChange('State_territory', e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                      >
                        <option value="SA">SA</option>
                        <option value="QLD">QLD</option>
                        <option value="WA">WA</option>
                        <option value="NSW">NSW</option>
                        <option value="VIC">VIC</option>
                        <option value="TAS">TAS</option>
                        <option value="ACT">ACT</option>
                        <option value="NT">NT</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Postcode</label>
                      <input
                        type="text"
                        value={formData.Postcode}
                        onChange={(e) => handleChange('Postcode', e.target.value)}
                        placeholder="5000"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Weeks Rented in Tax Year</label>
                    <input
                      type="number"
                      value={formData.Number_of_Weeks_Property_Was_rented}
                      onChange={(e) => handleChange('Number_of_Weeks_Property_Was_rented', e.target.value)}
                      placeholder="52"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ownership Percentage (%)</label>
                    <input
                      type="number"
                      value={formData.Ownership_}
                      onChange={(e) => handleChange('Ownership_', e.target.value)}
                      placeholder="100"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                </div>
              </div>

              {/* Income Schedule */}
              <div className="border border-emerald-100 rounded-xl p-5 bg-emerald-50/30">
                <h3 className="text-base font-bold text-emerald-950 mb-4">3. Rental Income Schedule</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Gross Rent Received ($)</label>
                    <input
                      type="text"
                      value={formData.Gross_Rent}
                      onChange={(e) => handleChange('Gross_Rent', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Other Income (Water charges, insurance recoveries) ($)</label>
                    <input
                      type="text"
                      value={formData.Other_Income_i_e_water_charges_etc}
                      onChange={(e) => handleChange('Other_Income_i_e_water_charges_etc', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                </div>
              </div>

              {/* Deductions / Expenses Schedule */}
              <div className="border border-rose-100 rounded-xl p-5 bg-rose-50/20">
                <h3 className="text-base font-bold text-rose-950 mb-4">4. Rental Deductions & Operating Expenses</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Advertising ($)</label>
                    <input
                      type="text"
                      value={formData.Advertising}
                      onChange={(e) => handleChange('Advertising', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Body Corporate / Strata ($)</label>
                    <input
                      type="text"
                      value={formData.Body_corporate_fees}
                      onChange={(e) => handleChange('Body_corporate_fees', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Borrowing Expenses ($)</label>
                    <input
                      type="text"
                      value={formData.Borrowing_expenses}
                      onChange={(e) => handleChange('Borrowing_expenses', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cleaning ($)</label>
                    <input
                      type="text"
                      value={formData.Cleaning}
                      onChange={(e) => handleChange('Cleaning', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Council Rates ($)</label>
                    <input
                      type="text"
                      value={formData.Council_rates}
                      onChange={(e) => handleChange('Council_rates', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Depreciable Assets ($)</label>
                    <input
                      type="text"
                      value={formData.Depreciable_items}
                      onChange={(e) => handleChange('Depreciable_items', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Gardening / Mowing ($)</label>
                    <input
                      type="text"
                      value={formData.Gardeninglawn_mowing}
                      onChange={(e) => handleChange('Gardeninglawn_mowing', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Building & Landlord Insurance ($)</label>
                    <input
                      type="text"
                      value={formData.Insurance}
                      onChange={(e) => handleChange('Insurance', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Interest on Investment Loans ($)</label>
                    <input
                      type="text"
                      value={formData.Interest_on_loans}
                      onChange={(e) => handleChange('Interest_on_loans', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Land Tax ($)</label>
                    <input
                      type="text"
                      value={formData.Land_tax}
                      onChange={(e) => handleChange('Land_tax', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Legal / Conveyancing Fees ($)</label>
                    <input
                      type="text"
                      value={formData.Legal_fees}
                      onChange={(e) => handleChange('Legal_fees', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Pest Control ($)</label>
                    <input
                      type="text"
                      value={formData.Pest_control}
                      onChange={(e) => handleChange('Pest_control', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Property Agent Management ($)</label>
                    <input
                      type="text"
                      value={formData.Property_management_feescommissions}
                      onChange={(e) => handleChange('Property_management_feescommissions', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Repairs & Maintenance ($)</label>
                    <input
                      type="text"
                      value={formData.Repairs_and_maintenance}
                      onChange={(e) => handleChange('Repairs_and_maintenance', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Water Supply & Usage ($)</label>
                    <input
                      type="text"
                      value={formData.Water_charges}
                      onChange={(e) => handleChange('Water_charges', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Sundry Expenses ($)</label>
                    <input
                      type="text"
                      value={formData.Sundry_rental_expenses}
                      onChange={(e) => handleChange('Sundry_rental_expenses', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                    />
                  </div>
                </div>
              </div>

              {/* Digital Declaration & Signature */}
              <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                <h3 className="text-base font-bold text-gray-900 mb-4">5. Owner Declaration & Digital Sign-off</h3>
                <div className="space-y-4">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    I declare that the information provided in this rental property summary is complete and correct to the best of my knowledge and that all expenses claimed were incurred in earning rental income.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Full Name / Electronic Signature *</label>
                      <input
                        type="text"
                        required
                        value={formData.signature}
                        onChange={(e) => handleChange('signature', e.target.value)}
                        placeholder="Type Full Name to Sign"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 font-serif italic focus:outline-none focus:border-[#087caa]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Date of Lodgement</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#087caa]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Data secured with 256-Bit SSL encryption. Strict statutory privacy policy.
                </span>
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-bold uppercase tracking-wider text-white bg-[#087caa] hover:bg-[#065b7d] shadow-sm transition-all disabled:opacity-70"
                >
                  <Send className="w-4 h-4" />
                  {status === 'submitting' ? 'Submitting Schedule...' : 'Submit Rental Summary'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
