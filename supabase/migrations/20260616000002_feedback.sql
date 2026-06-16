-- ============================================================
-- DELIKREOL — Feedback table migration
-- Table: feedback
-- ============================================================

-- Create feedback table (if not exists)
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  description text not null,
  email text,
  attachment_url text,
  status text not null default 'new',
  created_at timestamptz default now()
);

-- Index for faster queries by status
create index if not exists idx_feedback_status on feedback(status);

-- Index for created_at ordering
create index if not exists idx_feedback_created_at on feedback(created_at desc);

-- Enable RLS
alter table if exists feedback enable row level security;

-- RLS policies
do $$ begin
  drop policy if exists "Anyone can insert feedback" on feedback;
  drop policy if exists "Admin can read feedback" on feedback;
  drop policy if exists "Admin can update feedback" on feedback;
end $$;

-- Anyone can submit feedback (public form)
create policy "Anyone can insert feedback"
  on feedback for insert
  with check (true);

-- Only admins can view feedback
create policy "Admin can read feedback"
  on feedback for select
  using (is_admin());

-- Only admins can update feedback status
create policy "Admin can update feedback"
  on feedback for update
  using (is_admin());