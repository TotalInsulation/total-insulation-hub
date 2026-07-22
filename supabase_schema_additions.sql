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

-- Trusted devices: lets a super admin skip 2FA for 24 hours on a device
-- they've already verified on
create table if not exists public.trusted_devices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  device_token text not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default now(),
  unique(user_id, device_token)
);

alter table public.trusted_devices enable row level security;

create policy "Users manage own trusted devices" on public.trusted_devices
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index idx_trusted_devices_user_id on public.trusted_devices(user_id);
create index idx_trusted_devices_expires_at on public.trusted_devices(expires_at);

-- Owner tier: only Jordan and Nelson can toggle what other super admins see.
-- We add is_owner rather than a new role, so existing role checks (super_admin)
-- keep working everywhere else.
alter table public.users add column if not exists is_owner boolean default false;

-- Module permissions: which Hub modules each non-owner super admin can access.
-- If a super admin has no row here, they default to full access (so this only
-- restricts once an owner explicitly sets it).
create table if not exists public.module_permissions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  module_key text not null check (module_key in ('business', 'crew', 'team_online_tracker', 'more')),
  can_access boolean default true,
  updated_by uuid references public.users(id),
  updated_at timestamp with time zone default now(),
  unique(user_id, module_key)
);

alter table public.module_permissions enable row level security;

create policy "Owners manage module permissions" on public.module_permissions
  for all
  using (exists (select 1 from public.users where users.id = auth.uid() and users.is_owner = true))
  with check (exists (select 1 from public.users where users.id = auth.uid() and users.is_owner = true));

create policy "Users view own permissions" on public.module_permissions
  for select using (auth.uid() = user_id);

create index idx_module_permissions_user_id on public.module_permissions(user_id);

