export const siteConfig = {
  name: 'PromptAveron',
  description: 'Creative AI image prompts for portraits, photography, anime, fantasy, product visuals, and editorial storytelling.',
  url: 'https://promptavero.github.io',
  defaultTheme: 'light',
  social: {
    x: 'https://x.com',
    instagram: 'https://instagram.com',
    pinterest: 'https://pinterest.com',
  },
};

export type PromptRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  shortDescription: string;
  description: string;
  mainPrompt: string;
  negativePrompt?: string;
  imageUrl: string;
  category: string;
  tags: string[];
  aiModel: string;
  style: string;
  aspectRatios: string[];
  publishedAt: string;
  featured?: boolean;
  trending?: boolean;
};

export const promptCatalog: PromptRecord[] = [
  {
    id: 'sunset-portrait',
    title: 'Cinematic Sunset Portrait',
    slug: 'cinematic-sunset-portrait',
    excerpt: 'A warm editorial portrait with golden hour light and filmic detail.',
    shortDescription: 'Warm editorial portrait with cinematic color grading and subtle dramatic atmosphere.',
    description: 'A luminous portrait built for premium editorial storytelling with realistic skin texture, emotional focus, and cinematic lighting.',
    mainPrompt: 'A cinematic portrait of a young creative woman standing in soft golden hour light, dramatic side lighting, realistic skin texture, subtle wind in hair, editorial composition, shallow depth of field, richly layered background bokeh, photorealistic, ultra detailed, natural tones, 85mm lens, volumetric light, high-end fashion portrait photography',
    negativePrompt: 'blurry, text, watermark, low detail, oversaturated, warped anatomy, duplicate features',
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
    category: 'AI Portraits',
    tags: ['portrait', 'cinematic', 'golden hour', 'editorial'],
    aiModel: 'Midjourney',
    style: 'Cinematic',
    aspectRatios: ['1:1', '4:5', '9:16'],
    publishedAt: '2025-10-01',
    featured: true,
    trending: true,
  },
  {
    id: 'anime-fantasy',
    title: 'Anime Fantasy Character',
    slug: 'anime-fantasy-character',
    excerpt: 'An enchanted anime heroine surrounded by glowing magical scenery.',
    shortDescription: 'A fantasy anime character with magical atmosphere, expressive detail, and refined color storytelling.',
    description: 'Detailed fantasy illustration blending anime line work with rich cinematic color and magical atmosphere.',
    mainPrompt: 'A fantasy anime heroine with silver-blue hair, floating lantern lights, glowing magical forest, expressive eyes, elegant costume, ornate accessories, layered depth, painterly background, soft atmospheric lighting, highly detailed, vibrant fantasy art, dynamic pose, cinematic composition, anime style',
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80',
    category: 'Anime and Manga',
    tags: ['anime', 'fantasy', 'character'],
    aiModel: 'Stable Diffusion',
    style: 'Anime',
    aspectRatios: ['3:4', '2:3', '9:16'],
    publishedAt: '2025-09-26',
    featured: true,
  },
  {
    id: 'minimal-product',
    title: 'Minimal Product Photography',
    slug: 'minimal-product-photography',
    excerpt: 'Luxury e-commerce product still life with soft shadows and premium materials.',
    shortDescription: 'Clean product shot with premium materials, soft shadows, and refined commercial styling.',
    description: 'Editorial product photography for premium consumer goods, with a restrained palette, tactile surfaces, and boutique-level presentation.',
    mainPrompt: 'Minimalist product photography of a luxury skincare bottle on a soft neutral background, realistic glass reflections, subtle shadows, premium commercial styling, crisp focus, no clutter, soft natural light, clean composition, high-end brand aesthetic, 50mm lens, photorealistic, studio quality',
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
    category: 'Product Photography',
    tags: ['product', 'minimal', 'commercial'],
    aiModel: 'Flux',
    style: 'Commercial',
    aspectRatios: ['1:1', '4:5', '3:4'],
    publishedAt: '2025-09-18',
  },
  {
    id: 'editorial-fashion',
    title: 'Luxury Editorial Fashion Portrait',
    slug: 'luxury-editorial-fashion-portrait',
    excerpt: 'Elegant high-fashion portrait with polished textures and a refined studio atmosphere.',
    shortDescription: 'Luxury fashion portrait with soft contrast, premium styling, and intentional editorial shapes.',
    description: 'High-fashion portrait with rich textures and stylized, magazine-quality composition for campaigns and trend-forward visuals.',
    mainPrompt: 'Luxury editorial fashion portrait of a confident model in a tailored deep plum coat, dramatic studio lighting, glossy hair, subtle shadows, fashion magazine composition, soft skin retouching, editorial color grading, high-end couture aesthetic, realistic details, 85mm lens, premium commercial photography',
    imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',
    category: 'Fashion and Editorial',
    tags: ['fashion', 'editorial', 'portrait'],
    aiModel: 'Leonardo',
    style: 'Editorial',
    aspectRatios: ['4:5', '9:16', '3:4'],
    publishedAt: '2025-09-10',
  },
  {
    id: 'reading-lake',
    title: 'Cozy Reading by the Lake',
    slug: 'cozy-reading-by-the-lake',
    excerpt: 'A quiet literary scene with warm light, soft textures, and tranquil nature.',
    shortDescription: 'Soft, atmospheric reading scene set beside a reflective lake and warm afternoon light.',
    description: 'Comforting nature and lifestyle composition with intimate storytelling and a calm, thoughtful mood.',
    mainPrompt: 'A cozy reading scene beside a calm lake at golden hour, woman in a knit sweater seated on a wooden chair, warm sunlight, rich autumn palette, gentle winds, natural textures, tranquil mood, soft focus background, cinematic realism, detailed environment, lifestyle photography',
    imageUrl: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80',
    category: 'Landscapes and Nature',
    tags: ['lifestyle', 'nature', 'cozy'],
    aiModel: 'DALL·E 3',
    style: 'Realistic',
    aspectRatios: ['1:1', '16:9', '4:5'],
    publishedAt: '2025-08-28',
    trending: true,
  },
  {
    id: 'cyberpunk-neon',
    title: 'Cyberpunk Neon Street',
    slug: 'cyberpunk-neon-street',
    excerpt: 'Moody futuristic city alley flooded with rain-soaked neon reflections.',
    shortDescription: 'Futuristic cyberpunk street with rain, reflections, and electric atmosphere.',
    description: 'Urban sci-fi composition with mood, depth, and saturated color for atmospheric concept imagery.',
    mainPrompt: 'A neon-lit cyberpunk street at night, wet pavement reflecting vibrant purple and cyan lights, futuristic architecture, rainy atmosphere, cinematic composition, moody shadows, dramatic urban energy, highly detailed, realistic reflections, sci-fi illustration, volumetric lighting',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    category: 'Social Media Content',
    tags: ['cyberpunk', 'neon', 'city'],
    aiModel: 'Midjourney',
    style: 'Sci-Fi',
    aspectRatios: ['16:9', '9:16', '1:1'],
    publishedAt: '2025-08-15',
  },
  {
    id: 'dreamy-floral',
    title: 'Dreamy Floral Illustration',
    slug: 'dreamy-floral-illustration',
    excerpt: 'An airy botanical piece with painterly forms and luminous pastel depth.',
    shortDescription: 'Dreamlike floral illustration with pastel depth and soft editorial storytelling.',
    description: 'A soft botanical illustration combining painterly shapes with carefully layered color and romantic atmosphere.',
    mainPrompt: 'Dreamy floral illustration with layered petals in blush pink, lavender, and cream, painterly textures, soft sunlight, delicate composition, ornate leaves, airy negative space, magical realism, romantic botanical art, highly detailed, editorial illustration, transparent pastel palette',
    imageUrl: 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=1200&q=80',
    category: 'Digital Illustration',
    tags: ['illustration', 'floral', 'dreamy'],
    aiModel: 'Adobe Firefly',
    style: 'Illustration',
    aspectRatios: ['1:1', '3:4', '4:5'],
    publishedAt: '2025-08-01',
  },
  {
    id: 'vintage-travel',
    title: 'Vintage Travel Poster',
    slug: 'vintage-travel-poster',
    excerpt: 'Retro-inspired travel art with layered typography and nostalgic landscapes.',
    shortDescription: 'Retro poster art with layered shapes, warm travel nostalgia, and strong composition.',
    description: 'A travel-poster concept designed to feel tactile, nostalgic, and bright while preserving modern print clarity.',
    mainPrompt: 'Vintage travel poster featuring a coastal town at sunset, layered typography, nostalgic color palette, retro advertising style, hand-painted textures, dramatic sky, stylized landmarks, poster composition, cinematic warmth, richly detailed illustration',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    category: 'Posters and Stickers',
    tags: ['poster', 'travel', 'vintage'],
    aiModel: 'Leonardo',
    style: 'Poster',
    aspectRatios: ['3:4', '2:3', '16:9'],
    publishedAt: '2025-07-14',
  },
];
