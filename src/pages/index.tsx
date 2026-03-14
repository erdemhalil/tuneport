import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";

import { CollectionList } from "~/components/music/CollectionList";
import { TrackMatcher } from "~/components/music/TrackMatcher";
import { YouTubeMp3 } from "~/components/music/YouTubeMp3";
import { LandingPage } from "~/components/LandingPage";
import { AnimatedBackground } from "~/components/ui/AnimatedBackground";
import { useSpotifyDashboard } from "~/hooks/useSpotifyDashboard";

export default function Home() {
  const { data: sessionData } = useSession();
  const dashboard = useSpotifyDashboard(!!sessionData?.user);

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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <AnimatedBackground variant="app" />

          {/* Header */}
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
                        <div className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full bg-emerald-400"></div>
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

          {/* Main Content */}
          <main className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8">
            <div className="space-y-16">
              {/* Tabs */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => dashboard.setActiveTab("spotify")}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    dashboard.activeTab === "spotify"
                      ? "bg-white/15 text-white ring-2 ring-purple-400/70"
                      : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  Spotify Library
                </button>
                <button
                  onClick={() => dashboard.setActiveTab("youtube")}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    dashboard.activeTab === "youtube"
                      ? "bg-white/15 text-white ring-2 ring-purple-400/70"
                      : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  YouTube to MP3
                </button>
              </div>

              {/* Selected Collection Tracks */}
              {dashboard.activeTab === "spotify" &&
                dashboard.selectedCollectionId &&
                dashboard.collectionsData && (
                  <section className="animate-fade-in space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-4">
                        <h2 className="text-3xl font-light tracking-tight text-white">
                          {dashboard.collectionsData.collections.find(
                            (c) => c.id === dashboard.selectedCollectionId,
                          )?.name ?? "Collection"}
                        </h2>
                        <span className="text-sm text-gray-400">
                          {dashboard.totalTracks}{" "}
                          {dashboard.totalTracks === 1 ? "track" : "tracks"}
                        </span>
                      </div>
                      <button
                        onClick={() => dashboard.handleCollectionSelect(null)}
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
                        Back to Collections
                      </button>
                    </div>
                    <TrackMatcher
                      collection={
                        dashboard.collectionsData.collections.find(
                          (c) => c.id === dashboard.selectedCollectionId,
                        )!
                      }
                      tracks={dashboard.tracks}
                      isLoading={dashboard.isInitialLoading}
                      isPaginating={dashboard.isPaginating}
                      showHeader={false}
                      currentPage={dashboard.tracksPage}
                      totalItems={dashboard.totalTracks}
                      itemsPerPage={dashboard.tracksPerPage}
                      onPageChange={dashboard.setTracksPage}
                    />
                  </section>
                )}

              {/* Collections List */}
              {dashboard.activeTab === "spotify" &&
                !dashboard.selectedCollectionId && (
                  <section className="animate-fade-in space-y-8">
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

              {dashboard.activeTab === "youtube" && <YouTubeMp3 />}
            </div>
          </main>
        </div>
      ) : (
        <LandingPage />
      )}
    </>
  );
}
