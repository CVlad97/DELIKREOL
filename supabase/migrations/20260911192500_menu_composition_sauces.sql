-- Composition menu complète : accompagnements + boissons + sauces + consignes.
-- Appliqué en production le 2026-09-11 via connecteur Supabase.
-- Objectif : cases à cocher utiles sans forcer une composition absurde sur boissons/desserts.

update public.products
set menu_options = null,
    updated_at = now()
where is_public = true
  and is_available = true
  and status = 'verified'
  and (
    lower(coalesce(category,'')) in ('boissons','desserts','glaces')
    or lower(coalesce(name,'')) like '%cocktail%'
    or lower(coalesce(name,'')) like '%jus%'
  );

update public.products
set menu_options = jsonb_build_object(
    'sides', jsonb_build_array('Riz blanc', 'Riz lentilles', 'Légumes pays', 'Frites', 'Crudités'),
    'drinks', jsonb_build_array('Eau', 'Jus local du jour', 'Soda', 'Sans boisson'),
    'sauces', jsonb_build_array('Sauce chien', 'Sauce créole', 'Sauce piment à part', 'Sans sauce'),
    'included_side_count', 1,
    'included_drink_count', 1,
    'included_sauce_count', 1,
    'instructions_enabled', true
  ),
  updated_at = now()
where is_public = true
  and is_available = true
  and status = 'verified'
  and lower(coalesce(category,'')) = 'plats'
  and lower(coalesce(name,'')) not like '%cocktail%'
  and lower(coalesce(name,'')) not like '%jus%';

update public.products
set menu_options = jsonb_build_object(
    'sides', jsonb_build_array('Crudités', 'Légumes pays', 'Sans accompagnement'),
    'drinks', jsonb_build_array('Eau', 'Jus local du jour', 'Soda', 'Sans boisson'),
    'sauces', jsonb_build_array('Sauce chien', 'Sauce créole', 'Sauce piment à part', 'Sans sauce'),
    'included_side_count', 1,
    'included_drink_count', 1,
    'included_sauce_count', 1,
    'instructions_enabled', true
  ),
  updated_at = now()
where is_public = true
  and is_available = true
  and status = 'verified'
  and lower(coalesce(category,'')) in ('pâtes','pates','bowl');

update public.products
set menu_options = jsonb_build_object(
    'sides', jsonb_build_array('Frites', 'Crudités', 'Sans accompagnement'),
    'drinks', jsonb_build_array('Eau', 'Jus local du jour', 'Soda', 'Sans boisson'),
    'sauces', jsonb_build_array('Sauce chien', 'Sauce créole', 'Sauce piment à part', 'Sans sauce'),
    'included_side_count', 1,
    'included_drink_count', 1,
    'included_sauce_count', 1,
    'instructions_enabled', true
  ),
  updated_at = now()
where is_public = true
  and is_available = true
  and status = 'verified'
  and lower(coalesce(category,'')) in ('snacking','apéritifs','aperitifs')
  and lower(coalesce(name,'')) not like '%cocktail%'
  and lower(coalesce(name,'')) not like '%jus%';
