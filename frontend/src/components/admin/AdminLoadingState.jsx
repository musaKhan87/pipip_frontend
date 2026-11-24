import { Bike } from "lucide-react";

export default function AdminLoadingState({
  title = "Loading Fleet Data...",
  subtitle = "Connecting to operations database & syncing telemetry",
  className = "",
  minHeight = "min-h-[300px]",
}) {
  return (
    <div
      className={`w-full flex flex-col items-center justify-center p-6 text-center ${minHeight} ${className}`}
    >
      <div className="relative flex items-center justify-center mb-5">
        {/* Ambient Glow Aura */}
        <div
          className="absolute w-20 h-20 rounded-full bg-blue-500/20 blur-md animate-pulse pointer-events-none"
          style={{ animationDuration: "2.5s" }}
        />

        {/* Outer Pulsing Expanding Wave Ring */}
        <div
          className="absolute w-16 h-16 rounded-full bg-blue-500/15 animate-ping pointer-events-none"
          style={{ animationDuration: "2s" }}
        />

        {/* Precision Circular Spinner Track */}
        <div className="w-14 h-14 rounded-full border-[2.5px] border-slate-200/80 dark:border-slate-800 border-t-blue-600 border-r-indigo-500 animate-spin" />

        {/* Floating Brand Emblem Center */}
        <div className="absolute w-9 h-9 rounded-full bg-white dark:bg-slate-900 shadow-md border border-slate-100 dark:border-slate-800 flex items-center justify-center text-blue-600">
          <Bike className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse stroke-[2.2]" />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-display font-black text-foreground tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground max-w-xs mx-auto font-normal">
            {subtitle}
          </p>
        )}
      </div>

      {/* Modern Shimmer Progress Indicator */}
      <div className="w-36 h-1 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
        <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 rounded-full w-3/4 animate-pulse" />
      </div>
    </div>
  );
}
