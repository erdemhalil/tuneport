import { CollectionCard } from "./CollectionCard";
import { Pagination } from "../ui/Pagination";
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
  onPageChange,
}: CollectionListProps) {
  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-light tracking-tight text-white">
            Your Music Collections
          </h2>
          <p className="text-gray-400">Organizing your musical collections</p>
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
              No music collections found in your Spotify library. Create some
              playlists in Spotify to see them here.
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
          <CollectionCard
            key={collection.id}
            collection={collection}
            onClick={() => onCollectionClick?.(collection.id)}
          />
        ))}
      </div>

      {/* Pagination */}
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
