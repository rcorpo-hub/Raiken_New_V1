'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Search } from 'lucide-react';
import PaperPageIntro from './PaperPageIntro';
import { FORM_GROUPS, FORM_SERVICES, type FormService } from './form-services';

interface FormDef {
  id: number;
  title: string;
  category: string;
  description: string;
  href: string;
}

function FormLinks({ forms }: { forms: FormDef[] }) {
  return (
    <div className="form-links">
      {forms.map(form => (
        <Link key={form.id} href={form.href}>
          <span><strong>{form.title.replace(/\s*\(Form \d+\)/, '')}</strong><small>{form.description}</small></span>
          <ArrowRight size={23} aria-hidden="true" className="shrink-0" />
        </Link>
      ))}
    </div>
  );
}

export default function FormsDirectory({ forms, service }: { forms: FormDef[]; service?: FormService }) {
  const [query, setQuery] = useState('');
  const selected = service ? FORM_SERVICES[service] : undefined;
  const search = query.trim().toLowerCase();
  const matching = forms.filter(form =>
    `${form.title} ${form.category} ${form.description}`.toLowerCase().includes(search),
  );
  const groups = selected ? FORM_GROUPS.filter(group => group.id === selected.group) : FORM_GROUPS;

  return (
    <div className="new-page editorial-page">
      <PaperPageIntro
        eyebrow={selected ? selected.label.toUpperCase() : 'EXISTING CLIENTS'}
        title={selected ? selected.title : <>A place for<br />your paperwork.</>}
        before={selected && <Link href="/forms" className="text-link"><ArrowLeft size={18} aria-hidden="true" />All client forms</Link>}
      >
        {selected ? selected.description : 'Find your form, start an application or pick up where you left off.'}
      </PaperPageIntro>

      <nav className="forms-service-navigation" aria-label="Form services">
        <Link href="/forms" aria-current={!service ? 'page' : undefined}>All forms</Link>
        {Object.entries(FORM_SERVICES).map(([id, item]) => (
          <Link key={id} href={`/forms?service=${id}`} aria-current={service === id ? 'page' : undefined}>{item.label}</Link>
        ))}
      </nav>

      <div className="forms-tools">
        <label htmlFor="form-search" className="sr-only">Find a client form</label>
        <div className="form-search-field">
          <Search size={20} aria-hidden="true" />
          <input id="form-search" type="search" placeholder={selected?.placeholder || 'Find a form…'} value={query} onChange={event => setQuery(event.target.value)} />
        </div>
        {!service || service === 'business-accounting' ? (
          <a href="https://accounts.rcorpo.com/login" className="text-link" target="_blank" rel="noopener noreferrer">
            Open accounting software <ArrowUpRight size={20} aria-hidden="true" />
          </a>
        ) : (
          <Link href="/contact-us" className="text-link">Need help choosing a form? <ArrowUpRight size={20} aria-hidden="true" /></Link>
        )}
      </div>

      <p className="forms-result-count" role="status">{matching.length} {matching.length === 1 ? 'form' : 'forms'} found</p>
      {matching.length === 0 && (
        <p className="empty-results">
          No {selected ? `${selected.label.toLowerCase()} ` : ''}forms found. Try another search or <Link href="/contact-us" className="text-link">ask our team</Link>.
        </p>
      )}

      {groups.map(group => {
        const items = matching.filter(form => group.categories.includes(form.category));
        return items.length ? (
          <section className="forms-category" id={group.id} key={group.id}>
            <h2>{group.name}</h2>
            {group.subgroups ? group.subgroups.map(subgroup => {
              const subgroupForms = items.filter(form => subgroup.categories.includes(form.category));
              return subgroupForms.length ? (
                <section className="form-subgroup" id={`${group.id}-${subgroup.id}`} key={subgroup.id}>
                  <h3>{subgroup.name}</h3>
                  {subgroup.description && <p>{subgroup.description}</p>}
                  <FormLinks forms={subgroupForms} />
                </section>
              ) : null;
            }) : <FormLinks forms={items} />}
          </section>
        ) : null;
      })}
    </div>
  );
}
