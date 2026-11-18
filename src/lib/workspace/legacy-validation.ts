import {z} from 'zod';
import type {ManagedField} from './validation';

const requiredText=z.string().trim().min(1).max(12000);
const contracts={
 'contact-us':z.object({first_name:requiredText,last_name:requiredText,email:z.email(),question:requiredText}),
 support:z.object({name:requiredText,email:z.email(),subject:requiredText,message:requiredText}),
 'appointment-booking-form':z.object({name:requiredText,email:z.email(),phone:requiredText,preferredDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),preferredTimeSlot:z.enum(['morning','afternoon','evening']),format:z.enum(['office','phone','online'])}),
 'i-am-purchaser':z.object({firstName:requiredText,lastName:requiredText,email:z.email(),phone:requiredText,propertyAddress:requiredText,purchasePrice:requiredText,declarationAgreed:z.literal(true),signatureName:requiredText}),
 'i-am-vendor':z.object({firstName:requiredText,lastName:requiredText,email:z.email(),phone:requiredText,propertyAddress:requiredText,declarationAgreed:z.literal(true),signatureName:requiredText}),
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
 if(slug==='i-am-purchaser'&&answers.financeRequired==='yes'&&!answers.lenderName)errors.lenderName='Your lending institution or broker is required.';
 const result={...answers};
 if(slug==='quote-calculator'){
  result.total_buyer=amount(sum(answers,['Our_Fees','Stamp_Duty','Lodgement_Fees','Transaction_fees','LTO_Mortgage_Registration_Fees','Priority_Notices_optional','New_Title_post_settlement_optional']));
  result.Vendor_Total=amount(sum(answers,['Vendor_Fees','LTO_Discharge_of_Mortgage_Registration','Special_Water_Meter_Reading','Torrens_Title_Form_1','Community_Lot_Form_1','Strata_Unit_Form_1']));
  result.computed_buyer_total_aud=result.total_buyer;result.computed_vendor_total_aud=result.Vendor_Total;
 }
 if(slug==='rental-property-summary'){
  const income=sum(answers,['Gross_Rent','Other_Income_i_e_water_charges_etc']);
  const expenses=sum(answers,['Advertising','Body_corporate_fees','Borrowing_expenses','Cleaning','Council_rates','Depreciable_items','Gardeninglawn_mowing','Insurance','Interest_on_loans','Land_tax','Legal_fees','Pest_control','Property_management_feescommissions','Repairs_and_maintenance','Stationery_telephone_and_postage','Water_charges','Sundry_rental_expenses']);
  result.Total_Income=amount(income);result.Total_Expenses=amount(expenses);result.Net_Rental_Income=amount(income-expenses);
 }
 return {answers:result,errors};
}
