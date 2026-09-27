-- Totally Gone Bananas: initial schema
-- Run with `supabase db push`, or paste into the Supabase SQL editor.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.recipe_status as enum ('draft', 'pending', 'published', 'rejected');
create type public.media_kind as enum ('image', 'video');
create type public.user_role as enum ('member', 'editor', 'admin');

-- ---------------------------------------------------------------------------
-- Profiles (one per auth user, created automatically on sign-up)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text unique check (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text check (char_length(display_name) <= 60),
  avatar_path  text,
  bio          text check (char_length(bio) <= 280),
  role         public.user_role not null default 'member',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role helpers (security definer so they can be used inside RLS policies)
create or replace function public.current_role_is(roles public.user_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = any (roles));
$$;

create or replace function public.is_editor()
returns boolean
language sql
stable
as $$ select public.current_role_is(array['editor', 'admin']::public.user_role[]); $$;

-- Members can never change their own role; only admins can.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() is null in the SQL editor and for the service role, which are trusted.
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.current_role_is(array['admin']::public.user_role[]) then
    new.role := old.role;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
create table public.categories (
  id         text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
  name       text not null check (char_length(name) between 2 and 40),
  emoji      text,
  tagline    text check (char_length(tagline) <= 120),
  sort_order int not null default 0
);

-- ---------------------------------------------------------------------------
-- Recipes
-- ---------------------------------------------------------------------------
-- ingredients: text[]  e.g. {"3 ripe bananas","1 1/2 cups flour"}
-- steps: jsonb array   e.g. [{"text":"Mash the bananas.","media":{"kind":"image","path":"<uid>/x.jpg"}}]
create or replace function public.immutable_array_to_string(text[])
returns text
language sql
immutable
as $$ select array_to_string($1, ' '); $$;

create table public.recipes (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  title         text not null check (char_length(title) between 2 and 100),
  description   text check (char_length(description) <= 300),
  category_id   text references public.categories (id) on update cascade on delete set null,
  emoji         text,
  total_minutes int check (total_minutes between 1 and 2880),
  time_note     text check (char_length(time_note) <= 40),
  servings      int check (servings between 1 and 200),
  difficulty    smallint check (difficulty between 1 and 5),
  tags          text[] not null default '{}',
  ingredients   text[] not null default '{}' check (cardinality(ingredients) <= 80),
  steps         jsonb not null default '[]'::jsonb check (jsonb_typeof(steps) = 'array'),
  cover_path    text,
  status        public.recipe_status not null default 'pending',
  author_id     uuid references public.profiles (id) on delete set null,
  review_note   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  published_at  timestamptz,
  search        tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', public.immutable_array_to_string(ingredients)), 'C')
  ) stored
);

create index recipes_status_published_idx on public.recipes (status, published_at desc);
create index recipes_category_idx on public.recipes (category_id);
create index recipes_author_idx on public.recipes (author_id);
create index recipes_search_idx on public.recipes using gin (search);
create index recipes_tags_idx on public.recipes using gin (tags);

create or replace function public.recipes_before_write()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger recipes_before_write
  before insert or update on public.recipes
  for each row execute function public.recipes_before_write();

-- Extra photos and videos shown in the recipe gallery
create table public.recipe_media (
  id         uuid primary key default gen_random_uuid(),
  recipe_id  uuid not null references public.recipes (id) on delete cascade,
  kind       public.media_kind not null,
  path       text not null,
  caption    text check (char_length(caption) <= 140),
  position   int not null default 0,
  created_at timestamptz not null default now()
);
create index recipe_media_recipe_idx on public.recipe_media (recipe_id, position);

