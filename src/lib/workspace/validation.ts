import { z } from 'zod';

const key = z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]{0,199}$/);
export const fieldSchema = z.object({
  key, label:z.string().trim().min(1).max(240),
  type:z.enum(['text','email','tel','number','date','textarea','select','checkbox']),
  required:z.boolean(), options:z.array(z.object({value:z.string().min(1).max(120),label:z.string().min(1).max(160)})).max(80).default([]),
});
export const managedFormSchema = z.object({
  engine:z.literal('managed'), title:z.string().min(1).max(160), description:z.string().max(1500),
  fields:z.array(fieldSchema).min(1).max(100),
  reviewedLegacy:z.boolean(),
}).superRefine((value,ctx)=>{
  const keys=new Set<string>();
  for(const [i,field] of value.fields.entries()) {
    if(keys.has(field.key)||['__proto__','constructor','prototype'].includes(field.key)) ctx.addIssue({code:'custom',path:['fields',i,'key'],message:'Field keys must be unique and safe.'});
    keys.add(field.key);
    if(field.type==='select' && !field.options.length) ctx.addIssue({code:'custom',path:['fields',i,'options'],message:'Add at least one choice.'});
  }
});
export type ManagedForm = z.infer<typeof managedFormSchema>;
export type ManagedField = ManagedForm['fields'][number];

export function validateAnswers(definition: ManagedForm, input: Record<string, unknown>) {
  const result: Record<string, string | number | boolean> = {};
  const errors: Record<string,string> = {};
  for(const field of definition.fields) {
    const value=input[field.key];
    if(field.type==='checkbox') {
      if(value===undefined&&!field.required){result[field.key]=false;continue;}
      if(typeof value!=='boolean' || (field.required && value!==true)) errors[field.key]='Please confirm this field.';
      else result[field.key]=value;
      continue;
    }
    if(value===undefined || (typeof value==='string'&&!value.trim())) { if(field.required) errors[field.key]='This field is required.'; else result[field.key]=''; continue; }
    if(typeof value!=='string' || value.length>12000) { errors[field.key]='Enter a valid value.'; continue; }
    if(field.type==='email' && !z.email().safeParse(value).success) errors[field.key]='Enter a valid email address.';
    else if(field.type==='date' && (!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)) errors[field.key]='Enter a valid date.';
    else if(field.type==='number' && !Number.isFinite(Number(value))) errors[field.key]='Enter a valid number.';
    else if(field.type==='select' && !field.options.some(option=>option.value===value)) errors[field.key]='Choose an available option.';
    else result[field.key]=value;
  }
  return {answers:result,errors};
}

export const intakeSchema=z.object({
  branch_code:z.enum(['ADE','BNE','PER']).default('ADE'),
  applicant:z.object({name:z.string().trim().max(200),email:z.union([z.email().max(254),z.literal('')]),phone:z.string().max(60).optional()}),
  answers:z.record(z.string().max(200),z.unknown()).refine(x=>Object.keys(x).length<=250,'Too many fields'),
  version_id:z.uuid().optional(),idempotency_key:z.string().regex(/^[a-zA-Z0-9-]{16,100}$/).optional(),
});

export function validateJsonBounds(value:unknown,depth=0, budget={remaining:4000}):boolean {
  if(depth>8 || --budget.remaining<0) return false;
  if(typeof value==='string') return value.length<=24000;
  if(value===null || typeof value==='boolean') return true;
  if(typeof value==='number') return Number.isFinite(value);
  if(Array.isArray(value)) return value.length<=200 && value.every(x=>validateJsonBounds(x,depth+1,budget));
  if(typeof value==='object') return Object.entries(value).length<=250 && Object.entries(value).every(([key,value])=>!['__proto__','constructor','prototype'].includes(key)&&key.length<=200&&validateJsonBounds(value,depth+1,budget));
  return false;
}
