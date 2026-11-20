import {z} from 'zod';
import type {ClientIntakeFormData} from '@/conveyancing/types';
import {clearHiddenStampDutyAnswers,validateDeclaration,validatePartyDetails,validatePartyAddress,validateProperty,validateStampDuty} from '@/conveyancing/utils/validation';
const text=z.string().max(500),short=z.string().max(200),emptyFiles=z.array(z.never()).max(0),yesNo=z.enum(['','Yes','No']);
const party=z.object({
 id:z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/),isSingleName:z.boolean().optional(),firstName:short,middleName:short,lastName:short,dob:z.string().max(10),email:z.string().max(254),mobile:z.string().max(40),phoneCountryCode:z.string().regex(/^\+\d{1,4}$/),
 addressLine1:text,addressLine2:text,suburb:short,state:short,postcode:z.string().max(16),country:short,residencyStatus:z.enum(['','Australian Citizen','Permanent Resident','Temporary Resident']),occupation:short,sameAddressAsPrevious:z.boolean(),idDocuments:emptyFiles,
});
export const formDataSchema=z.object({
 role:z.enum(['Purchaser','Vendor']),roleConfirmed:z.boolean(),partyCount:z.number().int().min(1).max(6),isCompanyOrTrust:z.enum(['','Yes','No']).optional(),parties:z.array(party).min(1).max(6),
 property:z.object({addressLine1:text,suburb:short,state:z.literal('SA'),postcode:z.string().max(4),purchasePrice:z.string().max(18),settlementDate:z.string().max(10),intendedUse:z.enum(['','To live in','For investment']),ownershipType:z.enum(['','Sole Owner','Joint Tenants','Tenants in Common'])}),
 finance:z.object({mortgageRequired:z.enum(['','Yes','No','Maybe']),brokerOrBankerName:short,brokerPhone:z.string().max(40),brokerEmail:z.string().max(254),lenderName:short,paysByElectronicTransfer:z.boolean(),paysByCash:z.boolean(),cashAmount:z.string().max(18),paysByVirtualAssets:z.boolean(),virtualAssetsAmount:z.string().max(18),paysByOther:z.boolean(),otherPaymentDetails:text,sourceOfFundsDocuments:emptyFiles.optional()}),
 stampDuty:z.object({reliefEligible:z.enum(['','Yes','No','Not Sure']),firstHomeBuyer:yesNo,propertyType:z.enum(['','Vacant Land','Brand New Home','Established Home','Established Home With Substantial Renovation']),contractSignedOnOrAfter6Jul2024:yesNo,contractSignedBetween15Jun2023And5Jul2024:yesNo,underPriceThreshold:yesNo,meetsEligibilityCriteria:yesNo,notes:z.string().max(2000)}),
 declaration:z.object({coolingOffAcknowledged:z.boolean(),authorityToAct:z.boolean(),signedName:short,signedDate:z.string().max(10),signatureDataUrl:z.string().max(240000)}),howDidYouHear:short,idDocuments:emptyFiles,
}).superRefine((v,c)=>{if(v.partyCount!==v.parties.length||new Set(v.parties.map(p=>p.id)).size!==v.parties.length)c.addIssue({code:'custom',message:'Check the number of people and their identifiers.'});});
export const sessionInput=z.object({formData:formDataSchema,currentStep:z.number().int().min(1).max(5),partyIndex:z.number().int().min(0).max(5),sessionId:z.uuid(),revision:z.number().int().nonnegative()});
export function checkedFormData(raw:unknown){
 const parsed=formDataSchema.safeParse(raw);
 if(!parsed.success)return {errors:{form:parsed.error.issues[0]?.message||'Check the form.'},data:null};
 const data=parsed.data as ClientIntakeFormData;
 // Remove answers to questions removed from the reference's current UI.
 data.stampDuty=clearHiddenStampDutyAnswers(data.stampDuty);data.stampDuty.notes='';
 Object.assign(data.finance,{paysByElectronicTransfer:false,paysByCash:false,cashAmount:'',paysByVirtualAssets:false,virtualAssetsAmount:'',paysByOther:false,otherPaymentDetails:'',sourceOfFundsDocuments:[]});
 data.parties.forEach((p,i)=>{if(i===0)p.sameAddressAsPrevious=false;else if(p.sameAddressAsPrevious){const previous=data.parties[i-1];for(const k of ['addressLine1','addressLine2','suburb','state','postcode','country'] as const)p[k]=previous[k];}});
 if(data.role==='Vendor'){
  data.property.ownershipType='';data.property.intendedUse='';data.howDidYouHear='';data.finance.brokerOrBankerName='';data.finance.brokerPhone='';data.finance.brokerEmail='';
  data.stampDuty={reliefEligible:'',firstHomeBuyer:'',propertyType:'',contractSignedOnOrAfter6Jul2024:'',contractSignedBetween15Jun2023And5Jul2024:'',underPriceThreshold:'',meetsEligibilityCriteria:'',notes:''};
  data.declaration.coolingOffAcknowledged=false;if(data.finance.mortgageRequired!=='Yes')data.finance.lenderName='';
 }
 const errors:Record<string,string>={};
 if(!data.roleConfirmed)errors.role='Choose whether you are buying or selling.';
 if(data.isCompanyOrTrust==='Yes')errors.structure='Please contact our firm for company or trust conveyancing.';
 for(const p of data.parties)for(const [k,m] of Object.entries({...validatePartyDetails(p),...validatePartyAddress(p)}))errors[p.id+'.'+k]=m;
 Object.assign(errors,validateProperty(data),data.role==='Purchaser'?validateStampDuty(data.stampDuty):{},validateDeclaration(data));
 if(data.role==='Purchaser'&&data.parties.length>1&&data.property.ownershipType==='Sole Owner')errors['property.ownershipType']='Choose ownership for multiple purchasers.';
 if(data.role==='Vendor'&&data.finance.mortgageRequired==='Maybe')errors['finance.mortgageRequired']='Choose Yes or No.';
 return {data,errors};
}
