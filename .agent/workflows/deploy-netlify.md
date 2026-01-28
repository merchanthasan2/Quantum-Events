---
description: How to deploy Quantum Events to Netlify
---

# Deploying to Netlify

Follow these steps to deploy the Quantum Events platform to Netlify.

### 1. Prerequisites
- A Netlify account.
- The project connected to a GitHub repository (recommended).
- Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

### 2. Environment Variables
In your Netlify Project Settings, add the following Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
- `DATABASE_URL`: Your Supabase connection string (if using Prisma/Migrations).

### 3. Build Settings
Netlify should automatically detect the following settings:
- **Build command**: `npm run build`
- **Publish directory**: `.next`

### 4. Background Scraper (Important)
The current scraper uses `puppeteer`, which requires a Chrome binary. Standard serverless functions may not support this.
- For production, it is recommended to use a service like **Browserless.io** and update the `ScraperService` to connect via `puppeteer.connect()`.
- Alternatively, deploy the scraper as a **Netlify Background Function** (requires Pro tier) or a separate worker.

### 5. Manual Deployment
If you prefer to deploy via CLI:
```bash
npm install -g netlify-cli
netlify login
netlify deploy --build
```
