import { getSiteContent, getPublicOffices } from '@/lib/workspace/public-content';
import PaperPageIntro from '@/components/public/PaperPageIntro';
import Link from 'next/link';
import { ArrowUpRight, Phone, Mail } from 'lucide-react';

export default async function ContactUsPage() {
  const [content, offices]=await Promise.all([getSiteContent('contact'),getPublicOffices()]);
  return <div className="new-page editorial-page"><PaperPageIntro eyebrow="LET’S TALK" title={content.title} art="contact">{content.intro}</PaperPageIntro><div className="contact-grid"><section className="enquiry-paper"><h2>{content.enquiryTitle}</h2><p>{content.enquiryText}</p><a className="button button-orange" href={`mailto:${content.email}`}>Email our team <ArrowUpRight size={20} aria-hidden="true" /></a><p>Prefer to talk through your questions? Choose a time that suits you.</p><Link href="/appointment-booking-form" className="button button-paper">Book an appointment <ArrowUpRight size={20} aria-hidden="true" /></Link><p>Ready to get started? Find your Personal tax, Business accounting or Conveyancing form.</p><Link href="/forms" className="text-link">Browse client forms <ArrowUpRight size={20} aria-hidden="true" /></Link></section><aside className="contact-aside"><p className="eyebrow">CLOSER THAN YOU THINK</p><h2>Three cities.<br />One helpful team.</h2>{offices.map(office => <section className="office-block" id={office.id} key={office.id}><h3>{office.city}</h3><p>{office.address}</p><a href={`tel:${office.tel}`}><Phone size={16} aria-hidden="true" />{office.phone}</a></section>)}<a className="contact-email" href={`mailto:${content.email}`}><Mail size={17} aria-hidden="true" />{content.email}</a></aside></div></div>;
}
