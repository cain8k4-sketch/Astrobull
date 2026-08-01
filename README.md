# Astro Bull

Community-powered meme movement site on Robinhood Chain.  
Create free → get featured → get paid.

**Live domain:** [https://www.astrobull.xyz](https://www.astrobull.xyz)  
**Repo:** [cain8k4-sketch/Astrobull](https://github.com/cain8k4-sketch/Astrobull)

## Local

```bash
npm install
npm run dev
```

## Deploy (GitHub → Vercel)

1. Code is on `main` of this repo.
2. Vercel project connected to this repo (build: `npm run build`).
3. Domain `astrobull.xyz` / `www` stays on that project — redeploy after env changes.

## Supabase + admin + notifications

Full walkthrough: **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**  
SQL to run once: **[supabase/setup.sql](./supabase/setup.sql)**

### Vercel env vars (minimum)

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_ADMIN_PASSWORD` | `/admin` unlock password |
| `VITE_OWNER_EMAIL` | Mailto alert on signup |
| `VITE_NOTIFY_WEBHOOK_URL` | Discord/Zapier webhook (optional) |

After adding vars → **Redeploy**.

### Routes

| Path | What |
|---|---|
| `/` | Home |
| `/studio` | Creator Studio |
| `/signup` | Creator sign-up → Supabase |
| `/admin` | Password-protected inbox |

## Scripts

| Command | What |
|---|---|
| `npm run dev` | Local dev |
| `npm run build` | Production (Vercel/Nitro) |
| `npm run typecheck` | TypeScript |
