import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full footer-font">
      {/* Main Footer Container (#656666 background from WordPress Footer 641) */}
      <div className="bg-[#656666] text-white pt-20 pb-16 px-4 sm:px-6 lg:px-8 border-t border-gray-600">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Column 1: Logo */}
          <div className="flex flex-col items-start justify-start pt-2">
            <Link href="/" className="inline-block relative w-56 h-16">
              <Image 
                src="/images/logo-white.png" 
                alt="Raikan Corporation Logo White" 
                fill
                sizes="224px"
                className="object-contain object-left"
              />
            </Link>
          </div>

          {/* Column 2: Our Location */}
          <div>
            <h4 className="text-xl font-heading font-medium text-white mb-2">
              Our Location
            </h4>
            <p className="text-xs text-gray-300 italic mb-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
            </p>
            <ul className="space-y-4 text-sm text-gray-200">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#087caa] shrink-0 mt-1" />
                <a
                  href="https://www.google.com/maps/place/3%2F160+Hampstead+Rd,+Broadview+SA+5083,+Australia/@-34.8677665,138.6163769,17z/data=!3m1!4b1!4m5!3m4!1s0x6ab0c9c1d47ca60d:0xfbef3c20bfb60e4d!8m2!3d-34.8677709!4d138.6185656"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors leading-relaxed"
                >
                  Shop 3 160 Hampstead Road, Broadview SA 5083
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#087caa] shrink-0 mt-1" />
                <a
                  href="https://www.google.com/maps/place/22+Van+Dieren+Rd,+Pallara+QLD+4110,+Australia/@-27.6214257,152.9961542,17z/data=!3m1!4b1!4m5!3m4!1s0x6b914f4e5b806b53:0x48916af6a233486d!8m2!3d-27.6214305!4d152.9983429"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors leading-relaxed"
                >
                  22 Van Dieren Road, Pallara QLD 4110
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#087caa] shrink-0 mt-1" />
                <a
                  href="https://www.google.com/maps/place/440+Morley+Dr,+Morley+WA+6062,+Australia/@-31.8879096,115.8892131,17z/data=!3m1!4b1!4m5!3m4!1s0x2a32b066e52a9375:0x96ed07a188f83930!8m2!3d-31.8879142!4d115.8914018"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors leading-relaxed"
                >
                  440A Morley Drive, Morley WA 6062
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact us */}
          <div>
            <h4 className="text-xl font-heading font-medium text-white mb-2">
              Contact us
            </h4>
            <p className="text-xs text-gray-300 italic mb-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
            </p>
            <ul className="space-y-3 text-sm text-gray-200">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#087caa] shrink-0" />
                <a href="tel:0870769899" className="hover:text-white transition-colors">
                  08-7076-9899 (Adelaide)
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#087caa] shrink-0" />
                <a href="tel:0721029899" className="hover:text-white transition-colors">
                  07-2102-9899 (Brisbane)
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#087caa] shrink-0" />
                <a href="tel:0863735181" className="hover:text-white transition-colors">
                  08-6373-5181 (Perth)
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-[#087caa] shrink-0" />
                <a href="sms:0452508598" className="hover:text-white transition-colors">
                  Click here to SMS
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#087caa] shrink-0" />
                <a href="mailto:info@rcorpo.com" className="hover:text-white transition-colors">
                  info@rcorpo.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Row (#000000 pure black from WordPress Footer 641) */}
      <div className="bg-[#000000] text-gray-400 text-xs py-4 px-4 text-center">
        <div className="max-w-7xl mx-auto">
          <p>© 2019-22 Raikan Corporation.</p>
        </div>
      </div>
    </footer>
  );
}
