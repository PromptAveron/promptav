import { promptCatalog, type PromptRecord } from './site';
import { getSupabaseClient } from './supabase';

type PromptRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  prompt_text: string;
  negative_prompt: string | null;
  featured_image_url: string | null;
  image_alt: string | null;
  style: string | null;
  ai_model?: string | null;
  aspect_ratio: string | string[] | null;
  seo_title?: string | null;
  meta_description?: string | null;
  published_at: string | null;
  is_featured: boolean;
  is_trending?: boolean;
  categories: { name: string } | null;
  tags: string[] | null;
};

export type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imagePath: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  sortOrder: number;
};

function mapPrompt(row: PromptRow): PromptRecord {
  const aspectRatios = Array.isArray(row.aspect_ratio)
    ? row.aspect_ratio
    : typeof row.aspect_ratio === 'string'
      ? row.aspect_ratio.split(',').map((item) => item.trim()).filter(Boolean)
      : [];
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? '',
    shortDescription: row.excerpt ?? '',
    description: row.description ?? '',
    mainPrompt: row.prompt_text,
    negativePrompt: row.negative_prompt ?? undefined,
    imageUrl: row.featured_image_url ?? '',
    imageAlt: row.image_alt ?? undefined,
    seoTitle: row.seo_title ?? undefined,
    metaDescription: row.meta_description ?? undefined,
    category: row.categories?.name ?? 'Uncategorized',
    tags: row.tags ?? [],
    aiModel: row.ai_model ?? 'AI image generator',
    style: row.style ?? 'Creative',
    aspectRatios,
    publishedAt: row.published_at ?? new Date(0).toISOString(),
    featured: row.is_featured,
    trending: row.is_trending ?? false,
  };
}

export async function getPublishedPrompts(): Promise<PromptRecord[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return promptCatalog;

  const result = await supabase
    .from('prompts')
    .select('id,title,slug,excerpt,description,prompt_text,negative_prompt,featured_image_url,image_alt,style,ai_model,aspect_ratio,seo_title,meta_description,published_at,is_featured,is_trending,tags,categories(name)')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (result.error && (result.error.code === '42703' || result.error.code === 'PGRST204' || result.error.message.toLowerCase().includes('column'))) {
    console.warn(`Supabase CMS fields are not fully migrated yet; building with the legacy published-prompt fields. Apply 002_cms_features.sql to enable all prompt metadata. ${result.error.message}`);
    const legacyResult = await supabase
      .from('prompts')
      .select('id,title,slug,excerpt,description,prompt_text,negative_prompt,featured_image_url,image_alt,style,aspect_ratio,published_at,is_featured,tags,categories(name)')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    if (legacyResult.error) {
      throw new Error(`Unable to load published prompts from Supabase: ${legacyResult.error.message}`);
    }
    return (legacyResult.data as unknown as PromptRow[]).map(mapPrompt);
  }

  if (result.error) {
    throw new Error(`Unable to load published prompts from Supabase: ${result.error.message}`);
  }

  return (result.data as unknown as PromptRow[]).map(mapPrompt);
}

export async function getPublishedCategories(): Promise<CategoryRecord[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [...new Set(promptCatalog.map((prompt) => prompt.category))].map((name, index) => ({
      id: slugifyCategory(name),
      name,
      slug: slugifyCategory(name),
      description: null,
      imagePath: null,
      seoTitle: null,
      seoDescription: null,
      sortOrder: index,
    }));
  }

  const { data, error } = await supabase
    .from('categories')
    .select('id,name,slug,description,image_path,seo_title,seo_description,sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`Unable to load active categories from Supabase: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imagePath: row.image_path,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    sortOrder: row.sort_order,
  }));
}

function slugifyCategory(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
