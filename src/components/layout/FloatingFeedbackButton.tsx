import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export function FloatingFeedbackButton() {
  return (
    <Link
      to="/feedback"
      className="fixed right-3 bottom-24 sm:right-5 sm:bottom-5 z-50 inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-3 text-sm font-black text-white shadow-xl shadow-red-200 transition hover:-translate-y-0.5 hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-200"
      aria-label="Signaler un problème"
      title="Signaler un problème"
    >
      <AlertTriangle className="h-5 w-5" />
      <span className="hidden xs:inline sm:inline">Signaler un problème</span>
      <span className="xs:hidden sm:hidden">Problème</span>
    </Link>
  );
}
