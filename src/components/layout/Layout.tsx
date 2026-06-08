import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileCartBar } from './MobileCartBar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {children}
      </main>

      <Footer />

      {/* Floating mobile cart bar — sticks to bottom on small screens */}
      <MobileCartBar />
    </div>
  );
}
