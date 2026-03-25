-- IIQE Quiz Supabase Schema
-- Run this in Supabase SQL Editor to set up the database

-- 1. Users table (anonymous users with optional sync codes)
create table users (
  id uuid primary key default gen_random_uuid(),
  nickname text,
  sync_code text unique,
  created_at timestamptz default now()
);

-- 2. Per-chapter stats
create table stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  chapter_id text not null,
  correct int default 0,
  total int default 0,
  updated_at timestamptz default now(),
  unique(user_id, chapter_id)
);

-- 3. Error book
create table errors (
  id text not null,
  user_id uuid references users(id) on delete cascade,
  paper text,
  chapter_id text,
  chapter_name text,
  question jsonb not null,
  user_answer text,
  correct_answer text,
  review_count int default 0,
  last_review_at bigint,
  next_review_at bigint,
  mastered boolean default false,
  created_at bigint,
  primary key (user_id, id)
);

-- 4. User data (streak, daily, achievements, settings, counters)
create table user_data (
  user_id uuid primary key references users(id) on delete cascade,
  data jsonb default '{}',
  updated_at timestamptz default now()
);

-- 5. Indexes
create index idx_stats_user on stats(user_id);
create index idx_errors_user on errors(user_id);
create index idx_users_sync_code on users(sync_code);

-- 6. Row Level Security
alter table users enable row level security;
alter table stats enable row level security;
alter table errors enable row level security;
alter table user_data enable row level security;

-- RLS policies: allow all operations with anon key (no auth required)
-- Since we use anonymous users identified by client-side UUID,
-- we rely on the client sending the correct user_id.
create policy "Allow all on users" on users for all using (true) with check (true);
create policy "Allow all on stats" on stats for all using (true) with check (true);
create policy "Allow all on errors" on errors for all using (true) with check (true);
create policy "Allow all on user_data" on user_data for all using (true) with check (true);

-- 7. Function to generate unique 6-char sync code
create or replace function generate_sync_code()
returns text as $$
declare
  code text;
  exists_count int;
begin
  loop
    code := upper(substr(md5(random()::text), 1, 6));
    select count(*) into exists_count from users where sync_code = code;
    exit when exists_count = 0;
  end loop;
  return code;
end;
$$ language plpgsql;
