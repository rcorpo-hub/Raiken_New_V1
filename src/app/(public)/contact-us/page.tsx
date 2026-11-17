import PaperPageIntro from '@/components/public/PaperPageIntro';
import Link from 'next/link';
import { ArrowUpRight, Phone, Mail } from 'lucide-react';
import ContactEnquiryForm from '@/components/public/ContactEnquiryForm';

const offices = [
  { id: 'adelaide', city: 'Adelaide', address: 'Shop 3, 160 Hampstead Road, Broadview SA 5083', phone: '08 7076 9899', tel: '0870769899' },
  { id: 'brisbane', city: 'Brisbane', address: '22 Van Dieren Road, Pallara QLD 4110', phone: '07 2102 9899', tel: '0721029899' },
  { id: 'perth', city: 'Perth', address: '440A Morley Drive, Morley WA 6062', phone: '08 6373 5181', tel: '0863735181' },
];

export default function ContactUsPage() {
  return <div className="new-page editorial-page"><PaperPageIntro eyebrow="LET’S TALK" title="A simple next step." art="contact">Tell us what you need help with.<br />We’ll help you find the right person.</PaperPageIntro><div className="contact-grid"><section className="enquiry-paper"><h2>Make an enquiry</h2><p>Tax, business or property — we’re here to help.</p><ContactEnquiryForm /></section><aside className="contact-aside"><p className="eyebrow">CLOSER THAN YOU THINK</p><h2>Three cities.<br />One helpful team.</h2>{offices.map(office => <section className="office-block" id={office.id} key={office.id}><h3>{office.city}</h3><p>{office.address}</p><a href={`tel:${office.tel}`}><Phone size={16} aria-hidden="true" />{office.phone}</a></section>)}<a className="contact-email" href="mailto:info@rcorpo.com"><Mail size={17} aria-hidden="true" />info@rcorpo.com</a><Link href="/appointment" className="text-link">Prefer an appointment? <ArrowUpRight size={20} aria-hidden="true" /></Link></aside></div></div>;
}
