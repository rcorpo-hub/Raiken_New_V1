import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, BookOpen } from 'lucide-react';

const BLOG_POSTS = [
  {
    slug: 'to-do-when-selling-property-adelaide-conveyancing',
    title: 'To Do When Selling Property Adelaide Conveyancing',
    date: 'March 27, 2021',
    excerpt: 'Essential checklist and legal requirements when selling real estate in South Australia, including Form 1 cooling-off, discharge authorities, and identity verification.',
  },
  {
    slug: 'conveyancers',
    title: 'Conveyancers: Roles, Legal Settlement & Protection',
    date: 'March 29, 2021',
    excerpt: 'Understanding the role of a licensed Australian conveyancer in property transfers, contract drafting, title searches, and mortgage settlement representation.',
  },
];

export default function BlogIndexPage() {
  return (
    <div className="w-full font-sans bg-[#fafafa] py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-5xl font-heading font-normal text-[#2a2a2a] mb-2">
            Conveyancing &amp; Legal Insights
          </h1>
          <div className="w-16 h-1 bg-[#087caa] mx-auto mb-4" />
          <p className="text-sm text-[#454545] max-w-xl mx-auto">
            Official legal advisories, seller checklists, and conveyancing guides from the Raikan Corporation team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="bg-white border border-[#e5e5e5] rounded-xl p-8 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#087caa] mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{post.date}</span>
                </div>
                <h2 className="text-xl font-heading font-medium text-[#2a2a2a] mb-3 leading-snug">
                  <Link href={`/blog/${post.slug}`} className="hover:text-[#087caa] transition-colors">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-sm text-[#666666] leading-relaxed mb-6">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#087caa] hover:text-[#065b7d] transition-colors"
                >
                  Read Full Advisory <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
