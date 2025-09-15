# 🎵 Tuneport

A modern music platform that bridges Spotify and YouTube, allowing users to discover and download their favorite tracks with intelligent matching and seamless downloads.

## ✨ Features

- **Spotify Integration**: OAuth authentication with automatic token refresh
- **Smart YouTube Matching**: Duration-based matching with explicit content detection
- **Queue-Based Downloads**: Robust download system using BullMQ and Redis
- **Real-Time Progress**: Live progress tracking with floating progress widget
- **Automatic Downloads**: Files stream directly to user's Downloads folder
- **Pagination Support**: Handle large music libraries efficiently
- **Type-Safe APIs**: Full TypeScript coverage with tRPC
- **Modern UI**: Built with Tailwind CSS and React 19

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router + Pages Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: tRPC, NextAuth v4
- **Queue System**: BullMQ with Redis
- **Download Engine**: ytdlp-nodejs
- **Authentication**: Spotify OAuth with PKCE flow
- **APIs**: Spotify Web API, YouTube Data API v3

### Key Components

```
src/
├── app/                    # Next.js App Router (Auth routes)
├── pages/                  # Next.js Pages Router (Main app, tRPC)
├── server/
│   ├── api/               # tRPC routers and context
│   ├── auth/              # NextAuth configuration
│   └── queue/             # BullMQ download queue
├── components/            # React components
├── contexts/              # React Context providers
├── utils/                 # Shared utilities
└── env.js                # Environment validation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Redis server (local or cloud)
- Spotify Developer Account
- Google Cloud Project (for YouTube API)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/erdemhalil/tuneport.git
   cd tuneport
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Configure the following variables:
   ```env
   # NextAuth
   AUTH_SECRET="your-secret-here"

   # Spotify OAuth
   SPOTIFY_CLIENT_ID="your-spotify-client-id"
   SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"

   # YouTube Data API
   YOUTUBE_API_KEY="your-youtube-api-key"

   # Redis (optional - defaults provided)
   REDIS_HOST="localhost"
   REDIS_PORT="6379"
   REDIS_PASSWORD=""
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 🔧 Configuration

### Spotify OAuth Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add `http://localhost:3000/api/auth/callback/spotify` to Redirect URIs
4. Copy Client ID and Client Secret to `.env`

### YouTube Data API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Restrict the API key to YouTube Data API v3 only
6. Copy API key to `.env`

### Redis Setup

**Local Redis:**
```bash
# macOS with Homebrew
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis-server
```

**Cloud Redis:**
- Redis Cloud, Upstash, or AWS ElastiCache
- Update `REDIS_HOST`, `REDIS_PORT`, and `REDIS_PASSWORD` accordingly

## 📋 Available Scripts

```bash
# Development
npm run dev          # Start dev server with Turbo
npm run build        # Production build
npm run start        # Start production server
npm run preview      # Build and preview

# Code Quality
npm run check        # Lint + typecheck
npm run lint         # ESLint only
npm run lint:fix     # Auto-fix linting issues
npm run typecheck    # TypeScript check only
npm run format:check # Check code formatting
npm run format:write # Format code with Prettier
```

## 🎯 How It Works

### 1. Authentication Flow
- Users authenticate via Spotify OAuth
- Access tokens automatically refresh in background
- Session data includes Spotify user profile

### 2. Music Discovery
- Fetch user's liked songs and playlists from Spotify
- Display tracks with pagination for large libraries
- Show track metadata (artist, album, duration)

### 3. YouTube Matching
- Search YouTube for matching videos
- Match based on track duration (±10% tolerance)
- Filter explicit content based on YouTube metadata
- Return top 5 matches sorted by confidence

### 4. Download Process
- Queue download jobs in Redis using BullMQ
- Worker processes downloads with ytdlp-nodejs
- Convert YouTube videos to MP3 format (320kbps)
- Store files in Redis with 1-hour TTL
- Stream files directly to browser on completion

### 5. User Experience
- Real-time progress updates via tRPC subscriptions
- Floating progress widget shows active downloads
- Automatic browser downloads when jobs complete
- Manual re-download option for completed tracks

## 🔒 Security Features

- **Authentication**: Protected routes with NextAuth
- **API Validation**: Zod schemas for all inputs/outputs
- **Rate Limiting**: YouTube API quota management
- **File Access**: Authenticated download endpoints
- **Token Refresh**: Automatic Spotify token renewal

## 🐛 Troubleshooting

### Common Issues

**YouTube API 403 Error:**
- Check API key validity and quota
- Ensure YouTube Data API v3 is enabled
- Verify API key restrictions

**Redis Connection Failed:**
- Confirm Redis server is running
- Check connection credentials
- Verify firewall settings

**Spotify Auth Issues:**
- Validate redirect URIs in Spotify Dashboard
- Check client credentials
- Clear browser cookies/cache

**Download Failures:**
- Check ytdlp-nodejs installation
- Verify FFmpeg availability
- Check available disk space

### Debug Mode

Enable verbose logging:
```bash
DEBUG=* npm run dev
```

Check Redis status:
```bash
redis-cli ping
redis-cli keys "download:*"
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV="production"
AUTH_SECRET="your-production-secret"
SPOTIFY_CLIENT_ID="your-prod-client-id"
SPOTIFY_CLIENT_SECRET="your-prod-client-secret"
YOUTUBE_API_KEY="your-prod-api-key"
REDIS_HOST="your-redis-host"
REDIS_PORT="6379"
REDIS_PASSWORD="your-redis-password"
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Cloud Platforms

**Vercel:**
- Set environment variables in dashboard
- Deploy with `vercel --prod`

**Railway/Render:**
- Connect GitHub repository
- Configure environment variables
- Add Redis service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use ESLint and Prettier
- Write tests for new features
- Update documentation
- Follow conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [tRPC](https://trpc.io/) - Type-safe APIs
- [BullMQ](https://docs.bullmq.io/) - Queue system
- [ytdlp-nodejs](https://github.com/yt-dlp/yt-dlp) - YouTube downloader
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [YouTube Data API](https://developers.google.com/youtube/v3)

## 📞 Support

- Create an [issue](https://github.com/erdemhalil/tuneport/issues) for bugs
- Start a [discussion](https://github.com/erdemhalil/tuneport/discussions) for questions
- Check the [troubleshooting guide](#-troubleshooting) first

---

Built with ❤️ using Next.js 15 and modern web technologies.