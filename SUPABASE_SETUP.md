# Supabase + admin password + email alerts

## Two different things (easy to mix up)

| What | Env var | Purpose |
|---|---|---|
| **Admin login password** | `VITE_ADMIN_PASSWORD` | Unlocks `/admin` inbox |
| **Email alerts to you** | `VITE_WEB3FORMS_ACCESS_KEY` | Real email in **your** inbox on each signup |
| Database | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` | Saves creators in cloud |

`VITE_OWNER_EMAIL` alone does **not** auto-email you — it only opens a mail draft on the visitor’s device. Prefer **Web3Forms**.

---

## A. Supabase tables (you said these are done)

If not: run [`supabase/setup.sql`](./supabase/setup.sql) in Supabase SQL Editor.

---

## B. Admin password (login)

1. Vercel → Project → **Settings → Environment Variables**
2. Add:

```
VITE_ADMIN_PASSWORD =  (a long random password you will remember)
```

3. **Redeploy**
4. Open `https://www.astrobull.xyz/admin` → enter that password

This is **not** an email field. It’s only the unlock code for the inbox.

---

## C. Admin email alerts (the part that usually gets stuck)

### Recommended: Web3Forms (free, real email to your inbox)

1. Open **[https://web3forms.com](https://web3forms.com)**
2. Type **your** email (the inbox you want alerts in) → create access key
3. Check that inbox → **confirm / activate** the key (required)
4. Copy the **Access Key**
5. In Vercel env vars add:

```
VITE_WEB3FORMS_ACCESS_KEY =  (paste access key)
```

6. **Redeploy** (env vars only apply after redeploy)
7. Test: submit `/signup` with a fake creator → you should get an email within a minute  
   (check spam once)

### Optional: Discord instead of / as well as email

1. Discord channel → Edit → Integrations → Webhooks → New → Copy URL  
2. Vercel:

```
VITE_NOTIFY_WEBHOOK_URL =  (Discord webhook URL)
```

3. Redeploy

---

## D. Full Vercel env checklist

| Name | Required | Example |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | `eyJ...` |
| `VITE_ADMIN_PASSWORD` | Yes | strong password |
| `VITE_WEB3FORMS_ACCESS_KEY` | For real email | from web3forms.com |
| `VITE_NOTIFY_WEBHOOK_URL` | Optional | Discord webhook |
| `VITE_OWNER_EMAIL` | Optional / weak | only mailto fallback |

After any change → **Deployments → Redeploy**.

---

## E. Test

1. Redeploy with all env vars  
2. `/signup` → submit test creator  
3. Supabase Table Editor → `creators` has the row  
4. Your email inbox has “Astro Bull · new creator …”  
5. `/admin` + password → see row (source: **cloud**) → Approve  

Admin page also shows a status panel: Supabase / password / email / webhook.

---

## Troubleshooting email

| Symptom | Fix |
|---|---|
| No email | Key not confirmed on Web3Forms, or forgot redeploy |
| Still opens visitor’s mail app | You only set `VITE_OWNER_EMAIL` — switch to Web3Forms |
| Wrong inbox | Create a new Web3Forms key with the correct email |
| Spam | Mark as not spam once; add filter for “Astro Bull” |

---

## Security note

Anon key + UI password is fine for early launch. For stricter admin later, move approve/reject to a server function with the Supabase **service role** (never put service role in `VITE_*`).

## Herd chat table (optional)

```sql
create table if not exists public.herd_chat (
  id uuid primary key default gen_random_uuid(),
  handle text not null,
  body text not null,
  created_at timestamptz default now()
);

alter table public.herd_chat enable row level security;

create policy "public read herd_chat"
  on public.herd_chat for select
  to anon, authenticated
  using (true);

create policy "anon insert herd_chat"
  on public.herd_chat for insert
  to anon, authenticated
  with check (char_length(body) > 0 and char_length(body) <= 400);
```

Local multi-tab chat works without this. Cloud chat needs the table + anon insert/select.
