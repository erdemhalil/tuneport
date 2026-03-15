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
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute inset-0 ${isLanding ? "bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.03),transparent_35%),radial-gradient(circle_at_80%_75%,rgba(0,0,0,0.025),transparent_30%)]" : "bg-[radial-gradient(circle_at_15%_10%,rgba(0,0,0,0.02),transparent_30%),radial-gradient(circle_at_85%_80%,rgba(0,0,0,0.02),transparent_30%)]"}`}
        />
      </div>
    </>
  );
}
