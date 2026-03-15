import Image from "next/image";
import { AuthShowcase } from "~/components/AuthShowcase";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f6f6f4]">
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="rounded-2xl border border-zinc-300 bg-white p-4">
                <Image
                  src="/tuneport.png"
                  alt="Tuneport Logo"
                  width={100}
                  height={100}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-5xl font-semibold tracking-tight text-zinc-950">
                Tuneport
              </h1>
              <div className="mx-auto h-px w-20 bg-zinc-300"></div>
            </div>

            <div className="space-y-3">
              <p className="text-lg leading-relaxed text-zinc-700">
                Transform your Spotify library into
                <span className="font-semibold text-zinc-950">
                  {" "}
                  downloadable MP3s
                </span>
              </p>
              <p className="mx-auto max-w-sm text-sm leading-relaxed text-zinc-500">
                Connect your Spotify account and turn your favorite tracks into
                high-quality downloads with just a few clicks
              </p>
            </div>
          </div>

          <AuthShowcase />

          <div className="grid grid-cols-3 gap-6 pt-4">
            <FeatureCard
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              }
              label="Lightning Fast"
            />
            <FeatureCard
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              }
              label="Secure & Private"
            />
            <FeatureCard
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              }
              label="High Quality"
            />
          </div>

          <div className="pt-4 text-center">
            <p className="text-xs text-zinc-500">
              Built with Next.js &bull; Powered by Spotify & YouTube
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-zinc-300 bg-white p-4 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-300 bg-zinc-100">
        <svg
          className="h-5 w-5 text-zinc-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {icon}
        </svg>
      </div>
      <div className="text-xs font-medium text-zinc-700">{label}</div>
    </div>
  );
}
