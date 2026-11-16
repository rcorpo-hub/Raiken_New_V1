'use client';

import React, { useState } from 'react';
import { Phone, Mail, Video, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MyStickyElements() {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div
      className={`fixed left-0 top-1/2 -translate-y-1/2 z-50 transition-transform duration-300 ${
        isMinimized ? '-translate-x-[44px]' : 'translate-x-0'
      }`}
    >
      <div className="flex flex-col">
        {/* Minimize / Expand Toggle */}
        <button
          type="button"
          onClick={() => setIsMinimized(!isMinimized)}
          aria-label={isMinimized ? 'Expand social channels' : 'Minimize social channels'}
          className="w-11 h-9 bg-black hover:bg-neutral-800 text-white flex items-center justify-center transition-colors cursor-pointer rounded-tr-sm shadow-md"
        >
          {isMinimized ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* Phone */}
        <div className="relative group flex items-center">
          <a
            href="tel:0870769899"
            aria-label="Phone"
            className="w-11 h-11 bg-[#26D37C] hover:bg-[#20b86a] text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
          >
            <Phone className="w-5 h-5 fill-current" />
          </a>
          <a
            href="tel:0870769899"
            className="absolute left-11 top-0 h-11 px-4 bg-[#26D37C] text-white text-xs font-semibold flex items-center whitespace-nowrap overflow-hidden max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 rounded-r shadow-md cursor-pointer pointer-events-none group-hover:pointer-events-auto"
          >
            Phone
          </a>
        </div>

        {/* Email */}
        <div className="relative group flex items-center">
          <a
            href="mailto:r@rcorpo.com"
            aria-label="Email"
            className="w-11 h-11 bg-[#DC483C] hover:bg-[#c23b30] text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
          >
            <Mail className="w-5 h-5" />
          </a>
          <a
            href="mailto:r@rcorpo.com"
            className="absolute left-11 top-0 h-11 px-4 bg-[#DC483C] text-white text-xs font-semibold flex items-center whitespace-nowrap overflow-hidden max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 rounded-r shadow-md cursor-pointer pointer-events-none group-hover:pointer-events-auto"
          >
            Email
          </a>
        </div>

        {/* WhatsApp */}
        <div className="relative group flex items-center">
          <a
            href="https://web.whatsapp.com/send?phone=+61452508598"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="w-11 h-11 bg-[#26D367] hover:bg-[#1fb857] text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          </a>
          <a
            href="https://web.whatsapp.com/send?phone=+61452508598"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute left-11 top-0 h-11 px-4 bg-[#26D367] text-white text-xs font-semibold flex items-center whitespace-nowrap overflow-hidden max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 rounded-r shadow-md cursor-pointer pointer-events-none group-hover:pointer-events-auto"
          >
            WhatsApp
          </a>
        </div>

        {/* Zoom Meeting */}
        <div className="relative group flex items-center">
          <a
            href="https://us04web.zoom.us/j/3138391200?pwd=TFFCWWxuWmZTa0lGSXBzb3JaUXpkQT09"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Zoom Meeting"
            className="w-11 h-11 bg-[#7761DF] hover:bg-[#6650cb] text-white flex items-center justify-center transition-colors cursor-pointer rounded-br-sm shadow-md"
          >
            <Video className="w-5 h-5" />
          </a>
          <a
            href="https://us04web.zoom.us/j/3138391200?pwd=TFFCWWxuWmZTa0lGSXBzb3JaUXpkQT09"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute left-11 top-0 h-11 px-4 bg-[#7761DF] text-white text-xs font-semibold flex items-center whitespace-nowrap overflow-hidden max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 rounded-r shadow-md cursor-pointer pointer-events-none group-hover:pointer-events-auto"
          >
            Zoom Meeting
          </a>
        </div>
      </div>
    </div>
  );
}
