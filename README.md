# gated-gallery

Password-gated photo gallery. Next.js 14 (App Router) on Vercel, with **Vercel Blob** for image storage and **Vercel KV** (Upstash Redis) for metadata, view counts, and the guestbook.

## Routes

| Route | What it does |
|---|---|
| `/` | Bio + password form. Correct `SITE_PASSWORD` sets an httpOnly cookie and redirects to `/gallery`. Wrong password shows an inline error without a reload. Also shows a rotating blurred teaser image. |
| `/gallery` | Image grid with captions, "Recently added" badges (< 7 days), unique-session view counters, and a cosmetic 24h countdown. **Unauthenticated visitors get server-side-blurred images only** — the full-resolution bytes never leave the server, so the blur cannot be removed in devtools. |
| `/guestbook` | Name + message form (stored in KV, newest first). Redirects to `/` unless the site cookie is present. |
| `/upload` | Admin-only (separate `ADMIN_PASSWORD`, separate cookie). Drag-and-drop or file-picker upload + caption. File goes to Vercel Blob; `{id, url, caption, contentType, uploadedAt}` is prepended to the `images` list in KV. |

## How auth works

- `POST /api/auth/site` and `POST /api/auth/admin` verify passwords with a constant-time comparison and set `site_auth` / `admin_auth` cookies: **httpOnly, secure, sameSite=strict**.
- Cookie values are HMACs derived from the password itself, verified server-side on every request — nothing is enforced in client-side JS, and rotating a password invalidates all sessions.
- Gallery images are proxied through `/api/image/[id]`; Blob URLs are never sent to the browser. Without a valid cookie the route returns a 48px, Gaussian-blurred JPEG generated with `sharp`.

## KV layout

- `images` — list of JSON `{id, url, caption, contentType, uploadedAt}`, newest first
- `views:{id}` — set of session ids (unique-session view counting)
- `guestbook` — list of JSON `{name, message, timestamp}`, newest first

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
