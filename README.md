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

### Prerequisites

#### **Redis** (Cache & Job Queue):

BullMQ uses `Redis` for job queuing, and the app caches files and API responses in Redis. If `docker` is available, you can start a Redis instance with:
```bash
docker run -d -p 6379:6379 redis:alpine
```

For more installation options, visit [Redis' GitHub repository](https://github.com/redis/redis).

#### **yt-dlp** (Downloader):
Downloads YouTube videos and extracts high-quality MP3 audio. If Python is installed, you can install yt-dlp with:
```bash
pip install yt-dlp
```

#### **FFmpeg** (Audio Processing):
Required by yt-dlp for audio format conversion and extraction
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH

### Setup Steps

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

3. Start Redis server (in a separate terminal):

4. Run the development server:
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