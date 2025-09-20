<div align="center">
  <img src="./public/tuneport.png" alt="Tuneport Logo" width="120" height="120" style="border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);" />
  
  <h1 style="background: linear-gradient(135deg, #a855f7, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 3rem; font-weight: bold; margin: 1rem 0;">
    Tuneport
  </h1>
  
  <p style="font-size: 1.25rem; color: #6b7280; margin-bottom: 2rem;">
    Spotify to YouTube MP3 downloader
  </p>
</div>

---

Tuneport connects your Spotify library to YouTube for high-quality MP3 downloads. Built with Next.js 15, tRPC, and BullMQ for queued processing.

## Features

- Spotify OAuth: Fetch liked songs & playlists
- YouTube matching: Smart search by track/artist/duration
- Batch queuing: Up to 50 tracks via BullMQ/Redis
- Audio extraction: 320K MP3s with yt-dlp & ffmpeg
- Responsive UI: Modern theme, progress tracking
- Secure: NextAuth with PKCE

## Tech Stack

- Next.js 15 (hybrid routing)
- tRPC + Zod + SuperJSON
- NextAuth (Spotify)
- BullMQ + Redis (jobs)
- yt-dlp (downloads)
- Tailwind CSS v4 + TypeScript

## Quickstart

1. Clone & install:
   ```bash
   git clone <repo> tuneport
   cd tuneport
   npm install
   ```

2. Setup `.env.local` from `.env.example`:
   - `AUTH_SECRET`: `npx auth secret`
   - Spotify: Client ID/Secret from [developer.spotify.com](https://developer.spotify.com/dashboard)
   - YouTube: API key from [Google Console](https://console.cloud.google.com/apis/library/youtube.googleapis.com)
   - Redis: Defaults to localhost:6379

3. Install tools:
   - yt-dlp: `pip install yt-dlp`
   - ffmpeg: Add to PATH
   - Start Redis server

4. Run:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000, auth with Spotify, and start downloading.

## Commands

- `npm run dev` - Dev server (Turbopack)
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run check` - Lint + types
- `npm run lint:fix` - Fix lint
- `npm run format:write` - Format (Prettier/Tailwind)

## Structure

- `src/pages/` - Pages & tRPC API
- `src/server/` - Routers, services, queue/workers
- `src/components/music/` - Track UI
- `src/contexts/` - Download state
- `~/` alias for src/

## Notes

- Downloads: Auto-worker via `init.ts`; 90s timeout/job; Redis storage, serve via `/api/download/[id]`
- Production: Secure Redis; separate worker; monitor queues
- Gotchas: Hybrid auth (app router) vs tRPC (pages); explicit content filter in searches
- Contribute: PRs welcome; follow ESLint/Prettier.