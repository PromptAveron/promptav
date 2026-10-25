# PromptAveron

PromptAveron is a production-style static-first AI image prompt library and CMS concept built with Astro, React, Tailwind CSS, and Supabase-ready architecture for GitHub Pages deployment.

## Features

- Responsive homepage and editorial design
- Prompt library and detail pages generated as static routes
- Category, tag, and collection landing pages
- Supabase-ready architecture and admin dashboard shell
- SEO-friendly metadata and sitemap-ready structure

## Getting started

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Deployment notes

- Configure `site` in `astro.config.mjs` for your GitHub Pages URL or custom domain.
- Add environment variables for Supabase and deployment workflow configuration.
- Use GitHub Actions to build and deploy the generated static site.

## Supabase setup

1. Create a Supabase project.
2. Add the public and private keys to a `.env` file or GitHub secrets.
3. Run the SQL schema and RLS migrations in `supabase/migrations`.
4. Configure the storage bucket and policies for prompt media.
5. Set up the secure admin allowlist and publish trigger.

## Project structure

```text
src/
  components/
  layouts/
  lib/
  pages/
  styles/
public/
```

## Notes

This project is intentionally structured to support a full production deployment workflow while remaining static-site friendly for GitHub Pages.
