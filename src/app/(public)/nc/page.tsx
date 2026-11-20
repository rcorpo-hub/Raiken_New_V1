import type {Metadata} from 'next';
import Link from 'next/link';
import {ClientIntakeWizard} from '@/conveyancing/components/ClientIntakeWizard';
export const metadata:Metadata={title:'New Client Conveyancing Form | Raikan Corporation',description:'Buying or selling a property? Complete your conveyancing details securely with Raikan Corporation.'};
export default function ConveyancingPage(){
 return <div className="new-page conveyancing-page"><div className="conveyancing-back"><Link href="/forms?service=conveyancing" className="text-link">← All conveyancing forms</Link></div><div className="rk-app"><ClientIntakeWizard/></div></div>;
}
