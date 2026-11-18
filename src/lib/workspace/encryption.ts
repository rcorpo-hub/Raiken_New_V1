import 'server-only';
import {createCipheriv,createDecipheriv,randomBytes} from 'node:crypto';

function masterKey() {
  const key=process.env.ENCRYPTION_MASTER_KEY||'';
  if(!/^[a-f\d]{64}$/i.test(key)||/^0+$/.test(key)) throw new Error('Encryption is not configured');
  return Buffer.from(key,'hex');
}
export function encryptAnswers(value:unknown,aad:string) {
  const iv=randomBytes(12);const cipher=createCipheriv('aes-256-gcm',masterKey(),iv);
  cipher.setAAD(Buffer.from(aad));
  const encrypted=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);
  return {ciphertext:'\\x'+encrypted.toString('hex'),meta:{version:1,algorithm:'aes-256-gcm',iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64')}};
}
export function decryptAnswers(ciphertext:string,meta:{iv:string;tag:string},aad:string):Record<string,unknown> {
  const decipher=createDecipheriv('aes-256-gcm',masterKey(),Buffer.from(meta.iv,'base64'));
  decipher.setAAD(Buffer.from(aad));decipher.setAuthTag(Buffer.from(meta.tag,'base64'));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(ciphertext.replace(/^\\x/,''),'hex')),decipher.final()]).toString('utf8'));
}
