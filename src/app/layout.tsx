import type { Metadata } from 'next';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import '../styles/globals.css';
import '../styles/redesign.css';

const sans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });
const display = DM_Serif_Display({ subsets: ['latin'], weight: '400', variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  title: 'Raikan Corporation | Good advice. Less paperwork.',
  description: 'Tax, business accounts and property matters, explained clearly. Meet Raikan Corporation in Adelaide, Brisbane and Perth.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-scroll-behavior="smooth" className={`${sans.variable} ${display.variable}`}><body className="raikan-site">{children}</body></html>;
}
