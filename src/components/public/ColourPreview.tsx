'use client';

import {useId, useRef, useState} from 'react';
import {Check, Palette, X} from 'lucide-react';

export type PublicColour = 'orange' | 'blue';
export const colourCookie = 'raikan-colour-preview';

export default function ColourPreview({initialColour, children}: {initialColour: PublicColour; children: React.ReactNode}) {
  const [colour, setColour] = useState(initialColour);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  function choose(next: PublicColour) {
    setColour(next);
    // A presentation preference only; no form answers or account data are stored.
    document.cookie = `${colourCookie}=${next}; Path=/; Max-Age=2592000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  }

  return <div className="public-site" data-colour-theme={colour}>
    {children}
    <aside className="colour-preview" aria-label="Website colour preview" onKeyDown={event => {
      if (event.key === 'Escape') {setOpen(false); trigger.current?.focus();}
    }} onBlur={event => {if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);}}>
      {open && <section className="colour-preview-panel" id={panelId} aria-label="Colour choices">
        <div className="colour-preview-heading"><strong>Website colours</strong><button type="button" className="colour-preview-close" aria-label="Close colour options" onClick={() => {setOpen(false); trigger.current?.focus();}}><X size={17} aria-hidden="true" /></button></div>
        <div className="colour-preview-options" role="group" aria-label="Choose website colours">
          {([{id:'orange', label:'Orange'}, {id:'blue', label:'Original blue / purple'}] as const).map(option => <button type="button" key={option.id} aria-pressed={colour === option.id} onClick={() => choose(option.id)}><span className={`colour-preview-swatch swatch-${option.id}`} aria-hidden="true" /><span>{option.label}</span>{colour === option.id && <Check size={17} aria-hidden="true" />}</button>)}
        </div>
      </section>}
      <button className="colour-preview-trigger" type="button" ref={trigger} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}><Palette size={19} aria-hidden="true" />Colours</button>
    </aside>
  </div>;
}
