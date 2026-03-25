-- IIQE Quiz App - Supabase Setup
-- Only one table needed: stores all of 泉泉's progress as JSON

create table qq_progress (
  id text primary key,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- Allow anonymous access (no auth needed, only one user)
alter table qq_progress enable row level security;

create policy "Allow all access" on qq_progress
  for all using (true) with check (true);
