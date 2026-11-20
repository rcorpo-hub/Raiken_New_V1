import '@/styles/managed-forms.css';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import {cookies} from 'next/headers';
import ColourPreview from '@/components/public/ColourPreview';
import '@/styles/colour-preview.css';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const preference = (await cookies()).get('raikan-colour-preview')?.value;
  return <ColourPreview initialColour={preference === 'blue' ? 'blue' : 'orange'}><a href="#main-content" className="skip-link">Skip to content</a><Header /><main id="main-content" className="site-main">{children}</main><Footer /></ColourPreview>;
}
