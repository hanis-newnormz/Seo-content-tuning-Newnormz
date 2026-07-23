-- SEO Content Review Board — initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type recommendation_priority as enum ('Critical', 'High', 'Medium', 'Low');

create type recommendation_category as enum (
  'Content Optimization',
  'Keyword Optimization',
  'Search Intent',
  'EEAT',
  'Internal Linking',
  'UX Improvement',
  'Conversion Optimization'
);

create type recommendation_status as enum (
  'Draft',
  'Sent to Client',
  'Approved',
  'Rejected',
  'Implemented'
);

create type comment_author_type as enum ('agency', 'client');

-- ---------------------------------------------------------------------------
-- profiles — one row per agency team member (mirrors auth.users)
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------

create table projects (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  website_url text not null,
  project_name text not null,
  target_keywords text[] not null default '{}',
  share_token uuid not null default gen_random_uuid(),
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index projects_share_token_idx on projects (share_token);

-- ---------------------------------------------------------------------------
-- pages
-- ---------------------------------------------------------------------------

create table pages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  page_name text not null,
  page_url text not null,
  screenshot_url text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index pages_project_id_idx on pages (project_id);

-- ---------------------------------------------------------------------------
-- recommendations
-- ---------------------------------------------------------------------------

create table recommendations (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages (id) on delete cascade,
  section_name text not null,
  category recommendation_category not null default 'Content Optimization',
  priority recommendation_priority not null default 'Medium',
  current_content text,
  seo_issue text not null,
  recommended_content text not null,
  seo_reason text not null,
  expected_benefit text,
  status recommendation_status not null default 'Draft',
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recommendations_page_id_idx on recommendations (page_id);

-- ---------------------------------------------------------------------------
-- annotations — pins placed on a screenshot, linked to a recommendation
-- ---------------------------------------------------------------------------

create table annotations (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references recommendations (id) on delete cascade,
  page_id uuid not null references pages (id) on delete cascade,
  x_position numeric not null,
  y_position numeric not null,
  section_name text,
  created_at timestamptz not null default now()
);

create index annotations_recommendation_id_idx on annotations (recommendation_id);
create index annotations_page_id_idx on annotations (page_id);

-- ---------------------------------------------------------------------------
-- comments
-- ---------------------------------------------------------------------------

create table comments (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references recommendations (id) on delete cascade,
  user_name text not null,
  author_type comment_author_type not null default 'client',
  comment text not null,
  created_at timestamptz not null default now()
);

create index comments_recommendation_id_idx on comments (recommendation_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_set_updated_at before update on projects
  for each row execute procedure set_updated_at();

create trigger recommendations_set_updated_at before update on recommendations
  for each row execute procedure set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- The agency team authenticates via Supabase Auth and gets full access to
-- every table. Clients never receive Supabase credentials — the public
-- "Client View" is served through server-only API routes that validate a
-- project's `share_token` and use the service-role key, so anon/public
-- direct table access is intentionally left closed.
-- ---------------------------------------------------------------------------

alter table profiles enable row level security;
alter table projects enable row level security;
alter table pages enable row level security;
alter table recommendations enable row level security;
alter table annotations enable row level security;
alter table comments enable row level security;

create policy "profiles are viewable by authenticated users"
  on profiles for select to authenticated using (true);

create policy "users manage their own profile"
  on profiles for update to authenticated using (auth.uid() = id);

create policy "authenticated users have full access to projects"
  on projects for all to authenticated using (true) with check (true);

create policy "authenticated users have full access to pages"
  on pages for all to authenticated using (true) with check (true);

create policy "authenticated users have full access to recommendations"
  on recommendations for all to authenticated using (true) with check (true);

create policy "authenticated users have full access to annotations"
  on annotations for all to authenticated using (true) with check (true);

create policy "authenticated users have full access to comments"
  on comments for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Storage — website screenshots
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', true)
on conflict (id) do nothing;

create policy "public can view screenshots"
  on storage.objects for select
  using (bucket_id = 'screenshots');

create policy "authenticated users can upload screenshots"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'screenshots');

create policy "authenticated users can update screenshots"
  on storage.objects for update to authenticated
  using (bucket_id = 'screenshots');

create policy "authenticated users can delete screenshots"
  on storage.objects for delete to authenticated
  using (bucket_id = 'screenshots');
