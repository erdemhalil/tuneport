import Image from "next/image";
import { Pagination } from "~/components/ui/Pagination";
import type { Collection } from "~/utils/types";

interface CollectionListProps {
  collections: Collection[];
  onCollectionClick?: (collectionId: string) => void;
  isLoading?: boolean;
  // Pagination props
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export function CollectionList({
  collections,
  onCollectionClick,
  isLoading,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 20,
  onPageChange
}: CollectionListProps) {
  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-light tracking-tight text-white">
            Your Music Collections
          </h2>
          <p className="text-gray-400">
            Organizing your musical collections
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass animate-pulse rounded-2xl p-6">
              <div className="mb-4 aspect-square w-full rounded-xl bg-white/10"></div>
              <div className="space-y-3">
                <div className="h-5 w-3/4 rounded bg-white/10"></div>
                <div className="h-4 w-1/2 rounded bg-white/10"></div>
                <div className="h-3 w-2/3 rounded bg-white/10"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!collections.length) {
    return (
      <div className="animate-fade-in py-20 text-center">
        <div className="space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <svg
              className="h-8 w-8 text-gray-400"
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
          <div className="space-y-2">
            <h2 className="text-3xl font-light tracking-tight text-white">
              Your Music Collections
            </h2>
            <p className="mx-auto max-w-md text-gray-400">
              No music collections found in your Spotify library. Create some playlists
              in Spotify to see them here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="space-y-3">
        <h2 className="text-3xl font-light tracking-tight text-white">
          Your Music Collections
        </h2>
        <p className="text-gray-400">
          {collections.length} collection{collections.length === 1 ? "" : "s"} •
          Curated by you
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className={`group glass animate-fade-in cursor-pointer rounded-2xl border border-white/20 p-6 transition-all duration-300 hover:border-white/30 hover:shadow-2xl backdrop-blur-xl`}
            onClick={() => onCollectionClick?.(collection.id)}
          >
            {/* Collection Cover */}
            <div className="relative mb-6 aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5">
              {collection.image ? (
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div
                  className={
                    collection.type === 'liked_songs'
                      ? "flex h-full w-full items-center justify-center bg-gradient-to-br from-green-400/40 via-emerald-500/40 to-green-700/40"
                      : "flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 to-white/5"
                  }
                >
                  {collection.type === 'liked_songs' ? (
                    <svg
                      className="h-14 w-14 text-green-400 drop-shadow-lg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  ) : (
                    <svg
                      className="h-12 w-12 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  )}
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/20">
                <div className="flex h-12 w-12 scale-0 transform items-center justify-center rounded-full bg-white/10 transition-all duration-300 group-hover:scale-100 group-hover:bg-white/20 backdrop-blur-sm">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Collection Info */}
            <div className="space-y-3">
              <div>
                <h3 className="truncate text-lg font-medium text-white transition-colors duration-200 group-hover:text-purple-300">
                  {collection.name}
                </h3>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-300">
                  {collection.track_count} song
                  {collection.track_count === 1 ? "" : "s"}
                </span>
                <span className="text-xs text-gray-500">
                  by {collection.owner}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination within Collections section */}
      {onPageChange && totalItems > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          className="mt-8"
        />
      )}
    </div>
  );
}