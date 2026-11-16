'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe.');
      }
    } catch {
      setStatus('error');
      setMessage('A network error occurred.');
    }
  };

  return (
    <div className="w-full font-sans bg-white py-16 sm:py-24">
      <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-cyan-100 text-[#087caa] flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Subscribe to Our Newsletter
        </h1>
        <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto">
          Receive timely Australian tax updates, conveyancing regulatory changes, and legal advisory articles directly to your inbox.
        </p>

        <div className="bg-[#fafafa] border border-gray-200 rounded-2xl p-8 shadow-xs">
          {status === 'success' ? (
            <div className="py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-gray-900 mb-1">Subscription Confirmed</h2>
              <p className="text-sm text-gray-600">
                You have been subscribed to the Raikan Corporation newsletter.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {status === 'error' && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                  {message}
                </div>
              )}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg focus:border-[#087caa] outline-none"
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-3 text-sm font-bold uppercase tracking-wider text-white bg-[#087caa] hover:bg-[#065b7d] rounded-lg transition-colors shadow-sm disabled:opacity-70"
              >
                {status === 'submitting' ? 'Subscribing...' : 'Subscribe Now'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

