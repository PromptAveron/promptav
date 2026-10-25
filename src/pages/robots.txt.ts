export async function GET() {
  return new Response(`User-agent: *\nAllow: /\nSitemap: https://promptaveron.github.io/sitemap.xml\nDisallow: /admin/\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
