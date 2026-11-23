import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/util";


const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-blue-600 text-white hover:bg-blue-700 shadow-2xs",
        secondary:
          "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200/80 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300",
        destructive:
          "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400",
        warning:
          "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400",
        info:
          "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-400",
        outline: "text-foreground border-border bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };