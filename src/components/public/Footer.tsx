import { getSiteContent, getPublicOffices } from '@/lib/workspace/public-content';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

const footerGroups = [
  {
    title: 'Our services',
    links: [
      { label: 'Personal tax', href: '/forms?service=personal-tax' },
      { label: 'Business accounting', href: '/forms?service=business-accounting' },
      { label: 'Conveyancing', href: '/forms?service=conveyancing' },
    ],
  },
  {
    title: 'Raikan Corporation',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Our people', href: '/team' },
      { label: 'Insights', href: '/blog' },
      { label: 'Contact us', href: '/contact-us' },
      { label: 'Book an appointment', href: '/appointment' },
    ],
  },
];

export default async function Footer() {
 const [content, contact, offices]=await Promise.all([getSiteContent('footer'),getSiteContent('contact'),getPublicOffices()]);
  return (
    <footer className="site-footer footer-expanded" aria-label="Website footer">
      <div className="footer-content">
        <div className="footer-main-grid">
          <div className="footer-brand">
            <Link href="/" className="wordmark" aria-label="Raikan Corporation home">
              <Image src="/images/redesign/logo-warm.png" alt="Raikan Corporation" width={1871} height={840} sizes="(max-width: 640px) 160px, 200px" />
            </Link>
            <p className="footer-brand-description">{content.description}</p>
            <a className="footer-contact-link" href={`mailto:${contact.email}`}><Mail size={18} aria-hidden="true" />{contact.email}</a>
            <a className="footer-contact-link" href="https://wa.me/61452508598" target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" />Chat on WhatsApp<ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
          </div>

          {footerGroups.map(group => (
            <nav className="footer-nav-group" aria-label={group.title} key={group.title}>
              <h2>{group.title}</h2>
              <ul>{group.links.map(link => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}</ul>
            </nav>
          ))}

          <nav className="footer-nav-group footer-client-resources" aria-label="Client resources">
            <h2>Client resources</h2>
            <ul>
              <li><Link href="/forms">All client forms</Link></li>
              <li><a href="https://accounts.rcorpo.com/login" target="_blank" rel="noopener noreferrer">Accounting software<ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></li>
              <li><Link href="/appointment-booking-form">Book a consultation</Link></li>
              <li><Link href="/contact-us">Client support</Link></li>
            </ul>
          </nav>

        <section className="footer-offices" aria-labelledby="footer-offices-title">
          <h2 id="footer-offices-title">Our offices</h2>
          <div className="footer-offices-grid">
            {offices.map(office => (
              <section className="footer-office" aria-labelledby={`footer-${office.id}`} key={office.id}>
                <h3 id={`footer-${office.id}`}><Link href={`/contact-us#${office.id}`}>{office.city}<ArrowUpRight size={19} aria-hidden="true" /></Link></h3>
                <address>
                  <a className="footer-address" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.address)}`} target="_blank" rel="noopener noreferrer"><MapPin size={18} aria-hidden="true" /><span>{office.address}<span className="sr-only"> (opens in Google Maps in a new tab)</span></span></a>
                  <a className="footer-office-phone" href={`tel:${office.tel}`}><Phone size={17} aria-hidden="true" />{office.phone}</a>
                </address>
              </section>
            ))}
          </div>
        </section>
        </div>

        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} Raikan Corporation. All rights reserved.</p>
          <div><a href="/sitemap.xml">Sitemap</a><a href="#main-content">Back to top<ArrowUpRight size={16} aria-hidden="true" /></a></div>
        </div>
      </div>
    </footer>
  );
}
