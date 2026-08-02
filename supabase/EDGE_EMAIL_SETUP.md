# Creator signup email (Supabase Edge Function + Resend)

Sends **you** an email when a row is inserted into `creators`.

**To:** `AstroBull.Robinhood@Gmail.com`  
**From:** `Astro Bull <onboarding@resend.dev>` (Resend test domain — works immediately)

> Never paste API keys, JWTs, or service_role keys into chat.  
> If you already shared one, rotate it in Supabase → Settings → API.

---

## Step 1 — Resend account (free)

1. Go to [https://resend.com](https://resend.com) → sign up  
2. **API Keys → Create** → copy key (starts with `re_`)  
3. Keep it private — only goes into Supabase secrets

With `onboarding@resend.dev` you can only send **to the email you verified on Resend** while testing.  
Verify `AstroBull.Robinhood@Gmail.com` in Resend if needed, or use that same address as the Resend account email.

---

## Step 2 — Deploy the Edge Function

### Option A — Dashboard (easiest)

1. Supabase → your project → **Edge Functions**  
2. **Create a new function** named exactly: `creator-signup-notify`  
3. Paste the full contents of:

   `supabase/functions/creator-signup-notify/index.ts`

   (from the GitHub repo)  
4. **Deploy**

### Option B — CLI (if you use it locally)

```bash
supabase functions deploy creator-signup-notify
```

---

## Step 3 — Function secrets (not Vercel)

Supabase → **Edge Functions → Secrets** (or Project Settings → Edge Functions):

| Name | Value |
|---|---|
| `RESEND_API_KEY` | your `re_...` key |
| `OWNER_EMAIL` | `AstroBull.Robinhood@Gmail.com` |

Save.

---

## Step 4 — Database Webhook (fires on signup)

1. Supabase → **Database → Webhooks** (or Integrations → Webhooks)  
2. **Create a new hook**  
3. Settings:

| Field | Value |
|---|---|
| Name | `notify-creator-signup` |
| Table | `creators` |
| Events | **Insert** only |
| Type | Supabase Edge Function **or** HTTP Request |
| Function / URL | `creator-signup-notify` |

If only HTTP is offered, use:

```text
https://YOUR_PROJECT_REF.supabase.co/functions/v1/creator-signup-notify
```

Headers (if HTTP):

```text
Authorization: Bearer YOUR_ANON_OR_SERVICE_KEY
Content-Type: application/json
```

Prefer linking the Edge Function directly so you don’t put keys in the webhook UI long-term.

---

## Step 5 — Test

1. Supabase → **Table Editor → creators → Insert row** (fake name/email/wallet)  
   **or** submit `/signup` on the live site  
2. Check **AstroBull.Robinhood@Gmail.com** (and spam)  
3. Edge Functions → `creator-signup-notify` → **Logs** if no email  

---

## What stays on Vercel (separate)

| Vercel var | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Site talks to DB |
| `VITE_SUPABASE_ANON_KEY` | Site talks to DB |
| `VITE_ADMIN_PASSWORD` | `/admin` login |

**Do not** put `RESEND_API_KEY` in Vercel `VITE_*` — that exposes it in the browser.

---

## Function behaviour (summary)

- Reads `RESEND_API_KEY` and `OWNER_EMAIL` from **secrets**  
- `from`: `Astro Bull <onboarding@resend.dev>`  
- `to`: `AstroBull.Robinhood@Gmail.com`  
- Body: name, email, wallet, handles, status, admin link  
