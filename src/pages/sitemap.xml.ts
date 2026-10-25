import { getPublishedPrompts } from '../lib/prompts';
import { siteConfig } from '../lib/site';

export async function GET() {
  const baseUrl = siteConfig.url;
  const promptCatalog = await getPublishedPrompts();
  const urls = [
    '',
    '/prompts',
    '/categories',
    '/collections',
    ...promptCatalog.map((item) => `/prompts/${item.slug}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (path) => `
    <url>
      <loc>${baseUrl}${path}</loc>
      <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    </url>`,
    )
    .join('')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
