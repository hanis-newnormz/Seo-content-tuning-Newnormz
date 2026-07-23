-- SEO Content Review Board — initial schema
-- Run this in the Supabase SQL editor, or via `supabase db push`.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type rec_priority as enum ('critical', 'high', 'medium', 'low');

create type rec_category as enum (
  'content_optimization',
  'keyword_optimization',
  'search_intent',
  'eeat',
  'internal_linking',
  'ux_improvement',
  'conversion_optimization'
);

create type rec_status as enum (
  'draft',
  'sent_to_client',
  'approved',
  'rejected',
  'implemented'
);

create type comment_author_type as enum ('agency', 'client');

-- ---------------------------------------------------------------------------
-- profiles — one row per agency team member (auth.users mirror)
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

-- Auto-create a profile when a new auth user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------

create table projects (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  website_url text not null,
  project_name text not null,
  target_keywords text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table projects enable row level security;

create policy "Authenticated users can view projects"
  on projects for select to authenticated using (true);

create policy "Authenticated users can create projects"
  on projects for insert to authenticated with check (true);

create policy "Authenticated users can update projects"
  on projects for update to authenticated using (true);

create policy "Authenticated users can delete projects"
  on projects for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- pages
-- ---------------------------------------------------------------------------

create table pages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  page_name text not null,
  page_url text not null,
  screenshot_url text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table pages enable row level security;

create policy "Authenticated users can view pages"
  on pages for select to authenticated using (true);

create policy "Authenticated users can create pages"
  on pages for insert to authenticated with check (true);

create policy "Authenticated users can update pages"
  on pages for update to authenticated using (true);

create policy "Authenticated users can delete pages"
  on pages for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- recommendations
-- ---------------------------------------------------------------------------

create table recommendations (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages (id) on delete cascade,
  section_name text not null,
  category rec_category not null default 'content_optimization',
  priority rec_priority not null default 'medium',
  current_content text,
  recommended_content text not null,
  seo_reason text not null,
  status rec_status not null default 'draft',
  internal_notes text,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table recommendations enable row level security;

create policy "Authenticated users can view recommendations"
  on recommendations for select to authenticated using (true);

create policy "Authenticated users can create recommendations"
  on recommendations for insert to authenticated with check (true);

create policy "Authenticated users can update recommendations"
  on recommendations for update to authenticated using (true);

create policy "Authenticated users can delete recommendations"
  on recommendations for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- annotations — pins on a page screenshot, linked to a recommendation
-- ---------------------------------------------------------------------------

create table annotations (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references recommendations (id) on delete cascade,
  page_id uuid not null references pages (id) on delete cascade,
  x_position numeric(6, 2) not null,
  y_position numeric(6, 2) not null,
  label text,
  created_at timestamptz not null default now()
);

alter table annotations enable row level security;

create policy "Authenticated users can view annotations"
  on annotations for select to authenticated using (true);

create policy "Authenticated users can create annotations"
  on annotations for insert to authenticated with check (true);

create policy "Authenticated users can update annotations"
  on annotations for update to authenticated using (true);

create policy "Authenticated users can delete annotations"
  on annotations for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- comments — client or agency discussion thread on a recommendation
-- ---------------------------------------------------------------------------

create table comments (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references recommendations (id) on delete cascade,
  author_name text not null,
  author_type comment_author_type not null default 'client',
  comment text not null,
  created_at timestamptz not null default now()
);

alter table comments enable row level security;

create policy "Authenticated users can view comments"
  on comments for select to authenticated using (true);

create policy "Authenticated users can create comments"
  on comments for insert to authenticated with check (true);

create policy "Authenticated users can delete comments"
  on comments for delete to authenticated using (true);

-- Note: the public client view never talks to Supabase directly with the
-- anon key for writes — all client-facing reads/writes (share token lookup,
-- approvals, comments) go through Next.js server routes using the service
-- role key, which bypasses RLS after verifying the share token server-side.

-- ---------------------------------------------------------------------------
-- client_shares — public, token-based read-only links for client review
-- ---------------------------------------------------------------------------

create table client_shares (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(20), 'hex'),
  is_active boolean not null default true,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table client_shares enable row level security;

create policy "Authenticated users can view client shares"
  on client_shares for select to authenticated using (true);

create policy "Authenticated users can create client shares"
  on client_shares for insert to authenticated with check (true);

create policy "Authenticated users can update client shares"
  on client_shares for update to authenticated using (true);

create policy "Authenticated users can delete client shares"
  on client_shares for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_projects_updated_at before update on projects
  for each row execute procedure public.set_updated_at();

create trigger set_pages_updated_at before update on pages
  for each row execute procedure public.set_updated_at();

create trigger set_recommendations_updated_at before update on recommendations
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index pages_project_id_idx on pages (project_id);
create index recommendations_page_id_idx on recommendations (page_id);
create index recommendations_status_idx on recommendations (status);
create index annotations_recommendation_id_idx on annotations (recommendation_id);
create index annotations_page_id_idx on annotations (page_id);
create index comments_recommendation_id_idx on comments (recommendation_id);
create index client_shares_token_idx on client_shares (token);
create index client_shares_project_id_idx on client_shares (project_id);

-- ---------------------------------------------------------------------------
-- Storage — screenshots bucket
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', true)
on conflict (id) do nothing;

create policy "Public can view screenshots"
  on storage.objects for select
  using (bucket_id = 'screenshots');

create policy "Authenticated users can upload screenshots"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'screenshots');

create policy "Authenticated users can update screenshots"
  on storage.objects for update to authenticated
  using (bucket_id = 'screenshots');

create policy "Authenticated users can delete screenshots"
  on storage.objects for delete to authenticated
  using (bucket_id = 'screenshots');
