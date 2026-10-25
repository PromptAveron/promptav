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
  aspect_ratio: string | string[] | null;
  published_at: string | null;
  is_featured: boolean;
  categories: { name: string } | null;
  tags: string[] | null;
};

function mapPrompt(row: PromptRow): PromptRecord {
  const aspectRatios = Array.isArray(row.aspect_ratio)
    ? row.aspect_ratio
    : typeof row.aspect_ratio === 'string'
      ? [row.aspect_ratio]
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
    category: row.categories?.name ?? 'Uncategorized',
    tags: row.tags ?? [],
    aiModel: 'AI image generator',
    style: row.style ?? 'Creative',
    aspectRatios,
    publishedAt: row.published_at ?? new Date(0).toISOString(),
    featured: row.is_featured,
  };
}

export async function getPublishedPrompts(): Promise<PromptRecord[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return promptCatalog;

  const { data, error } = await supabase
    .from('prompts')
    .select('id,title,slug,excerpt,description,prompt_text,negative_prompt,featured_image_url,image_alt,style,aspect_ratio,published_at,is_featured,tags,categories(name)')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    throw new Error(`Unable to load published prompts from Supabase: ${error.message}`);
  }

  return (data as unknown as PromptRow[]).map(mapPrompt);
}
