interface CheckmarkBadgeProps {
  color?: "purple" | "emerald";
  size?: "sm" | "md";
  className?: string;
}

const colorClasses = {
  purple: "bg-purple-500",
  emerald: "bg-emerald-500",
} as const;

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
} as const;

export function CheckmarkBadge({
  color = "purple",
  size = "sm",
  className = "",
}: CheckmarkBadgeProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-full ${colorClasses[color]} ${sizeClasses[size]} ${className}`}
    >
      <svg
        className="h-3 w-3 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
