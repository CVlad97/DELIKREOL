-- Restore Snack Save Peyi'A from the owner-provided WhatsApp/Drive import.
-- Only visually verified product/photo matches are published. The two dishes
-- without a certain photo keep image_url null and therefore use the neutral
-- "photo a confirmer" fallback in the interface.

do $$
declare
  save_peyia_id uuid;
  composed_menu jsonb := jsonb_build_object(
    'sides', jsonb_build_array('Riz blanc', 'Riz lentilles', 'Legumes pays', 'Frites', 'Crudites'),
    'drinks', jsonb_build_array('Eau', 'Jus local du jour', 'Soda', 'Sans boisson'),
    'sauces', jsonb_build_array('Sauce chien', 'Sauce creole', 'Sauce piment a part', 'Sans sauce'),
    'included_side_count', 1,
    'included_drink_count', 1,
    'included_sauce_count', 1,
    'instructions_enabled', true
  );
begin
  select id into save_peyia_id
  from public.vendors
  where coalesce(business_name, name) ilike 'Snack%Peyi%A'
  limit 1;

  if save_peyia_id is null then
    raise exception 'Snack Save Peyi A vendor not found';
  end if;

  update public.products set
    name = 'Cote de porc', category = 'Plats', price = 12,
    image_url = 'https://delikreol.com/vendors/save-peyia/drive-reimport/IMG-20260710-WA0005.jpg',
    is_available = true, is_public = true, is_demo = false, status = 'verified', stock_quantity = 15,
    photo_status = 'confirmee', image_quality_status = 'validee', description_quality_status = 'validee',
    menu_options = composed_menu, updated_at = now()
  where vendor_id = save_peyia_id and source_key = 'save-peyia-cote-porc';

  update public.products set
    image_url = 'https://delikreol.com/vendors/save-peyia/drive-reimport/IMG-20260710-WA0007.jpg',
    is_available = true, is_public = true, is_demo = false, status = 'verified', stock_quantity = 15,
    photo_status = 'confirmee', image_quality_status = 'validee', description_quality_status = 'validee',
    menu_options = composed_menu, updated_at = now()
  where vendor_id = save_peyia_id and source_key = 'save-peyia-crevettes';

  update public.products set
    image_url = 'https://delikreol.com/vendors/save-peyia/drive-reimport/IMG-20260710-WA0008.jpg',
    is_available = true, is_public = true, is_demo = false, status = 'verified', stock_quantity = 15,
    photo_status = 'confirmee', image_quality_status = 'validee', description_quality_status = 'validee',
    menu_options = composed_menu, updated_at = now()
  where vendor_id = save_peyia_id and source_key = 'save-peyia-entrecote';

  update public.products set
    name = 'Le classique riz crevettes',
    description = 'Crevettes cuisinees aux oignons et assaisonnements maison, servies avec riz et crudites selon disponibilite.',
    category = 'Plats', price = 15,
    image_url = 'https://delikreol.com/vendors/save-peyia/drive-reimport/IMG-20260710-WA0009.jpg',
    source_key = 'save-peyia-riz-crevettes-classique',
    is_available = true, is_public = true, is_demo = false, status = 'verified', stock_quantity = 15,
    photo_status = 'confirmee', image_quality_status = 'validee', description_quality_status = 'validee',
    menu_options = composed_menu, updated_at = now()
  where vendor_id = save_peyia_id and source_key = 'save-peyia-bavette';

  update public.products set
    name = 'Panini saumon',
    description = 'Panini chaud garni de saumon, laitue, fromage rape et sauce maison, toaste sur place.',
    category = 'Snacking', price = 8,
    image_url = 'https://delikreol.com/vendors/save-peyia/drive-reimport/IMG-20260710-WA0006.jpg',
    ingredients = 'Pain panini, saumon, laitue, fromage rape, sauce maison.',
    allergens = 'Gluten, poisson, produits laitiers.',
    is_available = true, is_public = true, is_demo = false, status = 'verified', stock_quantity = 15,
    photo_status = 'confirmee', image_quality_status = 'validee', description_quality_status = 'validee',
    menu_options = null, updated_at = now()
  where vendor_id = save_peyia_id and source_key = 'save-peyia-panini-saumon';

  update public.products set
    name = 'Cocktail de fruits', category = 'Boisson', price = 6,
    image_url = 'https://delikreol.com/vendors/save-peyia/drive-reimport/IMG-20260710-WA0011.jpg',
    is_available = true, is_public = true, is_demo = false, status = 'verified', stock_quantity = 15,
    photo_status = 'confirmee', image_quality_status = 'validee', description_quality_status = 'validee',
    menu_options = null, updated_at = now()
  where vendor_id = save_peyia_id and source_key = 'save-peyia-cocktail-fruit';

  update public.products set
    name = 'Cocktail fruits avec alcool',
    description = 'Cocktail de fruits frais avec alcool, servi frais. Vente reservee aux adultes.',
    category = 'Boisson', price = 10,
    image_url = 'https://delikreol.com/vendors/save-peyia/drive-reimport/IMG-20260710-WA0012.jpg',
    is_available = true, is_public = true, is_demo = false, status = 'verified', stock_quantity = 15,
    photo_status = 'confirmee', image_quality_status = 'validee', description_quality_status = 'validee',
    menu_options = null, updated_at = now()
  where vendor_id = save_peyia_id and source_key = 'save-peyia-cocktail-alcool';

  update public.products set
    name = 'Salade de fruits frais',
    description = 'Salade de fruits frais de saison en coupelle.',
    category = 'Desserts', price = 6,
    image_url = 'https://delikreol.com/vendors/save-peyia/drive-reimport/IMG-20260710-WA0015.jpg',
    ingredients = 'Fruits frais de saison.', allergens = 'Aucun allergene connu, a confirmer.',
    is_available = true, is_public = true, is_demo = false, status = 'verified', stock_quantity = 15,
    photo_status = 'confirmee', image_quality_status = 'validee', description_quality_status = 'validee',
    menu_options = null, updated_at = now()
  where vendor_id = save_peyia_id and source_key = 'save-peyia-salade-fruits-assortie';

  update public.products set
    image_url = null, is_available = true, is_public = true, is_demo = false, status = 'verified', stock_quantity = 15,
    photo_status = 'a confirmer', image_quality_status = 'a valider', description_quality_status = 'validee',
    menu_options = composed_menu, updated_at = now()
  where vendor_id = save_peyia_id and source_key in ('save-peyia-filet-poulet', 'save-peyia-cote-agneau');

  if not exists (select 1 from public.products where vendor_id = save_peyia_id and source_key = 'save-peyia-cabri') then
    insert into public.products (
      vendor_id, name, description, category, price, image_url, is_available, stock_quantity,
      is_public, is_demo, status, photo_status, image_quality_status, description_quality_status,
      is_bankable, source_key, menu_options, ingredients, allergens
    ) values (
      save_peyia_id, 'Cabri', 'Cabri grille aux epices creoles, servi avec un accompagnement au choix.',
      'Plats', 16, 'https://delikreol.com/vendors/save-peyia/drive-reimport/IMG-20260710-WA0010.jpg', true, 15,
      true, false, 'verified', 'confirmee', 'validee', 'validee', true, 'save-peyia-cabri', composed_menu,
      'Cabri grille, epices, accompagnement au choix.', 'A confirmer avec le partenaire.'
    );
  end if;

  if not exists (select 1 from public.products where vendor_id = save_peyia_id and source_key = 'save-peyia-salade-fruits-rhum') then
    insert into public.products (
      vendor_id, name, description, category, price, image_url, is_available, stock_quantity,
      is_public, is_demo, status, photo_status, image_quality_status, description_quality_status,
      is_bankable, source_key, ingredients, allergens
    ) values (
      save_peyia_id, 'Salade de fruits au rhum', 'Salade de fruits frais de saison au rhum. Vente reservee aux adultes.',
      'Desserts', 10, 'https://delikreol.com/vendors/save-peyia/drive-reimport/IMG-20260710-WA0016.jpg', true, 15,
      true, false, 'verified', 'confirmee', 'validee', 'validee', true, 'save-peyia-salade-fruits-rhum',
      'Fruits frais de saison, rhum.', 'Alcool. Service reserve aux adultes.'
    );
  end if;
end $$;
