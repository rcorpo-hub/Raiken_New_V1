import type { Metadata } from 'next';
import { Maven_Pro, PT_Sans, Work_Sans } from 'next/font/google';
import '../styles/globals.css';
import MyStickyElements from '@/components/public/MyStickyElements';

const mavenPro = Maven_Pro({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-maven-pro',
  display: 'swap',
});

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
  display: 'swap',
});

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-work-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Raiken Corporation | Accounting, Conveyancing & Taxation Solutions Australia',
  description: 'National Australian advisory firm delivering specialized Accounting, Property Conveyancing, Taxation, and Business Structuring across Adelaide, Brisbane, and Perth.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${mavenPro.variable} ${ptSans.variable} ${workSans.variable}`}>
      <body className="min-h-screen flex flex-col bg-white text-[#454545] antialiased">
        <MyStickyElements />
        {children}
      </body>
    </html>
  );
}
