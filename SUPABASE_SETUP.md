# Supabase + admin + notifications (Astro Bull)

Finish this after the site is on Vercel / GitHub.

## 1. Create Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Name it e.g. `astrobull`, set a DB password, pick a region
3. Wait until the project is ready

## 2. Run the SQL schema

1. Supabase → **SQL Editor** → **New query**
2. Paste **all** of [`supabase/setup.sql`](./supabase/setup.sql)
3. Click **Run** (should succeed with no errors)
4. Confirm tables under **Table Editor**: `creators`, `leaderboard`

## 3. Copy API keys

Supabase → **Project Settings** → **API**:

| Copy this | Paste into Vercel as |
|---|---|
| Project URL | `VITE_SUPABASE_URL` |
| `anon` `public` key | `VITE_SUPABASE_ANON_KEY` |

Never put the `service_role` key in Vercel `VITE_*` vars (it is exposed to browsers).

## 4. Vercel environment variables

Vercel → your project → **Settings** → **Environment Variables**  
Add for **Production** (and Preview if you want):

| Name | Example | Required |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://abcd.supabase.co` | Yes (for cloud signups) |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | Yes |
| `VITE_ADMIN_PASSWORD` | long random string | **Yes — change default** |
| `VITE_OWNER_EMAIL` | `you@gmail.com` | For mailto alerts |
| `VITE_NOTIFY_WEBHOOK_URL` | Discord webhook URL | Optional, better alerts |

Then **Redeploy** (env vars only apply after a new deploy).

## 5. Admin password

- Page: `https://www.astrobull.xyz/admin`
- Password = value of `VITE_ADMIN_PASSWORD`
- Default in code if unset: `astro-herd` — **do not leave this live**

## 6. Notifications

On each successful signup the site:

1. Saves to Supabase `creators` (if keys set)
2. Fires **Discord/Zapier webhook** if `VITE_NOTIFY_WEBHOOK_URL` is set
3. Opens a **mailto** draft if `VITE_OWNER_EMAIL` is set (uses the visitor’s email app)

### Discord webhook (recommended)

1. Discord server → channel → **Edit channel** → **Integrations** → **Webhooks** → New
2. Copy URL → `VITE_NOTIFY_WEBHOOK_URL` in Vercel
3. Redeploy

### Supabase Database Webhook (optional, no browser needed)

1. Supabase → **Database** → **Webhooks**
2. Table `creators`, event **Insert**
3. HTTP POST to the same Discord URL or a Zapier “Catch Hook”

## 7. Test checklist

1. Redeploy Vercel with env vars  
2. Open `/signup` → submit a test creator  
3. Supabase **Table Editor** → `creators` → new row appears  
4. Open `/admin` → unlock with your password → see the row (source: **cloud**)  
5. Approve / Reject → status updates in Supabase  
6. Discord/email notification arrives  

## 8. Leaderboard (optional)

Insert rows manually in Table Editor → `leaderboard`, or later wire stats automation.  
Public site reads with the anon key (select-only).

## Security note

This MVP uses the **anon** key from the browser + an admin **UI password**.  
Anyone with the anon key can still hit the REST API if they reverse-engineer the site (normal for public Supabase).  
For higher security later: move approve/reject to a Supabase Edge Function or Vercel server function with the **service role** key (never `VITE_`).
