import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, MapPin, Phone } from 'lucide-react';

const WHATSAPP_NUMBER = '596696653589';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
const WHATSAPP_DISPLAY = '+596 696 65 35 89';
const CONTACT_EMAIL = 'contact@delikreol.mq';

const quickLinks = [
  { label: 'Catalogue', to: '/catalogue' },
  { label: 'Traiteurs', to: '/traiteurs' },
  { label: 'Devis traiteur', to: '/devis' },
  { label: 'Devenir partenaire', to: '/devenir-partenaire' },
  { label: 'Devenir livreur', to: '/devenir-livreur' },
  { label: 'Points relais', to: '/points-relais' },
  { label: 'Aide', to: '/aide' },
];

const legalLinks = [
  { label: 'CGV', to: '/cgv' },
  { label: 'CGU', to: '/cgu' },
  { label: 'Politique de confidentialité', to: '/confidentialite' },
  { label: 'Mentions légales', to: '/mentions-legales' },
];

export function Footer() {
  return (
    <footer className="relative mt-auto border-t border-border/40">
      {/* Madras strip */}
      <div className="madras-strip" />

      <div className="bg-gradient-to-b from-white to-muted/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="mb-12 rounded-[2rem] bg-gradient-to-br from-stone-950 via-emerald-950 to-orange-700 p-6 text-white shadow-[0_28px_80px_-52px_rgba(42,25,15,0.8)] md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-200">
                  DeliKreol opérationnel
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
                  Commande client, demande pro ou partenariat.
                </h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/catalogue"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white transition-all hover:bg-orange-600"
                >
                  Catalogue
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/devis"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white transition-all hover:bg-white/20"
                >
                  Demande pro
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link to="/" className="inline-flex items-center gap-2 group">
                <img
                  src={`${import.meta.env.BASE_URL || '/'}branding/logo-mark.svg`}
                  alt="Logo DeliKreol"
                  className="brand-logo-frame h-10 w-10 rounded-2xl object-contain p-1.5 transition-transform group-hover:scale-105"
                />
                <span className="text-lg font-bold tracking-tight text-foreground">
                  Deli<span className="text-primary">Kreol</span>
                </span>
              </Link>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
                Le goût local, simple à commander.
              </p>

              {/* Social */}
              <div className="mt-5 flex items-center gap-3">
                <a
                  href="https://instagram.com/delikreol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-card border border-border/60 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a
                  href="https://facebook.com/delikreol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-card border border-border/60 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
                Liens rapides
              </h3>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
                Contact
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-accent transition-colors group"
                  >
                    <MessageCircle className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                    {WHATSAPP_DISPLAY}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {CONTACT_EMAIL}
                  </a>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Martinique, Antilles françaises</span>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
                Informations légales
              </h3>
              <ul className="space-y-2.5">
                {legalLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/livraison"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Infos livraison
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © 2026 DeliKreol — Martinique. Tous droits réservés. Propriété exclusive.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Fait avec 🧡 en Martinique
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
