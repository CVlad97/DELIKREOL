/*
  DeliKreol — project_memory / MemLife

  Cette migration ajoute une table de memoire projet durable.
  Elle ne contient aucun secret, aucun token, aucun mot de passe.
*/

create table if not exists public.project_memory (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  content text not null,
  source text default 'manual',
  confidence text default 'to_confirm',
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.project_memory enable row level security;

do $$ begin
  create policy "Authenticated users can read project memory"
    on public.project_memory
    for select
    to authenticated
    using (true);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "Authenticated users can insert project memory"
    on public.project_memory
    for insert
    to authenticated
    with check (true);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "Authenticated users can update project memory"
    on public.project_memory
    for update
    to authenticated
    using (true)
    with check (true);
exception
  when duplicate_object then null;
end $$;
