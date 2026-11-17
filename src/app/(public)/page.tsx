import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import ServiceFolders from '@/components/public/ServiceFolders';

export default function HomePage() {
  return (
    <div className="paper-home home-split new-page">
      <section className="paper-hero">
        <Image src="/images/redesign/desk-edge.png" className="hero-desk" alt="" width={400} height={666} priority />
        <div className="hero-content">
          <h1>
            Good advice.<br />Less <span className="marked-word">paperwork.<Image src="/images/redesign/underline-brush.png" alt="" width={690} height={33} className="brush-underline" priority /></span>
          </h1>
          <p>Tax, business accounts and property matters, explained clearly.</p>
        </div>
        <Image src="/images/redesign/start-here.png" alt="" className="hero-note" width={150} height={260} />
      </section>
      <ServiceFolders />
      <section id="contact" className="next-step">
        <div>
          <h2>A simple next step.</h2>
          <p>Tell us what you need help with. We’ll help you find the right person.</p>
        </div>
        <Link href="/contact-us" className="button button-outline">
          Make an enquiry <ArrowUpRight size={26} aria-hidden="true" />
        </Link>
      </section>
      <Image src="/images/redesign/pen-cup-v2.png" className="home-pen" alt="" width={512} height={768} sizes="140px" />
      <Image src="/images/redesign/eucalyptus-sprig-v2.png" className="home-leaves" alt="" width={768} height={512} sizes="260px" />
    </div>
  );
}
