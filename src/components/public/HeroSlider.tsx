'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronRightCircle } from 'lucide-react';

interface SlideData {
  id: number;
  bg: string;
  type: 'welcome' | 'bullets' | 'text-left' | 'text-right';
  subtitle?: string;
  title: string;
  titleColor?: string;
  description?: string;
  bullets?: string[];
  illustration?: string;
  hasScheduleBtn?: boolean;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    bg: '/images/TAX-BG-1.jpg',
    type: 'welcome',
    subtitle: 'Welcome To',
    title: 'Raikan Corporation',
    titleColor: '#000000',
    illustration: '/images/images.png',
    hasScheduleBtn: true,
  },
  {
    id: 2,
    bg: '/images/TAX-BG-2-1.jpg',
    type: 'bullets',
    subtitle: 'Raikan Corporation is a boutique accounting firm based in Adelaide Brisbane, Perth',
    title: 'Specialized Corporate Services',
    bullets: ['Business Structuring', 'Bookkeeping Services'],
    hasScheduleBtn: true,
  },
  {
    id: 3,
    bg: '/images/TAX-BG-2-1.jpg',
    type: 'bullets',
    subtitle: 'Raikan Corporation is a boutique accounting firm based in Adelaide Brisbane, Perth',
    title: 'Comprehensive Tax Advisory',
    bullets: ['Taxation Return Lodgement', 'Cloud based Accounting Solution'],
    hasScheduleBtn: true,
  },
  {
    id: 4,
    bg: '/images/TAX-BG-3.jpg',
    type: 'text-left',
    title: 'Virtual Meetings',
    titleColor: '#000000',
    description:
      'We offer virtual meetings for taxation services through zoom and other online platforms allowing you to finalise your tax affairs without leaving your home/office. We practice paperless office hence all documents are sent for signature electronically enabling you to sign over your phone or computer.',
    hasScheduleBtn: true,
  },
  {
    id: 5,
    bg: '/images/TAX-BG-4.jpg',
    type: 'text-right',
    title: 'Free Accounting Software',
    titleColor: '#ea2a2a',
    description:
      'We provide free cloud-based accounting software for our small medium business clients for basic needs. Software can be accessed through anywhere on desktop, laptop, tablet or even a phone allowing you to use from anywhere and any device.',
    hasScheduleBtn: true,
  },
  {
    id: 6,
    bg: '/images/TAX-BG-5.jpg',
    type: 'text-left',
    title: 'Conveyancing Services',
    titleColor: '#000000',
    description:
      'Buying or selling a house, we provide conveyancing services for residential property. We assist clients dealing with property with all the information and step by step process involved.',
    hasScheduleBtn: true,
  },
  {
    id: 7,
    bg: '/images/TAX-BG-6.jpg',
    type: 'text-left',
    title: 'Home Loans',
    titleColor: '#000000',
    description:
      'Whether you are a first-time buyer, or already have an existing home loan, it is always best to make sure you have the right home loan for your needs. We provide you with range of options to choose which not only meets but suits your need and circumstances.',
    hasScheduleBtn: true,
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] md:h-[560px] lg:h-[620px] overflow-hidden bg-[#23a1f2] select-none group">
      {SLIDES.map((slide, idx) => {
        const isActive = idx === current;

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Layer */}
            <div className="absolute inset-0">
              <Image
                src={slide.bg}
                alt={slide.title}
                fill
                sizes="100vw"
                priority={idx === 0}
                className="object-cover object-center"
              />
            </div>

            {/* Slide Content Layer */}
            <div className="relative z-10 max-w-7xl mx-auto h-full px-6 sm:px-12 md:px-16 flex items-center">
              {/* Type: Welcome (Slide 1 matching exact screenshot) */}
              {slide.type === 'welcome' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
                  <div className="lg:col-span-7 flex flex-col justify-center">
                    {slide.subtitle && (
                      <h2 
                        className={`text-2xl sm:text-4xl md:text-5xl font-heading font-medium text-white tracking-wide transition-all duration-700 delay-100 ${
                          isActive ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0'
                        }`}
                      >
                        {slide.subtitle}
                      </h2>
                    )}
                    <h1 
                      className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-black mt-1 sm:mt-2 leading-tight"
                    >
                      {isActive ? (
                        slide.title.split('').map((char, cIdx) => (
                          <span
                            key={cIdx}
                            className="animate-hero-char"
                            style={{
                              animationDelay: `${150 + cIdx * 35}ms`,
                              whiteSpace: char === ' ' ? 'pre' : 'normal',
                            }}
                          >
                            {char}
                          </span>
                        ))
                      ) : (
                        <span>{slide.title}</span>
                      )}
                    </h1>

                    {/* Dual Action Buttons */}
                    <div 
                      className={`flex flex-wrap items-center gap-3 sm:gap-4 mt-6 sm:mt-10 ${
                        isActive ? 'animate-hero-bounce' : 'opacity-0'
                      }`}
                      style={{ animationDelay: '650ms' }}
                    >
                      {/* Orange Book Appointment Button */}
                      <Link
                        href="/appointment"
                        className="inline-block hover:opacity-95 transition-transform hover:scale-105 active:scale-95 shadow-md rounded"
                      >
                        <Image
                          src="/images/schedule-appointment-button.png"
                          alt="Click here to Book Appointment"
                          width={190}
                          height={70}
                          className="h-11 sm:h-13 w-auto object-contain"
                          priority
                        />
                      </Link>

                      {/* Orange Contact Us Pill Button */}
                      <Link
                        href="/#contact"
                        className="inline-flex items-center gap-2 px-5 sm:px-6 h-11 sm:h-13 bg-[#f37021] hover:bg-[#e05f12] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-md sm:rounded-lg shadow-md transition-all hover:scale-105 active:scale-95"
                      >
                        <span>Contact Us</span>
                        <ChevronRightCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-[#f37021]" />
                      </Link>
                    </div>
                  </div>

                  {/* Right Illustration */}
                  {slide.illustration && (
                    <div 
                      className={`hidden lg:flex lg:col-span-5 justify-end items-center ${
                        isActive ? 'animate-hero-slide-right' : 'opacity-0'
                      }`}
                      style={{ animationDelay: '350ms' }}
                    >
                      <Image
                        src={slide.illustration}
                        alt="Tax & Advisory Illustration"
                        width={480}
                        height={360}
                        className="w-full max-w-[440px] h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                        priority
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Type: Bullets (Slide 2 & 3) */}
              {slide.type === 'bullets' && (
                <div className="max-w-3xl">
                  {slide.subtitle && (
                    <p 
                      className={`text-sm sm:text-xl md:text-2xl font-medium text-white max-w-2xl leading-relaxed mb-4 sm:mb-6 transition-all duration-700 delay-100 ${
                        isActive ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
                      }`}
                    >
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.bullets && (
                    <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                      {slide.bullets.map((bullet, bIdx) => (
                        <div
                          key={bullet}
                          className={`flex items-center gap-3 text-lg sm:text-3xl md:text-4xl font-heading font-bold text-black transition-all duration-700 ${
                            isActive ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
                          }`}
                          style={{ transitionDelay: `${200 + bIdx * 150}ms` }}
                        >
                          <span className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/90 text-black flex items-center justify-center text-sm shadow-sm">
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#087caa]" />
                          </span>
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link
                    href="/appointment"
                    className={`inline-block hover:opacity-95 transition-all duration-700 delay-400 ${
                      isActive ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                    }`}
                  >
                    <Image
                      src="/images/schedule-appointment-button.png"
                      alt="Click here to Book Appointment"
                      width={190}
                      height={70}
                      className="h-11 sm:h-13 w-auto object-contain"
                    />
                  </Link>
                </div>
              )}

              {/* Type: Text Left (Slide 4, 6, 7) */}
              {slide.type === 'text-left' && (
                <div className="max-w-2xl">
                  <h2 
                    className={`text-3xl sm:text-5xl md:text-6xl font-heading font-bold text-black mb-3 sm:mb-4 transition-all duration-700 delay-100 ${
                      isActive ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0'
                    }`}
                  >
                    {slide.title}
                  </h2>
                  <p 
                    className={`text-xs sm:text-base md:text-lg text-black font-semibold leading-relaxed mb-6 sm:mb-8 max-w-xl transition-all duration-700 delay-200 ${
                      isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}
                  >
                    {slide.description}
                  </p>
                  <Link
                    href="/appointment"
                    className={`inline-block hover:opacity-95 transition-all duration-700 delay-300 ${
                      isActive ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                    }`}
                  >
                    <Image
                      src="/images/schedule-appointment-button.png"
                      alt="Click here to Book Appointment"
                      width={190}
                      height={70}
                      className="h-11 sm:h-13 w-auto object-contain"
                    />
                  </Link>
                </div>
              )}

              {/* Type: Text Right (Slide 5) */}
              {slide.type === 'text-right' && (
                <div className="w-full flex justify-end">
                  <div className="max-w-2xl text-right">
                    <h2 
                      className={`text-3xl sm:text-5xl md:text-6xl font-heading font-bold text-[#ea2a2a] mb-3 sm:mb-4 transition-all duration-700 delay-100 ${
                        isActive ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0'
                      }`}
                    >
                      {slide.title}
                    </h2>
                    <p 
                      className={`text-xs sm:text-base md:text-lg text-black font-semibold leading-relaxed mb-6 sm:mb-8 max-w-xl ml-auto transition-all duration-700 delay-200 ${
                        isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                      }`}
                    >
                      {slide.description}
                    </p>
                    <div className="flex justify-end">
                      <Link
                        href="/appointment"
                        className={`inline-block hover:opacity-95 transition-all duration-700 delay-300 ${
                          isActive ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                        }`}
                      >
                        <Image
                          src="/images/schedule-appointment-button.png"
                          alt="Click here to Book Appointment"
                          width={190}
                          height={70}
                          className="h-11 sm:h-13 w-auto object-contain"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Prev Arrow */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 sm:w-12 h-16 sm:h-20 bg-black/20 hover:bg-black/50 text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer rounded-r"
      >
        <ChevronLeft className="w-7 h-7 sm:w-9 sm:h-9" />
      </button>

      {/* Next Arrow */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 sm:w-12 h-16 sm:h-20 bg-black/20 hover:bg-black/50 text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer rounded-l"
      >
        <ChevronRight className="w-7 h-7 sm:w-9 sm:h-9" />
      </button>

      {/* Navigation Bullets */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all rounded-full cursor-pointer ${
              idx === current 
                ? 'w-7 sm:w-8 h-2 sm:h-2.5 bg-white shadow' 
                : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
