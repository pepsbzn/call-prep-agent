# gated-gallery

Password-gated photo gallery. Next.js 14 (App Router) on Vercel, with **Vercel Blob** for image storage and **Vercel KV** (Upstash Redis) for metadata, view counts, and the guestbook.

## Routes

| Route | What it does |
|---|---|
| `/` | Bio + password form. Correct `SITE_PASSWORD` sets an httpOnly cookie and redirects to `/gallery`. Wrong password shows an inline error without a reload. Also shows a rotating blurred teaser image. |
| `/gallery` | Image grid with captions, "Recently added" badges (< 7 days), unique-session view counters, and a cosmetic 24h countdown. **Unauthenticated visitors get server-side-blurred images only** — the full-resolution bytes never leave the server, so the blur cannot be removed in devtools. |
| `/guestbook` | Name + message form (stored in KV, newest first). Redirects to `/` unless the site cookie is present. |
| `/upload` | Admin-only (separate `ADMIN_PASSWORD`, separate cookie). Drag-and-drop or file-picker upload + caption. File goes to Vercel Blob; `{id, url, caption, contentType, uploadedAt}` is prepended to the `images` list in KV. Also shows a "Sync Google Drive now" button when Drive auto-import is configured (see below). |

## How auth works

- `POST /api/auth/site` and `POST /api/auth/admin` verify passwords with a constant-time comparison and set `site_auth` / `admin_auth` cookies: **httpOnly, secure, sameSite=strict**.
- Cookie values are HMACs derived from the password itself, verified server-side on every request — nothing is enforced in client-side JS, and rotating a password invalidates all sessions.
- Gallery images are proxied through `/api/image/[id]`; Blob URLs are never sent to the browser. Without a valid cookie the route returns a 48px, Gaussian-blurred JPEG generated with `sharp`.

## KV layout

- `images` — list of JSON `{id, url, caption, contentType, uploadedAt}`, newest first
- `views:{id}` — set of session ids (unique-session view counting)
- `guestbook` — list of JSON `{name, message, timestamp}`, newest first
- `drive:imported` — set of Google Drive file ids already imported (dedup for auto-sync)

## Auto-import from Google Drive

Drop a photo into a connected Google Drive folder and it shows up in the gallery without touching `/upload` — a scheduled job (plus a manual "Sync now" button) polls the folder, downloads anything new, and stores it exactly like a manual upload. The **caption is taken from the filename** (`quad-attempt-landing.jpg` → "quad attempt landing"), since there's no UI step to type one — rename the file before dropping it in if you want a specific caption.

This is optional: the site works without it, and `/upload`'s manual form is unaffected either way.

### Setup

1. **Create a Google Cloud project** at https://console.cloud.google.com (or reuse one) and enable the **Google Drive API** (APIs & Services → Library → search "Google Drive API" → Enable).
2. **Create a service account**: IAM & Admin → Service Accounts → Create Service Account. No roles/permissions needed at the project level — access is granted per-folder in step 4.
3. **Create a key** for that service account: open it → Keys tab → Add Key → Create new key → JSON. This downloads a `.json` file — you need two fields from it: `client_email` and `private_key`.
4. **Share the Drive folder** you want to watch with that service account's `client_email` (right-click the folder in Drive → Share → paste the email → Viewer is enough).
5. **Get the folder ID**: open the folder in Drive, copy the last segment of the URL — `https://drive.google.com/drive/folders/<FOLDER_ID>`.
6. **Set the environment variables** on the Vercel project:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` — the `client_email` from the JSON key
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` — the `private_key` from the JSON key, pasted as-is (Vercel's env var UI handles the embedded newlines fine)
   - `GOOGLE_DRIVE_FOLDER_ID` — the folder ID from step 5
   - `CRON_SECRET` — any random string (`openssl rand -hex 32`); this is what lets Vercel's own scheduled invocations call the sync endpoint without needing your admin password
7. **Redeploy.** `vercel.json` already schedules `/api/drive/sync` every 15 minutes.

### A note on cron frequency

Vercel's Hobby (free) plan restricts how often scheduled Cron Jobs actually fire — check your plan's current limits in the Vercel dashboard's Cron Jobs docs/settings, since this has changed over time and a Hobby project may only run the schedule once a day regardless of what's in `vercel.json`. Either way, the **"Sync Google Drive now" button on `/upload`** hits the same endpoint on demand and works regardless of plan, so you're never actually stuck waiting — drop a file in Drive, click the button, it's in the gallery.

Each sync run imports at most 5 new files (to stay well under the function's time limit); anything beyond that picks up on the next run or button click.

## Deploy to Vercel

### 1. Push the repo to GitHub (if not already)

### 2. Create the Vercel project

```bash
npm i -g vercel
vercel login
vercel link        # from the repo root: create a new project when prompted
```

(Or import the repo at https://vercel.com/new — framework is auto-detected as Next.js, no build settings to change.)

### 3. Provision Blob storage

In the Vercel dashboard: **Storage → Create Database → Blob → Create**, then **Connect Project** and select this project.
This automatically adds `BLOB_READ_WRITE_TOKEN` to the project's environment variables.

### 4. Provision KV (Upstash Redis)

Vercel KV is now provided through the Vercel Marketplace as **Upstash for Redis** — the `@vercel/kv` client works with it unchanged.

In the dashboard: **Storage → Create Database → Upstash (Redis) → Create**, then **Connect Project** and select this project.
This automatically adds `KV_REST_API_URL`, `KV_REST_API_TOKEN` (and related `KV_*`/`REDIS_*` vars).

### 5. Set the passwords

```bash
vercel env add SITE_PASSWORD production
vercel env add ADMIN_PASSWORD production
```

(Repeat with `preview`/`development` if you want those environments gated too, or set them under **Project → Settings → Environment Variables**.)

### 6. Deploy

```bash
vercel --prod
```

### 7. Local development

```bash
vercel env pull .env.development.local   # pulls Blob + KV credentials
npm install
npm run dev
```

Note: cookies are set with `secure: true`; Chrome and Firefox accept secure cookies on `http://localhost`, so local dev works as-is.

## Limits worth knowing

- Uploads go through a route handler, so Vercel's **~4.5 MB request body limit** applies per upload. If you need bigger originals, switch `/api/upload` to `@vercel/blob/client` client uploads.
- The countdown on `/gallery` is cosmetic only: it starts at 24:00:00 per browser session and changes nothing when it elapses.
