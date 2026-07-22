-- Total Insulation Hub - Supabase Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgvector";

-- Users table (extends Supabase auth)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  state text check (state in ('NSW', 'VIC', 'WA', 'QLD', 'Office')),
  role text check (role in ('crew', 'admin', 'super_admin')) default 'crew',
  phone text,
  photo_url text,
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Channels (states + Office)
create table if not exists public.channels (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null check (name in ('NSW', 'VIC', 'WA', 'QLD', 'Office')),
  description text,
  created_at timestamp with time zone default now()
);

-- Communities (chats within channels)
create table if not exists public.communities (
  id uuid primary key default uuid_generate_v4(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  name text not null,
  description text,
  community_type text check (community_type in ('inductions', 'general', 'job', 'custom')) default 'custom',
  job_id uuid, -- references WIP projects
  created_by uuid references public.users(id),
  archived boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(channel_id, name)
);

-- Community members
create table if not exists public.community_members (
  id uuid primary key default uuid_generate_v4(),
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text check (role in ('member', 'admin')) default 'member',
  joined_at timestamp with time zone default now(),
  unique(community_id, user_id)
);

-- Messages
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  content text,
  message_type text check (message_type in ('text', 'photo', 'document', 'video')) default 'text',
  media_urls text[] default '{}',
  mentions text[] default '{}',
  reply_to uuid references public.messages(id) on delete set null,
  edited_at timestamp with time zone,
  pinned boolean default false,
  created_at timestamp with time zone default now()
);

-- Tenders
create table if not exists public.tenders (
  id uuid primary key default uuid_generate_v4(),
  tender_number text unique,
  client text not null,
  project_name text not null,
  contact_name text,
  contact_phone text,
  contact_email text,
  state text check (state in ('NSW', 'VIC', 'WA', 'QLD')),
  quoted_value numeric(12,2),
  revised_value numeric(12,2),
  due_date date,
  submission_date date,
  status text check (status in ('pending', 'submitted', 'won', 'lost', 'no_works')) default 'pending',
  notes text,
  procore_link text,
  onedrive_folder_link text,
  created_by uuid references public.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tender outstanding items
create table if not exists public.tender_outstanding_items (
  id uuid primary key default uuid_generate_v4(),
  tender_id uuid not null references public.tenders(id) on delete cascade,
  item_name text not null,
  owner text,
  due_date date,
  completed boolean default false,
  created_at timestamp with time zone default now()
);

-- WIP Projects
create table if not exists public.wip_projects (
  id uuid primary key default uuid_generate_v4(),
  job_number text unique,
  project_name text not null,
  client text not null,
  state text check (state in ('NSW', 'VIC', 'WA', 'QLD')) not null,
  quoted_value numeric(12,2),
  invoiced_to_date numeric(12,2) default 0,
  actual_spend numeric(12,2) default 0,
  start_date date,
  planned_completion_date date,
  actual_completion_date date,
  current_stage text,
  completion_percentage numeric(5,2) default 0,
  related_tender_id uuid references public.tenders(id),
  project_manager text,
  procore_link text,
  onedrive_folder_link text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- WIP Project crew assignments
create table if not exists public.project_crew_assignments (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.wip_projects(id) on delete cascade,
  crew_member_id uuid not null references public.users(id) on delete cascade,
  role text,
  start_date date,
  end_date date,
  assigned_at timestamp with time zone default now(),
  unique(project_id, crew_member_id)
);

-- WIP Project milestones
create table if not exists public.project_milestones (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.wip_projects(id) on delete cascade,
  milestone_name text not null,
  planned_date date,
  actual_date date,
  status text check (status in ('pending', 'in_progress', 'completed')) default 'pending',
  created_at timestamp with time zone default now()
);

-- Variations
create table if not exists public.variations (
  id uuid primary key default uuid_generate_v4(),
  variation_number text,
  project_id uuid not null references public.wip_projects(id) on delete cascade,
  description text not null,
  cost_impact numeric(12,2),
  time_impact_days integer,
  status text check (status in ('submitted', 'approved', 'rejected', 'completed')) default 'submitted',
  submitted_date date,
  approved_date date,
  completed_date date,
  client_sign_off boolean default false,
  created_by uuid references public.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Documents
create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  file_url text not null,
  file_size integer,
  file_type text,
  entity_type text check (entity_type in ('tender', 'project', 'variation')),
  entity_id uuid,
  uploaded_by uuid references public.users(id),
  onedrive_path text,
  created_at timestamp with time zone default now()
);

-- Labour allocations
create table if not exists public.labour_allocations (
  id uuid primary key default uuid_generate_v4(),
  crew_member_id uuid not null references public.users(id) on delete cascade,
  project_id uuid not null references public.wip_projects(id) on delete cascade,
  allocation_start_date date not null,
  allocation_end_date date not null,
  role text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Leave requests
create table if not exists public.leave_requests (
  id uuid primary key default uuid_generate_v4(),
  crew_member_id uuid not null references public.users(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text check (reason in ('annual', 'sick', 'comp', 'other')),
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  approved_by uuid references public.users(id),
  approved_date date,
  created_at timestamp with time zone default now()
);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  assigned_to uuid[] not null, -- array of user IDs
  created_by uuid not null references public.users(id),
  due_date date,
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  status text check (status in ('pending', 'in_progress', 'completed', 'on_hold')) default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Calendar events
create table if not exists public.calendar_events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  event_date date not null,
  event_time time,
  location text,
  event_type text check (event_type in ('meeting', 'deadline', 'site_visit', 'event')) default 'event',
  attendees uuid[] default '{}',
  recurring boolean default false,
  recurrence_pattern text,
  created_by uuid references public.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Activity log
create table if not exists public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id),
  activity_type text,
  activity_description text,
  project_id uuid,
  entity_type text,
  entity_id uuid,
  created_at timestamp with time zone default now()
);

-- Online tracker
create table if not exists public.online_status (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  is_online boolean default false,
  current_activity text,
  current_project_id uuid,
  last_active_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id)
);

-- Push notification subscriptions
create table if not exists public.push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  subscription text not null unique,
  created_at timestamp with time zone default now()
);

