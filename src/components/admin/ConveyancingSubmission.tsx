import type {ClientIntakeFormData} from '@/conveyancing/types';
import {stampDutyVisibility} from '@/conveyancing/utils/validation';
import {formatDate,readable} from '@/lib/workspace/config';
type PersonStatus={party_index:number;status:string;voi_outcome?:string;voi_review_status?:string;has_flagged_items:boolean};
export type VerificationCase={send_status:string;envelope_status?:string;verification_status:string;aml_status?:string;aml_risk_rating?:string;last_synced_at?:string;error_code?:string;livesign_envelope_id?:string};
function Fields({title,values,prefix}:{title:string;values:Record<string,unknown>;prefix:string}){
 return <fieldset className="admin-completed-section"><legend>{title}</legend><div className="admin-completed-grid">{Object.entries(values).map(([label,value],i)=><div className="admin-completed-field" key={label}><label htmlFor={prefix+'-'+i}>{label}</label><input id={prefix+'-'+i} readOnly value={typeof value==='boolean'?(value?'Yes':'No'):String(value??'')} placeholder="Not provided"/></div>)}</div></fieldset>;
}
export function VerificationSummary({record,people}:{record:VerificationCase;people:PersonStatus[]}){
 return <section className="admin-panel admin-editor admin-verification"><h2>LiveSign verification</h2><p className="admin-muted">Results come from LiveSign. Internal review notes do not change these results.</p>
 <dl className="admin-definition-list"><div><dt>Request</dt><dd>{readable(record.send_status)}</dd></div><div><dt>LiveSign matter status</dt><dd>{record.envelope_status||'Not available yet'}</dd></div><div><dt>Identity verification</dt><dd>{readable(record.verification_status)}</dd></div><div><dt>AML status</dt><dd>{record.aml_status||'Waiting for LiveSign'}</dd></div><div><dt>AML risk rating</dt><dd>{record.aml_risk_rating||'Not available yet'}</dd></div><div><dt>Last checked</dt><dd>{record.last_synced_at?formatDate(record.last_synced_at)+' · '+new Date(record.last_synced_at).toLocaleTimeString('en-AU',{timeZone:'Australia/Adelaide'}):'Not checked yet'}</dd></div></dl>
 {people.map(p=><p key={p.party_index}><strong>Person {p.party_index+1}:</strong> {readable(p.status)}{p.voi_review_status?' · Review: '+p.voi_review_status:''}{p.has_flagged_items?' · Flagged for review':''}</p>)}
 {record.error_code&&<p className="admin-alert">Processing needs attention: {readable(record.error_code)}. Check the LiveSign account and integration settings before attempting another request.</p>}
 {record.send_status==='pending_send'&&!record.livesign_envelope_id&&<p className="admin-small">The form is saved. Verification has not been confirmed as sent. LiveSign and email configuration must be enabled during setup.</p>}
 </section>;
}
export default function ConveyancingSubmission({data,id}:{data:ClientIntakeFormData;id:string}){
 const sd=data.stampDuty,show=stampDutyVisibility(sd);
 return <div className="admin-completed-form" role="group" aria-label="Submitted conveyancing form">
 <Fields title="Matter details" prefix={id+'-matter'} values={{'Buying or selling':data.role,'Number of people':data.parties.length}}/>
 {data.parties.map((p,i)=><Fields key={p.id} title={data.role+' '+(i+1)} prefix={id+'-person-'+i} values={{'First name':p.firstName,'Middle name':p.middleName,'Last name':p.lastName,'Date of birth':p.dob,'Email address':p.email,'Phone number':p.phoneCountryCode+' '+p.mobile,'Street address':p.addressLine1,'Address line 2':p.addressLine2,'Suburb / city':p.suburb,'State':p.state,'Postcode':p.postcode,'Country':p.country,'Residency status':p.residencyStatus,'Occupation':p.occupation}}/>)}
 <Fields title="Property details" prefix={id+'-property'} values={{'Street address':data.property.addressLine1,'Suburb':data.property.suburb,'State':data.property.state,'Postcode':data.property.postcode,[data.role==='Purchaser'?'Purchase price':'Sale price']:data.property.purchasePrice,'Settlement date':data.property.settlementDate,...(data.role==='Purchaser'?{'Intended use':data.property.intendedUse,'Type of ownership':data.property.ownershipType}:{})}}/>
 <Fields title="Mortgage details" prefix={id+'-finance'} values={{'Mortgage':data.finance.mortgageRequired,'Bank / lender':data.finance.lenderName,...(data.role==='Purchaser'?{'Broker / banker':data.finance.brokerOrBankerName,'Broker phone':data.finance.brokerPhone,'Broker email':data.finance.brokerEmail,'How did you hear about us?':data.howDidYouHear}:{})}}/>
 {data.role==='Purchaser'&&<Fields title="Stamp duty" prefix={id+'-stamp'} values={{'Eligible for relief':sd.reliefEligible,...(show.firstHomeBuyer?{'First home buyer':sd.firstHomeBuyer}:{}),...(show.propertyType?{'Property type':sd.propertyType}:{}),...(show.signedAfter?{'Contract signed on or after 6 July 2024':sd.contractSignedOnOrAfter6Jul2024}:{}),...(show.signedBetween?{'Contract signed 15 June 2023–5 July 2024':sd.contractSignedBetween15Jun2023And5Jul2024}:{}),...(show.threshold?{'Under price threshold':sd.underPriceThreshold}:{}),...(show.criteria?{'Meets eligibility criteria':sd.meetsEligibilityCriteria}:{})}}/>}
 <Fields title="Declaration" prefix={id+'-declaration'} values={{'Full name':data.declaration.signedName,'Date signed':data.declaration.signedDate,'Authority to act':data.declaration.authorityToAct,...(data.role==='Purchaser'?{'Cooling-off rights acknowledged':data.declaration.coolingOffAcknowledged}:{})}}/>
 <fieldset className="admin-completed-section"><legend>Submitted signature</legend><img src={data.declaration.signatureDataUrl} alt="Signature supplied with this submission" className="admin-submitted-signature"/></fieldset>
 </div>;
}
