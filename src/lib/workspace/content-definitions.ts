export const contentDefinitions = {
  home: {path:'/',title:'Homepage',fields:{
    headline1:['Headline, first line','Good advice.'],headline2:['Headline, second line','Less paperwork.'],
    intro:['Introduction','Tax, business accounts and property matters, explained clearly.'],
    nextTitle:['Enquiry heading','A simple next step.'],nextText:['Enquiry introduction','Tell us what you need help with. We’ll help you find the right person.'],
    personalTitle:['Personal tax heading','Your tax return, without the runaround.'],personalText:['Personal tax description','Straightforward tax support for individuals, sole traders and SMSFs. We take the time to understand your situation and make it simple, from start to finish.'],
    businessTitle:['Business accounting heading','More time for your business.'],businessText:['Business accounting description','From bookkeeping and BAS to business structures and cloud accounting, we help you keep the numbers in order and understand your next step.'],
    propertyTitle:['Conveyancing heading','Your next move, made simpler.'],propertyText:['Conveyancing description','Buying or selling a property? Get clear guidance through the paperwork and settlement process, with a team you can talk to along the way.'],
  }},
  contact:{path:'/contact-us',title:'Contact & office details',fields:{
    title:['Page heading','A simple next step.'],intro:['Introduction','Tell us what you need help with. We’ll help you find the right person.'],
    enquiryTitle:['Enquiry heading','Make an enquiry'],enquiryText:['Enquiry introduction','Tax, business or property — we’re here to help.'],
    email:['Public email address','info@rcorpo.com'],
    adelaideAddress:['Adelaide address','Shop 3, 160 Hampstead Road, Broadview SA 5083'],adelaidePhone:['Adelaide telephone','08 7076 9899'],
    brisbaneAddress:['Brisbane address','22 Van Dieren Road, Pallara QLD 4110'],brisbanePhone:['Brisbane telephone','07 2102 9899'],
    perthAddress:['Perth address','440A Morley Drive, Morley WA 6062'],perthPhone:['Perth telephone','08 6373 5181'],
  }},
  team:{path:'/team',title:'Our people',fields:{
    headline1:['Heading, first line','Good people.'],headline2:['Heading, second line','Clear guidance.'],
    intro:['Introduction','Real conversations. Practical answers. Meet the people behind your paperwork.'],
    leadName:['Lead contact name','Bhavesh Chaudhari'],leadBio:['Lead contact introduction','Speak with Bhavesh about your tax, business accounting and property needs.'],leadPhone:['Lead contact telephone','0452 508 598'],
    members:['Team members — one per line: Name | Role','Jagdishbhai Patel | Chartered accountant\nHalak Patel | Administration\nAashka Shah | Administration\nKashvi Gurnani | Administration\nPrachi Naik | Administration\nKhushbu Gangwani | Administration\nVarsha Nayak | Client liaison officer'],
  }},
  footer:{path:'/_site/footer',title:'Footer wording',fields:{description:['Company introduction','Tax, business accounts and property matters, explained clearly.']}},
} as const;
export type ContentKey=keyof typeof contentDefinitions;
export function defaultContent(key:ContentKey):Record<string,string>{return Object.fromEntries(Object.entries(contentDefinitions[key].fields).map(([key,value])=>[key,value[1]]));}

export function cleanContent(key:ContentKey,document:unknown):Record<string,string>{
  if(!document||typeof document!=='object'||Array.isArray(document))throw new Error('Invalid content');
  const allowed=contentDefinitions[key].fields;const result:Record<string,string>={};
  for(const name of Object.keys(allowed)){
    const value=(document as Record<string,unknown>)[name];
    const max=name==='members'?6000:name.endsWith('Text')||name==='intro'||name==='leadBio'?1500:300;
    if(typeof value!=='string'||!value.trim()||value.length>max)throw new Error(`Check the ${name} field (maximum ${max} characters).`);
    if(name==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))throw new Error('Enter a valid email address.');
    if(name.endsWith('Phone')&&!/^[+\d ()-]{5,40}$/.test(value))throw new Error('Enter a valid telephone number.');
    result[name]=value.trim();
  }
  return result;
}
