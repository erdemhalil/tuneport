import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";

import { api } from "~/utils/api";
import { PlaylistList } from "~/components/music/PlaylistList";
import { TrackMatcher } from "~/components/music/TrackMatcher";

export default function Home() {
  const { data: sessionData } = useSession();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;

  // Fetch liked songs with pagination
  const { data: likedSongsData, isLoading: likedSongsLoading } =
    api.spotify.likedSongs.useQuery(
      { limit: pageSize, offset: currentPage * pageSize },
      { enabled: !!sessionData?.user },
    );

  // Pagination helpers
  const totalPages = likedSongsData
    ? Math.ceil(likedSongsData.total / pageSize)
    : 0;
  const hasNextPage = currentPage < totalPages - 1;
  const hasPrevPage = currentPage > 0;

  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset to first page when switching between views
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedPlaylistId]);

  // Fetch playlists
  const { data: playlistsData, isLoading: playlistsLoading } =
    api.spotify.playlists.useQuery(
      { limit: 20, offset: 0 },
      { enabled: !!sessionData?.user },
    );

  // Fetch playlist tracks when a playlist is selected
  const { data: playlistTracksData, isLoading: playlistTracksLoading } =
    api.spotify.playlistTracks.useQuery(
      { id: selectedPlaylistId!, limit: 50, offset: 0 },
      { enabled: !!sessionData?.user && !!selectedPlaylistId },
    );

  return (
    <>
      <Head>
        <title>Tuneport</title>
        <meta
          name="description"
          content="Transform your Spotify library into something extraordinary"
        />
        <link rel="icon" href="/tuneport.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/tuneport.png" type="image/png" sizes="16x16" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {sessionData?.user ? (
        // Music Library View - Modern Dark Theme
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-purple-500/5 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 h-64 w-64 rounded-full bg-pink-500/5 blur-3xl animate-pulse delay-500"></div>
          </div>

          {/* Floating Music Notes Animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 animate-bounce delay-300">
              <div className="text-purple-400/20 text-4xl">♪</div>
            </div>
            <div className="absolute top-40 right-20 animate-bounce delay-700">
              <div className="text-blue-400/20 text-3xl">♫</div>
            </div>
            <div className="absolute bottom-32 left-20 animate-bounce delay-1000">
              <div className="text-pink-400/20 text-5xl">♬</div>
            </div>
            <div className="absolute bottom-20 right-10 animate-bounce delay-500">
              <div className="text-purple-400/20 text-4xl">♪</div>
            </div>
          </div>

          {/* Premium Header - Glass effect with dark theme */}
          <header className="glass sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="flex h-20 items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-2 rounded-full bg-gradient-to-b from-purple-500 to-blue-500"></div>
                  <h1 className="text-2xl font-light tracking-tight text-white">
                    Tuneport
                  </h1>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3">
                    {sessionData.user.image && (
                      <div className="relative">
                        <Image
                          src={sessionData.user.image}
                          alt="Profile"
                          width={40}
                          height={40}
                          className="rounded-full shadow-lg ring-2 ring-white/20"
                        />
                        <div className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-400"></div>
                      </div>
                    )}
                    <div className="hidden sm:block">
                      <span className="text-sm font-medium text-white">
                        {sessionData.user.name}
                      </span>
                      <div className="text-xs text-gray-400">Connected</div>
                    </div>
                  </div>
                  <button
                    onClick={() => void signOut()}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-gray-300 transition-all duration-200 hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content - Generous spacing for premium feel */}
          <main className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8">
            <div className="space-y-16">
              {/* Liked Songs Section */}
              <section className="animate-fade-in space-y-8">
                <TrackMatcher
                  tracks={likedSongsData?.tracks ?? []}
                  title="Liked Songs"
                  isLoading={likedSongsLoading}
                />

                {/* Premium Pagination Controls */}
                {totalPages > 1 && (
                  <div className="glass flex items-center justify-between rounded-2xl p-6 shadow-2xl border border-white/10 backdrop-blur-xl">
                    <div className="text-sm font-medium text-gray-300">
                      <span className="text-white">
                        {currentPage + 1}
                      </span>{" "}
                      of {totalPages}
                      <span className="ml-2 text-gray-400">
                        • {likedSongsData?.total ?? 0} songs
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={goToPrevPage}
                        disabled={!hasPrevPage}
                        className="inline-flex items-center rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-2 text-sm font-medium text-gray-300 transition-all duration-200 hover:border-white/30 hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <svg
                          className="mr-2 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        Previous
                      </button>

                      {/* Page Numbers - Clean minimal design */}
                      <div className="flex items-center space-x-2">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            const pageNum =
                              Math.max(
                                0,
                                Math.min(totalPages - 5, currentPage - 2),
                              ) + i;
                            if (pageNum >= totalPages) return null;

                            return (
                              <button
                                key={pageNum}
                                onClick={() => goToPage(pageNum)}
                                className={`h-10 w-10 rounded-xl text-sm font-medium transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none ${
                                  pageNum === currentPage
                                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                                    : "border border-white/20 bg-white/5 backdrop-blur-sm text-gray-300 hover:border-white/30 hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                {pageNum + 1}
                              </button>
                            );
                          },
                        )}
                      </div>

                      <button
                        onClick={goToNextPage}
                        disabled={!hasNextPage}
                        className="inline-flex items-center rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-2 text-sm font-medium text-gray-300 transition-all duration-200 hover:border-white/30 hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                        <svg
                          className="ml-2 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Selected Playlist Tracks */}
              {selectedPlaylistId && playlistTracksData && (
                <section className="animate-fade-in space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-light tracking-tight text-white">
                      {playlistsData?.playlists.find(
                        (p) => p.id === selectedPlaylistId,
                      )?.name ?? "Playlist"}
                    </h2>
                    <button
                      onClick={() => setSelectedPlaylistId(null)}
                      className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-gray-300 transition-all duration-200 hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Back to Library
                    </button>
                  </div>
                  <TrackMatcher
                    tracks={playlistTracksData.tracks}
                    isLoading={playlistTracksLoading}
                  />
                </section>
              )}

              {/* Playlists */}
              {!selectedPlaylistId && (
                <section className="animate-fade-in">
                  <PlaylistList
                    playlists={playlistsData?.playlists ?? []}
                    onPlaylistClick={setSelectedPlaylistId}
                    isLoading={playlistsLoading}
                  />
                </section>
              )}
            </div>
          </main>
        </div>
      ) : (
        // Modern Hero Landing Page with Icon Integration
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl animate-pulse delay-500"></div>
          </div>

          {/* Floating Music Notes Animation */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 animate-bounce delay-300">
              <div className="text-purple-400/30 text-4xl">♪</div>
            </div>
            <div className="absolute top-40 right-20 animate-bounce delay-700">
              <div className="text-blue-400/30 text-3xl">♫</div>
            </div>
            <div className="absolute bottom-32 left-20 animate-bounce delay-1000">
              <div className="text-pink-400/30 text-5xl">♬</div>
            </div>
            <div className="absolute bottom-20 right-10 animate-bounce delay-500">
              <div className="text-purple-400/30 text-4xl">♪</div>
            </div>
          </div>

          <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8">
              {/* Hero Section with Icon */}
              <div className="text-center space-y-6">
                {/* Project Icon - Prominent Display */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 to-blue-500 blur-2xl opacity-60 animate-pulse"></div>
                    <div className="relative rounded-3xl bg-gradient-to-r from-purple-600 to-blue-600 p-6 shadow-2xl">
                      <Image
                        src="/tuneport.png"
                        alt="Tuneport Logo"
                        width={120}
                        height={120}
                        className="rounded-2xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Brand Name with Gradient */}
                <div className="space-y-2">
                  <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                    Tuneport
                  </h1>
                  <div className="h-1 w-24 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                </div>

                {/* Tagline */}
                <div className="space-y-3">
                  <p className="text-xl font-light text-gray-300 leading-relaxed">
                    Transform your Spotify library into
                    <span className="font-semibold text-white"> downloadable MP3s</span>
                  </p>
                  <p className="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
                    Connect your Spotify account and turn your favorite tracks into high-quality downloads with just a few clicks
                  </p>
                </div>
              </div>

              {/* Enhanced Auth Card */}
              <AuthShowcase />

              {/* Feature Grid with Icons */}
              <div className="grid grid-cols-3 gap-6 pt-4">
                <div className="group text-center space-y-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xs font-medium text-gray-300">Lightning Fast</div>
                </div>

                <div className="group text-center space-y-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="text-xs font-medium text-gray-300">Secure & Private</div>
                </div>

                <div className="group text-center space-y-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="text-xs font-medium text-gray-300">High Quality</div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-4">
                <p className="text-xs text-gray-500">
                  Built with Next.js • Powered by Spotify & YouTube
                </p>
              </div>
            </div>
          </div>
        </main>
      )}
    </>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
      {sessionData?.user ? (
        <div className="space-y-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            {sessionData.user.image && (
              <div className="relative">
                <Image
                  src={sessionData.user.image}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="rounded-full shadow-lg ring-4 ring-white/20"
                />
                <div className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full border-3 border-slate-900 bg-green-400 shadow-lg"></div>
              </div>
            )}
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-white">
                Welcome back
              </h3>
              <p className="font-medium text-gray-300">
                {sessionData.user.name}
              </p>
              <p className="text-sm text-gray-400">Ready to download your music?</p>
            </div>
          </div>

          <button
            onClick={() => void signOut()}
            className="w-full rounded-2xl bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:from-red-700 hover:to-red-800 hover:shadow-xl focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="space-y-6 text-center">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white">
              Connect with Spotify
            </h2>
            <p className="leading-relaxed text-gray-300">
              Link your Spotify account to start downloading your favorite tracks
            </p>
          </div>

          <button
            onClick={() => void signIn("spotify")}
            className="group flex w-full items-center justify-center space-x-4 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:scale-105 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
          >
            <svg
              className="h-6 w-6 transition-transform group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.6-.12-.421.18-.78.6-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.081zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.42-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.781-.18-.601.18-1.2.78-1.381 4.5-1.411 11.64-1.151 15.12 1.621.48.3.599 1.019.24 1.5-.36.48-1.061.6-1.5.24z" />
            </svg>
            <span>Continue with Spotify</span>
          </button>

          <p className="text-xs leading-relaxed text-gray-400">
            We only access your music library and playlists. Your data stays secure and private.
          </p>
        </div>
      )}
    </div>
  );
}
