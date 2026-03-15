import Image from "next/image";
import type { Collection } from "~/utils/types";

interface CollectionCardProps {
  collection: Collection;
  onClick: () => void;
}

export function CollectionCard({ collection, onClick }: CollectionCardProps) {
  return (
    <div
      className="group animate-fade-in border-edge bg-surface hover:bg-surface-hover cursor-pointer rounded-xl border p-5 transition-colors"
      onClick={onClick}
    >
      {/* Collection Cover */}
      <div className="border-edge bg-inset relative mb-5 aspect-square overflow-hidden rounded-lg border">
        {collection.image ? (
          <Image
            src={collection.image}
            alt={collection.name}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className={
              collection.type === "liked_songs"
                ? "bg-surface-hover flex h-full w-full items-center justify-center"
                : "bg-inset flex h-full w-full items-center justify-center"
            }
          >
            {collection.type === "liked_songs" ? (
              <svg
                className="text-secondary h-14 w-14"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg
                className="text-muted h-12 w-12"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            )}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
          <div className="border-edge bg-surface text-primary flex h-10 w-10 items-center justify-center rounded-lg border opacity-0 transition-opacity group-hover:opacity-100">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Collection Info */}
      <div className="space-y-3">
        <div>
          <h3 className="text-primary truncate text-base font-medium">
            {collection.name}
          </h3>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary font-medium">
            {collection.track_count} song
            {collection.track_count === 1 ? "" : "s"}
          </span>
          <span className="text-muted text-xs">by {collection.owner}</span>
        </div>
      </div>
    </div>
  );
}