-- ---------------------------------------------------------------------------
-- Saves and cook logs ("I made it!" with a rating and optional tip)
-- ---------------------------------------------------------------------------
create table public.saves (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  recipe_id  uuid not null references public.recipes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create table public.cook_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  recipe_id  uuid not null references public.recipes (id) on delete cascade,
  rating     smallint not null check (rating between 1 and 5),
  tip        text check (char_length(tip) <= 280),
  created_at timestamptz not null default now()
);
create index cook_logs_recipe_idx on public.cook_logs (recipe_id, created_at desc);
create index cook_logs_user_idx on public.cook_logs (user_id, created_at desc);

create view public.recipe_ratings
with (security_invoker = true)
as
  select recipe_id, round(avg(rating)::numeric, 1) as avg_rating, count(*)::int as ratings_count
  from public.cook_logs
  group by recipe_id;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.categories   enable row level security;
alter table public.recipes      enable row level security;
alter table public.recipe_media enable row level security;
alter table public.saves        enable row level security;
alter table public.cook_logs    enable row level security;

-- profiles
create policy "Profiles are public" on public.profiles
  for select using (true);
create policy "Users update their own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Admins update any profile" on public.profiles
  for update to authenticated using (public.current_role_is(array['admin']::public.user_role[]));

-- categories
create policy "Categories are public" on public.categories
  for select using (true);
create policy "Editors manage categories" on public.categories
  for all to authenticated using (public.is_editor()) with check (public.is_editor());

-- recipes
create policy "Published recipes are public; authors and editors see the rest" on public.recipes
  for select using (status = 'published' or author_id = auth.uid() or public.is_editor());
create policy "Signed-in users create recipes" on public.recipes
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and (status in ('draft', 'pending') or public.is_editor())
  );
create policy "Authors edit unpublished recipes" on public.recipes
  for update to authenticated
  using (author_id = auth.uid() and status <> 'published')
  with check (author_id = auth.uid() and status in ('draft', 'pending'));
create policy "Editors edit any recipe" on public.recipes
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "Authors delete unpublished recipes; editors delete any" on public.recipes
  for delete to authenticated
  using ((author_id = auth.uid() and status <> 'published') or public.is_editor());

-- recipe_media follows its recipe
create policy "Media is visible with its recipe" on public.recipe_media
  for select using (exists (select 1 from public.recipes r where r.id = recipe_id));
create policy "Recipe editors manage media" on public.recipe_media
  for all to authenticated
  using (exists (
    select 1 from public.recipes r
    where r.id = recipe_id and ((r.author_id = auth.uid() and r.status <> 'published') or public.is_editor())
  ))
  with check (exists (
    select 1 from public.recipes r
    where r.id = recipe_id and ((r.author_id = auth.uid() and r.status <> 'published') or public.is_editor())
  ));

-- saves are private to their owner
create policy "Users manage their own saves" on public.saves
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- cook logs: public on published recipes, written by their owner
create policy "Cook logs on published recipes are public" on public.cook_logs
  for select using (
    user_id = auth.uid()
    or exists (select 1 from public.recipes r where r.id = recipe_id and r.status = 'published')
  );
create policy "Users log their own cooking" on public.cook_logs
  for insert to authenticated with check (user_id = auth.uid());
create policy "Users delete their own logs; editors moderate" on public.cook_logs
  for delete to authenticated using (user_id = auth.uid() or public.is_editor());

-- ---------------------------------------------------------------------------
-- Storage: recipe photos/videos and avatars.
-- Files live under "<user id>/<file>" so each user can only write their own folder.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('recipe-media', 'recipe-media', true, 52428800,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'video/mp4', 'video/webm', 'video/quicktime']),
  ('avatars', 'avatars', true, 5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "Users upload to their own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('recipe-media', 'avatars') and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users update their own files" on storage.objects
  for update to authenticated
  using (bucket_id in ('recipe-media', 'avatars') and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users delete their own files; editors moderate" on storage.objects
  for delete to authenticated
  using (bucket_id in ('recipe-media', 'avatars') and ((storage.foldername(name))[1] = auth.uid()::text or public.is_editor()));
