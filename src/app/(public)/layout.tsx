import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import WelcomeModal from '@/components/public/WelcomeModal';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <Footer />
      <WelcomeModal />
    </>
  );
}
