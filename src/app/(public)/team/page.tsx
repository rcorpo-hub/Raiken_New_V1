import PaperPageIntro from '@/components/public/PaperPageIntro';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Phone } from 'lucide-react';

const members = [{ name: 'Jagdishbhai Patel', role: 'Chartered accountant' }, { name: 'Halak Patel', role: 'Administration' }, { name: 'Aashka Shah', role: 'Administration' }, { name: 'Kashvi Gurnani', role: 'Administration' }, { name: 'Prachi Naik', role: 'Administration' }, { name: 'Khushbu Gangwani', role: 'Administration' }, { name: 'Varsha Nayak', role: 'Client liaison officer' }];

export default function TeamPage() {
  return <div className="new-page editorial-page"><PaperPageIntro eyebrow="OUR PEOPLE" title={<>Good people.<br />Clear guidance.</>} art="people">Real conversations. Practical answers.<br />Meet the people behind your paperwork.</PaperPageIntro><section className="team-lead"><div className="team-photo"><Image src="/images/redesign/logo-warm.png" alt="Raikan Corporation" width={1871} height={840} sizes="(max-width: 640px) 230px, 340px" /></div><div><p className="eyebrow">MEET BHAVESH</p><h2>Bhavesh Chaudhari</h2><p>Speak with Bhavesh about your tax, business accounting and property needs.</p><a href="tel:0452508598" className="text-link"><Phone size={20} aria-hidden="true" />0452 508 598</a><Link href="/contact-us" className="button button-orange">Start a conversation <ArrowUpRight size={20} aria-hidden="true" /></Link></div></section><section className="team-section"><h2>Your team, at a glance.</h2><div className="team-list">{members.map(member => <article key={member.name}><h3>{member.name}</h3><p>{member.role}</p></article>)}</div></section><section className="next-step"><div><h2>Let’s start with a hello.</h2><p>We’ll help you find the right person.</p></div><Link href="/contact-us" className="button button-outline">Make an enquiry <ArrowUpRight size={26} aria-hidden="true" /></Link></section></div>;
}
