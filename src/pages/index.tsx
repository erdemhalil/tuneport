import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";

import { CollectionList } from "~/components/music/CollectionList";
import { TrackMatcher } from "~/components/music/TrackMatcher";
import { YouTubeMp3 } from "~/components/music/YouTubeMp3";
import { LandingPage } from "~/components/LandingPage";
import { useSpotifyDashboard } from "~/hooks/useSpotifyDashboard";
import { useTheme } from "~/contexts/ThemeContext";

export default function Home() {
  const { data: sessionData } = useSession();
  const dashboard = useSpotifyDashboard(!!sessionData?.user);
  const { theme, toggle } = useTheme();
  const selectedCollection =
    dashboard.collectionsData?.collections.find(
      (c) => c.id === dashboard.selectedCollectionId,
    ) ?? null;

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
        <div className="bg-page text-primary min-h-screen">
          {/* Header */}
          <header className="border-edge bg-header sticky top-0 z-50 border-b shadow-sm shadow-black/5 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="flex h-14 items-center gap-3">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-accent flex h-7 w-7 items-center justify-center rounded-lg">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  </div>
                  <h1 className="text-primary text-lg font-semibold tracking-tight">
                    Tuneport
                  </h1>
                </div>

                {/* Tab switcher */}
                <div className="border-edge bg-inset mx-auto flex items-center gap-1 rounded-lg border p-1">
                  <button
                    onClick={() => dashboard.setActiveTab("spotify")}
                    className={`cursor-pointer rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                      dashboard.activeTab === "spotify"
                        ? "bg-surface text-primary shadow-sm"
                        : "text-secondary hover:text-primary"
                    }`}
                  >
                    Spotify Library
                  </button>
                  <button
                    onClick={() => dashboard.setActiveTab("youtube")}
                    className={`cursor-pointer rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                      dashboard.activeTab === "youtube"
                        ? "bg-surface text-primary shadow-sm"
                        : "text-secondary hover:text-primary"
                    }`}
                  >
                    YouTube to MP3
                  </button>
                </div>

                {/* Right side: theme toggle + profile + sign out */}
                <div className="flex items-center space-x-3">
                  {/* Theme toggle */}
                  <button
                    onClick={toggle}
                    className="border-edge bg-surface text-secondary hover:bg-surface-hover hover:text-primary focus:ring-ring inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border transition-colors focus:ring-2 focus:outline-none"
                    title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                    aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                  >
                    {theme === "dark" ? (
                      <svg
                        key="sun"
                        className="animate-theme-toggle h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        key="moon"
                        className="animate-theme-toggle h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                      </svg>
                    )}
                  </button>

                  <div className="flex items-center space-x-3">
                    {sessionData.user.image && (
                      <div>
                        <Image
                          src={sessionData.user.image}
                          alt="Profile"
                          width={36}
                          height={36}
                          className="border-edge rounded-full border"
                        />
                      </div>
                    )}
                    <div className="hidden sm:block">
                      <span className="text-primary text-sm font-medium">
                        {sessionData.user.name}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => void signOut()}
                    className="text-muted hover:text-primary cursor-pointer text-sm font-medium transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="relative mx-auto h-[calc(100vh-3.5rem)] max-w-7xl overflow-hidden px-6 py-4 lg:px-8">
            <div className="flex h-full min-h-0 flex-col gap-4">
              {/* Selected Collection Tracks */}
              {dashboard.activeTab === "spotify" &&
                dashboard.selectedCollectionId &&
                dashboard.collectionsData && (
                  <section className="animate-fade-in flex h-full min-h-0 flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-baseline gap-4">
                        <h2 className="text-primary text-3xl font-semibold tracking-tight">
                          {selectedCollection?.name ?? "Collection"}
                        </h2>
                        <span className="text-muted text-sm">
                          {dashboard.totalTracks}{" "}
                          {dashboard.totalTracks === 1 ? "track" : "tracks"}
                        </span>
                      </div>
                      <button
                        onClick={() => dashboard.handleCollectionSelect(null)}
                        className="border-edge bg-surface text-secondary hover:bg-surface-hover hover:text-primary focus:ring-ring inline-flex cursor-pointer items-center rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus:ring-2 focus:outline-none"
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
                        Back to Collections
                      </button>
                    </div>
                    {selectedCollection ? (
                      <div className="min-h-0 flex-1">
                        <TrackMatcher
                          collection={selectedCollection}
                          tracks={dashboard.tracks}
                          isLoading={dashboard.isInitialLoading}
                          isPaginating={dashboard.isPaginating}
                          showHeader={false}
                          currentPage={dashboard.tracksPage}
                          totalItems={dashboard.totalTracks}
                          itemsPerPage={dashboard.tracksPerPage}
                          onPageChange={dashboard.setTracksPage}
                        />
                      </div>
                    ) : (
                      <div className="border-edge bg-surface text-secondary rounded-xl border p-6 text-sm">
                        The selected collection is no longer available. Please
                        go back and choose another collection.
                      </div>
                    )}
                  </section>
                )}

              {/* Collections List */}
              {dashboard.activeTab === "spotify" &&
                !dashboard.selectedCollectionId && (
                  <section className="collections-native-scrollbar animate-fade-in h-full min-h-0 overflow-y-auto pr-1">
                    <CollectionList
                      collections={dashboard.collectionsData?.collections ?? []}
                      onCollectionClick={dashboard.handleCollectionSelect}
                      isLoading={dashboard.collectionsLoading}
                      currentPage={dashboard.collectionsPage}
                      totalItems={dashboard.collectionsData?.total ?? 0}
                      itemsPerPage={dashboard.collectionsPerPage}
                      onPageChange={dashboard.setCollectionsPage}
                    />
                  </section>
                )}

              {dashboard.activeTab === "youtube" && (
                <div className="h-full min-h-0">
                  <YouTubeMp3 />
                </div>
              )}
            </div>
          </main>
        </div>
      ) : (
        <LandingPage />
      )}
    </>
  );
}
