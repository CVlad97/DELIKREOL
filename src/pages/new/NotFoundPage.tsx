import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-display font-bold text-primary/20 mb-4">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Page introuvable</h1>
        <p className="text-muted-foreground mb-8">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            <Home className="w-4 h-4" />
            Accueil
          </Link>
          <Link to="/catalogue" className="inline-flex items-center gap-2 px-6 py-3 bg-secondary/10 text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/20 transition-colors">
            <Search className="w-4 h-4" />
            Catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
