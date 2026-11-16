'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const seen = sessionStorage.getItem('rc_welcome_seen');
    if (!seen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('rc_welcome_seen', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative max-w-3xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close welcome notice"
          className="absolute right-3 top-3 z-20 w-8 h-8 rounded-full bg-gray-900/70 hover:bg-gray-900 text-white flex items-center justify-center transition-colors shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Welcome Image Graphic */}
        <div className="relative w-full aspect-16/9 sm:aspect-2/1 bg-slate-900">
          <Image
            src="/images/welcome.png"
            alt="Raikan Corporation Welcome Notice"
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-contain"
            priority
          />
        </div>

        {/* Footer Dismiss Button */}
        <div className="p-4 bg-gray-50 flex justify-end border-t border-gray-100">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#087caa] hover:bg-[#065b7d] rounded transition-colors"
          >
            Enter Website
          </button>
        </div>
      </div>
    </div>
  );
}

