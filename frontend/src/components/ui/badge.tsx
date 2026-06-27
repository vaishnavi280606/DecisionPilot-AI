import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variant === "default" && "bg-primary/10 text-primary border-transparent",
        variant === "secondary" && "bg-slate-100 text-slate-900 border-transparent dark:bg-slate-800 dark:text-slate-100",
        variant === "destructive" && "bg-red-500/10 text-red-600 border-transparent dark:bg-red-500/20 dark:text-red-400",
        variant === "outline" && "text-foreground border border-slate-200 dark:border-slate-800",
        variant === "success" && "bg-emerald-500/10 text-emerald-600 border-transparent dark:bg-emerald-500/20 dark:text-emerald-400",
        variant === "warning" && "bg-amber-500/10 text-amber-600 border-transparent dark:bg-amber-500/20 dark:text-amber-400",
        className
      )}
      {...props}
    />
  );
}
