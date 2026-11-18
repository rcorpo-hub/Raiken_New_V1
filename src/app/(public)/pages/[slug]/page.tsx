import {notFound} from 'next/navigation';
import {getPublishedDocument} from '@/lib/workspace/public-content';
import PublishedArticle from '@/components/public/PublishedArticle';
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const document=await getPublishedDocument('/pages/'+slug);if(!document)notFound();return <PublishedArticle document={document.blocks}/>;}
