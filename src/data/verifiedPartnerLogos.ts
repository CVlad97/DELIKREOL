/** Verified, locally hosted partner brand assets. Do not infer logos from food photographs. */
const VERIFIED_LOGOS: Record<string, string> = {
  'chef-a-mada': 'vendors/chef-a-mada/logo.jpg',
  'les-delices-de-ninice': 'vendors/ninice/logo-les-delices-de-ninice.webp',
};

export function getVerifiedPartnerLogo(slug: string): string | null {
  const asset = VERIFIED_LOGOS[slug];
  return asset ? `${import.meta.env.BASE_URL}${asset}` : null;
}
