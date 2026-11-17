'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, X } from 'lucide-react';

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  function close() { setOpen(false); }
  return (
    <header className="site-header" onKeyDown={event => { if (event.key === 'Escape') { close(); event.currentTarget.querySelector<HTMLButtonElement>('.menu-toggle')?.focus(); } }}>
      <div className="header-inner">
        <Link href="/" className="wordmark" aria-label="Raikan Corporation home" onClick={close}><Image src="/images/redesign/logo-warm.png" alt="Raikan Corporation" width={1871} height={840} sizes="(max-width: 640px) 128px, (min-width: 1100px) 12vw, 180px" priority /></Link>
        <nav aria-label="Main navigation" className="desktop-navigation">
          <Link href="/#services">Services</Link>
          <Link href="/team" aria-current={pathname === '/team' ? 'page' : undefined}>Our people</Link>
          <Link href="/contact-us" aria-current={pathname === '/contact-us' ? 'page' : undefined}>Contact</Link>
        </nav>
        <div className="header-actions"><Link href="/forms" className="client-link" aria-current={pathname === '/forms' ? 'page' : undefined}>Existing clients</Link><span className="nav-divider" aria-hidden="true" /><Link href="/contact-us" className="button button-orange">Make an enquiry <ArrowUpRight size={20} aria-hidden="true" /></Link></div>
        <button className="menu-toggle" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
      </div>
      {open && <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation"><Link href="/#services" onClick={close}>Services</Link><Link href="/team" onClick={close}>Our people</Link><Link href="/contact-us" onClick={close}>Contact</Link><Link href="/forms" onClick={close}>Existing clients & forms</Link><a href="https://accounts.rcorpo.com/login" target="_blank" rel="noopener noreferrer">Accounting software <ArrowUpRight size={18} aria-hidden="true" /></a><Link href="/appointment" onClick={close}>Book a conversation</Link><Link href="/contact-us" onClick={close} className="button button-orange">Make an enquiry <ArrowUpRight size={20} aria-hidden="true" /></Link></nav>}
    </header>
  );
}
