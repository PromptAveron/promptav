create extension if not exists pgcrypto;

alter table public.prompts
  add column if not exists excerpt text,
  add column if not exists description text,
  add column if not exists negative_prompt text,
  add column if not exists featured_image_url text,
  add column if not exists image_alt text,
  add column if not exists style text,
  add column if not exists ai_model text,
  add column if not exists aspect_ratio text,
  add column if not exists seo_title text,
  add column if not exists meta_description text,
  add column if not exists category_id uuid references public.categories(id) on delete set null,
  add column if not exists tags text[] not null default '{}',
  add column if not exists status text not null default 'draft',
  add column if not exists is_featured boolean not null default false,
  add column if not exists is_trending boolean not null default false,
  add column if not exists published_at timestamptz,
  add column if not exists scheduled_at timestamptz,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_by uuid references auth.users(id) on delete set null,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.categories
  add column if not exists description text,
  add column if not exists image_path text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists sort_order integer not null default 0,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_prompts_category_id on public.prompts(category_id);
create index if not exists idx_prompts_updated_at on public.prompts(updated_at desc);
create index if not exists idx_prompts_tags on public.prompts using gin(tags);

create or replace function public.set_cms_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists prompts_set_updated_at on public.prompts;
create trigger prompts_set_updated_at
before update on public.prompts
for each row execute function public.set_cms_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_cms_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.prompts enable row level security;
alter table public.categories enable row level security;
grant select on public.prompts, public.categories to anon, authenticated;
grant insert, update, delete on public.prompts, public.categories to authenticated;

drop policy if exists "Public can read published prompts" on public.prompts;
create policy "Public can read published prompts"
on public.prompts for select to anon, authenticated
using (status = 'published' or public.is_admin());

drop policy if exists "CMS admins can manage prompts" on public.prompts;
create policy "CMS admins can manage prompts"
on public.prompts for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read active categories" on public.categories;
drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read active categories"
on public.categories for select to anon, authenticated
using (is_active or public.is_admin());

drop policy if exists "CMS admins can manage categories" on public.categories;
create policy "CMS admins can manage categories"
on public.categories for all to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'prompt-images',
  'prompt-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read prompt images" on storage.objects;
create policy "Public can read prompt images"
on storage.objects for select to anon, authenticated
using (bucket_id = 'prompt-images');

drop policy if exists "CMS admins can upload prompt images" on storage.objects;
create policy "CMS admins can upload prompt images"
on storage.objects for insert to authenticated
with check (bucket_id = 'prompt-images' and public.is_admin());

drop policy if exists "CMS admins can update prompt images" on storage.objects;
create policy "CMS admins can update prompt images"
on storage.objects for update to authenticated
using (bucket_id = 'prompt-images' and public.is_admin())
with check (bucket_id = 'prompt-images' and public.is_admin());

drop policy if exists "CMS admins can delete prompt images" on storage.objects;
create policy "CMS admins can delete prompt images"
on storage.objects for delete to authenticated
using (bucket_id = 'prompt-images' and public.is_admin());
