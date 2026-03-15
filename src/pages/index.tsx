import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";

import { CollectionList } from "~/components/music/CollectionList";
import { TrackMatcher } from "~/components/music/TrackMatcher";
import { YouTubeMp3 } from "~/components/music/YouTubeMp3";
import { LandingPage } from "~/components/LandingPage";
import { useSpotifyDashboard } from "~/hooks/useSpotifyDashboard";

export default function Home() {
  const { data: sessionData } = useSession();
  const dashboard = useSpotifyDashboard(!!sessionData?.user);
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
        <div className="min-h-screen bg-[#f6f6f4] text-zinc-900">
          {/* Header */}
          <header className="sticky top-0 z-50 border-b border-zinc-300 bg-[#f6f6f4]/95">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="flex h-14 items-center gap-3">
                <div className="flex items-center space-x-3">
                  <div className="h-6 w-1 rounded-full bg-zinc-900"></div>
                  <h1 className="text-lg font-semibold tracking-tight text-zinc-950">
                    Tuneport
                  </h1>
                </div>

                <div className="mx-auto flex items-center gap-2 rounded-lg border border-zinc-300 bg-white p-1">
                  <button
                    onClick={() => dashboard.setActiveTab("spotify")}
                    className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                      dashboard.activeTab === "spotify"
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    Spotify Library
                  </button>
                  <button
                    onClick={() => dashboard.setActiveTab("youtube")}
                    className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                      dashboard.activeTab === "youtube"
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    YouTube to MP3
                  </button>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    {sessionData.user.image && (
                      <div>
                        <Image
                          src={sessionData.user.image}
                          alt="Profile"
                          width={40}
                          height={40}
                          className="rounded-full border border-zinc-300"
                        />
                      </div>
                    )}
                    <div className="hidden sm:block">
                      <span className="text-sm font-medium text-zinc-900">
                        {sessionData.user.name}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => void signOut()}
                    className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus:ring-2 focus:ring-zinc-900 focus:outline-none"
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
                        <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
                          {selectedCollection?.name ?? "Collection"}
                        </h2>
                        <span className="text-sm text-zinc-500">
                          {dashboard.totalTracks}{" "}
                          {dashboard.totalTracks === 1 ? "track" : "tracks"}
                        </span>
                      </div>
                      <button
                        onClick={() => dashboard.handleCollectionSelect(null)}
                        className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus:ring-2 focus:ring-zinc-900 focus:outline-none"
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
                      <div className="rounded-xl border border-zinc-300 bg-white p-6 text-sm text-zinc-700">
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
