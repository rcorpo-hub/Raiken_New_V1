import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return <footer className="site-footer"><div className="footer-top"><Link href="/" className="wordmark" aria-label="Raikan Corporation home"><Image src="/images/redesign/logo-warm.png" alt="Raikan Corporation" width={1871} height={840} sizes="(max-width: 640px) 115px, 145px" /></Link><nav className="office-links" aria-label="Our offices"><Link href="/contact-us#adelaide">Adelaide</Link><span aria-hidden="true">|</span><Link href="/contact-us#brisbane">Brisbane</Link><span aria-hidden="true">|</span><Link href="/contact-us#perth">Perth</Link></nav><Link href="/forms" className="client-link">Existing clients</Link></div><div className="footer-utility"><span>© {new Date().getFullYear()} Raikan Corporation</span><nav aria-label="Useful links"><a href="https://accounts.rcorpo.com/login" target="_blank" rel="noopener noreferrer">Accounting software</a><Link href="/appointment">Appointments</Link><Link href="/support">Support</Link><Link href="/blog">Insights</Link></nav></div></footer>;
}
