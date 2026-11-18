export type AnswerField={key:string;label:string;type?:string;options:{value:string;label:string}[]};
export type AnswerRow=AnswerField & {value:unknown};
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
export function isMissingAnswer(value:unknown){return value===null||value===undefined||value===''||(typeof value==='string'&&!value.trim())||(Array.isArray(value)&&!value.length);}
export function readableField(key:string){return key.replace(/([a-z0-9])([A-Z])/g,'$1 $2').replace(/[_-]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());}
export function answerFields(schema:unknown):AnswerField[]{
 if(!object(schema)||!Array.isArray(schema.fields))return [];
 const seen=new Set<string>();const fields:AnswerField[]=[];
 for(const item of schema.fields){
  if(!object(item)||typeof item.key!=='string'||seen.has(item.key))continue;
  seen.add(item.key);
  const options=Array.isArray(item.options)?item.options.filter((option):option is {value:string;label:string}=>object(option)&&typeof option.value==='string'&&typeof option.label==='string'):[];
  fields.push({key:item.key,label:typeof item.label==='string'&&item.label.trim()?item.label:readableField(item.key),type:typeof item.type==='string'?item.type:undefined,options});
 }
 return fields;
}
export function buildAnswerRows(answers:Record<string,unknown>,schema:unknown,contact?:Record<string,unknown>):AnswerRow[]{
 const fields=answerFields(schema);const used=new Set(fields.map(field=>field.key));
 const rows:AnswerRow[]=fields.map(field=>({...field,value:answers[field.key]}));
 for(const [key,value] of Object.entries(answers))if(!used.has(key))rows.push({key,label:readableField(key),options:[],value});
 if(object(schema)&&schema.engine==='managed'&&contact){
  const basics=[['name','Full name'],['email','Email address'],['phone','Phone'],['office','Office']];
  rows.unshift(...basics.map(([key,label])=>({key:'@contact.'+key,label,options:[],value:contact[key]})));
 }
 return rows;
}
export function answerText(value:unknown,field?:Pick<AnswerField,'options'>):string|null{
 if(isMissingAnswer(value))return 'Not provided';
 if(Array.isArray(value)||typeof value==='object')return null;
 if(typeof value==='boolean')return value?'Yes':'No';
 return field?.options.find(option=>option.value===String(value))?.label??String(value);
}
