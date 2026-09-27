-- Track which invite link led to a recipe submission (from utm_content).
alter table public.recipes
  add column if not exists referred_by text
  check (referred_by is null or char_length(referred_by) between 1 and 64);

create index if not exists recipes_referred_by_idx on public.recipes (referred_by)
  where referred_by is not null;
