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
        <title>Tuneport — Music, Reimagined</title>
        <meta
          name="description"
          content="Transform your Spotify library into something extraordinary"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {sessionData?.user ? (
        // Music Library View - Premium authenticated experience
        <div className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-neutral-100">
          {/* Premium Header - Glass effect with minimal design */}
          <header className="glass sticky top-0 z-50 border-b border-neutral-200/50">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="flex h-20 items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-600"></div>
                  <h1 className="text-2xl font-light tracking-tight text-neutral-900">
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
                          className="rounded-full shadow-sm ring-2 ring-white"
                        />
                        <div className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400"></div>
                      </div>
                    )}
                    <div className="hidden sm:block">
                      <span className="text-sm font-medium text-neutral-900">
                        {sessionData.user.name}
                      </span>
                      <div className="text-xs text-neutral-500">Connected</div>
                    </div>
                  </div>
                  <button
                    onClick={() => void signOut()}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 transition-all duration-200 hover:bg-neutral-50 hover:text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content - Generous spacing for premium feel */}
          <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
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
                  <div className="glass flex items-center justify-between rounded-2xl p-6 shadow-sm">
                    <div className="text-sm font-medium text-neutral-600">
                      <span className="text-neutral-900">
                        {currentPage + 1}
                      </span>{" "}
                      of {totalPages}
                      <span className="ml-2 text-neutral-500">
                        • {likedSongsData?.total ?? 0} songs
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={goToPrevPage}
                        disabled={!hasPrevPage}
                        className="inline-flex items-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
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
                                className={`h-10 w-10 rounded-xl text-sm font-medium transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
                                  pageNum === currentPage
                                    ? "bg-blue-500 text-white shadow-md"
                                    : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
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
                        className="inline-flex items-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
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
                    <h2 className="text-3xl font-light tracking-tight text-neutral-900">
                      {playlistsData?.playlists.find(
                        (p) => p.id === selectedPlaylistId,
                      )?.name ?? "Playlist"}
                    </h2>
                    <button
                      onClick={() => setSelectedPlaylistId(null)}
                      className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 transition-all duration-200 hover:bg-neutral-50 hover:text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
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
        // Premium Landing Page - Swiss-inspired minimal design
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-neutral-50 to-neutral-100 p-6">
          <div className="animate-scale-in w-full max-w-lg space-y-12">
            {/* Premium Brand Identity */}
            <div className="space-y-6 text-center">
              <div className="mb-8 flex items-center justify-center space-x-3">
                <div className="h-12 w-3 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 shadow-sm"></div>
                <h1 className="text-5xl font-light tracking-tight text-neutral-900">
                  Tuneport
                </h1>
              </div>

              <div className="space-y-3">
                <p className="text-xl leading-relaxed font-light text-neutral-700">
                  Transform your music library into something extraordinary
                </p>
                <p className="mx-auto max-w-md text-sm leading-relaxed text-neutral-500">
                  Connect your Spotify account to discover, organize, and
                  experience your music in entirely new ways
                </p>
              </div>
            </div>

            {/* Premium Auth Card */}
            <AuthShowcase />

            {/* Minimal feature highlights */}
            <div className="grid grid-cols-3 gap-8 border-t border-neutral-200 pt-8">
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <svg
                    className="h-4 w-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <div className="text-xs font-medium text-neutral-600">
                  Secure
                </div>
              </div>
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                  <svg
                    className="h-4 w-4 text-emerald-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="text-xs font-medium text-neutral-600">
                  Smart
                </div>
              </div>
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                  <svg
                    className="h-4 w-4 text-purple-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="text-xs font-medium text-neutral-600">
                  Simple
                </div>
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
    <div className="glass space-y-6 rounded-3xl border border-neutral-200/50 p-8 shadow-lg">
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
                  className="rounded-full shadow-md ring-4 ring-white"
                />
                <div className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full border-3 border-white bg-emerald-400 shadow-sm"></div>
              </div>
            )}
            <div className="space-y-1">
              <h3 className="text-xl font-medium text-neutral-900">
                Welcome back
              </h3>
              <p className="font-medium text-neutral-600">
                {sessionData.user.name}
              </p>
              <p className="text-sm text-neutral-500">Your music awaits</p>
            </div>
          </div>

          <button
            onClick={() => void signOut()}
            className="w-full rounded-2xl bg-neutral-900 px-6 py-4 font-medium text-white shadow-sm transition-all duration-200 hover:bg-neutral-800 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:outline-none"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="space-y-6 text-center">
          <div className="space-y-3">
            <h2 className="text-2xl font-medium text-neutral-900">
              Connect with Spotify
            </h2>
            <p className="leading-relaxed text-neutral-600">
              Securely link your Spotify account to unlock your personalized
              music experience
            </p>
          </div>

          <button
            onClick={() => void signIn("spotify")}
            className="group flex w-full items-center justify-center space-x-3 rounded-2xl bg-neutral-900 px-6 py-4 font-medium text-white shadow-sm transition-all duration-200 hover:bg-neutral-800 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:outline-none"
          >
            <svg
              className="h-5 w-5 transition-transform group-hover:scale-105"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.6-.12-.421.18-.78.6-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.081zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.42-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.781-.18-.601.18-1.2.78-1.381 4.5-1.411 11.64-1.151 15.12 1.621.48.3.599 1.019.24 1.5-.36.48-1.061.6-1.5.24z" />
            </svg>
            <span>Continue with Spotify</span>
          </button>

          <p className="text-xs leading-relaxed text-neutral-400">
            By connecting, you agree to let Tuneport access your Spotify library
            and playlists
          </p>
        </div>
      )}
    </div>
  );
}
