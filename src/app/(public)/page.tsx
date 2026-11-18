import { getSiteContent } from '@/lib/workspace/public-content';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import ServiceFolders from '@/components/public/ServiceFolders';

export default async function HomePage() {
  const content = await getSiteContent('home');
  const headlineWords=content.headline2.split(' ');
  const markedWord=headlineWords.pop();
  return (
    <div className="paper-home home-split new-page">
      <section className="paper-hero">
        <Image src="/images/redesign/desk-edge.png" className="hero-desk" alt="" width={400} height={666} priority />
        <div className="hero-content">
          <h1>
            {content.headline1}<br />{headlineWords.join(' ')}{' '}<span className="marked-word">{markedWord}<Image src="/images/redesign/underline-brush.png" alt="" width={690} height={33} className="brush-underline" priority /></span>
          </h1>
          <p>{content.intro}</p>
        </div>
        <Image src="/images/redesign/start-here.png" alt="" className="hero-note" width={150} height={260} />
      </section>
      <ServiceFolders copy={content} />
      <section id="contact" className="next-step">
        <div>
          <h2>{content.nextTitle}</h2>
          <p>{content.nextText}</p>
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
