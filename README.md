<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Yapendik School OS

School Operating System & Institutional Workspace for Yapendik.

## Tech Stack
- **Package Manager**: `pnpm` (v11+)
- **Runtime / Frontend**: Node.js (v24+) / React 19 (`react`, `react-dom`)
- **Language**: TypeScript 5.8+
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Backend / Database**: Supabase (`@supabase/supabase-js`)
- **Build Tool**: Vite 6

## Run Locally

**Prerequisites:** Node.js (v20+ / v24+) & `pnpm`

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Environment Variables:
   Configure [.env.local](file:///d:/PROJECT/yapendik-tk-pilot/.env.local) with your credentials:
   - `GEMINI_API_KEY`: Google Gemini API Key
   - `VITE_SUPABASE_URL`: Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Supabase Anon Public Key

3. Run Development Server:
   ```bash
   pnpm dev
   ```

4. Build & Check Types:
   ```bash
   pnpm lint
   pnpm build
   ```

