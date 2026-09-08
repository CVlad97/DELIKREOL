-- Grant the confirmed DELIKREOL administration account its database profile.
do $$
declare
  target_user_id uuid;
begin
  select id into target_user_id
  from auth.users
  where lower(email) = lower('contactcvs@ikabay.store')
  limit 1;

  if target_user_id is null then
    raise exception 'Compte Auth contactcvs@ikabay.store introuvable';
  end if;

  insert into public.profiles (id, email, full_name, user_type, role, created_at, updated_at)
  values (
    target_user_id,
    'contactcvs@ikabay.store',
    'Administration DELIKREOL',
    'admin',
    'admin',
    now(),
    now()
  )
  on conflict (id) do update
  set email = excluded.email,
      user_type = 'admin',
      role = 'admin',
      updated_at = now();
end
$$;
