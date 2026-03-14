import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import type { Track } from "~/utils/types";

type CollectionTracksResponse = {
  tracks: Track[];
  total: number;
  limit: number;
  offset: number;
};

const COLLECTIONS_PER_PAGE = 20;
const TRACKS_PER_PAGE = 50;

export function useSpotifyDashboard(isAuthenticated: boolean) {
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState<"spotify" | "youtube">("spotify");

  // Pagination state
  const [collectionsPage, setCollectionsPage] = useState(1);
  const [tracksPage, setTracksPage] = useState(1);

  // Cache for previous tracks data (avoids flash during pagination)
  const [previousCollectionTracksData, setPreviousCollectionTracksData] =
    useState<CollectionTracksResponse | null>(null);

  // Fetch collections (liked songs + playlists) with pagination
  const { data: collectionsData, isLoading: collectionsLoading } =
    api.spotify.collections.useQuery(
      {
        limit: COLLECTIONS_PER_PAGE,
        offset: (collectionsPage - 1) * COLLECTIONS_PER_PAGE,
      },
      { enabled: isAuthenticated },
    );

  // Fetch collection tracks when a collection is selected
  const { data: collectionTracksData, isLoading: collectionTracksLoading } =
    api.spotify.collectionTracks.useQuery(
      {
        collectionId: selectedCollectionId!,
        limit: TRACKS_PER_PAGE,
        offset: (tracksPage - 1) * TRACKS_PER_PAGE,
      },
      { enabled: isAuthenticated && !!selectedCollectionId },
    );

  // Update cache when new data arrives
  useEffect(() => {
    if (collectionTracksData && !collectionTracksLoading) {
      setPreviousCollectionTracksData(collectionTracksData);
    }
  }, [collectionTracksData, collectionTracksLoading]);

  // Derive display data: prefer fresh data, fall back to cached
  const currentData = collectionTracksData ?? previousCollectionTracksData;
  const tracks = currentData?.tracks ?? [];
  const totalTracks = currentData?.total ?? 0;

  const isInitialLoading =
    collectionTracksLoading && previousCollectionTracksData === null;
  const isPaginating =
    collectionTracksLoading && previousCollectionTracksData !== null;

  const handleCollectionSelect = (collectionId: string | null) => {
    setSelectedCollectionId(collectionId);
    setTracksPage(1);
    if (collectionId !== selectedCollectionId) {
      setPreviousCollectionTracksData(null);
    }
  };

  return {
    // Tab state
    activeTab,
    setActiveTab,

    // Collection browsing
    collectionsData,
    collectionsLoading,
    collectionsPage,
    setCollectionsPage,
    collectionsPerPage: COLLECTIONS_PER_PAGE,

    // Selected collection tracks
    selectedCollectionId,
    handleCollectionSelect,
    tracks,
    totalTracks,
    tracksPage,
    setTracksPage,
    tracksPerPage: TRACKS_PER_PAGE,
    isInitialLoading,
    isPaginating,
  };
}
