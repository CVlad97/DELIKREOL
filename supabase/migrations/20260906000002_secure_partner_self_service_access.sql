-- Secure partner self-service access and catalog editing.

alter table public.partner_corrections
  add column if not exists access_code text,
  add column if not exists partner_name text,
  add column if not exists user_agent text;

create unique index if not exists idx_vendors_one_account
  on public.vendors(user_id) where user_id is not null;

create or replace function private.guard_partner_vendor_write()
returns trigger language plpgsql security definer
set search_path=public,private
as $$
begin
  if (select auth.uid()) is not null and not private.is_delikreol_admin() then
    if tg_op='INSERT' then
      new.user_id := (select auth.uid());
      new.status := 'draft'; new.is_public := false; new.is_demo := false;
      new.commission_rate := 15;
      new.stripe_connect_account_id := null; new.stripe_account_id := null;
      new.stripe_charges_enabled := false; new.stripe_payouts_enabled := false;
      new.stripe_onboarding_completed := false; new.stripe_details_submitted := false;
    else
      new.user_id := old.user_id; new.status := old.status;
      new.is_public := old.is_public; new.is_demo := old.is_demo; new.is_active := old.is_active;
      new.commission_rate := old.commission_rate;
      new.stripe_connect_account_id := old.stripe_connect_account_id;
      new.stripe_account_id := old.stripe_account_id;
      new.stripe_charges_enabled := old.stripe_charges_enabled;
      new.stripe_payouts_enabled := old.stripe_payouts_enabled;
      new.stripe_onboarding_completed := old.stripe_onboarding_completed;
      new.stripe_details_submitted := old.stripe_details_submitted;
      new.partner_status := old.partner_status;
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists guard_partner_vendor_write on public.vendors;
create trigger guard_partner_vendor_write before insert or update on public.vendors
for each row execute function private.guard_partner_vendor_write();

create or replace function private.guard_partner_product_write()
returns trigger language plpgsql security definer
set search_path=public,private
as $$
begin
  if (select auth.uid()) is not null and not private.is_delikreol_admin() then
    if tg_op='UPDATE' and new.vendor_id is distinct from old.vendor_id then
      raise exception 'vendor_id cannot be changed' using errcode='42501';
    end if;
    new.status := 'draft'; new.is_public := false; new.is_demo := false;
    new.photo_status := case when nullif(trim(coalesce(new.image_url,'')),'') is null then 'missing' else 'pending_review' end;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists guard_partner_product_write on public.products;
create trigger guard_partner_product_write before insert or update on public.products
for each row execute function private.guard_partner_product_write();

drop policy if exists vendors_insert_own_pending on public.vendors;
create policy vendors_insert_own_pending on public.vendors for insert to authenticated
with check (
  (select auth.uid()) is not null and user_id=(select auth.uid())
  and status='draft' and is_public=false and is_demo=false
  and stripe_connect_account_id is null and stripe_account_id is null
);

create or replace function public.claim_partner_access()
returns jsonb language plpgsql security definer
set search_path=public,auth,private
as $$
declare
  target_user auth.users%rowtype;
  target_vendor public.vendors%rowtype;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode='28000'; end if;
  select * into target_user from auth.users where id=(select auth.uid());
  if target_user.email_confirmed_at is null then raise exception 'Email confirmation required' using errcode='42501'; end if;

  select * into target_vendor from public.vendors
  where user_id=(select auth.uid())
     or (user_id is null and email is not null and lower(trim(email))=lower(trim(target_user.email)))
  order by case when user_id=(select auth.uid()) then 0 else 1 end
  limit 1 for update;

  if not found then return jsonb_build_object('claimed',false,'reason','no_matching_verified_email'); end if;
  if target_vendor.user_id is null then
    update public.vendors set user_id=(select auth.uid()),updated_at=now()
    where id=target_vendor.id and user_id is null;
  end if;
  update public.profiles set user_type='vendor',updated_at=now() where id=(select auth.uid());
  return jsonb_build_object('claimed',true,'vendor_id',target_vendor.id,'business_name',coalesce(target_vendor.business_name,target_vendor.name));
end;
$$;
revoke all on function public.claim_partner_access() from public,anon;
grant execute on function public.claim_partner_access() to authenticated;

create or replace function private.promote_vendor_profile()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
  if new.user_id is not null then
    update public.profiles set user_type='vendor',updated_at=now() where id=new.user_id;
  end if;
  return new;
end;
$$;
drop trigger if exists promote_vendor_profile on public.vendors;
create trigger promote_vendor_profile after insert or update of user_id on public.vendors
for each row when (new.user_id is not null) execute function private.promote_vendor_profile();

drop policy if exists "product_photos_public_insert" on storage.objects;
drop policy if exists "Authenticated users can upload caterer photos" on storage.objects;
drop policy if exists "Authenticated users can update caterer photos" on storage.objects;
drop policy if exists "Authenticated users can delete caterer photos" on storage.objects;

drop policy if exists partner_product_photos_select_own on storage.objects;
create policy partner_product_photos_select_own on storage.objects for select to authenticated
using (bucket_id='product-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists partner_product_photos_update_own on storage.objects;
create policy partner_product_photos_update_own on storage.objects for update to authenticated
using (bucket_id='product-photos' and (storage.foldername(name))[1]=(select auth.uid())::text)
with check (bucket_id='product-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists partner_product_photos_delete_own on storage.objects;
create policy partner_product_photos_delete_own on storage.objects for delete to authenticated
using (bucket_id='product-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);

grant select,insert,update on public.vendors to authenticated;
grant select,insert,update,delete on public.products to authenticated;
grant select,insert on public.partner_corrections to anon,authenticated;
