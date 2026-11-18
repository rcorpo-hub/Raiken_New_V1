'use client';
import { useFormSubmit } from '@/lib/workspace/submit-form';
import { getApplicant } from '@/lib/workspace/applicant';

import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, LifeBuoy, FileText } from 'lucide-react';

export default function SupportPage() {
  const submitForm = useFormSubmit();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Conveyancing File Query',
    priority: 'Normal',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [ticketId, setTicketId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const res = await submitForm('/api/forms/support/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_code: 'ADE',
          applicant: getApplicant(formData),
          answers: formData,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setTicketId(data.reference || 'RC-TKT-LOGGED');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="w-full font-sans bg-[#fafafa] py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-cyan-100 text-[#087caa] flex items-center justify-center mx-auto mb-4">
            <LifeBuoy className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">
            Client Support Desk
          </h1>
          <div className="w-16 h-1 bg-[#087caa] mx-auto mb-4" />
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            Submit an official support enquiry regarding your settlement file, tax return status, or corporate filing.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 shadow-xs">
          {status === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Support Ticket Created</h2>
              <p className="text-sm text-gray-600 mb-4">
                Your ticket has been routed to our legal and tax support specialists.
              </p>
              <div className="text-xs font-mono bg-gray-50 border border-gray-200 px-4 py-2 rounded inline-block text-gray-800 mb-6">
                Ticket Reference: <strong>{ticketId}</strong>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#087caa] bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-colors"
                >
                  Create Another Ticket
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded focus:bg-white focus:border-[#087caa] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded focus:bg-white focus:border-[#087caa] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded focus:bg-white focus:border-[#087caa] outline-none"
                  >
                    <option value="Conveyancing File Query">Conveyancing Settlement Status</option>
                    <option value="Tax Return / BAS">Tax Return / BAS Enquiry</option>
                    <option value="Company / Trust Registration">Company / Trust Registration</option>
                    <option value="Billing / Invoice">Billing &amp; Trust Account Receipt</option>
                    <option value="General Support">General Client Support</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded focus:bg-white focus:border-[#087caa] outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High (Settlement this week)</option>
                    <option value="Urgent">Urgent (Settlement today)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Settlement date confirmation for 12 Smith St"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded focus:bg-white focus:border-[#087caa] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Detailed Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your enquiry in detail, including file or property reference if available..."
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded focus:bg-white focus:border-[#087caa] outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="px-8 py-3 text-sm font-bold uppercase tracking-wider text-white bg-[#087caa] hover:bg-[#065b7d] rounded-lg transition-colors shadow-sm disabled:opacity-70"
                >
                  {status === 'submitting' ? 'Submitting Ticket...' : 'Submit Support Ticket'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

