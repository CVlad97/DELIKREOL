import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { traiteurSpaces } from '../../data/traiteurs';
import { mockProducts } from '../../data/mockCatalog';
import { martiniqueCommunes } from '../../data/martiniqueCommunes';
import { calculateDistanceKm } from '../../services/geolocation';
import { resolveTraiteurCoords } from '../../services/partnerGeo';
import { ShoppingCart, MapPin, ChefHat, Truck, Store, Utensils, Package, CreditCard, MessageCircle, Phone, Eye, EyeOff, Users, Building2, Ship, Heart, Clock } from 'lucide-react';

type Onglet = 'parcours' | 'dashboard-partenaires' | 'dashboard-clients' | 'carte' | 'bases';

const FAKE_LAT = 14.6104;
const FAKE_LNG = -61.0718;

export default function DemoPage() {
  const [onglet, setOnglet] = useState<Onglet>('parcours');
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [mode, setMode] = useState<'retrait' | 'livraison'>('retrait');
  const [showPhone, setShowPhone] = useState(false);
  const [showCartePositions, setShowCartePositions] = useState(true);

  // Produits en vedette pour la démo
  const demoProducts = useMemo(() => mockProducts.slice(0, 12), []);

  // Traiteurs avec coordonnées résolues
  const traiteursAvecCoords = useMemo(() => traiteurSpaces
    .filter(t => t.status === 'public confirmé')
    .map(t => {
      const coords = resolveTraiteurCoords(t.zone, t.commune) || { latitude: FAKE_LAT, longitude: FAKE_LNG };
      return { ...t, ...coords };
    }), []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-4 uppercase tracking-wider">
            🧪 MODE DÉMO
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3">
            Découvrir <span className="text-primary">DELIKREOL</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Teste le parcours complet sans inscription. Explore les dashboards, la carte et les bases de données.
          </p>
        </div>

        {/* Onglets */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {[
            { id: 'parcours', label: '🛒 Parcours commande', icon: ShoppingCart },
            { id: 'dashboard-partenaires', label: '👨‍🍳 Dashboard partenaires', icon: ChefHat },
            { id: 'dashboard-clients', label: '👤 Dashboard client', icon: Users },
            { id: 'carte', label: '🗺️ Carte traiteurs', icon: MapPin },
            { id: 'bases', label: '🗄️ Bases', icon: Package },
          ].map(o => (
            <button key={o.id} onClick={() => setOnglet(o.id as Onglet)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all ${
                onglet === o.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white text-muted-foreground border border-input hover:border-primary/40'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* ─── PARCOURS COMMANDE ─────────────────────────────── */}
        {onglet === 'parcours' && (
          <div>
            {/* Stepper */}
            <div className="flex items-center justify-center gap-2 mb-8 text-sm">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    step >= s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}>{s}</div>
                  <span className={`text-xs ${step === s ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    {['Choisis', 'Panier', 'Mode', 'Confirme'][s-1]}
                  </span>
                  {s < 4 && <div className={`w-8 h-0.5 ${step > s ? 'bg-primary' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl border border-input p-6 md:p-8">
              {/* Step 1: Choix plat */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">1. Choisis ton plat</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {demoProducts.map(p => (
                      <button key={p.id} onClick={() => { setSelectedProduct(p); setStep(2); }}
                        className={`text-left p-3 rounded-2xl border-2 transition-all ${
                          selectedProduct?.id === p.id ? 'border-primary bg-primary/8' : 'border-input hover:border-primary/30'
                        }`}>
                        <div className="w-full h-20 rounded-xl bg-primary/8 mb-2 overflow-hidden">
                          {(p as any).image_url && <img src={(p as any).image_url} alt={p.name} className="w-full h-full object-cover" />}
                        </div>
                        <p className="text-xs font-bold truncate">{p.name}</p>
                        <p className="text-xs text-primary font-bold">{p.price?.toFixed(2)} €</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Panier */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">2. Ton panier</h2>
                  {selectedProduct && (
                    <div className="flex items-center gap-4 p-4 bg-primary/8 rounded-2xl">
                      <div className="w-16 h-16 rounded-xl bg-primary/15 overflow-hidden flex-shrink-0">
                        {selectedProduct.image_url && <img src={selectedProduct.image_url} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold">{selectedProduct.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedProduct.price?.toFixed(2)} €</p>
                      </div>
                      <span className="px-3 py-1 bg-primary text-white rounded-lg text-sm font-bold">1</span>
                    </div>
                  )}
                  <div className="mt-4 p-4 bg-muted rounded-2xl">
                    <div className="flex justify-between text-sm"><span>Sous-total</span><span className="font-bold">{selectedProduct?.price?.toFixed(2)} €</span></div>
                    <div className="flex justify-between text-sm mt-2 text-muted-foreground">
                      <span>Frais de service</span><span className={mode === 'retrait' ? 'text-success' : ''}>{mode === 'retrait' ? 'Gratuit' : 'À confirmer'}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold"><span>Total estimé</span><span className="text-primary">{selectedProduct?.price?.toFixed(2)} €</span></div>
                  </div>
                </div>
              )}

              {/* Step 3: Mode */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">3. Choisis ton mode</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { id: 'retrait', icon: Store, label: 'Retrait', desc: 'Gratuit — chez le partenaire', color: 'text-success bg-success/10' },
                      { id: 'livraison', icon: Truck, label: 'Livraison', desc: 'Programmée — à partir de 40€', color: 'text-primary bg-primary/8' },
                    ].map(m => (
                      <button key={m.id} onClick={() => { setMode(m.id as any); setStep(4); }}
                        className={`p-6 rounded-2xl border-2 text-left transition-all ${
                          mode === m.id ? 'border-primary bg-primary/8' : 'border-input hover:border-primary/30'
                        }`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${m.color} mb-3`}>
                          <m.icon className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-lg">{m.label}</p>
                        <p className="text-sm text-muted-foreground">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <MessageCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">4. Confirme sur WhatsApp</h2>
                  <p className="text-muted-foreground text-sm mb-4">
                    Ta commande est prête. Envoie-la sur WhatsApp pour validation.
                  </p>
                  <div className="p-4 bg-muted rounded-2xl text-left text-sm mb-4">
                    <p className="font-bold mb-2">📋 Récapitulatif</p>
                    <p>{selectedProduct?.name} × 1 — {selectedProduct?.price?.toFixed(2)} €</p>
                    <p>Mode : {mode === 'retrait' ? 'Retrait' : 'Livraison'}</p>
                  </div>
                  <a href={`https://wa.me/596696653589?text=${encodeURIComponent(`Bonjour, je souhaite commander : ${selectedProduct?.name}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-all">
                    <MessageCircle className="w-5 h-5" /> Confirmer sur WhatsApp
                  </a>
                  <p className="text-xs text-muted-foreground mt-2">Paiement en ligne bientôt disponible</p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}
                  className="px-4 py-2 rounded-xl border border-input text-sm font-semibold disabled:opacity-30">← Retour</button>
                {step < 4 && <button onClick={() => setStep(step + 1)}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-sm transition-all">Suivant →</button>}
                {step === 4 && <button onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl border border-primary/30 text-primary text-sm font-semibold">Recommencer</button>}
              </div>
            </div>
          </div>
        )}

        {/* ─── DASHBOARD PARTENAIRES ─────────────────────────── */}
        {onglet === 'dashboard-partenaires' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-input p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ChefHat className="w-6 h-6 text-primary" /> Dashboard Partenaire</h2>
              <p className="text-muted-foreground text-sm mb-6">Aperçu de ce que voit un traiteur connecté à son espace.</p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Commandes du jour', value: '3', sub: '+1 aujourd\'hui', color: 'bg-primary/8 text-primary' },
                  { label: 'Revenu du mois', value: '1 240 €', sub: '+15% vs juin', color: 'bg-success/10 text-success' },
                  { label: 'Avis clients', value: '4.8 ⭐', sub: '12 avis', color: 'bg-blue-50 text-blue-700' },
                ].map(k => (
                  <div key={k.label} className={`rounded-2xl p-5 ${k.color}`}>
                    <p className="text-xs opacity-70">{k.label}</p>
                    <p className="text-2xl font-black mt-1">{k.value}</p>
                    <p className="text-xs mt-1 opacity-70">{k.sub}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="font-bold text-sm mb-2">📋 Dernières commandes</p>
                {[
                  { id: 'DK-202607-001', client: 'Marie L.', plat: 'Colombo poulet', montant: '18.50 €', statut: 'À préparer' },
                  { id: 'DK-202607-002', client: 'Jean-Marc P.', plat: 'Foutou banane', montant: '15.00 €', statut: 'Prête' },
                  { id: 'DK-202607-003', client: 'Sophie A.', plat: 'Pépite coco ×3', montant: '12.00 €', statut: 'Livrée' },
                ].map(cmd => (
                  <div key={cmd.id} className="flex items-center justify-between p-3 bg-muted rounded-xl text-sm">
                    <div><span className="font-mono text-xs text-muted-foreground">{cmd.id}</span><p className="font-semibold">{cmd.client}</p></div>
                    <div className="text-right"><p>{cmd.plat}</p><span className="text-xs text-muted-foreground">{cmd.montant}</span></div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      cmd.statut === 'À préparer' ? 'bg-secondary/15 text-secondary' : cmd.statut === 'Prête' ? 'bg-blue-100 text-blue-700' : 'bg-success/15 text-success'
                    }`}>{cmd.statut}</span>
                  </div>
                ))}
              </div>
              <Link to="/partenaire?code=SAVEURS-PILOTE" className="inline-flex items-center gap-2 mt-4 text-sm text-primary font-bold hover:underline">
                Accéder à mon espace →
              </Link>
            </div>
          </div>
        )}

        {/* ─── DASHBOARD CLIENTS ─────────────────────────────── */}
        {onglet === 'dashboard-clients' && (
          <div className="bg-white rounded-3xl border border-input p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Users className="w-6 h-6 text-primary" /> Dashboard Client</h2>
            <p className="text-muted-foreground text-sm mb-6">Suis tes commandes, gère tes favoris et accède à tes informations.</p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Commandes en cours', value: '1', icon: Package },
                { label: 'Favoris', value: '5', icon: Heart },
                { label: 'Dernière commande', value: 'Il y a 3j', icon: Clock },
              ].map(k => (
                <div key={k.label} className="bg-muted rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                    <k.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div><p className="text-xs text-muted-foreground">{k.label}</p><p className="font-bold">{k.value}</p></div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-secondary/10 rounded-2xl border border-secondary/20">
              <p className="font-bold text-sm mb-1">📍 Commande en cours</p>
              <p className="text-sm">DK-202607-001 — Colombo poulet — <span className="text-secondary font-semibold">À confirmer sur WhatsApp</span></p>
              <Link to="/statut-commande" className="text-sm text-primary font-bold hover:underline mt-2 inline-block">Voir le suivi →</Link>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-2xl">
              <p className="font-bold text-sm mb-3">📋 Historique</p>
              {[
                { id: 'DK-202606-012', plat: 'Pépite tiramisu', date: '28/06/2026', total: '9.00 €', statut: 'Livrée' },
                { id: 'DK-202606-008', plat: 'Colombo poulet', date: '15/06/2026', total: '18.50 €', statut: 'Livrée' },
              ].map(h => (
                <div key={h.id} className="flex items-center justify-between text-sm py-2 border-b border-input last:border-0">
                  <span className="text-xs text-muted-foreground font-mono">{h.id}</span>
                  <span>{h.plat}</span>
                  <span className="text-muted-foreground">{h.total}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success">{h.statut}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── CARTE ─────────────────────────────────────────── */}
        {onglet === 'carte' && (
          <div className="bg-white rounded-3xl border border-input p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><MapPin className="w-6 h-6 text-primary" /> Carte des traiteurs</h2>
            <p className="text-muted-foreground text-sm mb-4">Positionnement de chaque partenaire DELIKREOL en Martinique.</p>
            <div className="bg-[#FFF8F0] rounded-2xl p-6 border border-primary/20 min-h-[400px] relative overflow-hidden">
              {/* Carte simplifiée Martinique */}
              <div className="relative w-full h-[400px] bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl overflow-hidden">
                {/* SVG simplifié de la Martinique avec positions */}
                <svg viewBox="0 0 600 400" className="w-full h-full">
                  {/* Fond carte */}
                  <rect width="600" height="400" fill="#FFF8F0" rx="12" />
                  {/* Contour Martinique (simplifié) */}
                  <path d="M 180 50 Q 250 20 350 40 Q 450 60 480 120 Q 500 180 450 250 Q 400 320 350 340 Q 280 370 200 350 Q 120 320 100 250 Q 80 180 100 120 Q 120 60 180 50 Z"
                    fill="#E8F5E9" stroke="#4CAF50" strokeWidth="2" strokeDasharray="4" />
                  <text x="300" y="200" textAnchor="middle" className="text-2xl font-black" fill="#2E7D32" opacity="0.2">MARTINIQUE</text>

                  {/* Positions traiteurs */}
                  {traiteursAvecCoords.map((t, i) => {
                    // Convertir coords lat/lng en positions SVG (approximatif pour Martinique)
                    const x = 100 + (t.longitude + 61.2) * 120;
                    const y = 380 - (t.latitude - 14.4) * 150;
                    return (
                      <g key={t.slug}>
                        <circle cx={x} cy={y} r={i === 0 ? 14 : 10} fill={['#F97316','#10B981','#3B82F6','#8B5CF6','#EC4899'][i] || '#F97316'} opacity={0.3} />
                        <circle cx={x} cy={y} r={i === 0 ? 8 : 6} fill={['#F97316','#10B981','#3B82F6','#8B5CF6','#EC4899'][i] || '#F97316'} stroke="white" strokeWidth="2" />
                        <text x={x + (i === 0 ? -12 : 12)} y={y - 10} textAnchor={i === 0 ? 'end' : 'start'} fontSize="10" fontWeight="bold" fill="#374151">
                          {t.name}
                        </text>
                        <text x={x + (i === 0 ? -12 : 12)} y={y + 2} textAnchor={i === 0 ? 'end' : 'start'} fontSize="8" fill="#9CA3AF">
                          {t.commune || t.zone}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Légende */}
              <div className="flex flex-wrap gap-3 mt-4">
                {traiteursAvecCoords.map((t, i) => (
                  <div key={t.slug} className="flex items-center gap-2 text-xs bg-white rounded-xl px-3 py-2 border border-input">
                    <div className={`w-3 h-3 rounded-full`}
                      style={{ backgroundColor: ['#F97316','#10B981','#3B82F6','#8B5CF6','#EC4899'][i] }} />
                    <span className="font-semibold">{t.name}</span>
                    <span className="text-muted-foreground">{t.commune || t.zone}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── BASES ─────────────────────────────────────────── */}
        {onglet === 'bases' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-input p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Package className="w-6 h-6 text-primary" /> Bases de données</h2>
              <p className="text-muted-foreground text-sm mb-6">Accès aux différentes tables et espaces du système.</p>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Traiteurs */}
                <div className="border border-primary/20 rounded-2xl p-5 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-3">
                    <ChefHat className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-sm mb-1">Traiteurs</h3>
                  <p className="text-xs text-muted-foreground mb-3">{traiteurSpaces.length} partenaires</p>
                  <div className="space-y-1 text-xs">
                    {traiteurSpaces.map(t => (
                      <div key={t.slug} className="flex justify-between py-1 border-b border-gray-50 last:border-0">
                        <span>{t.name}</span>
                        <span className="text-muted-foreground">{t.commune || t.zone}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          t.status === 'public confirmé' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
                        }`}>{t.status === 'public confirmé' ? '✅ Actif' : '⏳ Test'}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/traiteurs" className="text-xs text-primary font-bold hover:underline mt-2 inline-block">Voir la page →</Link>
                </div>

                {/* Livreurs */}
                <div className="border border-blue-100 rounded-2xl p-5 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-sm mb-1">Livreurs</h3>
                  <p className="text-xs text-muted-foreground mb-3">Table `driver_applications` (Supabase)</p>
                  <p className="text-xs text-muted-foreground mb-2">Inscription via le formulaire public.</p>
                  <Link to="/devenir-livreur" className="text-xs text-blue-600 font-bold hover:underline block">Devenir livreur →</Link>
                  <Link to="/admin/livreurs" className="text-xs text-blue-600 font-bold hover:underline block">Admin livreurs →</Link>
                </div>

                {/* Points relais */}
                <div className="border border-success/25 rounded-2xl p-5 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center mb-3">
                    <Store className="w-5 h-5 text-success" />
                  </div>
                  <h3 className="font-bold text-sm mb-1">Points relais</h3>
                  <p className="text-xs text-muted-foreground mb-3">Table `relay_point_applications` (Supabase)</p>
                  <p className="text-xs text-muted-foreground mb-2">Inscription via le formulaire public.</p>
                  <Link to="/devenir-point-relais" className="text-xs text-success font-bold hover:underline block">Devenir point relais →</Link>
                  <Link to="/admin/points-relais" className="text-xs text-success font-bold hover:underline block">Admin relais →</Link>
                </div>
              </div>

              {/* Dashboard admin */}
              <div className="mt-4 bg-muted rounded-2xl p-4 border border-input">
                <p className="font-bold text-sm mb-2">🔐 Accès administrateur</p>
                <div className="flex flex-wrap gap-2">
                  <Link to="/admin/dashboard" className="text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors">Dashboard</Link>
                  <Link to="/admin/livreurs" className="text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors">Livreurs</Link>
                  <Link to="/admin/points-relais" className="text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors">Points relais</Link>
                  <Link to="/admin/factures" className="text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors">Factures</Link>
                  <Link to="/admin/finance" className="text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors">Finance</Link>
                  <Link to="/admin/simulation" className="text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors">Simulation</Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA retour */}
        <div className="text-center mt-8">
          <Link to="/catalogue" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-lg shadow-primary/20">
            🛒 Voir le vrai catalogue
          </Link>
        </div>
      </div>
    </Layout>
  );
}