import Image from "next/image";
import type { Collection } from "~/utils/types";

interface CollectionCardProps {
  collection: Collection;
  onClick: () => void;
}

export function CollectionCard({ collection, onClick }: CollectionCardProps) {
  return (
    <div
      className="group glass animate-fade-in cursor-pointer rounded-2xl border border-white/20 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/30 hover:shadow-2xl"
      onClick={onClick}
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
              collection.type === "liked_songs"
                ? "flex h-full w-full items-center justify-center bg-gradient-to-br from-green-400/40 via-emerald-500/40 to-green-700/40"
                : "flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 to-white/5"
            }
          >
            {collection.type === "liked_songs" ? (
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
          <div className="flex h-12 w-12 scale-0 transform items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all duration-300 group-hover:scale-100 group-hover:bg-white/20">
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
          <span className="text-xs text-gray-500">by {collection.owner}</span>
        </div>
      </div>
    </div>
  );
}
