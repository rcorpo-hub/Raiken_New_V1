import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Clock, 
  MapPin, 
  Check, 
  CalendarCheck, 
  DollarSign, 
  Phone, 
  Mail, 
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import HeroSlider from '@/components/public/HeroSlider';
import ContactEnquiryForm from '@/components/public/ContactEnquiryForm';

export default function HomePage() {
  return (
    <div className="w-full font-sans bg-white">
      {/* 1. Hero Revolution Slider */}
      <HeroSlider />

      {/* 2. Our Services Section (WordPress Post 332) */}
      <section id="services" className="py-20 bg-[#fafafa] relative animate-line-view">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading text-[#2a2a2a] mb-2 tracking-wide">
              &bull; Our Services &bull;
            </h2>
            <div className="h-[2px] w-24 mx-auto bg-gradient-to-r from-[#01cffc] via-[#2d8dd6] to-[#b83bfa] my-3 relative flex items-center justify-center">
              <span className="w-2 h-2 rotate-45 bg-[#2d8dd6] absolute"></span>
            </div>
            <p className="text-sm text-[#888888] max-w-xl mx-auto italic">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Service 1: Taxation */}
            <div className="bg-white border border-[#e5e5e5] rounded-lg p-10 shadow-xs hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="relative w-24 h-24 mb-6">
                <Image
                  src="/images/tax.png"
                  alt="Taxation Services"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-2xl font-heading font-normal text-[#2a2a2a] mb-3">Taxation</h3>
              <p className="text-sm text-[#454545] mb-8 leading-relaxed">
                Tax Related Service - Individual, Business and SMSF
              </p>
              <div className="mt-auto">
                <Link
                  href="/#contact"
                  className="dt-sc-button inline-block px-7 py-3 text-xs tracking-wider text-white bg-[#087caa] hover:bg-[#065b7d] rounded transition-colors"
                >
                  Read More
                </Link>
              </div>
            </div>

            {/* Service 2: Conveyancing */}
            <div className="bg-white border border-[#e5e5e5] rounded-lg p-10 shadow-xs hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="relative w-24 h-24 mb-6">
                <Image
                  src="/images/loan.png"
                  alt="Conveyancing Services"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-2xl font-heading font-normal text-[#2a2a2a] mb-3">Conveyancing</h3>
              <p className="text-sm text-[#454545] mb-8 leading-relaxed">
                Licensed legal settlement and property transfer services across Australia.
              </p>
              <div className="mt-auto">
                <a
                  href="https://conveyancing.rcorpo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dt-sc-button inline-flex items-center gap-1.5 px-7 py-3 text-xs tracking-wider text-white bg-[#087caa] hover:bg-[#065b7d] rounded transition-colors"
                >
                  Read More <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHY US Section (WordPress Post 332: background #2d8dd6) */}
      <section className="py-16 bg-[#2d8dd6] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-heading font-normal text-white uppercase mb-2 tracking-wide">
              &bull; WHY US &bull;
            </h2>
            <div className="h-[2px] w-24 mx-auto bg-white/70 my-3 relative flex items-center justify-center">
              <span className="w-2 h-2 rotate-45 bg-white absolute"></span>
            </div>
            <p className="text-sm text-blue-100 max-w-xl mx-auto italic">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center sm:text-left">
            {/* Item 1 */}
            <div className="flex items-center gap-4 bg-white/10 p-5 rounded-lg backdrop-blur-xs">
              <Clock className="w-8 h-8 text-white shrink-0" />
              <span className="text-lg font-heading text-white">Open on weekends</span>
            </div>

            {/* Item 2 */}
            <div className="flex items-center gap-4 bg-white/10 p-5 rounded-lg backdrop-blur-xs">
              <Clock className="w-8 h-8 text-white shrink-0" />
              <span className="text-lg font-heading text-white">Open after hours</span>
            </div>

            {/* Item 3 */}
            <div className="flex items-center gap-4 bg-white/10 p-5 rounded-lg backdrop-blur-xs">
              <MapPin className="w-8 h-8 text-white shrink-0" />
              <span className="text-lg font-heading text-white">Multi City locations</span>
            </div>

            {/* Item 4 */}
            <div className="flex items-center gap-4 bg-white/10 p-5 rounded-lg backdrop-blur-xs">
              <Check className="w-8 h-8 text-white shrink-0" />
              <span className="text-lg font-heading text-white">Quality Service</span>
            </div>

            {/* Item 5 */}
            <div className="flex items-center gap-4 bg-white/10 p-5 rounded-lg backdrop-blur-xs">
              <CalendarCheck className="w-8 h-8 text-white shrink-0" />
              <span className="text-lg font-heading text-white">Quick response</span>
            </div>

            {/* Item 6 */}
            <div className="flex items-center gap-4 bg-white/10 p-5 rounded-lg backdrop-blur-xs">
              <DollarSign className="w-8 h-8 text-white shrink-0" />
              <span className="text-lg font-heading text-white">Fixed Fee Services</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Contact Us Section (WordPress Post 332: background #ededed with Frame-1-11.png) */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-heading text-[#2a2a2a] mb-2 tracking-wide">
              &bull; Contact us &bull;
            </h2>
            <div className="h-[2px] w-24 mx-auto bg-gradient-to-r from-[#01cffc] via-[#2d8dd6] to-[#b83bfa] my-3 relative flex items-center justify-center">
              <span className="w-2 h-2 rotate-45 bg-[#2d8dd6] absolute"></span>
            </div>
            <p className="text-sm text-[#888888] max-w-xl mx-auto italic">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
            </p>
          </div>

          <div className="bg-[#ededed] rounded-xl overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-3">
            {/* Left Contact Information Column with Frame-1-11.png */}
            <div 
              className="p-8 sm:p-12 relative flex flex-col justify-between rounded-xl"
              style={{
                backgroundImage: "url('/images/Frame-1-11.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div>
                <h4 className="text-xl font-heading font-medium text-[#2a2a2a] text-center mb-1">
                  Contact Information
                </h4>
                <h6 className="text-xs font-heading text-[#666666] text-center uppercase tracking-wider mb-8">
                  Click to reach us
                </h6>

                <div className="space-y-4">
                  {/* Broadview */}
                  <a
                    href="https://www.google.com/maps/place/3%2F160+Hampstead+Rd,+Broadview+SA+5083,+Australia/@-34.8677665,138.6163769,17z/data=!3m1!4b1!4m5!3m4!1s0x6ab0c9c1d47ca60d:0xfbef3c20bfb60e4d!8m2!3d-34.8677709!4d138.6185656"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white/90 hover:bg-white rounded-lg shadow-xs transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#087caa] text-white flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#2a2a2a] block">Broadview</span>
                      <span className="text-xs text-[#666666]">Shop 3 160 Hampstead Rd SA</span>
                    </div>
                  </a>

                  {/* Pallara */}
                  <a
                    href="https://www.google.com/maps/place/22+Van+Dieren+Rd,+Pallara+QLD+4110,+Australia/@-27.6214257,152.9961542,17z/data=!3m1!4b1!4m5!3m4!1s0x6b914f4e5b806b53:0x48916af6a233486d!8m2!3d-27.6214305!4d152.9983429"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white/90 hover:bg-white rounded-lg shadow-xs transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#087caa] text-white flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#2a2a2a] block">Pallara</span>
                      <span className="text-xs text-[#666666]">22 Van Dieren Rd QLD</span>
                    </div>
                  </a>

                  {/* Morley */}
                  <a
                    href="https://www.google.com/maps/place/440+Morley+Dr,+Morley+WA+6062,+Australia/@-31.8879096,115.8892131,17z/data=!3m1!4b1!4m5!3m4!1s0x2a32b066e52a9375:0x96ed07a188f83930!8m2!3d-31.8879142!4d115.8914018"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white/90 hover:bg-white rounded-lg shadow-xs transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#087caa] text-white flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#2a2a2a] block">Morley</span>
                      <span className="text-xs text-[#666666]">440A Morley Dr WA</span>
                    </div>
                  </a>
                </div>
              </div>

              {/* Row of 4 Icons */}
              <div className="pt-8">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <a
                    href="http://wa.me/61452508598"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="w-11 h-11 mx-auto rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </a>
                  <a
                    href="tel:0870769899"
                    aria-label="Call Us"
                    className="w-11 h-11 mx-auto rounded-full bg-[#087caa] text-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                  <a
                    href="mailto:r@rcorpo.com"
                    aria-label="Email Us"
                    className="w-11 h-11 mx-auto rounded-full bg-[#EA4335] text-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                  <a
                    href="sms:0452508598"
                    aria-label="SMS Us"
                    className="w-11 h-11 mx-auto rounded-full bg-[#34A853] text-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Form Column (Form 697) */}
            <div className="p-8 sm:p-12 lg:col-span-2 bg-[#ededed]">
              <h3 className="text-2xl font-heading font-medium text-[#2a2a2a] mb-6">
                Enquiry Form
              </h3>
              <ContactEnquiryForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
