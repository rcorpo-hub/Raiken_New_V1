import 'server-only';
import {inflateSync} from 'node:zlib';
// Both reference signature modes normalise to PNG. Validate bounded pixels,
// rejecting malformed data URLs, excessive dimensions and empty canvases.
export function validSignature(value:string):boolean{
 try{
  if(!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(value))return false;
  const bytes=Buffer.from(value.slice(22),'base64');
  if(bytes.length>180000||bytes.length<50||!bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')))return false;
  let offset=8,width=0,height=0,bpp=0;const chunks:Buffer[]=[];
  while(offset+12<=bytes.length){
   const length=bytes.readUInt32BE(offset),kind=bytes.toString('ascii',offset+4,offset+8);
   if(length>180000||offset+12+length>bytes.length)return false;
   const data=bytes.subarray(offset+8,offset+8+length);
   if(kind==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);if(data[8]!==8||![2,6].includes(data[9])||data[12]!==0)return false;bpp=data[9]===6?4:3;}
   if(kind==='IDAT')chunks.push(data);offset+=length+12;if(kind==='IEND')break;
  }
  if(!width||!height||width>1200||height>600||width*height>720000||!bpp)return false;
  const stride=width*bpp,raw=inflateSync(Buffer.concat(chunks),{maxOutputLength:3000000});
  if(raw.length!==(stride+1)*height)return false;
  let prior=Buffer.alloc(stride),ink=0;
  for(let y=0;y<height;y++){
   const filter=raw[y*(stride+1)];if(filter>4)return false;
   const row=Buffer.from(raw.subarray(y*(stride+1)+1,(y+1)*(stride+1)));
   for(let x=0;x<stride;x++){
    const a=x>=bpp?row[x-bpp]:0,b=prior[x],c=x>=bpp?prior[x-bpp]:0,p=a+b-c;
    const predictor=filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):Math.abs(p-a)<=Math.abs(p-b)&&Math.abs(p-a)<=Math.abs(p-c)?a:Math.abs(p-b)<=Math.abs(p-c)?b:c;
    row[x]=(row[x]+predictor)&255;
   }
   for(let x=0;x<stride;x+=bpp)if((bpp===3||row[x+3]>30)&&Math.min(row[x],row[x+1],row[x+2])<160)ink++;
   prior=row;
  }
  return ink>=8;
 }catch{return false;}
}
