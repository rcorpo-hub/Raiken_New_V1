declare module 'nodemailer'{
 const nodemailer:{createTransport(options:Record<string,unknown>):{sendMail(message:Record<string,unknown>):Promise<{accepted?:string[]}>;close():void}};
 export default nodemailer;
}
