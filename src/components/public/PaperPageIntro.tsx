import Image from 'next/image';
import type { ReactNode } from 'react';

const artwork = {
  forms: { src: '/images/redesign/paper-stack-v2.png', width: 700, height: 900 },
  contact: { src: '/images/redesign/pen-cup-v2.png', width: 512, height: 768 },
  people: { src: '/images/redesign/eucalyptus-sprig-v2.png', width: 768, height: 512 },
};

export default function PaperPageIntro({ eyebrow, title, children, art = 'forms', before }: {
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
  art?: keyof typeof artwork;
  before?: ReactNode;
}) {
  const image = artwork[art];
  return (
    <section className={`page-intro paper-page-intro paper-page-intro-${art}`}>
      <div className="page-intro-copy">
        {before}
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <Image src="/images/redesign/underline-brush.png" className="intro-brush" alt="" width={690} height={33} sizes="260px" />
        <p>{children}</p>
      </div>
      <Image {...image} alt="" className="page-intro-art" sizes="(max-width: 640px) 1px, 220px" />
    </section>
  );
}
