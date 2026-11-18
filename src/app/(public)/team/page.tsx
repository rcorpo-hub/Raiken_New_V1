import { getSiteContent } from '@/lib/workspace/public-content';
import PaperPageIntro from '@/components/public/PaperPageIntro';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Phone } from 'lucide-react';

export default async function TeamPage() {
 const content=await getSiteContent('team');
 const members=content.members.split('\n').map(line=>{const [name,role]=line.split('|');return {name:name.trim(),role:role?.trim()||''};}).filter(member=>member.name);
  return <div className="new-page editorial-page"><PaperPageIntro eyebrow="OUR PEOPLE" title={<>{content.headline1}<br />{content.headline2}</>} art="people">{content.intro}</PaperPageIntro><section className="team-lead"><div className="team-photo"><Image src="/images/redesign/logo-warm.png" alt="Raikan Corporation" width={1871} height={840} sizes="(max-width: 640px) 230px, 340px" /></div><div><p className="eyebrow">MEET BHAVESH</p><h2>{content.leadName}</h2><p>{content.leadBio}</p><a href={`tel:${content.leadPhone.replace(/[^+\d]/g,'')}`} className="text-link"><Phone size={20} aria-hidden="true" />{content.leadPhone}</a><Link href="/contact-us" className="button button-orange">Start a conversation <ArrowUpRight size={20} aria-hidden="true" /></Link></div></section><section className="team-section"><h2>Your team, at a glance.</h2><div className="team-list">{members.map(member => <article key={member.name}><h3>{member.name}</h3><p>{member.role}</p></article>)}</div></section><section className="next-step"><div><h2>Let’s start with a hello.</h2><p>We’ll help you find the right person.</p></div><Link href="/contact-us" className="button button-outline">Make an enquiry <ArrowUpRight size={26} aria-hidden="true" /></Link></section></div>;
}
