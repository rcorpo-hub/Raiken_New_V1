import {z} from 'zod';
import type {ManagedField} from './validation';

const requiredText=z.string().trim().min(1).max(12000);
const contracts={
 'appointment-booking-form':z.object({name:requiredText,email:z.email(),phone:requiredText,preferredDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),preferredTimeSlot:z.enum(['morning','afternoon','evening']),format:z.enum(['office','phone','online'])}),
};
function cents(value:unknown):bigint{
 const text=String(value??'').replace(/[$,\s]/g,'');if(!text)return 0n;
 if(!/^-?\d{1,12}(\.\d{1,2})?$/.test(text))throw new Error('Amounts must be numbers with at most two decimal places.');
 const negative=text.startsWith('-');const [whole,decimal='']=text.replace('-','').split('.');const result=BigInt(whole)*100n+BigInt(decimal.padEnd(2,'0'));return negative?-result:result;
}
const amount=(value:bigint)=>`${value<0n?'-':''}${(value<0n?-value:value)/100n}.${String((value<0n?-value:value)%100n).padStart(2,'0')}`;
const sum=(answers:Record<string,unknown>,keys:string[])=>keys.reduce((total,key)=>total+cents(answers[key]),0n);
export function validateLegacy(slug:string,answers:Record<string,unknown>,fields:ManagedField[]=[]){
 const errors:Record<string,string>={};const contract=contracts[slug as keyof typeof contracts];
 if(contract){const parsed=contract.safeParse(answers);if(!parsed.success)for(const issue of parsed.error.issues)errors[String(issue.path[0])]='Check this required field.';}
 else for(const field of fields){const value=answers[field.key];if(field.required&&(value===undefined||value===null||(typeof value==='string'&&!value.trim())||(Array.isArray(value)&&!value.length)||(field.type==='checkbox'&&value!==true)))errors[field.key]='This field is required.';if(value!==undefined&&value!==''&&field.type==='email'&&!z.email().safeParse(value).success)errors[field.key]='Enter a valid email address.';}
 const result={...answers};
 if(slug==='rental-property-summary'){
  const income=sum(answers,['Gross_Rent','Other_Income_i_e_water_charges_etc']);
  const expenses=sum(answers,['Advertising','Body_corporate_fees','Borrowing_expenses','Cleaning','Council_rates','Depreciable_items','Gardeninglawn_mowing','Insurance','Interest_on_loans','Land_tax','Legal_fees','Pest_control','Property_management_feescommissions','Repairs_and_maintenance','Stationery_telephone_and_postage','Water_charges','Sundry_rental_expenses']);
  result.Total_Income=amount(income);result.Total_Expenses=amount(expenses);result.Net_Rental_Income=amount(income-expenses);
 }
 return {answers:result,errors};
}
