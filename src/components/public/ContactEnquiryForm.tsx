'use client';

import React, { useState } from 'react';
import { Mail, Phone, User, HelpCircle, CheckCircle, AlertCircle, Send, FileText } from 'lucide-react';

export default function ContactEnquiryForm() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phonenumber: '',
    subject: '',
    question: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [reference, setReference] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/forms/contact-us/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_code: 'ADE',
          applicant: {
            name: `${formData.first_name} ${formData.last_name}`.trim(),
            email: formData.email,
            phone: formData.phonenumber,
          },
          answers: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phonenumber: formData.phonenumber,
            subject: formData.subject,
            question: formData.question,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit enquiry. Please try again.');
      }

      setReference(data.reference || `RC-ENQ-${Date.now().toString().slice(-6)}`);
      setStatus('success');
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phonenumber: '',
        subject: '',
        question: '',
      });
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred while submitting.');
    }
  };

  return (
    <div className="w-full">
      {status === 'success' ? (
        <div className="p-8 bg-white border border-[#90C397] rounded-lg shadow-xs text-left">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-7 h-7 text-[#5E7F62]" />
            <h4 className="text-xl font-heading font-medium text-[#2a2a2a]">Thank you!</h4>
          </div>
          <p className="text-sm text-[#444444] mb-3 leading-relaxed">
            We will contact you soon. Following are our contact details should you require immediate assistance:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs space-y-1.5 text-gray-700 mb-6">
            <div><strong>Office:</strong> <a href="tel:0870769899" className="text-[#087caa] hover:underline">08-7076-9899</a></div>
            <div><strong>WhatsApp:</strong> <a href="http://wa.me/61452508598" target="_blank" rel="noopener noreferrer" className="text-[#087caa] hover:underline">Click Here</a></div>
            <div><strong>Email:</strong> <a href="mailto:r@rcorpo.com" className="text-[#087caa] hover:underline">r@rcorpo.com</a></div>
            <div className="pt-2 font-mono text-gray-500">Reference: <strong className="text-[#087caa]">{reference}</strong></div>
          </div>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#087caa] hover:bg-[#065b7d] rounded transition-colors"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === 'error' && (
            <div className="p-4 bg-[#FFEBEB] border border-[#FFCBCB] rounded-lg text-[#D08080] text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <div className="relative">
                <input
                  type="text"
                  name="first_name"
                  required
                  placeholder="Your First Name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#cdcdcd] rounded px-4 py-3 text-sm text-[#444444] placeholder-[#888888] focus:outline-none focus:border-[#4EB1B6] transition-colors"
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <div className="relative">
                <input
                  type="text"
                  name="last_name"
                  required
                  placeholder="Your Last Name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#cdcdcd] rounded px-4 py-3 text-sm text-[#444444] placeholder-[#888888] focus:outline-none focus:border-[#4EB1B6] transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email Address */}
            <div>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Your Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#cdcdcd] rounded px-4 py-3 text-sm text-[#444444] placeholder-[#888888] focus:outline-none focus:border-[#4EB1B6] transition-colors"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <div className="relative">
                <input
                  type="tel"
                  name="phonenumber"
                  required
                  placeholder="Your Phone number"
                  value={formData.phonenumber}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#cdcdcd] rounded px-4 py-3 text-sm text-[#444444] placeholder-[#888888] focus:outline-none focus:border-[#4EB1B6] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Subject */}
          <div>
            <input
              type="text"
              name="subject"
              required
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full bg-white border border-[#cdcdcd] rounded px-4 py-3 text-sm text-[#444444] placeholder-[#888888] focus:outline-none focus:border-[#4EB1B6] transition-colors"
            />
          </div>

          {/* Question / Message */}
          <div>
            <textarea
              name="question"
              required
              rows={5}
              placeholder="Ask us any questions..."
              value={formData.question}
              onChange={handleChange}
              className="w-full bg-white border border-[#cdcdcd] rounded px-4 py-3 text-sm text-[#444444] placeholder-[#888888] focus:outline-none focus:border-[#4EB1B6] transition-colors"
            />
          </div>

          {/* Submit Button (Exact Super Forms style: coral #f26c68 hover #444444) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="inline-flex items-center gap-2 px-9 py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-[#f26c68] hover:bg-[#444444] rounded transition-all shadow-xs disabled:opacity-70"
            >
              <Send className="w-3.5 h-3.5" />
              {status === 'submitting' ? 'Loading...' : 'Submit'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
