create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  cover_image_url text,
  seo_title text,
  meta_description text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  short_description text,
  description text,
  content_blocks jsonb default '[]'::jsonb,
  main_prompt text,
  prompt_text text,
  negative_prompt text,
  featured_image_url text,
  thumbnail_url text,
  image_alt text,
  image_caption text,
  image_attribution text,
  source_url text,
  license text,
  primary_category_id uuid references categories(id),
  creator_id uuid,
  ai_model text,
  ai_tools text[],
  style text,
  subject text,
  mood text,
  lighting text,
  composition text,
  color_palette text,
  parameters jsonb,
  aspect_ratios text[],
  instructions text,
  customization_tips text,
  use_cases text,
  seo_title text,
  meta_description text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image text,
  robots_directive text default 'index,follow',
  status text not null default 'draft' check (status in ('draft','published','scheduled','archived')),
  is_featured boolean not null default false,
  is_trending boolean not null default false,
  published_at timestamptz,
  scheduled_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists prompt_tags (
  prompt_id uuid not null references prompts(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (prompt_id, tag_id)
);

create table if not exists prompt_variants (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references prompts(id) on delete cascade,
  label text not null,
  aspect_ratio text not null,
  prompt_text text not null,
  negative_prompt text,
  parameters jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists prompt_images (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references prompts(id) on delete cascade,
  storage_path text not null,
  public_url text,
  alt_text text,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  seo_title text,
  meta_description text,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists collection_prompts (
  collection_id uuid not null references collections(id) on delete cascade,
  prompt_id uuid not null references prompts(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (collection_id, prompt_id)
);

create table if not exists creators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  bio text,
  avatar_url text,
  website_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_prompts_status_published on prompts(status, published_at desc);
create index if not exists idx_prompts_slug on prompts(slug);
create index if not exists idx_categories_slug on categories(slug);
create index if not exists idx_tags_slug on tags(slug);
create index if not exists idx_prompt_variants_prompt_id on prompt_variants(prompt_id, sort_order);

alter table prompts add column if not exists prompt_text text;
alter table prompts add column if not exists main_prompt text;
update prompts set prompt_text = coalesce(prompt_text, main_prompt, '') where prompt_text is null;
update prompts set main_prompt = coalesce(main_prompt, prompt_text, '') where main_prompt is null;
alter table prompts alter column prompt_text set not null;
alter table prompts alter column main_prompt set not null;

create or replace function public.sync_prompt_text_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.prompt_text := coalesce(nullif(new.prompt_text, ''), new.main_prompt, '');
  new.main_prompt := coalesce(nullif(new.main_prompt, ''), new.prompt_text, '');
  return new;
end;
$$;

drop trigger if exists sync_prompt_text_columns on prompts;
create trigger sync_prompt_text_columns
before insert or update of prompt_text, main_prompt on prompts
for each row execute function public.sync_prompt_text_columns();

alter table profiles enable row level security;
alter table categories enable row level security;
alter table tags enable row level security;
alter table prompts enable row level security;
alter table prompt_tags enable row level security;
alter table prompt_variants enable row level security;
alter table prompt_images enable row level security;
alter table collections enable row level security;
alter table collection_prompts enable row level security;
alter table creators enable row level security;

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

grant select on prompts, categories, tags, prompt_tags, prompt_variants, prompt_images, collections, collection_prompts, creators to anon, authenticated;
grant select on profiles to authenticated;
grant insert, update, delete on prompts, categories, tags, prompt_tags, prompt_variants, prompt_images, collections, collection_prompts, creators to authenticated;
grant insert, update, delete on profiles to authenticated;

drop policy if exists "Public can read published prompts" on prompts;
create policy "Public can read published prompts" on prompts for select to anon, authenticated using (status = 'published' or public.is_admin());
drop policy if exists "Public can read categories" on categories;
create policy "Public can read categories" on categories for select to anon, authenticated using (true);
drop policy if exists "Public can read published collections" on collections;
create policy "Public can read published collections" on collections for select to anon, authenticated using (status = 'published' or public.is_admin());
drop policy if exists "Public can read creators" on creators;
create policy "Public can read creators" on creators for select to anon, authenticated using (true);
drop policy if exists "Public can read tags" on tags;
create policy "Public can read tags" on tags for select to anon, authenticated using (true);
drop policy if exists "Public can read tags for published prompts" on prompt_tags;
create policy "Public can read tags for published prompts" on prompt_tags for select to anon, authenticated using (
  public.is_admin() or exists (select 1 from prompts p where p.id = prompt_id and p.status = 'published')
);
drop policy if exists "Public can read variants for published prompts" on prompt_variants;
create policy "Public can read variants for published prompts" on prompt_variants for select to anon, authenticated using (
  public.is_admin() or exists (select 1 from prompts p where p.id = prompt_id and p.status = 'published')
);
drop policy if exists "Public can read images for published prompts" on prompt_images;
create policy "Public can read images for published prompts" on prompt_images for select to anon, authenticated using (
  public.is_admin() or exists (select 1 from prompts p where p.id = prompt_id and p.status = 'published')
);
drop policy if exists "Public can read prompts in published collections" on collection_prompts;
create policy "Public can read prompts in published collections" on collection_prompts for select to anon, authenticated using (
  public.is_admin() or exists (
    select 1 from collections c join prompts p on p.id = prompt_id
    where c.id = collection_id and c.status = 'published' and p.status = 'published'
  )
);
drop policy if exists "Users can view own profile; admins can view all" on profiles;
create policy "Users can view own profile; admins can view all" on profiles for select to authenticated using (auth.uid() = id or public.is_admin());

drop policy if exists "Admins can manage profiles" on profiles;
create policy "Admins can manage profiles" on profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can manage prompts" on prompts;
create policy "Admins can manage prompts" on prompts for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can manage categories" on categories;
create policy "Admins can manage categories" on categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can manage tags" on tags;
create policy "Admins can manage tags" on tags for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can manage prompt tags" on prompt_tags;
create policy "Admins can manage prompt tags" on prompt_tags for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can manage variants" on prompt_variants;
create policy "Admins can manage variants" on prompt_variants for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can manage prompt images" on prompt_images;
create policy "Admins can manage prompt images" on prompt_images for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can manage collections" on collections;
create policy "Admins can manage collections" on collections for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can manage collection prompts" on collection_prompts;
create policy "Admins can manage collection prompts" on collection_prompts for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can manage creators" on creators;
create policy "Admins can manage creators" on creators for all to authenticated using (public.is_admin()) with check (public.is_admin());
