import 'server-only';
export type MailEvent={kind:string;reference:string;role:string;name:string;to:string;status?:string};
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function mailMessage(event:MailEvent){
 const titles:Record<string,string>={received:'We have received your form',sent:'Your form has been sent to LiveSign',verified:'Your identity has been verified',firm_received:'New conveyancing form received',firm_status:'Conveyancing verification status updated',firm_error:'Conveyancing verification needs attention'};
 const subject=(titles[event.kind]||'Conveyancing update')+' ['+event.reference+']';
 const body=event.kind==='sent'?'LiveSign will email each person their identity verification link. Please check your inbox and junk folder.':event.kind==='verified'?'Your identity has been successfully verified through LiveSign. Our team will contact you about the next steps.':event.kind==='received'?'Your form has been saved. Our team will arrange your LiveSign verification.':('Please open the owner workspace to review this matter. Status: '+(event.status||'Received')+'.');
 return {subject,html:'<div style="font:16px Arial,sans-serif;line-height:1.6;color:#24261e"><h1>'+escape(titles[event.kind]||'Conveyancing update')+'</h1><p>'+escape(event.name?('Hello '+event.name+','):'Hello,')+'</p><p>'+escape(body)+'</p><p>Reference: <strong>'+escape(event.reference)+'</strong></p><p>Raikan Corporation</p></div>'};
}
export async function sendConveyancingMail(event:MailEvent,messageId:string){
 if(process.env.CONVEYANCING_EMAIL_ENABLED!=='true')throw new Error('EMAIL_CONFIGURATION_REQUIRED');
 const {SMTP_HOST:host,SMTP_USER:user,SMTP_PASS:pass,SMTP_FROM:from}=process.env;
 if(!host||!user||!pass||!from)throw new Error('EMAIL_CONFIGURATION_REQUIRED');
 const {default:nodemailer}=await import('nodemailer');
 const port=Number(process.env.SMTP_PORT||587);
 const transport=nodemailer.createTransport({host,port,secure:port===465,requireTLS:port!==465,auth:{user,pass},connectionTimeout:15000,socketTimeout:30000});
 try{const result=await transport.sendMail({from,to:event.to,...mailMessage(event),messageId:'<'+messageId+'@'+new URL(process.env.NEXT_PUBLIC_APP_URL!).hostname+'>'});if(!result.accepted?.length)throw new Error('EMAIL_NOT_ACCEPTED');}
 finally{transport.close();}
}
