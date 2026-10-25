# PromptAveron

PromptAveron is an Astro static site for discovering AI image prompts, with Supabase-backed build-time publishing, an authenticated editorial dashboard, and GitHub Pages deployment.

## Local development

1. Install Node.js 22 or newer.
2. Install dependencies: `npm ci`
3. Copy `.env.example` to `.env` and set `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`.
4. Run `npm run dev`.

Without Supabase environment variables, the local site uses the clearly identified in-repo sample catalog. With Supabase configured, public pages are generated from published database records; a database/schema error fails the build rather than silently falling back.

## Supabase project setup

1. In the Supabase SQL Editor, run [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql). The migration preserves existing prompt records and makes `prompt_text` and `main_prompt` compatible.
2. Create an administrator in Supabase Authentication (email/password). Public sign-up should remain disabled.
3. Add that user to `profiles` from the SQL Editor, replacing the UUID with the Auth user's ID:

   ```sql
   insert into public.profiles (id, display_name, role)
   values ('AUTH_USER_UUID', 'Site Administrator', 'admin')
   on conflict (id) do update set role = 'admin';
   ```

   Role changes must be performed only by a trusted project owner using the Supabase SQL Editor.
4. Confirm RLS is enabled and test that anonymous requests can read only `published` prompts. Admin policies use the protected `public.is_admin()` database function.
5. Set local build variables in `.env`:

   ```env
   PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

   The anon key is intentionally public in browser/static builds. Never use a service-role key in this project or in a browser.

## Admin and publishing

- Visit `/admin/`, sign in with the administrator account, save draft prompts, and publish them.
- The dashboard verifies the user's `profiles.role` through Supabase RLS. Hiding `/admin/` is not a security boundary.
- Publishing calls the `publish-site` Supabase Edge Function. The function checks the authenticated user and admin role before dispatching the GitHub workflow.
- Deploy the Edge Function from a trusted machine with Supabase CLI access:

  ```powershell
  supabase login
  supabase link --project-ref jcgznqtglnqtrkaqqfjs
  supabase secrets set GITHUB_TOKEN=<fine-grained-token> GITHUB_REPOSITORY=PromptAveron/promptaveron.github.io GITHUB_WORKFLOW=deploy.yml ALLOWED_ORIGIN=https://promptaveron.github.io
  supabase functions deploy publish-site
  ```

  The GitHub token belongs only in Supabase Function secrets and needs Actions write access to this repository. Never paste it into source code or frontend environment variables.
- In GitHub repository Settings → Secrets and variables → Actions, add `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` secrets. The workflow fails when either is absent.
- In Settings → Pages, set the source to GitHub Actions. Pushes to `main` and authenticated workflow dispatches build and deploy the static site.
- A rebuild can be retried from the dashboard if the Edge Function reports a dispatch error. The public site continues serving the last successful Pages deployment until a replacement build deploys.

## Build and checks

```bash
npm run check
npm run build
npm run preview
```

The build creates HTML for every currently published prompt, plus sitemap and robots files. No published prompts is a valid empty state.

## Deployment URL

The configured GitHub Pages URL is `https://promptaveron.github.io`. If using a different domain, update `site` in `astro.config.mjs`, `url` in `src/lib/site.ts`, `PUBLIC_SITE_URL`, and the Edge Function's `ALLOWED_ORIGIN`.
