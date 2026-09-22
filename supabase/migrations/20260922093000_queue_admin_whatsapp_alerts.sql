create or replace function public.queue_admin_whatsapp_alert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  alert_message text;
begin
  if tg_table_name = 'orders' then
    alert_message := format(
      'DELIKREOL · Nouvelle commande %s · %s € · statut %s. Intervention admin à vérifier.',
      coalesce(new.order_number, left(new.id::text, 8)),
      coalesce(new.total_amount, 0),
      coalesce(new.status, 'nouvelle')
    );
  elsif tg_table_name = 'driver_applications' then
    alert_message := format('DELIKREOL · Nouvelle candidature livreur : %s. Documents et activation à vérifier.', coalesce(new.name, 'Nom à vérifier'));
  elsif tg_table_name = 'relay_point_applications' then
    alert_message := format('DELIKREOL · Nouvelle candidature point relais : %s. Documents et activation à vérifier.', coalesce(new.business_name, new.place_name, 'Nom à vérifier'));
  else
    alert_message := format('DELIKREOL · Nouvelle candidature partenaire : %s. Documents et activation à vérifier.', coalesce(new.business_name, new.contact_name, 'Nom à vérifier'));
  end if;

  insert into public.notifications (order_id, recipient_type, recipient_phone, channel, message, status, attempts)
  values (
    case when tg_table_name = 'orders' then new.id::text else null end,
    'admin',
    '596696653589',
    'whatsapp_support',
    alert_message,
    'pending',
    0
  );
  return new;
end;
$$;

revoke all on function public.queue_admin_whatsapp_alert() from public;
revoke execute on function public.queue_admin_whatsapp_alert() from anon, authenticated;

drop trigger if exists queue_admin_whatsapp_order on public.orders;
create trigger queue_admin_whatsapp_order after insert on public.orders
for each row execute function public.queue_admin_whatsapp_alert();

drop trigger if exists queue_admin_whatsapp_partner on public.partner_applications;
create trigger queue_admin_whatsapp_partner after insert on public.partner_applications
for each row execute function public.queue_admin_whatsapp_alert();

drop trigger if exists queue_admin_whatsapp_driver on public.driver_applications;
create trigger queue_admin_whatsapp_driver after insert on public.driver_applications
for each row execute function public.queue_admin_whatsapp_alert();

drop trigger if exists queue_admin_whatsapp_relay on public.relay_point_applications;
create trigger queue_admin_whatsapp_relay after insert on public.relay_point_applications
for each row execute function public.queue_admin_whatsapp_alert();
