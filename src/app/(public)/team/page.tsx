import React from 'react';
import Image from 'next/image';
import { Phone, MessageSquare, PhoneCall, MessageCircle } from 'lucide-react';

const TEAM_MEMBERS = [
  { name: 'Jagdishbhai Patel', role: 'CHARTERED ACCOUNTANT' },
  { name: 'Halak Patel', role: 'ADMIN' },
  { name: 'Aashka Shah', role: 'ADMIN' },
  { name: 'Kashvi Gurnani', role: 'ADMIN' },
  { name: 'Prachi Naik', role: 'ADMIN' },
  { name: 'Khushbu Gangwani', role: 'ADMIN' },
  { name: 'VARSHA NAYAK', role: 'CLIENT LIAISON OFFICER' },
];

export default function TeamPage() {
  return (
    <div className="w-full font-sans bg-white">
      {/* 1. Header Banner (WordPress Post 8644: Frame-2-3.png background, 70px heading) */}
      <section 
        className="relative w-full py-28 sm:py-44 bg-cover bg-center text-center overflow-hidden"
        style={{ backgroundImage: `url('/images/Frame-2-3.png')` }}
      >
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <h1 className="text-4xl sm:text-7xl font-heading font-bold text-white tracking-tight">
            Meet Our Team
          </h1>
        </div>
      </section>

      {/* 2. Executive Leadership Card (WordPress Post 8644: background #eaf9fd, border-radius 15px) */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#eaf9fd] rounded-[15px] p-8 sm:p-12 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex justify-center">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80">
              <Image
                src="/images/Frame-15-1.png"
                alt="Bhavesh Chaudhari"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="space-y-6 text-center md:text-left">
            <div>
              <h2 className="text-3xl font-heading font-bold text-[#2a2a2a]">
                Bhavesh Chaudhari
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#454545]">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <PhoneCall className="w-4 h-4 text-[#10cffc]" />
                <a href="tel:0870769899" className="font-semibold hover:text-[#087caa] transition-colors">
                  08 7076 9899
                </a>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="w-4 h-4 text-[#10cffc]" />
                <a href="tel:0452508598" className="font-semibold hover:text-[#087caa] transition-colors">
                  0452 508 598
                </a>
              </div>
            </div>

            {/* Quick Action Icons */}
            <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
              <a
                href="tel:0452508598"
                aria-label="Direct Phone Call"
                className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#10cffc] hover:bg-[#10cffc] hover:text-white transition-colors"
              >
                <Phone className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/61452508598"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#10cffc] hover:bg-[#10cffc] hover:text-white transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="sms:0452508598"
                aria-label="SMS Text"
                className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#10cffc] hover:bg-[#10cffc] hover:text-white transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Team Member Cards (WordPress Post 8644: background #f6f6f6, 50px heading) */}
      <section className="py-16 bg-[#f6f6f6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-heading font-bold text-[#2a2a2a] mb-3">
              Our Team
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {TEAM_MEMBERS.map((member, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-xl overflow-hidden shadow-xs border border-gray-200 text-center flex flex-col items-center p-6 hover:shadow-md transition-shadow"
              >
                <div className="relative w-36 h-36 rounded-full overflow-hidden mb-6 bg-cyan-50">
                  <Image
                    src="/images/team1.png"
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-lg font-heading font-bold text-[#2a2a2a] mb-1">
                  {member.name}
                </h3>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#087caa]">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
