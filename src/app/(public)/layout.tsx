import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <><a href="#main-content" className="skip-link">Skip to content</a><Header /><main id="main-content" className="site-main">{children}</main><Footer /></>;
}