-- Notification preferences
create table if not exists public.notification_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade unique,
  push_enabled boolean default true,
  email_enabled boolean default true,
  email_frequency text check (email_frequency in ('realtime', 'daily', 'weekly')) default 'daily',
  quiet_hours_start time default '22:00',
  quiet_hours_end time default '08:00',
  quiet_hours_enabled boolean default true,
  do_not_disturb boolean default false,
  updated_at timestamp with time zone default now()
);

-- Create indexes
create index idx_messages_community_id on public.messages(community_id);
create index idx_messages_created_at on public.messages(created_at);
create index idx_community_members_user_id on public.community_members(user_id);
create index idx_community_members_community_id on public.community_members(community_id);
create index idx_users_state on public.users(state);
create index idx_users_role on public.users(role);
create index idx_tenders_status on public.tenders(status);
create index idx_tenders_due_date on public.tenders(due_date);
create index idx_wip_projects_state on public.wip_projects(state);
create index idx_wip_projects_status on public.wip_projects(current_stage);
create index idx_project_crew_assignments_crew_id on public.project_crew_assignments(crew_member_id);
create index idx_labour_allocations_crew_id on public.labour_allocations(crew_member_id);
create index idx_activity_log_user_id on public.activity_log(user_id);
create index idx_activity_log_created_at on public.activity_log(created_at);
create index idx_online_status_user_id on public.online_status(user_id);

-- Create RLS policies
alter table public.users enable row level security;
alter table public.channels enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.messages enable row level security;
alter table public.tenders enable row level security;
alter table public.wip_projects enable row level security;
alter table public.variations enable row level security;
alter table public.tasks enable row level security;
alter table public.calendar_events enable row level security;
alter table public.activity_log enable row level security;
alter table public.online_status enable row level security;
alter table public.notification_preferences enable row level security;

-- Users can view all users
create policy "Users can view all users" on public.users for select using (true);

-- Users can update own profile
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- Channels are readable by all
create policy "Channels are readable by all" on public.channels for select using (true);

-- Communities readable if user is member or admin
create policy "Communities readable if member or admin" on public.communities for select 
  using (
    exists (
      select 1 from public.community_members 
      where community_members.community_id = communities.id 
      and community_members.user_id = auth.uid()
    )
    or 
    exists (
      select 1 from public.users 
      where users.id = auth.uid() 
      and users.role = 'super_admin'
    )
  );

-- Community members can view their community's messages
create policy "View messages in your communities" on public.messages for select 
  using (
    exists (
      select 1 from public.community_members 
      where community_members.community_id = messages.community_id 
      and community_members.user_id = auth.uid()
    )
    or
    exists (
      select 1 from public.users 
      where users.id = auth.uid() 
      and users.role = 'super_admin'
    )
  );

-- Users can insert messages in their communities
create policy "Insert messages in your communities" on public.messages for insert 
  with check (
    exists (
      select 1 from public.community_members 
      where community_members.community_id = messages.community_id 
      and community_members.user_id = auth.uid()
    )
    and
    auth.uid() = user_id
  );

-- Users can update own messages
create policy "Update own messages" on public.messages for update 
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete own messages
create policy "Delete own messages" on public.messages for delete 
  using (auth.uid() = user_id);

-- Tenders readable by super admins
create policy "Tenders readable by super admins" on public.tenders for select 
  using (
    exists (
      select 1 from public.users 
      where users.id = auth.uid() 
      and users.role = 'super_admin'
    )
  );

-- WIP projects readable by super admins
create policy "WIP projects readable by super admins" on public.wip_projects for select 
  using (
    exists (
      select 1 from public.users 
      where users.id = auth.uid() 
      and users.role = 'super_admin'
    )
  );

-- Tasks readable if assigned or created by super admin
create policy "Tasks readable if assigned or created" on public.tasks for select 
  using (
    auth.uid() = created_by 
    or 
    auth.uid() = any(assigned_to)
    or
    exists (
      select 1 from public.users 
      where users.id = auth.uid() 
      and users.role = 'super_admin'
    )
  );

-- Calendar events readable by all authenticated users
create policy "Calendar events readable by all" on public.calendar_events for select 
  using (auth.role() = 'authenticated');

-- Activity log readable by super admins
create policy "Activity log readable by super admins" on public.activity_log for select 
  using (
    exists (
      select 1 from public.users 
      where users.id = auth.uid() 
      and users.role = 'super_admin'
    )
  );

-- Online status readable if own or super admin
create policy "Online status readable if own or super admin" on public.online_status for select 
  using (
    auth.uid() = user_id 
    or
    exists (
      select 1 from public.users 
      where users.id = auth.uid() 
      and users.role = 'super_admin'
    )
  );

-- Notification preferences readable if own
create policy "Notification preferences readable if own" on public.notification_preferences for select 
  using (auth.uid() = user_id);

-- Users can update own notification preferences
create policy "Update own notification preferences" on public.notification_preferences for update 
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

