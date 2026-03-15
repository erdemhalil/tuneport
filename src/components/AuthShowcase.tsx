import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

export function AuthShowcase() {
  const { data: sessionData } = useSession();

  return (
    <div className="rounded-xl border border-zinc-300 bg-white p-6">
      {sessionData?.user ? (
        <div className="space-y-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            {sessionData.user.image && (
              <div className="relative">
                <Image
                  src={sessionData.user.image}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="rounded-full border border-zinc-300"
                />
                <div className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full border-2 border-white bg-zinc-900"></div>
              </div>
            )}
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-zinc-900">Welcome back</h3>
              <p className="font-medium text-zinc-700">
                {sessionData.user.name}
              </p>
              <p className="text-sm text-zinc-500">
                Ready to download your music?
              </p>
            </div>
          </div>

          <button
            onClick={() => void signOut()}
            className="w-full rounded-md border border-zinc-900 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus:ring-2 focus:ring-zinc-900 focus:outline-none"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="space-y-6 text-center">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-zinc-900">
              Connect with Spotify
            </h2>
            <p className="leading-relaxed text-zinc-600">
              Link your Spotify account to start downloading your favorite
              tracks
            </p>
          </div>

          <button
            onClick={() => void signIn("spotify")}
            className="group flex w-full items-center justify-center space-x-3 rounded-md border border-zinc-900 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus:ring-2 focus:ring-zinc-900 focus:outline-none"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.6-.12-.421.18-.78.6-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.081zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.42-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.781-.18-.601.18-1.2.78-1.381 4.5-1.411 11.64-1.151 15.12 1.621.48.3.599 1.019.24 1.5-.36.48-1.061.6-1.5.24z" />
            </svg>
            <span>Continue with Spotify</span>
          </button>

          <p className="text-xs leading-relaxed text-zinc-500">
            We only access your music library and playlists. Your data stays
            secure and private.
          </p>
        </div>
      )}
    </div>
  );
}
