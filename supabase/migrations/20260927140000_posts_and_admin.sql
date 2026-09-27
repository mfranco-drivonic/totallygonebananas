-- Blog posts + public read policy for storage (covers used by posts/recipes).

create type public.post_status as enum ('draft', 'published');

create table public.posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  title         text not null check (char_length(title) between 2 and 120),
  excerpt       text check (char_length(excerpt) <= 300),
  body          text not null check (char_length(body) between 1 and 50000),
  cover_path    text,
  status        public.post_status not null default 'draft',
  author_id     uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  published_at  timestamptz
);

create index posts_status_published_idx on public.posts (status, published_at desc);
create index posts_author_idx on public.posts (author_id);

create or replace function public.posts_before_write()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    new.published_at := coalesce(new.published_at, now());
  end if;
  if new.status = 'draft' then
    new.published_at := null;
  end if;
  return new;
end;
$$;

create trigger posts_before_write
  before insert or update on public.posts
  for each row execute function public.posts_before_write();

alter table public.posts enable row level security;

create policy "Published posts are public; editors see drafts"
  on public.posts for select
  using (status = 'published' or public.is_editor());

create policy "Editors create posts"
  on public.posts for insert to authenticated
  with check (public.is_editor() and author_id = auth.uid());

create policy "Editors update posts"
  on public.posts for update to authenticated
  using (public.is_editor())
  with check (public.is_editor());

create policy "Editors delete posts"
  on public.posts for delete to authenticated
  using (public.is_editor());

-- Public read for public storage buckets (covers and recipe media).
create policy "Public read recipe media and avatars"
  on storage.objects for select
  using (bucket_id in ('recipe-media', 'avatars'));
