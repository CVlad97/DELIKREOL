/**
 * Service SEO — Utilitaires pour le référencement local Martinique de DeliKreol
 *
 * Fournit des fonctions pour :
 * - Définir les balises meta (OG, Twitter, description, keywords) dynamiquement
 * - Générer des objets JSON-LD schema.org (LocalBusiness/Restaurant, BreadcrumbList)
 *
 * @module seo
 */

/** Types supportés pour les métadonnées Open Graph / Twitter */
export interface MetaConfig {
  title: string;
  description: string;
  keywords?: string;
}

/**
 * Réinitialise ou crée les balises meta OG, Twitter, description et keywords dans le <head>.
 * Remplace les contenus existants pour les balises ciblées.
 *
 * @param title   - Titre de la page (og:title, twitter:title, document.title)
 * @param description - Description de la page (og:description, twitter:description, meta description)
 * @param keywords   - Mots-clés (meta keywords, optionnel)
 *
 * @example
 * setPageMeta(
 *   'Ninice - Fort-de-France - Plats créoles Martinique',
 *   'Découvrez Les Délices de Ninice à Fort-de-France. Traiteur créole et livraison repas Martinique.',
 *   'ninice, fort-de-france, livraison repas Martinique, plats créoles'
 * );
 */
export function setPageMeta(title: string, description: string, keywords?: string): void {
  document.title = title;

  /**
   * Helper interne : crée ou met à jour une balise meta.
   * @param attr - Nom de l'attribut ('name' ou 'property')
   * @param key  - Valeur de l'attribut (name ou property)
   * @param content - Contenu de la balise
   */
  const upsertMeta = (attr: 'name' | 'property', key: string, content: string): void => {
    const selector = `meta[${attr}="${key}"]`;
    let el = document.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Open Graph
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);

  // Twitter Card
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', description);

  // Meta description & keywords
  upsertMeta('name', 'description', description);
  if (keywords !== undefined) {
    upsertMeta('name', 'keywords', keywords);
  }
}

/**
 * Génère un objet JSON-LD pour schema.org LocalBusiness (ou Restaurant si le nom est fourni).
 * Adapté au contexte Martinique (areaServed, geo, coordonnées).
 *
 * @param commune - Commune martiniquaise (ex: "Fort-de-France", "Ducos")
 * @param name    - Nom de l'établissement (ex: "Ninice", "Coco's Food")
 * @returns Objet JSON-LD brut, à sérialiser avec JSON.stringify
 *
 * @example
 * const schema = getLocalBusinessSchema('Fort-de-France', 'Ninice');
 * // → { "@context": "https://schema.org", "@type": "Restaurant", ... }
 */
export function getLocalBusinessSchema(commune?: string, name?: string): Record<string, unknown> {
  const base: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': name ? 'Restaurant' : 'LocalBusiness',
    name: name || 'DeliKreol',
    description: 'Commande de plats créoles en Martinique. Traiteurs locaux, livraison et retrait.',
    url: 'https://cvlad97.github.io/DELIKREOL/',
    telephone: '+596696653589',
    email: 'contact@delikreol.mq',
    areaServed: [
      {
        '@type': 'Country',
        name: 'Martinique',
        sameAs: 'https://fr.wikipedia.org/wiki/Martinique',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: commune || 'Martinique',
      addressCountry: 'MQ',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 14.6,
      longitude: -61.0,
    },
    sameAs: [
      'https://wa.me/596696653589',
    ],
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Monday', opens: '08:00', closes: '19:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Tuesday', opens: '08:00', closes: '19:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Wednesday', opens: '08:00', closes: '19:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Thursday', opens: '08:00', closes: '19:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday', opens: '08:00', closes: '19:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '16:00' },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 4.8,
      bestRating: 5,
      ratingCount: 27,
      reviewCount: 27,
    },
  };

  if (commune) {
    base.address = {
      '@type': 'PostalAddress',
      addressLocality: commune,
      addressCountry: 'MQ',
    };
  }

  return base;
}

/**
 * Génère un objet JSON-LD pour schema.org BreadcrumbList.
 *
 * @param items - Liste d'éléments { name, url } représentant le fil d'Ariane
 * @returns Objet JSON-LD brut
 *
 * @example
 * const breadcrumb = getBreadcrumbSchema([
 *   { name: 'Accueil', url: 'https://cvlad97.github.io/DELIKREOL/' },
 *   { name: 'Traiteurs', url: 'https://cvlad97.github.io/DELIKREOL/#/traiteurs' },
 *   { name: 'Ninice', url: 'https://cvlad97.github.io/DELIKREOL/#/traiteur/ninice' },
 * ]);
 */
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}