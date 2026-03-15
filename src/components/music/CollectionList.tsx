import { CollectionCard } from "./CollectionCard";
import { Pagination } from "../ui/Pagination";
import { SkeletonRepeater } from "../ui/SkeletonRepeater";
import type { Collection } from "~/utils/types";

interface CollectionListProps {
  collections: Collection[];
  onCollectionClick?: (collectionId: string) => void;
  isLoading?: boolean;
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
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Your Music Collections
          </h2>
          <p className="text-zinc-500">Organizing your musical collections</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <SkeletonRepeater count={8}>
            {(i) => (
              <div key={i} className="animate-pulse rounded-xl border border-zinc-300 bg-white p-6">
                <div className="mb-4 aspect-square w-full rounded-lg bg-zinc-100"></div>
                <div className="space-y-3">
                  <div className="h-5 w-3/4 rounded bg-zinc-100"></div>
                  <div className="h-4 w-1/2 rounded bg-zinc-100"></div>
                  <div className="h-3 w-2/3 rounded bg-zinc-100"></div>
                </div>
              </div>
            )}
          </SkeletonRepeater>
        </div>
      </div>
    );
  }

  if (!collections.length) {
    return (
      <div className="animate-fade-in py-20 text-center">
        <div className="space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-zinc-300 bg-white">
            <svg
              className="h-8 w-8 text-zinc-500"
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
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Your Music Collections
            </h2>
            <p className="mx-auto max-w-md text-zinc-500">
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
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Your Music Collections
        </h2>
        <p className="text-zinc-500">
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
