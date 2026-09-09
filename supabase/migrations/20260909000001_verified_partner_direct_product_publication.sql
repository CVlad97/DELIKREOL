-- Allow a verified public partner to publish only products attached to their own vendor.
-- Unverified partners keep the existing draft/review workflow.

create or replace function private.guard_partner_product_write()
returns trigger language plpgsql security definer
set search_path=public,private
as $$
declare
  partner_can_publish boolean := false;
begin
  if (select auth.uid()) is not null and not private.is_delikreol_admin() then
    if tg_op='UPDATE' and new.vendor_id is distinct from old.vendor_id then
      raise exception 'vendor_id cannot be changed' using errcode='42501';
    end if;

    select exists(
      select 1 from public.vendors v
      where v.id=new.vendor_id
        and v.user_id=(select auth.uid())
        and v.status='verified'
        and v.is_public=true
        and coalesce(v.is_active,true)=true
    ) into partner_can_publish;

    if not partner_can_publish then
      new.status := 'draft';
      new.is_public := false;
    else
      new.status := 'verified';
      new.is_public := true;
    end if;

    new.is_demo := false;
    new.photo_status := case
      when nullif(trim(coalesce(new.image_url,'')),'') is null then 'missing'
      else 'partner_published'
    end;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
