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

- [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Redis](https://hub.docker.com/_/redis)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp?tab=readme-ov-file#installation) available in PATH
- [FFmpeg](https://www.ffmpeg.org/download.html) available in PATH
- [Spotify app credentials](https://developer.spotify.com/dashboard)
- [YouTube Data API key](https://developers.google.com/youtube/registering_an_application)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local env file from `.env.example` and fill in values:
   - `AUTH_SECRET` (generate with `npx auth secret`)
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `YOUTUBE_API_KEY`
   - `REDIS_HOST`
   - `REDIS_PORT`
   - `REDIS_PASSWORD` (optional)

3. Start Redis (example with Docker):

   ```bash
   docker run -d -p 6379:6379 redis:alpine
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open http://localhost:3000

## Scripts

- `npm run dev` - Start development server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks
- `npm run check` - Run lint + typecheck
- `npm run format:write` - Format files
- `npm run test` - Run tests
