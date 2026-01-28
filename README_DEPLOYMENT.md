# 🚀 Deployment Guide - Quantum Events

This guide explains how to deploy the **India Events Platform** to Netlify for the trial and prepare for the cPanel transition later.

## 1. Netlify Deployment (Current Trial)

### Environment Variables
You MUST add these to your Netlify Project Settings (**Site configuration > Environment variables**):
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anonymous Key.
- `ANTHROPIC_API_KEY`: (Optional) Your Claude API key for AI features.

### Important Note on Scraping (Puppeteer)
Netlify Functions (which power the `/api/admin/sync` route) have a **10-second timeout** by default. Running Puppeteer in these functions is resource-heavy and may fail because Chromium is not pre-installed in standard serverless environments.

**Workaround for Trial:**
If the "Sync Live Events" button fails on Netlify:
1. Run the sync locally using the command: `npx ts-node src/dev-sync.ts`. This will push the real events from your machine to the live Supabase database.
2. The website (Netlify) will immediately reflect these changes.

## 2. cPanel Deployment (Future Phase)

When you move to cPanel:
1. Ensure your cPanel plan supports **Node.js** (look for "Setup Node.js App").
2. Use the **Next.js Custom Server** or a standalone build.
3. **Puppeteer**: Most shared cPanel hosts do not allow Chromium. We recommend moving the scraper to a **GitHub Action** (Cron Job) that runs every 6 hours and updates Supabase directly. This keeps the web server fast and avoid resource conflicts.

## 3. Build & Test locally
```bash
npm run build
npm run start
```

---
Built with ❤️ for Quantum Events.
