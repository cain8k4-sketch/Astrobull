# Astro Bull

Community-powered meme movement site on Robinhood Chain.  
Create free → get featured → get paid.

## Live preview (local)

```bash
npm install
npm run dev
```

## Deploy to Vercel (recommended)

1. Push this repo to GitHub (already set up as `cain8k4-sketch/Astrobull`).
2. Go to [vercel.com/new](https://vercel.com/new) → **Import** this repository.
3. Framework preset: **Other** (Nitro / TanStack Start handles output).
4. Build settings (usually auto-detected):
   - **Install command:** `npm install`
   - **Build command:** `npm run build`
   - **Output:** leave default (Nitro writes `.vercel/output`)
5. Optional env vars (Project → Settings → Environment Variables):

| Variable | Purpose |
|---|---|
| `VITE_ADMIN_PASSWORD` | Admin inbox password (change from default) |
| `VITE_OWNER_EMAIL` | Mailto alerts on new creator signups |
| `VITE_SUPABASE_URL` | Live creators / leaderboard |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `DATABASE_URL` | Neon Postgres for auth + migrations |

6. Deploy. Your site gets a `*.vercel.app` URL; add a custom domain under Project → Domains.

## Important

- Upload **package.json at the repo root** (this folder structure). Do not nest the app inside another folder.
- Videos live in `/public` and ship with the build.
- Admin path: `/admin` — set `VITE_ADMIN_PASSWORD` before going public.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build + migrations |
| `npm run typecheck` | TypeScript check |
