import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowRight, ChefHat, Clock3, Sparkles, Star, UtensilsCrossed } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  buildCustomerSpaceLink,
  buildTraiteurSpaceLink,
  featuredTraiteurSpaces,
  formatEuro,
  getTraiteurSpaceBySlug,
  traiteurSpaces,
} from '@/data/traiteurs';

export function TraiteursPage() {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const [activeSlug, setActiveSlug] = useState(featuredTraiteurSpaces[0]?.slug ?? traiteurSpaces[0]?.slug ?? '');
  const saveursDemoEmail = 'saveurs.afrique@demo.delikreol.local';
  const saveursDemoUserId = 'demo_vendor_saveurs_afrique';

  useEffect(() => {
    document.title = 'DELIKREOL | Espaces traiteurs';
    upsertMeta('description', 'Découvrez les espaces traiteurs DELIKREOL avec description, prix, menu et accès commande direct.');
    upsertMeta('og:title', 'DELIKREOL | Espaces traiteurs');
    upsertMeta('og:description', 'Chaque traiteur dispose de son espace dédié avec ses plats, ses prix et ses accès commande.');
  }, []);

  useEffect(() => {
    const vendorSlug = new URLSearchParams(window.location.search).get('vendor');
    const vendorSpace = vendorSlug ? getTraiteurSpaceBySlug(vendorSlug) : null;
    if (vendorSpace) {
      setActiveSlug(vendorSpace.slug);
    }
  }, []);

  useEffect(() => {
    if (!activeSlug) return;
    const params = new URLSearchParams(window.location.search);
    params.set('view', 'traiteurs');
    params.set('vendor', activeSlug);
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', nextUrl);
  }, [activeSlug]);

  const activeSpace = useMemo(
    () => getTraiteurSpaceBySlug(activeSlug) ?? featuredTraiteurSpaces[0] ?? traiteurSpaces[0],
    [activeSlug],
  );
  const isSaveursAfrique = activeSpace.name === "Saveurs d'Afrique";

  const totalItems = useMemo(() => traiteurSpaces.reduce((sum, space) => sum + space.menuItems.length, 0), []);
  const lowestPrice = useMemo(() => {
    const prices = traiteurSpaces.flatMap((space) => space.menuItems.map((item) => item.price));
    return prices.length ? Math.min(...prices) : 0;
  }, []);
  const averageTicket = useMemo(() => {
    const total = traiteurSpaces.reduce((sum, space) => sum + space.averageTicket, 0);
    return traiteurSpaces.length ? total / traiteurSpaces.length : 0;
  }, []);

  const activateSaveursDemoAccess = () => {
    const demoProfile = {
      id: saveursDemoUserId,
      full_name: "Saveurs d'Afrique",
      phone: '+596696677679',
      user_type: 'vendor' as const,
      avatar_url: null,
      created_at: new Date().toISOString(),
      email: saveursDemoEmail,
    };

    localStorage.setItem('delikreol_demo_profiles', JSON.stringify([demoProfile]));
    localStorage.setItem('delikreol_demo_session', JSON.stringify({ userId: saveursDemoUserId, email: saveursDemoEmail }));
    localStorage.setItem('delikreol_demo_override', 'true');
    window.location.href = `${baseUrl}?view=partner-documents`;
  };

  return (
    <div className="min-h-screen bg-[#fbf4ea] text-[#2a190f]">
      <header className="border-b border-white/80 bg-[#fff8ec]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <a href={`${baseUrl}?view=customer`} className="flex items-center gap-3 rounded-2xl px-2 py-1">
            <img src={`${baseUrl}branding/logo-mark.svg`} alt="DELIKREOL" className="h-11 w-11 rounded-2xl bg-white p-1.5 shadow-sm" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#c2410c]">Espace traiteurs</p>
              <p className="text-lg font-black tracking-tight text-[#2a190f]">DELIKREOL</p>
            </div>
          </a>
          <div className="flex flex-wrap gap-2">
            <a
              href={`${baseUrl}?view=customer#catalogue`}
              className="inline-flex items-center justify-center rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-black text-[#7c2d12] shadow-sm transition hover:-translate-y-0.5"
            >
              Retour catalogue
            </a>
            <a
              href={`${baseUrl}?view=pro`}
              className="inline-flex items-center justify-center rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-black text-[#7c2d12] shadow-sm transition hover:-translate-y-0.5"
            >
              Espace pro
            </a>
            <a
              href={`${baseUrl}?view=customer`}
              className="inline-flex items-center justify-center rounded-full bg-[#d95f2d] px-4 py-2 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5"
            >
              Commander
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
        <section className="rounded-[2.25rem] border border-orange-100 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full bg-[#fff3e5] text-[#7c2d12] hover:bg-[#fff3e5]">
              Espaces dédiés
            </Badge>
            <Badge variant="outline" className="rounded-full border-orange-200 text-[#7c2d12]">
              {traiteurSpaces.length} traiteurs
            </Badge>
            <Badge variant="outline" className="rounded-full border-orange-200 text-[#7c2d12]">
              {totalItems} références
            </Badge>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c2410c]">Vitrines locales</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">
                Des espaces traiteurs clairs, des prix lisibles, une commande directe.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
                Chaque traiteur dispose de sa propre vitrine avec description, menu, prix de départ et accès immédiat vers le catalogue client.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard icon={<UtensilsCrossed className="h-5 w-5" />} label="Espaces" value={`${traiteurSpaces.length}`} />
                <MetricCard icon={<Sparkles className="h-5 w-5" />} label="Références" value={`${totalItems}`} />
                <MetricCard icon={<Star className="h-5 w-5" />} label="À partir de" value={formatEuro(lowestPrice)} />
                <MetricCard icon={<Clock3 className="h-5 w-5" />} label="Panier moyen" value={formatEuro(averageTicket)} />
              </div>
            </div>

            <Card className="overflow-hidden border-orange-100 bg-[#24170f] text-white shadow-elegant">
              <CardContent className="p-0">
                <div className={`relative overflow-hidden bg-gradient-to-br ${activeSpace.gradient} p-6`}>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="rounded-full bg-white/15 text-white hover:bg-white/15">
                      {activeSpace.offer}
                    </Badge>
                    <Badge variant="outline" className="rounded-full border-white/25 text-white">
                      {activeSpace.zone}
                    </Badge>
                  </div>
                  <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_190px]">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-white/70">Espace en avant</p>
                      <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{activeSpace.name}</h2>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-white/90 sm:text-base">
                        {activeSpace.description}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Button asChild className="bg-white text-[#2a190f] shadow-lg shadow-black/10 hover:bg-white/90">
                          <a href={buildCustomerSpaceLink(baseUrl, activeSpace.slug)}>
                            Commander ce traiteur
                            <ArrowRight className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button asChild variant="outline" className="border-white/35 bg-white/5 text-white hover:bg-white/12 hover:text-white">
                          <a href={buildTraiteurSpaceLink(baseUrl, activeSpace.slug)}>Ouvrir la vitrine</a>
                        </Button>
                      </div>

                      {isSaveursAfrique && (
                        <div className="mt-5 rounded-[1.4rem] border border-white/15 bg-white/10 p-4 backdrop-blur">
                          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/70">
                            Accès vendeur démo
                          </p>
                          <p className="mt-2 text-sm leading-6 text-white/90">
                            Email: <span className="font-black">{saveursDemoEmail}</span> · Mot de passe au choix en mode test.
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                              type="button"
                              onClick={activateSaveursDemoAccess}
                              className="bg-white text-[#2a190f] shadow-lg shadow-black/10 hover:bg-white/90"
                            >
                              Activer l’accès
                            </Button>
                            <Button
                              asChild
                              variant="outline"
                              className="border-white/35 bg-white/5 text-white hover:bg-white/12 hover:text-white"
                            >
                              <a href={`${baseUrl}?view=pro`}>Voir l’espace pro</a>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="overflow-hidden rounded-[1.5rem] border border-white/15 bg-white/10 p-3 shadow-xl backdrop-blur">
                      {activeSpace.heroImage ? (
                        <img
                          src={activeSpace.heroImage}
                          alt={activeSpace.name}
                          className="h-full min-h-[200px] w-full rounded-[1.1rem] object-cover"
                        />
                      ) : (
                        <div className="flex min-h-[200px] items-center justify-center rounded-[1.1rem] bg-white/10">
                          <div className="text-center">
                            <ChefHat className="mx-auto h-10 w-10 text-white" />
                            <p className="mt-3 text-sm font-black uppercase tracking-[0.18em] text-white/80">
                              Vitrine locale
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 p-6 sm:grid-cols-3">
                  <MiniStat label="Prix de départ" value={formatEuro(activeSpace.startingAt)} />
                  <MiniStat label="Panier moyen" value={formatEuro(activeSpace.averageTicket)} />
                  <MiniStat label="Délai" value={activeSpace.turnaround} />
                </div>

                <Separator className="mx-6 bg-orange-100" />

                <div className="p-6">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#c2410c]">Points forts</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeSpace.highlights.map((item) => (
                      <Badge key={item} variant="outline" className="rounded-full border-orange-200 bg-[#fffaf3] text-[#7c2d12]">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                {activeSpace.galleryImages.length > 0 && (
                  <div className="grid gap-3 px-6 pb-6 sm:grid-cols-2">
                    {activeSpace.galleryImages.map((image) => (
                      <div key={image} className="overflow-hidden rounded-[1.4rem] border border-orange-100 bg-[#fffaf3] shadow-sm">
                        <img src={image} alt={activeSpace.name} className="h-44 w-full object-cover" loading="lazy" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-8">
          <Tabs value={activeSlug} onValueChange={setActiveSlug}>
            <div className="rounded-[2rem] border border-orange-100 bg-white p-4 shadow-soft">
              <TabsList className="flex w-full flex-col gap-2 bg-transparent p-0 sm:flex-row">
                {traiteurSpaces.map((space) => (
                  <TabsTrigger
                    key={space.slug}
                    value={space.slug}
                    className="flex-1 rounded-[1.25rem] border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm font-black text-[#5a4334] shadow-sm data-[state=active]:border-transparent data-[state=active]:bg-[#24170f] data-[state=active]:text-white"
                  >
                    {space.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {traiteurSpaces.map((space) => (
              <TabsContent key={space.slug} value={space.slug} className="mt-6">
                <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                  <Card className="overflow-hidden border-orange-100 bg-white shadow-soft">
                    <CardHeader className={`bg-gradient-to-br ${space.gradient} text-white`}>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="rounded-full bg-white/15 text-white hover:bg-white/15">
                          {space.offer}
                        </Badge>
                        <Badge variant="outline" className="rounded-full border-white/25 text-white">
                          {space.zone}
                        </Badge>
                      </div>
                      <CardTitle className="mt-4 text-3xl text-white">{space.name}</CardTitle>
                      <CardDescription className="max-w-xl text-white/90">{space.story}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5 p-6">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <MiniStat label="À partir de" value={formatEuro(space.startingAt)} />
                        <MiniStat label="Panier moyen" value={formatEuro(space.averageTicket)} />
                      </div>

                      <div className="rounded-[1.35rem] border border-orange-100 bg-[#fffaf3] p-4">
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#c2410c]">Spécialité</p>
                        <p className="mt-2 text-sm leading-6 text-stone-600">{space.specialty}</p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <MiniStat label="Disponibilité" value={space.availability} />
                        <MiniStat label="Préparation" value={space.turnaround} />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {space.highlights.slice(0, 5).map((item) => (
                          <Badge key={item} variant="outline" className="rounded-full border-orange-200 bg-[#fffaf3] text-[#7c2d12]">
                            {item}
                          </Badge>
                        ))}
                      </div>

                      <Separator className="bg-orange-100" />

                      <div className="flex flex-wrap gap-3">
                        <Button asChild className="bg-[#d95f2d] text-white shadow-lg shadow-orange-500/20 hover:bg-[#c85529]">
                          <a href={buildCustomerSpaceLink(baseUrl, space.slug)}>
                            Commander ce traiteur
                            <ArrowRight className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button asChild variant="outline" className="border-orange-200 bg-white text-[#7c2d12] hover:bg-[#fff8ef]">
                          <a href={buildTraiteurSpaceLink(baseUrl, space.slug)}>Partager la vitrine</a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-100 bg-white shadow-soft">
                    <CardHeader>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#c2410c]">Menu & prix</p>
                      <CardTitle className="text-2xl text-[#2a190f]">Carte du moment</CardTitle>
                      <CardDescription>Descriptions et tarifs issus du catalogue local.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {space.menuItems.map((item) => (
                        <div key={item.name} className="overflow-hidden rounded-[1.25rem] border border-orange-100 bg-[#fffaf4] shadow-sm">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="h-44 w-full object-cover" loading="lazy" />
                          )}
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-black text-[#2a190f]">{item.name}</p>
                                  {item.featured && (
                                    <Badge variant="secondary" className="rounded-full bg-[#ecfeff] text-[#0f766e] hover:bg-[#ecfeff]">
                                      Signature
                                    </Badge>
                                  )}
                                </div>
                                <p className="mt-1 text-sm leading-6 text-stone-600">{item.description}</p>
                              </div>
                              <p className="shrink-0 text-lg font-black text-[#c2410c]">{formatEuro(item.price)}</p>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge variant="outline" className="rounded-full border-orange-200 bg-white text-[#7c2d12]">
                                {item.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>
      </main>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-orange-100 bg-[#fffaf4] p-4 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff3e5] text-[#d95f2d]">{icon}</div>
      <p className="mt-3 text-[11px] font-black uppercase tracking-[0.22em] text-stone-400">{label}</p>
      <p className="mt-1 text-lg font-black text-[#2a190f]">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-orange-100 bg-[#fffaf4] p-4 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#c2410c]">{label}</p>
      <p className="mt-2 text-base font-black text-[#2a190f]">{value}</p>
    </div>
  );
}

function upsertMeta(name: string, content: string) {
  const selector = `meta[name="${name}"]`;
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}
