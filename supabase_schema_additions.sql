-- Run this AFTER supabase_schema.sql
-- Adds two-factor authentication storage for super admins

create table if not exists public.user_2fa (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade unique,
  secret_base32 text not null,
  enabled boolean default false,
  backup_codes text[] default '{}',
  backup_codes_used text[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.user_2fa enable row level security;

-- Users can only read/write their own 2FA record
create policy "Users manage own 2FA" on public.user_2fa
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_user_2fa_user_id on public.user_2fa(user_id);
