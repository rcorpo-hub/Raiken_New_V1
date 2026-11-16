'use client';

import React, { useState, useRef } from 'react';
import { PenTool, CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react';

export default function DigitalSignaturePage() {
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [documentRef, setDocumentRef] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [receiptRef, setReceiptRef] = useState<string | null>(null);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#087caa';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked) {
      alert('Please confirm your legal consent before signing.');
      return;
    }

    let signaturePayload = '';
    if (signatureMode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      signaturePayload = canvas.toDataURL('image/png');
    } else {
      signaturePayload = `typed:${typedName}`;
    }

    setStatus('submitting');

    try {
      const res = await fetch('/api/forms/digital-signature/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_code: 'ADE',
          applicant: {
            name: typedName,
            email: signerEmail,
          },
          answers: {
            mode: signatureMode,
            documentReference: documentRef,
            signature: signaturePayload,
            signedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setReceiptRef(data.reference || 'RC-SIG-VERIFIED');
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
            <PenTool className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">
            Digital Signature Capture
          </h1>
          <div className="w-16 h-1 bg-[#087caa] mx-auto mb-4" />
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            Authorized electronic signature capture for conveyancing authorities, tax authorizations, and client engagement agreements.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 shadow-xs">
          {status === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Signature Recorded</h2>
              <p className="text-sm text-gray-600 mb-4">
                Your signature has been securely timestamped and associated with file <strong>{documentRef}</strong>.
              </p>
              <div className="text-xs font-mono bg-gray-50 border border-gray-200 px-4 py-2 rounded inline-block text-gray-800 mb-6">
                Verification Reference: <strong>{receiptRef}</strong>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Signatory Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="e.g. Johnathan Smith"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded focus:bg-white focus:border-[#087caa] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Signatory Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={signerEmail}
                    onChange={(e) => setSignerEmail(e.target.value)}
                    placeholder="john@example.com.au"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded focus:bg-white focus:border-[#087caa] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Document / Property Reference
                </label>
                <input
                  type="text"
                  value={documentRef}
                  onChange={(e) => setDocumentRef(e.target.value)}
                  placeholder="e.g. Contract of Sale - 12 Smith St, Adelaide"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded focus:bg-white focus:border-[#087caa] outline-none"
                />
              </div>

              {/* Mode Toggle */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-2">
                  Signature Input Method
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSignatureMode('draw')}
                    className={`px-4 py-2 text-xs font-bold rounded uppercase tracking-wider transition-colors ${
                      signatureMode === 'draw'
                        ? 'bg-[#087caa] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Draw Signature
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignatureMode('type')}
                    className={`px-4 py-2 text-xs font-bold rounded uppercase tracking-wider transition-colors ${
                      signatureMode === 'type'
                        ? 'bg-[#087caa] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Type Signature
                  </button>
                </div>
              </div>

              {/* Draw Signature Canvas */}
              {signatureMode === 'draw' ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Sign in the box below using your mouse or finger:</span>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-xs text-red-600 hover:underline inline-flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Clear Box
                    </button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair touch-none"
                  />
                </div>
              ) : (
                <div>
                  <div className="p-6 bg-gray-50 border border-gray-300 rounded-lg text-center">
                    <span className="font-serif italic text-3xl text-gray-900 block min-h-[48px]">
                      {typedName || 'Your Name Preview'}
                    </span>
                  </div>
                </div>
              )}

              {/* Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer text-xs text-gray-700 leading-relaxed">
                  <input
                    type="checkbox"
                    required
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="w-4 h-4 rounded text-[#087caa] focus:ring-[#087caa] mt-0.5"
                  />
                  <span>
                    I confirm that this electronic signature is intended to sign and legally execute the specified Australian documentation, in accordance with the Electronic Transactions Act.
                  </span>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="px-8 py-3 text-sm font-bold uppercase tracking-wider text-white bg-[#087caa] hover:bg-[#065b7d] rounded-lg transition-colors shadow-sm disabled:opacity-70"
                >
                  {status === 'submitting' ? 'Submitting Signature...' : 'Execute Digital Signature'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

