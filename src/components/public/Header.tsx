'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(null);
  const [mobileAccordions, setMobileAccordions] = useState<{
    services: boolean;
    forms: boolean;
    formsIndividual: boolean;
    formsCompany: boolean;
    formsTrust: boolean;
    formsConveyancing: boolean;
    virtual: boolean;
    information: boolean;
  }>({
    services: false,
    forms: false,
    formsIndividual: false,
    formsCompany: false,
    formsTrust: false,
    formsConveyancing: false,
    virtual: false,
    information: false,
  });

  const toggleAccordion = (section: keyof typeof mobileAccordions) => {
    setMobileAccordions((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdown(null);
      setActiveSubDropdown(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <header className="w-full bg-white sticky top-0 z-50 shadow-xs font-sans">
      {/* Brand & Contact Row (WordPress Header 638) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative w-48 sm:w-56 h-12 sm:h-14">
              <Image 
                src="/images/logo.png" 
                alt="Raikan Corporation Logo" 
                fill
                sizes="(max-width: 768px) 192px, 224px"
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Contact Details (Desktop Header 638 with exact icon images) */}
          <div className="hidden lg:flex items-center gap-10">
            {/* Call us */}
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 shrink-0">
                <Image 
                  src="/images/icon14.png" 
                  alt="Call Us" 
                  fill 
                  className="object-contain" 
                />
              </div>
              <div className="text-left leading-tight">
                <span className="text-[11px] text-[#888888] uppercase tracking-wider block font-semibold mb-0.5">
                  Call us
                </span>
                <a 
                  href="tel:0870769899" 
                  className="text-sm font-bold text-[#2a2a2a] hover:text-[#087caa] transition-colors"
                >
                  08 7076 9899
                </a>
              </div>
            </div>

            {/* Mail Us */}
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 shrink-0">
                <Image 
                  src="/images/icon15.png" 
                  alt="Mail Us" 
                  fill 
                  className="object-contain" 
                />
              </div>
              <div className="text-left leading-tight">
                <span className="text-[11px] text-[#888888] uppercase tracking-wider block font-semibold mb-0.5">
                  Mail Us
                </span>
                <a 
                  href="mailto:info@rcorpo.com" 
                  className="text-sm font-bold text-[#2a2a2a] hover:text-[#087caa] transition-colors"
                >
                  info@rcorpo.com
                </a>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 shrink-0">
                <Image 
                  src="/images/icon16.png" 
                  alt="Location" 
                  fill 
                  className="object-contain" 
                />
              </div>
              <div className="text-left leading-tight">
                <span className="text-[11px] text-[#888888] uppercase tracking-wider block font-semibold mb-0.5">
                  Location
                </span>
                <span className="text-sm font-bold text-[#2a2a2a]">
                  Adelaide | Brisbane | Perth
                </span>
              </div>
            </div>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#2a2a2a] hover:text-[#087caa] hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Menu Bar (Gradient matching live site & video recording) */}
      <div className="w-full bg-gradient-to-r from-[#01cffc] via-[#2d8dd6] to-[#b83bfa] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <nav className="hidden lg:flex items-center space-x-1 text-[14px] font-medium text-white">
            <Link 
              href="/" 
              className={`relative px-3.5 py-3 text-[14px] font-medium transition-colors ${
                pathname === '/' 
                  ? 'text-white font-bold after:content-[""] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:border-solid after:border-b-[6px] after:border-b-white after:border-x-[6px] after:border-x-transparent after:border-t-0' 
                  : 'text-white/95 hover:text-white hover:bg-white/10 rounded-sm'
              }`}
            >
              Home
            </Link>

            {/* Services Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('services')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                className={`flex items-center px-3.5 py-3 text-[14px] font-medium transition-colors ${
                  pathname?.startsWith('/services')
                    ? 'text-white font-bold after:content-[""] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:border-solid after:border-b-[6px] after:border-b-white after:border-x-[6px] after:border-x-transparent after:border-t-0'
                    : 'text-white/95 hover:text-white hover:bg-white/10 rounded-sm'
                }`}
              >
                <span>Services</span>
              </button>

              {activeDropdown === 'services' && (
                <div className="absolute left-0 top-full w-56 bg-white border border-gray-100 shadow-xl rounded-md py-2 z-50 animate-in fade-in duration-150">
                  <Link 
                    href="/#services" 
                    className="block px-4 py-2.5 text-sm text-[#333333] hover:bg-[#087caa] hover:text-white transition-colors"
                  >
                    Taxation
                  </Link>
                  <a 
                    href="https://conveyancing.rcorpo.com/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-between px-4 py-2.5 text-sm text-[#333333] hover:bg-[#087caa] hover:text-white transition-colors"
                  >
                    <span>Conveyancing Service</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <Link 
              href="/team" 
              className={`relative px-3.5 py-3 text-[14px] font-medium transition-colors ${
                pathname === '/team' 
                  ? 'text-white font-bold after:content-[""] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:border-solid after:border-b-[6px] after:border-b-white after:border-x-[6px] after:border-x-transparent after:border-t-0' 
                  : 'text-white/95 hover:text-white hover:bg-white/10 rounded-sm'
              }`}
            >
              Our Team
            </Link>

            {/* Forms Multi-Tier Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('forms')}
              onMouseLeave={() => {
                setActiveDropdown(null);
                setActiveSubDropdown(null);
              }}
            >
              <button
                type="button"
                className={`flex items-center px-3.5 py-3 text-[14px] font-medium transition-colors ${
                  pathname?.startsWith('/nc') || pathname?.includes('form')
                    ? 'text-white font-bold after:content-[""] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:border-solid after:border-b-[6px] after:border-b-white after:border-x-[6px] after:border-x-transparent after:border-t-0'
                    : 'text-white/95 hover:text-white hover:bg-white/10 rounded-sm'
                }`}
              >
                <span>Forms</span>
              </button>

              {activeDropdown === 'forms' && (
                <div className="absolute left-0 top-full w-64 bg-white border border-gray-100 shadow-xl rounded-md py-2 z-50 animate-in fade-in duration-150">
                  {/* Individual Submenu */}
                  <div 
                    className="relative group/sub"
                    onMouseEnter={() => setActiveSubDropdown('individual')}
                    onMouseLeave={() => setActiveSubDropdown(null)}
                  >
                    <div className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-[#333333] hover:bg-[#087caa] hover:text-white transition-colors cursor-pointer">
                      <span>Individual</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>

                    {activeSubDropdown === 'individual' && (
                      <div className="absolute left-full top-0 w-72 bg-white border border-gray-100 shadow-xl rounded-md py-2 z-50">
                        <Link href="/new-individual-client-form" className="block px-4 py-2 text-xs text-[#454545] hover:bg-[#087caa] hover:text-white transition-colors">
                          New Individual Client Form
                        </Link>
                        <Link href="/new-individual-tax-file-number-application" className="block px-4 py-2 text-xs text-[#454545] hover:bg-[#087caa] hover:text-white transition-colors">
                          New Individual Tax File Number Application
                        </Link>
                        <Link href="/new-individual-abn-application" className="block px-4 py-2 text-xs text-[#454545] hover:bg-[#087caa] hover:text-white transition-colors">
                          New Individual ABN Application
                        </Link>
                        <Link href="/new-client-questionnaire-form" className="block px-4 py-2 text-xs text-[#454545] hover:bg-[#087caa] hover:text-white transition-colors">
                          New Client Questionnaire Form
                        </Link>
                        <Link href="/rideshare-taxi-gst" className="block px-4 py-2 text-xs text-[#454545] hover:bg-[#087caa] hover:text-white transition-colors">
                          Rideshare / Taxi GST
                        </Link>
                        <Link href="/rental-property-summary" className="block px-4 py-2 text-xs text-[#454545] hover:bg-[#087caa] hover:text-white transition-colors">
                          Rental Property Summary
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Company Submenu */}
                  <div 
                    className="relative group/sub"
                    onMouseEnter={() => setActiveSubDropdown('company')}
                    onMouseLeave={() => setActiveSubDropdown(null)}
                  >
                    <div className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-[#333333] hover:bg-[#087caa] hover:text-white transition-colors cursor-pointer">
                      <span>Company</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>

                    {activeSubDropdown === 'company' && (
                      <div className="absolute left-full top-0 w-64 bg-white border border-gray-100 shadow-xl rounded-md py-2 z-50">
                        <Link href="/new-company-registration" className="block px-4 py-2 text-xs text-[#454545] hover:bg-[#087caa] hover:text-white transition-colors">
                          New Company Registration
                        </Link>
                        <Link href="/new-company-client-form" className="block px-4 py-2 text-xs text-[#454545] hover:bg-[#087caa] hover:text-white transition-colors">
                          New Company Client Form
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Trust Submenu */}
                  <div 
                    className="relative group/sub"
                    onMouseEnter={() => setActiveSubDropdown('trust')}
                    onMouseLeave={() => setActiveSubDropdown(null)}
                  >
                    <div className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-[#333333] hover:bg-[#087caa] hover:text-white transition-colors cursor-pointer">
                      <span>Trust</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>

                    {activeSubDropdown === 'trust' && (
                      <div className="absolute left-full top-0 w-64 bg-white border border-gray-100 shadow-xl rounded-md py-2 z-50">
                        <Link href="/new-trust-registration" className="block px-4 py-2 text-xs text-[#454545] hover:bg-[#087caa] hover:text-white transition-colors">
                          New Trust Registration
                        </Link>
                        <Link href="/new-trust-client-form" className="block px-4 py-2 text-xs text-[#454545] hover:bg-[#087caa] hover:text-white transition-colors">
                          New Trust Client Form
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Conveyancing Form Submenu */}
                  <div 
                    className="relative group/sub"
                    onMouseEnter={() => setActiveSubDropdown('conveyancing')}
                    onMouseLeave={() => setActiveSubDropdown(null)}
                  >
                    <div className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-[#333333] hover:bg-[#087caa] hover:text-white transition-colors cursor-pointer">
                      <span>Conveyancing Form</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>

                    {activeSubDropdown === 'conveyancing' && (
                      <div className="absolute left-full top-0 w-64 bg-white border border-gray-100 shadow-xl rounded-md py-2 z-50">
                        <Link href="/nc" className="block px-4 py-2 text-xs text-[#454545] hover:bg-[#087caa] hover:text-white transition-colors">
                          New Client Conveyancing Form
                        </Link>
                        <Link href="/nc/i-am-purchaser" className="block px-4 py-2 text-xs text-[#454545] hover:bg-[#087caa] hover:text-white transition-colors">
                          I am Purchaser (Form 5116)
                        </Link>
                        <Link href="/nc/i-am-vendor" className="block px-4 py-2 text-xs text-[#454545] hover:bg-[#087caa] hover:text-white transition-colors">
                          I am Vendor (Form 5121)
                        </Link>
                        <Link href="/quote-calculator" className="block px-4 py-2 text-xs text-[#454545] hover:bg-[#087caa] hover:text-white transition-colors">
                          Quote Calculator
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Software Link */}
            <a 
              href="https://accounts.rcorpo.com/login" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3.5 py-3 text-[14px] font-medium text-white/95 hover:text-white hover:bg-white/10 rounded-sm transition-colors"
            >
              Software
            </a>

            {/* Virtual Meeting Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('virtual')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                className="flex items-center px-3.5 py-3 text-[14px] font-medium text-white/95 hover:text-white hover:bg-white/10 rounded-sm transition-colors"
              >
                <span>Virtual Meeting</span>
              </button>

              {activeDropdown === 'virtual' && (
                <div className="absolute left-0 top-full w-56 bg-white border border-gray-100 shadow-xl rounded-md py-2 z-50 animate-in fade-in duration-150">
                  <a href="https://us04web.zoom.us/j/3138391200?pwd=TFFCWWxuWmZTa0lGSXBzb3JaUXpkQT09" target="_blank" rel="noopener noreferrer" className="block px-4 py-2.5 text-sm text-[#333333] hover:bg-[#087caa] hover:text-white transition-colors">
                    Zoom Meeting
                  </a>
                  <a href="https://meet.google.com/" target="_blank" rel="noopener noreferrer" className="block px-4 py-2.5 text-sm text-[#333333] hover:bg-[#087caa] hover:text-white transition-colors">
                    Google Meet
                  </a>
                  <a href="https://join.skype.com/w0bU5GYYWBI3" target="_blank" rel="noopener noreferrer" className="block px-4 py-2.5 text-sm text-[#333333] hover:bg-[#087caa] hover:text-white transition-colors">
                    Skype
                  </a>
                  <a href="https://meetingsapac31.webex.com/meet/pr1562356390" target="_blank" rel="noopener noreferrer" className="block px-4 py-2.5 text-sm text-[#333333] hover:bg-[#087caa] hover:text-white transition-colors">
                    Cisco Webex
                  </a>
                  <a href="https://dl2.ultraviewer.net/UltraViewer_setup_6.2_en.exe" target="_blank" rel="noopener noreferrer" className="block px-4 py-2.5 text-sm text-[#333333] hover:bg-[#087caa] hover:text-white transition-colors">
                    Ultraviewer
                  </a>
                </div>
              )}
            </div>

            {/* Information Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('information')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                className={`flex items-center px-3.5 py-3 text-[14px] font-medium transition-colors ${
                  pathname?.startsWith('/blog') 
                    ? 'text-white font-bold after:content-[""] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:border-solid after:border-b-[6px] after:border-b-white after:border-x-[6px] after:border-x-transparent after:border-t-0' 
                    : 'text-white/95 hover:text-white hover:bg-white/10 rounded-sm'
                }`}
              >
                <span>Information</span>
              </button>

              {activeDropdown === 'information' && (
                <div className="absolute left-0 top-full w-52 bg-white border border-gray-100 shadow-xl rounded-md py-2 z-50 animate-in fade-in duration-150">
                  <Link 
                    href="/blog" 
                    className="block px-4 py-2.5 text-sm text-[#333333] hover:bg-[#087caa] hover:text-white transition-colors"
                  >
                    Tax Related
                  </Link>
                  <a 
                    href="https://conveyancing.rcorpo.com/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-between px-4 py-2.5 text-sm text-[#333333] hover:bg-[#087caa] hover:text-white transition-colors"
                  >
                    <span>Conveyancing</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <Link 
              href="/#contact" 
              className={`relative px-3.5 py-3 text-[14px] font-medium transition-colors ${
                pathname === '/contact-us' 
                  ? 'text-white font-bold after:content-[""] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:border-solid after:border-b-[6px] after:border-b-white after:border-x-[6px] after:border-x-transparent after:border-t-0' 
                  : 'text-white/95 hover:text-white hover:bg-white/10 rounded-sm'
              }`}
            >
              Contact Us
            </Link>
          </nav>

          {/* Right Action: Appointment Link (White text with chevron matching live site) */}
          <div className="hidden lg:block">
            <Link
              href="/appointment"
              className="text-[14px] font-medium text-white hover:text-white/80 flex items-center gap-1 py-3 px-2 transition-colors group"
            >
              <span>Appointment</span>
              <span className="text-white font-bold group-hover:translate-x-0.5 transition-transform">&gt;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-8 space-y-1 max-h-[85vh] overflow-y-auto">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-[#2a2a2a] hover:bg-gray-50 rounded"
          >
            Home
          </Link>

          {/* Services Accordion */}
          <div>
            <button
              type="button"
              onClick={() => toggleAccordion('services')}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-[#2a2a2a] hover:bg-gray-50 rounded text-left"
            >
              <span>Services</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileAccordions.services ? 'rotate-180' : ''}`} />
            </button>
            {mobileAccordions.services && (
              <div className="pl-4 pr-2 py-1 space-y-1 bg-gray-50 rounded-lg my-1">
                <Link href="/#services" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-xs text-[#454545] hover:text-[#087caa]">
                  Taxation
                </Link>
                <a href="https://conveyancing.rcorpo.com/" target="_blank" rel="noopener noreferrer" className="block px-3 py-1.5 text-xs text-[#454545] hover:text-[#087caa]">
                  Conveyancing Service ↗
                </a>
              </div>
            )}
          </div>

          <Link
            href="/team"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-[#2a2a2a] hover:bg-gray-50 rounded"
          >
            Our Team
          </Link>

          {/* Forms Accordion */}
          <div>
            <button
              type="button"
              onClick={() => toggleAccordion('forms')}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-[#2a2a2a] hover:bg-gray-50 rounded text-left"
            >
              <span>Forms</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileAccordions.forms ? 'rotate-180' : ''}`} />
            </button>
            {mobileAccordions.forms && (
              <div className="pl-4 pr-2 py-1 space-y-1 bg-gray-50 rounded-lg my-1">
                {/* Individual */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleAccordion('formsIndividual')}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-[#2a2a2a] text-left"
                  >
                    <span>Individual</span>
                    <ChevronDown className={`w-3.5 h-3.5 ${mobileAccordions.formsIndividual ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileAccordions.formsIndividual && (
                    <div className="pl-4 space-y-1 py-1">
                      <Link href="/new-individual-client-form" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-xs text-gray-600">
                        • New Individual Client Form
                      </Link>
                      <Link href="/new-individual-tax-file-number-application" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-xs text-gray-600">
                        • New Tax File Number Application
                      </Link>
                      <Link href="/new-individual-abn-application" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-xs text-gray-600">
                        • New Individual ABN Application
                      </Link>
                      <Link href="/new-client-questionnaire-form" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-xs text-gray-600">
                        • New Client Questionnaire Form
                      </Link>
                      <Link href="/rideshare-taxi-gst" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-xs text-gray-600">
                        • Rideshare / Taxi GST
                      </Link>
                      <Link href="/rental-property-summary" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-xs text-gray-600">
                        • Rental Property Summary
                      </Link>
                    </div>
                  )}
                </div>

                {/* Company */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleAccordion('formsCompany')}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-[#2a2a2a] text-left"
                  >
                    <span>Company</span>
                    <ChevronDown className={`w-3.5 h-3.5 ${mobileAccordions.formsCompany ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileAccordions.formsCompany && (
                    <div className="pl-4 space-y-1 py-1">
                      <Link href="/new-company-registration" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-xs text-gray-600">
                        • New Company Registration
                      </Link>
                      <Link href="/new-company-client-form" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-xs text-gray-600">
                        • New Company Client Form
                      </Link>
                    </div>
                  )}
                </div>

                {/* Trust */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleAccordion('formsTrust')}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-[#2a2a2a] text-left"
                  >
                    <span>Trust</span>
                    <ChevronDown className={`w-3.5 h-3.5 ${mobileAccordions.formsTrust ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileAccordions.formsTrust && (
                    <div className="pl-4 space-y-1 py-1">
                      <Link href="/new-trust-registration" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-xs text-gray-600">
                        • New Trust Registration
                      </Link>
                      <Link href="/new-trust-client-form" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-xs text-gray-600">
                        • New Trust Client Form
                      </Link>
                    </div>
                  )}
                </div>

                {/* Conveyancing */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleAccordion('formsConveyancing')}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-[#2a2a2a] text-left"
                  >
                    <span>Conveyancing Form</span>
                    <ChevronDown className={`w-3.5 h-3.5 ${mobileAccordions.formsConveyancing ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileAccordions.formsConveyancing && (
                    <div className="pl-4 space-y-1 py-1">
                      <Link href="/nc" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-xs text-gray-600">
                        • New Client Conveyancing Form
                      </Link>
                      <Link href="/nc/i-am-purchaser" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-xs text-gray-600">
                        • I am Purchaser (Form 5116)
                      </Link>
                      <Link href="/nc/i-am-vendor" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-xs text-gray-600">
                        • I am Vendor (Form 5121)
                      </Link>
                      <Link href="/quote-calculator" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1 text-xs text-gray-600">
                        • Quote Calculator
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <a
            href="https://accounts.rcorpo.com/login"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2 text-sm font-semibold text-[#2a2a2a] hover:bg-gray-50 rounded"
          >
            Software ↗
          </a>

          {/* Virtual Meeting Accordion */}
          <div>
            <button
              type="button"
              onClick={() => toggleAccordion('virtual')}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-[#2a2a2a] hover:bg-gray-50 rounded text-left"
            >
              <span>Virtual Meeting</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileAccordions.virtual ? 'rotate-180' : ''}`} />
            </button>
            {mobileAccordions.virtual && (
              <div className="pl-4 pr-2 py-1 space-y-1 bg-gray-50 rounded-lg my-1">
                <a href="https://us04web.zoom.us/j/3138391200?pwd=TFFCWWxuWmZTa0lGSXBzb3JaUXpkQT09" target="_blank" rel="noopener noreferrer" className="block px-3 py-1.5 text-xs text-[#454545]">Zoom Meeting</a>
                <a href="https://meet.google.com/" target="_blank" rel="noopener noreferrer" className="block px-3 py-1.5 text-xs text-[#454545]">Google Meet</a>
                <a href="https://join.skype.com/w0bU5GYYWBI3" target="_blank" rel="noopener noreferrer" className="block px-3 py-1.5 text-xs text-[#454545]">Skype</a>
                <a href="https://meetingsapac31.webex.com/meet/pr1562356390" target="_blank" rel="noopener noreferrer" className="block px-3 py-1.5 text-xs text-[#454545]">Cisco Webex</a>
                <a href="https://dl2.ultraviewer.net/UltraViewer_setup_6.2_en.exe" target="_blank" rel="noopener noreferrer" className="block px-3 py-1.5 text-xs text-[#454545]">Ultraviewer</a>
              </div>
            )}
          </div>

          {/* Information Accordion */}
          <div>
            <button
              type="button"
              onClick={() => toggleAccordion('information')}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-[#2a2a2a] hover:bg-gray-50 rounded text-left"
            >
              <span>Information</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileAccordions.information ? 'rotate-180' : ''}`} />
            </button>
            {mobileAccordions.information && (
              <div className="pl-4 pr-2 py-1 space-y-1 bg-gray-50 rounded-lg my-1">
                <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 text-xs text-[#454545] hover:text-[#087caa]">
                  Tax Related
                </Link>
                <a href="https://conveyancing.rcorpo.com/" target="_blank" rel="noopener noreferrer" className="block px-3 py-1.5 text-xs text-[#454545] hover:text-[#087caa]">
                  Conveyancing
                </a>
              </div>
            )}
          </div>

          <Link
            href="/#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-[#2a2a2a] hover:bg-gray-50 rounded"
          >
            Contact Us
          </Link>

          <div className="pt-4 px-3">
            <Link
              href="/appointment"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center px-4 py-3 text-sm font-bold uppercase tracking-wider text-white bg-[#087caa] rounded shadow-xs"
            >
              Appointment
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
