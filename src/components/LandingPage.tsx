import Image from "next/image";
import { AnimatedBackground } from "~/components/ui/AnimatedBackground";
import { AuthShowcase } from "~/components/AuthShowcase";

export function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AnimatedBackground variant="landing" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          {/* Hero Section with Icon */}
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-3xl bg-gradient-to-r from-purple-500 to-blue-500 opacity-60 blur-2xl"></div>
                <div className="relative rounded-3xl bg-gradient-to-r from-purple-600 to-blue-600 p-6 shadow-2xl">
                  <Image
                    src="/tuneport.png"
                    alt="Tuneport Logo"
                    width={120}
                    height={120}
                    className="rounded-2xl"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-6xl font-bold text-transparent">
                Tuneport
              </h1>
              <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
            </div>

            <div className="space-y-3">
              <p className="text-xl leading-relaxed font-light text-gray-300">
                Transform your Spotify library into
                <span className="font-semibold text-white">
                  {" "}
                  downloadable MP3s
                </span>
              </p>
              <p className="mx-auto max-w-sm text-sm leading-relaxed text-gray-400">
                Connect your Spotify account and turn your favorite tracks into
                high-quality downloads with just a few clicks
              </p>
            </div>
          </div>

          <AuthShowcase />

          {/* Feature Grid */}
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
              gradient="from-green-500 to-emerald-500"
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
              gradient="from-purple-500 to-pink-500"
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
              gradient="from-blue-500 to-cyan-500"
              label="High Quality"
            />
          </div>

          <div className="pt-4 text-center">
            <p className="text-xs text-gray-500">
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
  gradient,
  label,
}: {
  icon: React.ReactNode;
  gradient: string;
  label: string;
}) {
  return (
    <div className="group space-y-3 rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white/10">
      <div
        className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${gradient} shadow-lg transition-transform group-hover:scale-110`}
      >
        <svg
          className="h-6 w-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {icon}
        </svg>
      </div>
      <div className="text-xs font-medium text-gray-300">{label}</div>
    </div>
  );
}
