import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";

import { api } from "~/utils/api";
import { PlaylistList } from "~/components/music/PlaylistList";
import { TrackMatcher } from "~/components/music/TrackMatcher";

export default function Home() {
  const { data: sessionData } = useSession();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;

  // Fetch liked songs with pagination
  const { data: likedSongsData, isLoading: likedSongsLoading } = api.spotify.likedSongs.useQuery(
    { limit: pageSize, offset: currentPage * pageSize },
    { enabled: !!sessionData?.user }
  );

  // Pagination helpers
  const totalPages = likedSongsData ? Math.ceil(likedSongsData.total / pageSize) : 0;
  const hasNextPage = currentPage < totalPages - 1;
  const hasPrevPage = currentPage > 0;

  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
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
  const { data: playlistsData, isLoading: playlistsLoading } = api.spotify.playlists.useQuery(
    { limit: 20, offset: 0 },
    { enabled: !!sessionData?.user }
  );

  // Fetch playlist tracks when a playlist is selected
  const { data: playlistTracksData, isLoading: playlistTracksLoading } = api.spotify.playlistTracks.useQuery(
    { id: selectedPlaylistId!, limit: 50, offset: 0 },
    { enabled: !!sessionData?.user && !!selectedPlaylistId }
  );

  return (
    <>
      <Head>
        <title>Tuneport</title>
        <meta name="description" content="Your Spotify-powered music app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {sessionData?.user ? (
        // Music Library View
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <h1 className="text-2xl font-light text-slate-900">Tuneport</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {sessionData.user.image && (
                      <Image
                        src={sessionData.user.image}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    )}
                    <span className="text-sm text-slate-700">{sessionData.user.name}</span>
                  </div>
                  <button
                    onClick={() => void signOut()}
                    className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-12">
              {/* Liked Songs */}
              <div className="space-y-4">
                <TrackMatcher
                  tracks={likedSongsData?.tracks ?? []}
                  title="Liked Songs"
                  isLoading={likedSongsLoading}
                />

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 p-4">
                    <div className="text-sm text-slate-600">
                      Page {currentPage + 1} of {totalPages} ({likedSongsData?.total ?? 0} total songs)
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={goToPrevPage}
                        disabled={!hasPrevPage}
                        className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ← Previous
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                          if (pageNum >= totalPages) return null;

                          return (
                            <button
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              className={`px-3 py-2 text-sm font-medium rounded-md ${
                                pageNum === currentPage
                                  ? 'bg-red-600 text-white'
                                  : 'text-slate-500 bg-white border border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              {pageNum + 1}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={goToNextPage}
                        disabled={!hasNextPage}
                        className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Playlist Tracks */}
              {selectedPlaylistId && playlistTracksData && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900">
                      {playlistsData?.playlists.find(p => p.id === selectedPlaylistId)?.name ?? "Playlist"}
                    </h2>
                    <button
                      onClick={() => setSelectedPlaylistId(null)}
                      className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1 rounded-md hover:bg-slate-100 transition-colors"
                    >
                      ← Back to Playlists
                    </button>
                  </div>
                  <TrackMatcher
                    tracks={playlistTracksData.tracks}
                    isLoading={playlistTracksLoading}
                  />
                </div>
              )}

              {/* Playlists */}
              {!selectedPlaylistId && (
                <PlaylistList
                  playlists={playlistsData?.playlists ?? []}
                  onPlaylistClick={setSelectedPlaylistId}
                  isLoading={playlistsLoading}
                />
              )}
            </div>
          </main>
        </div>
      ) : (
        // Auth View
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-8">
            {/* Logo/Brand */}
            <div className="text-center">
              <h1 className="text-4xl font-light text-slate-900 tracking-tight">
                Tuneport
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Your music, reimagined
              </p>
            </div>

            {/* Auth Section */}
            <AuthShowcase />
          </div>
        </main>
      )}
    </>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200/50">
      {sessionData?.user ? (
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center space-y-3">
            {sessionData.user.image && (
              <div className="relative">
                <Image
                  src={sessionData.user.image}
                  alt="Profile"
                  width={64}
                  height={64}
                  className="rounded-full ring-2 ring-slate-200"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium text-slate-900">
                Welcome back
              </h3>
              <p className="text-slate-600">{sessionData.user.name}</p>
            </div>
          </div>

          <button
            onClick={() => void signOut()}
            className="w-full bg-slate-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-slate-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-slate-900">
              Connect your Spotify
            </h2>
            <p className="text-sm text-slate-600">
              Access your music library and playlists
            </p>
          </div>

          <button
            onClick={() => void signIn("spotify")}
            className="w-full bg-slate-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-slate-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.6-.12-.421.18-.78.6-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.081zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.42-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.781-.18-.601.18-1.2.78-1.381 4.5-1.411 11.64-1.151 15.12 1.621.48.3.599 1.019.24 1.5-.36.48-1.061.6-1.5.24z"/>
            </svg>
            <span>Continue with Spotify</span>
          </button>
        </div>
      )}
    </div>
  );
}
