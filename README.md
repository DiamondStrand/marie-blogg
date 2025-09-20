# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Environment

Create a `.env` file with:

```sh
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
PRIVATE_SPACE_KEY=uuid-of-space
```

Data is fetched server-side from Supabase using these variables. No client-side keys are exposed.

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## SEO

This project includes:

- Dynamic sitemap at `/sitemap.xml` (auto-includes posts and key pages)
- Robots at `/robots.txt` with sitemap reference
- RSS feed at `/rss.xml`
- Per-page meta tags and JSON-LD implemented for home, list, and post pages
- See `src/lib/docs/seo.md` for the full 2025 SEO playbook

Optional: after deploys you can notify search engines of sitemap updates (replace domain):

```sh
curl -s "https://www.google.com/ping?sitemap=https://example.com/sitemap.xml" > /dev/null
curl -s "https://www.bing.com/ping?sitemap=https://example.com/sitemap.xml" > /dev/null
```
