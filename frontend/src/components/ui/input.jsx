import React from "react";
import { cn } from "../../lib/util";


const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input/80 bg-background px-3 py-1.5 text-sm shadow-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 focus-visible:border-slate-900 dark:focus-visible:ring-slate-100 dark:focus-visible:border-slate-100 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
