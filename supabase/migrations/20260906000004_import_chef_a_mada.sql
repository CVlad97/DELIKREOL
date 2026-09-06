do $$
begin
  update public.vendors
  set legal_name = 'Chef à Mada',
      status = 'verified',
      is_public = true,
      is_active = true,
      is_demo = false,
      zone_label = 'Fort-de-France',
      commune = 'Fort-de-France',
      address = 'Fort-de-France, Martinique',
      description = 'Traiteur malgache et créole — ateliers culinaires, plats sur commande et événements.',
      story = 'Association Loi 1901 basée à Fort-de-France qui promeut la cuisine malgache et créole à travers des ateliers, prestations traiteur et événements culturels.',
      promise = 'Cuisine malgacho-créole authentique — ateliers et traiteur sur commande.',
      specialty = 'Cuisine malgache et créole, rougail, poulet massalé, samoussas et ateliers culinaires.',
      highlights = '["Association Loi 1901", "Cuisine malgache et créole", "Fort-de-France", "Ateliers culinaires", "HelloAsso"]'::jsonb,
      logo_url = 'https://delikreol.com/vendors/chef-a-mada/logo.jpg',
      hero_image = 'https://delikreol.com/vendors/chef-a-mada/logo.jpg',
      portrait_image = 'https://delikreol.com/vendors/chef-a-mada/logo.jpg',
      gallery_images = '["https://delikreol.com/vendors/chef-a-mada/logo.jpg"]'::jsonb,
      photo_status = 'confirmée',
      public_display_status = 'public confirmé',
      latitude = 14.6104,
      longitude = -61.0718,
      location = extensions.st_point(-61.0718, 14.6104)::extensions.geography,
      delivery_radius_km = greatest(coalesce(delivery_radius_km, 3), 3),
      updated_at = now()
  where lower(coalesce(business_name, name)) = lower('Chef à Mada');

  if not found then
    insert into public.vendors (
      name, business_name, legal_name, status, is_public, is_active, is_demo,
      zone_label, commune, address, description, story, promise, specialty,
      highlights, logo_url, hero_image, portrait_image, gallery_images,
      photo_status, public_display_status, latitude, longitude, location,
      delivery_radius_km, created_at, updated_at
    ) values (
      'Chef à Mada', 'Chef à Mada', 'Chef à Mada', 'verified', true, true, false,
      'Fort-de-France', 'Fort-de-France', 'Fort-de-France, Martinique',
      'Traiteur malgache et créole — ateliers culinaires, plats sur commande et événements.',
      'Association Loi 1901 basée à Fort-de-France qui promeut la cuisine malgache et créole à travers des ateliers, prestations traiteur et événements culturels.',
      'Cuisine malgacho-créole authentique — ateliers et traiteur sur commande.',
      'Cuisine malgache et créole, rougail, poulet massalé, samoussas et ateliers culinaires.',
      '["Association Loi 1901", "Cuisine malgache et créole", "Fort-de-France", "Ateliers culinaires", "HelloAsso"]'::jsonb,
      'https://delikreol.com/vendors/chef-a-mada/logo.jpg',
      'https://delikreol.com/vendors/chef-a-mada/logo.jpg',
      'https://delikreol.com/vendors/chef-a-mada/logo.jpg',
      '["https://delikreol.com/vendors/chef-a-mada/logo.jpg"]'::jsonb,
      'confirmée', 'public confirmé', 14.6104, -61.0718,
      extensions.st_point(-61.0718, 14.6104)::extensions.geography,
      3, now(), now()
    );
  end if;
end $$;
