# Tuneport

Tuneport helps you move from streaming to ownership: sign in with Spotify, select tracks or playlists, match them on YouTube, and queue MP3 downloads with progress tracking.

## What You Can Do

- Sign in with Spotify and browse liked songs or playlists
- Match tracks against YouTube results
- Queue single or batch downloads
- Track active, completed, and failed jobs in the downloads widget
- Use either Spotify Library mode or YouTube to MP3 mode
- Switch between dark and light themes in the app

## Stack

- Next.js (Pages Router)
- React + TypeScript
- next-auth for Spotify authentication
- tRPC for API routing
- Tailwind CSS for styling
- BullMQ + Redis for queueing and caching
- yt-dlp + FFmpeg for audio extraction

## Requirements

- [Docker](https://docs.docker.com/engine/install/)
- [Spotify app credentials](https://developer.spotify.com/dashboard)
- [YouTube Data API key](https://developers.google.com/youtube/registering_an_application)

For local Spotify auth, add this callback URL in your Spotify app settings:

- `http://127.0.0.1:3000/api/auth/callback/spotify`

## Quick Start (Docker Compose)

1. Create your env file from `.env.example`:

   ```bash
   cp .env.example .env
   ```

2. Fill in `.env` values:
   - `AUTH_SECRET` (generate with `npx auth secret`)
   - `NEXTAUTH_URL` (use `http://127.0.0.1:3000` for local Docker runs)
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `YOUTUBE_API_KEY`
   - `REDIS_PASSWORD` (optional)

3. Start app + Redis:

   ```bash
   docker compose up -d --build
   ```

4. Open http://127.0.0.1:3000

5. Stop services:

   ```bash
   docker compose down
   ```

## Optional: Local development without Docker

Use this if you want to run with `npm` directly.

Extra requirements:

- [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Redis](https://hub.docker.com/_/redis)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp?tab=readme-ov-file#installation) available in PATH
- [FFmpeg](https://www.ffmpeg.org/download.html) available in PATH

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure `.env` (`NEXTAUTH_URL=http://127.0.0.1:3000`, `REDIS_HOST=localhost`, `REDIS_PORT=6379`)

3. Start Redis (example):

   ```bash
   docker run -d -p 6379:6379 redis:alpine
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open http://127.0.0.1:3000

## Scripts

- `npm run dev` - Start development server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks
- `npm run check` - Run lint + typecheck
- `npm run format:write` - Format files
- `npm run test` - Run tests
