import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, ArrowLeft } from 'lucide-react';

interface PostData {
  title: string;
  date: string;
  contentHtml: string;
}

const POSTS: Record<string, PostData> = {
  'to-do-when-selling-property-adelaide-conveyancing': {
    title: 'To Do When Selling Property Adelaide Conveyancing',
    date: 'March 27, 2021',
    contentHtml: `
      <h2><strong>Things to do when you are selling</strong></h2>
      <ul class="list-disc pl-5 space-y-4 my-6">
        <li>
          <strong>Contract:</strong><br />
          Read the contract carefully before you sign and make sure you are happy with the conditions of the contract, settlement date, purchase price, etc. Once you sign the contract, it becomes legally binding according to the written terms agreed.
        </li>
        <li>
          <strong>Form 1:</strong><br />
          Provide Form 1 to the purchaser, as the purchaser's right to cool-off starts from the day you serve the Form 1 to them. It is a legal requirement in South Australia to provide Form 1 to the purchaser. The purchaser has two business days to cool off from the contract after Form 1 is served. Cooling off rights do not apply when purchasing at auction or if the purchaser agrees to waive their rights in writing using a prescribed certificate from a legal practitioner.
        </li>
        <li>
          <strong>Discharge Authority Form:</strong><br />
          You need to inform your mortgage bank about the sale of the property for them to prepare for electronic settlement. You can speak to the bank directly and apply using a discharge authority application form, or ask Raikan Corporation to assist you with this preparation.
        </li>
        <li>
          <strong>Verification of Identity (VOI):</strong><br />
          We must verify your identity personally before the settlement of property and finalize the execution of transfer documents. If you are unable to visit our Adelaide, Brisbane, or Perth offices, VOI can be executed at an authorized Australia Post location.
        </li>
      </ul>
    `,
  },
  'conveyancers': {
    title: 'Conveyancers: Roles, Legal Settlement & Protection',
    date: 'March 29, 2021',
    contentHtml: `
      <p class="text-base leading-relaxed mb-6">
        Conveyancing is the legal process of transferring the ownership of real estate property from one person to another. A conveyancer is a licensed and qualified professional who can:
      </p>
      <ul class="list-disc pl-5 space-y-2 mb-8">
        <li>Provide legal advice and information about the sale or purchase of property</li>
        <li>Prepare binding legal documentation for property transactions</li>
        <li>Represent either the vendor or the buyer during the electronic PEXA settlement process.</li>
      </ul>

      <h2 class="text-2xl font-bold text-gray-900 mb-4">What a Conveyancer Does</h2>
      <p class="mb-4">An Australian licensed conveyancer will:</p>
      <ul class="list-disc pl-5 space-y-2 mb-8">
        <li>Prepare and clarify legal contracts, including Contract of Sale and Memorandum of Transfer.</li>
        <li>Conduct comprehensive title searches checking for easements, encumbrances, and zoning covenants.</li>
        <li>Represent you in coordinating settlement terms with the other party's legal representative.</li>
        <li>Place and securely hold deposit money in a statutory trust account.</li>
        <li>Calculate accurate financial adjustments for municipal council rates, emergency service levies, and water charges.</li>
        <li>Liaise directly with your financial lending institution regarding loan payouts or mortgage drawdowns.</li>
        <li>Lodge all final transfer and stamp duty certifications with Land Services SA, Titles Queensland, or Landgate WA.</li>
      </ul>
    `,
  },
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POSTS[slug];

  if (!post) {
    notFound();
  }

  return (
    <div className="w-full font-sans bg-white py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#087caa] hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#087caa] mb-3">
            <Calendar className="w-4 h-4" />
            <span>{post.date}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            {post.title}
          </h1>
          <div className="w-16 h-1 bg-[#087caa]" />
        </header>

        <div
          className="prose prose-slate max-w-none text-gray-800 leading-relaxed text-sm sm:text-base space-y-4"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-[#fafafa] border border-gray-200 rounded-xl p-6 text-center">
            <h3 className="text-base font-bold text-gray-900 mb-2">Need Conveyancing Guidance?</h3>
            <p className="text-xs text-gray-600 mb-4">
              Our licensed conveyancers in Adelaide, Brisbane, and Perth review contracts and Form 1 documentation.
            </p>
            <Link
              href="/nc"
              className="inline-block px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#087caa] hover:bg-[#065b7d] rounded transition-colors"
            >
              Start Conveyancing Intake
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

