interface FormSubgroup {
  id: string;
  name: string;
  categories: string[];
  description?: string;
}

interface FormGroup {
  id: string;
  name: string;
  categories: string[];
  subgroups?: FormSubgroup[];
}

export const FORM_GROUPS: FormGroup[] = [
  { id: 'taxation', name: 'Personal tax', categories: ['Registration', 'Taxation'] },
  {
    id: 'business', name: 'Business accounting', categories: ['Corporate', 'Trusts'],
    subgroups: [
      { id: 'company', name: 'Company', categories: ['Corporate'] },
      {
        id: 'trust', name: 'Trust', categories: ['Trusts'],
        description: 'Trust registration and existing-client forms. A named-trust form is intended for clients of that specific trust.',
      },
    ],
  },
  { id: 'conveyancing', name: 'Property & conveyancing', categories: ['Conveyancing'] },
  { id: 'general', name: 'Enquiries & appointments', categories: ['General'] },
];

export const FORM_SERVICES = {
  'personal-tax': {
    group: 'taxation', label: 'Personal tax', title: 'Personal tax forms.',
    description: 'Find the forms for your individual registration, tax and rental income.',
    placeholder: 'Search personal tax forms…',
  },
  'business-accounting': {
    group: 'business', label: 'Business accounting', title: 'Business accounting forms.',
    description: 'Find your business, company and trust forms in one place.',
    placeholder: 'Search business accounting forms…',
  },
  conveyancing: {
    group: 'conveyancing', label: 'Conveyancing', title: 'Conveyancing forms.',
    description: 'Find the forms for buying, selling and settling property.',
    placeholder: 'Search conveyancing forms…',
  },
};

export type FormService = keyof typeof FORM_SERVICES;

export function resolveFormService(value: string | string[] | undefined): FormService | undefined {
  const service = Array.isArray(value) ? value[0] : value;
  return service && Object.prototype.hasOwnProperty.call(FORM_SERVICES, service)
    ? service as FormService
    : undefined;
}

export function categoriesForService(service: FormService): string[] {
  return FORM_GROUPS.find(group => group.id === FORM_SERVICES[service].group)!.categories;
}
