-- Let signed-in users create their own profile row (needed if the auth trigger
-- missed them, e.g. accounts created before the schema existed).

create policy "Users create their own profile"
  on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));
