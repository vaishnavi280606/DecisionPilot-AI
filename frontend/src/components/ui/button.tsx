import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 active:scale-95",
        // Variants
        variant === "default" && "bg-primary text-white shadow-md hover:bg-primary/90",
        variant === "outline" && "border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800",
        variant === "secondary" && "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
        variant === "destructive" && "bg-red-500 text-white hover:bg-red-600",
        variant === "ghost" && "bg-transparent hover:bg-slate-100 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-400",
        variant === "link" && "bg-transparent underline-offset-4 hover:underline text-primary",
        // Sizes
        size === "default" && "h-10 px-4 py-2",
        size === "sm" && "h-8 rounded-md px-3 text-xs",
        size === "lg" && "h-12 rounded-lg px-8 text-base",
        size === "icon" && "h-9 w-9 p-0",
        className
      )}
      {...props}
    />
  );
}
