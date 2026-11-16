'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle, ShieldCheck, Send } from 'lucide-react';

export default function AppointmentBookingPage() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [reference, setReference] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    branch: 'ADE',
    service: 'Conveyancing Consultation',
    format: 'office',
    preferredDate: '',
    preferredTimeSlot: 'morning',
    notes: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/forms/appointment-booking-form/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_code: formData.branch,
          applicant: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
          answers: formData,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setReference(data.reference || `RC-APT-${Date.now().toString().slice(-6)}`);
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to submit appointment request.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Network connection error. Please try again.');
    }
  }

  return (
    <div className="w-full bg-[#fafafa] font-sans min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-[#087caa] text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#087caa]" />
            Official Raikan Form 5251 · Dedicated Consultation Scheduling
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-normal text-[#2a2a2a] mb-2">
            Schedule an Advisory Consultation
          </h1>
          <div className="w-16 h-1 bg-[#087caa] mx-auto mb-4" />
          <p className="text-sm text-[#454545] max-w-xl mx-auto">
            Book an appointment with our conveyancers, accountants, or business advisors in Adelaide, Brisbane, Perth, or via virtual teleconference.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-10 shadow-xs">
          {status === 'success' ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-heading font-medium text-[#2a2a2a] mb-2">Appointment Request Logged</h2>
              <p className="text-sm text-[#454545] max-w-md mx-auto mb-6">
                Thank you, <strong className="text-[#2a2a2a]">{formData.name}</strong>. Our calendar manager will confirm your chosen consultation slot shortly via email and SMS.
              </p>
              <div className="inline-block bg-gray-100 border border-gray-200 rounded-lg px-6 py-3 text-sm font-mono text-gray-800 mb-8">
                Request Reference: <strong className="text-[#087caa]">{reference}</strong>
              </div>
              <div>
                <Link
                  href="/"
                  className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-[#087caa] hover:bg-[#065b7d] transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Branch Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Preferred Office Location <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                >
                  <option value="ADE">Adelaide Office (Broadview SA)</option>
                  <option value="BNE">Brisbane Office (Pallara QLD)</option>
                  <option value="PER">Perth Office (Morley WA)</option>
                </select>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Service Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                >
                  <option value="Conveyancing Consultation">Property Conveyancing & Transfers</option>
                  <option value="Individual Tax Return">Individual Tax Return & Compliance</option>
                  <option value="Company & Trust Structuring">Company, Trust & Corporate Structuring</option>
                  <option value="BAS & GST Services">BAS, GST & Bookkeeping Services</option>
                </select>
              </div>

              {/* Meeting Format */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Meeting Format <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'office', label: 'Office Visit' },
                    { id: 'phone', label: 'Phone Call' },
                    { id: 'online', label: 'Virtual Meet' },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer text-xs font-semibold uppercase tracking-wider transition-all ${
                        formData.format === item.id
                          ? 'border-[#087caa] bg-cyan-50 text-[#087caa]'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="format"
                        value={item.id}
                        checked={formData.format === item.id}
                        onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                        className="sr-only"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0400 000 000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Preferred Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Time Preference
                  </label>
                  <select
                    value={formData.preferredTimeSlot}
                    onChange={(e) => setFormData({ ...formData, preferredTimeSlot: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                  >
                    <option value="morning">Morning (9:00 AM - 12:00 PM)</option>
                    <option value="afternoon">Afternoon (1:00 PM - 5:00 PM)</option>
                    <option value="evening">After Hours (5:00 PM - 7:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Additional Notes or Questions
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe your requirements or any relevant documents you hold..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#087caa]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 text-xs font-bold uppercase tracking-wider text-white bg-[#087caa] hover:bg-[#065b7d] rounded-lg transition-colors shadow-sm disabled:opacity-70"
                >
                  <Send className="w-3.5 h-3.5" />
                  {status === 'submitting' ? 'Booking Consultation...' : 'Confirm Appointment Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
