import { signIn } from "next-auth/react";

export function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#141416] text-white">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="landing-glow-primary absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-[55%] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,rgba(99,102,241,0.03)_35%,transparent_70%)]" />
        <div className="landing-glow-secondary absolute top-[40%] left-[38%] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.06)_0%,rgba(139,92,246,0.02)_40%,transparent_70%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        {/* Header */}
        <header>
          <span className="text-sm font-semibold tracking-[0.18em] text-zinc-500">
            TUNEPORT
          </span>
        </header>

        {/* Center content */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h1 className="landing-stagger-1 max-w-4xl text-5xl leading-[0.94] font-semibold tracking-[-0.032em] text-white sm:text-6xl lg:text-8xl">
            Turn streaming habits
            <br />
            into an offline library.
          </h1>

          <p className="landing-stagger-2 mt-6 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base lg:text-lg">
            Build a personal collection you actually own, ready whenever you
            are.
          </p>

          <button
            onClick={() => void signIn("spotify")}
            className="landing-stagger-3 group mt-10 flex cursor-pointer items-center gap-2.5 rounded-full bg-[#1DB954] px-7 py-3.5 text-sm font-semibold text-black shadow-[0_0_24px_rgba(29,185,84,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1ed760] hover:shadow-[0_0_32px_rgba(29,185,84,0.35)] focus:ring-2 focus:ring-[#1DB954]/50 focus:ring-offset-2 focus:ring-offset-[#141416] focus:outline-none"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.6-.12-.421.18-.78.6-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.081zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.42-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.781-.18-.601.18-1.2.78-1.381 4.5-1.411 11.64-1.151 15.12 1.621.48.3.599 1.019.24 1.5-.36.48-1.061.6-1.5.24z" />
            </svg>
            <span>Continue with Spotify</span>
            <svg
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <p className="landing-stagger-4 mt-4 text-xs text-zinc-600">
            Read-only access. No posting.
          </p>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-zinc-800/50 pt-4 text-xs text-zinc-600">
          <span>Private by default</span>
          <span>Curated by you</span>
        </footer>
      </div>
    </main>
  );
}
