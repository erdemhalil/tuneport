interface AnimatedBackgroundProps {
  /** "app" for the authenticated view (subtle), "landing" for the landing page (more vivid) */
  variant?: "app" | "landing";
}

export function AnimatedBackground({
  variant = "app",
}: AnimatedBackgroundProps) {
  const isLanding = variant === "landing";

  return (
    <>
      <div className="absolute inset-0">
        <div
          className={`absolute top-1/4 left-1/4 h-72 w-72 animate-pulse rounded-full blur-3xl ${isLanding ? "bg-purple-500/10" : "bg-purple-500/5"}`}
        />
        <div
          className={`absolute right-1/4 bottom-1/4 h-96 w-96 animate-pulse rounded-full blur-3xl delay-1000 ${isLanding ? "bg-blue-500/10" : "bg-blue-500/5"}`}
        />
        <div
          className={`absolute top-1/2 left-1/2 h-64 w-64 animate-pulse rounded-full blur-3xl delay-500 ${isLanding ? "bg-pink-500/10" : "bg-pink-500/5"}`}
        />
      </div>

      <div
        className={`absolute inset-0 overflow-hidden ${!isLanding ? "pointer-events-none" : ""}`}
      >
        <div className="absolute top-20 left-10 animate-bounce delay-300">
          <div
            className={`text-4xl ${isLanding ? "text-purple-400/30" : "text-purple-400/20"}`}
          >
            ♪
          </div>
        </div>
        <div className="absolute top-40 right-20 animate-bounce delay-700">
          <div
            className={`text-3xl ${isLanding ? "text-blue-400/30" : "text-blue-400/20"}`}
          >
            ♫
          </div>
        </div>
        <div className="absolute bottom-32 left-20 animate-bounce delay-1000">
          <div
            className={`text-5xl ${isLanding ? "text-pink-400/30" : "text-pink-400/20"}`}
          >
            ♬
          </div>
        </div>
        <div className="absolute right-10 bottom-20 animate-bounce delay-500">
          <div
            className={`text-4xl ${isLanding ? "text-purple-400/30" : "text-purple-400/20"}`}
          >
            ♪
          </div>
        </div>
      </div>
    </>
  );
}
