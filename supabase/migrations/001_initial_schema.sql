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
  main_prompt text not null,
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

create policy "Public can read published content" on prompts for select using (status = 'published');
create policy "Public can read published categories" on categories for select using (true);
create policy "Public can read published collections" on collections for select using (status = 'published');
create policy "Public can read creators" on creators for select using (true);
create policy "Public can read tags" on tags for select using (true);
create policy "Public can read prompt tags" on prompt_tags for select using (true);
create policy "Public can read prompt variants" on prompt_variants for select using (true);
create policy "Public can read images" on prompt_images for select using (true);

create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

create policy "Admins can manage all content" on prompts for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin')) with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can manage categories" on categories for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin')) with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can manage tags" on tags for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin')) with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can manage collections" on collections for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin')) with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can manage creators" on creators for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin')) with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
