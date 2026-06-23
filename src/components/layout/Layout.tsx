import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileCartBar } from './MobileCartBar';
import { FloatingFeedbackButton } from './FloatingFeedbackButton';
import { CookieConsent } from '../CookieConsent';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {title && (
          <div className="px-4 pt-6 pb-2 max-w-7xl mx-auto w-full">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          </div>
        )}
        {children}
      </main>

      <Footer />

      {/* Signalement rapide visible partout */}
      <FloatingFeedbackButton />

      {/* Floating mobile cart bar — sticks to bottom on small screens */}
      <MobileCartBar />

      {/* Cookie consent banner */}
      <CookieConsent />
    </div>
  );
}
