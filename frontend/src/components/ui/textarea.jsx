import React from "react";
import { cn } from "../../lib/util";


const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input/80 bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 focus-visible:border-slate-900 dark:focus-visible:ring-slate-100 dark:focus-visible:border-slate-100 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };