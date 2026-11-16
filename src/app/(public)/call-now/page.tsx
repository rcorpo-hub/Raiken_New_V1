'use client';

import React, { useState } from 'react';
import { Phone, CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

export default function CallNowPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: 'Conveyancing',
    preferredTime: 'Morning (9am - 12pm)',
    notes: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [reference, setReference] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const res = await fetch('/api/forms/call-now/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_code: 'ADE',
          applicant: {
            name: formData.name,
            email: 'callback@rcorpo.com',
            phone: formData.phone,
          },
          answers: formData,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setReference(data.reference || 'RC-CALL-REQUESTED');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="w-full font-sans bg-[#fafafa] py-16 sm:py-24">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-cyan-100 text-[#087caa] flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Immediate Call Back</h1>
          <p className="text-sm text-gray-600">
            Submit your contact number and our senior advisors will connect with you during your preferred time window.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 shadow-sm">
          {status === 'success' ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Call Request Logged</h2>
              <p className="text-sm text-gray-600 mb-4">
                We have registered your callback for <strong>{formData.phone}</strong>.
              </p>
              <div className="text-xs font-mono bg-gray-50 border border-gray-200 px-4 py-2 rounded inline-block text-gray-800">
                Ref: {reference}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Michael Taylor"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded focus:bg-white focus:border-[#087caa] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0400 000 000"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded focus:bg-white focus:border-[#087caa] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Topic of Discussion
                </label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded focus:bg-white focus:border-[#087caa] outline-none"
                >
                  <option value="Conveyancing">Property Conveyancing</option>
                  <option value="Taxation">Taxation &amp; BAS</option>
                  <option value="Company">Company Registration</option>
                  <option value="Trust">Trust Setup</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Preferred Time Window
                </label>
                <select
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded focus:bg-white focus:border-[#087caa] outline-none"
                >
                  <option value="Morning (9am - 12pm)">Morning (9:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (12pm - 3pm)">Afternoon (12:00 PM - 3:00 PM)</option>
                  <option value="Late Afternoon (3pm - 5:30pm)">Late Afternoon (3:00 PM - 5:30 PM)</option>
                  <option value="Urgent (Within 1 hour)">Urgent Priority (Next Available)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full py-3 text-sm font-bold uppercase tracking-wider text-white bg-[#087caa] hover:bg-[#065b7d] rounded-lg transition-colors shadow-sm disabled:opacity-70"
                >
                  {status === 'submitting' ? 'Submitting...' : 'Call Me Back'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

