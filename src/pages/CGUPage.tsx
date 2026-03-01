import { ArrowLeft } from 'lucide-react';

interface CGUPageProps {
  onBack: () => void;
}

export function CGUPage({ onBack }: CGUPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <h1 className="text-3xl md:text-4xl font-black mb-6">Conditions Generales d'Utilisation (CGU)</h1>

        <div className="space-y-5 text-slate-300 leading-relaxed">
          <p>
            Les presentes conditions definissent les regles d'utilisation de la plateforme Delikreol,
            place de marche dediee aux produits martiniquais et aux services logistiques associes.
          </p>
          <p>
            En creant un compte, en passant commande ou en utilisant les services Delikreol, vous acceptez
            ces CGU. Les conditions legales definitives doivent etre validees par un conseil juridique avant
            mise en production commerciale.
          </p>
          <p>
            Delikreol agit en qualite d'intermediaire technologique entre clients, fournisseurs, points relais
            et transporteurs. Chaque partenaire reste responsable de la conformite de ses produits, de ses prix
            et de ses obligations reglementaires.
          </p>
          <p>
            Pour les details complets (paiement, annulation, remboursement, responsabilites), consultez
            egalement les pages « Conditions d'utilisation », « Confidentialite » et « Mentions legales ».
          </p>
        </div>
      </div>
    </div>
  );
}
