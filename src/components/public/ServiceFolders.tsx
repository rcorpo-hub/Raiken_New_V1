'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const services = [
  { id: 'personal', label: 'Personal tax', heading: 'Your tax return, without the runaround.', description: 'Straightforward tax support for individuals, sole traders and SMSFs. We take the time to understand your situation and make it simple, from start to finish.', cta: 'Explore personal tax', href: '/forms?service=personal-tax' },
  { id: 'business', label: 'Business accounting', heading: 'More time for your business.', description: 'From bookkeeping and BAS to business structures and cloud accounting, we help you keep the numbers in order and understand your next step.', cta: 'Explore business accounting', href: '/forms?service=business-accounting' },
  { id: 'property', label: 'Conveyancing', heading: 'Your next move, made simpler.', description: 'Buying or selling a property? Get clear guidance through the paperwork and settlement process, with a team you can talk to along the way.', cta: 'Explore conveyancing', href: '/forms?service=conveyancing' },
];

export default function ServiceFolders() {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const service = services[selected];
  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % services.length;
    else if (event.key === 'ArrowLeft') next = (index + services.length - 1) % services.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = services.length - 1;
    else return;
    event.preventDefault(); setSelected(next); tabs.current[next]?.focus();
  }
  return <section id="services" className="service-folders" aria-label="How we can help"><div className="folder-tabs" role="tablist" aria-label="Choose a service">{services.map((item, index) => <button key={item.id} id={`tab-${item.id}`} type="button" role="tab" aria-selected={selected === index} aria-controls="service-panel" tabIndex={selected === index ? 0 : -1} className={`folder-tab ${selected === index ? 'is-selected' : ''}`} onClick={() => setSelected(index)} onKeyDown={event => onKeyDown(event, index)} ref={element => { tabs.current[index] = element; }}>{item.label}</button>)}</div><div id="service-panel" role="tabpanel" tabIndex={0} aria-labelledby={`tab-${service.id}`} className="folder-panel"><Image className="folder-art" src="/images/redesign/folder-panel.png" alt="" fill sizes="(min-width: 1100px) 61vw, 94vw" priority /><Image className="folder-documents" src="/images/redesign/paper-stack-v2.png" alt="" width={700} height={900} sizes="(min-width: 1100px) 24vw, (min-width: 900px) 41vw, 1px" priority /><div className="folder-copy" key={service.id}><h2>{service.heading}</h2><span className="small-rule" aria-hidden="true" /><p>{service.description}</p><Link href={service.href} className="button button-paper">{service.cta}<ArrowRight size={24} aria-hidden="true" /></Link></div></div></section>;
}
