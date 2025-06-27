
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/context/CartContext';
import { Suspense } from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen">
        <Suspense>
          <Header />
        </Suspense>
        <main className="flex-grow container mx-auto px-12 py-8">
          <Suspense>
            {children}
          </Suspense>
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
