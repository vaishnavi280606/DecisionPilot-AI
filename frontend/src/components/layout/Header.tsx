import { Search, Bell, User, Bot, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Notification } from "../../lib/types";

interface HeaderProps {
  onSearch: (q: string) => void;
  onNotify?: () => void;
  onProfileClick: () => void;
  notifications: Notification[];
  onClearNotifications: () => void;
}

export function Header({ 
  onSearch, 
  onNotify, 
  onProfileClick, 
  notifications, 
  onClearNotifications 
}: HeaderProps) {
  const unreadCount = notifications.filter(n => !n.is_read).length;
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-white px-8 dark:bg-slate-950 sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-slate-950/80">
      <div className="w-full max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <Input
            placeholder="Search decisions, customers, agents..."
            className="pl-10 h-10 bg-slate-50/50 border-slate-100 focus-visible:ring-primary/20 transition-all dark:bg-slate-900 dark:border-slate-800"
            onKeyDown={(e) => e.key === "Enter" && onSearch?.(e.currentTarget.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 shadow-sm">
          <Bot size={16} className="animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider">AI Engines: Synced</span>
        </div>

        <div className="flex items-center gap-2">
            <Button 
              size="icon" 
              variant="ghost" 
              className="rounded-xl relative group"
              onClick={onClearNotifications}
            >
              <Bell size={20} className="text-slate-500 group-hover:text-primary transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-white dark:ring-slate-950"></span>
              )}
            </Button>
          
          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1"></div>
          
          <div 
            className="flex items-center gap-3 cursor-pointer group pl-2"
            onClick={onProfileClick}
          >
            <div className="text-right hidden lg:block">
              <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Alex Rivera</p>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter opacity-70">Decision Architect</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 transition-all group-hover:ring-4 group-hover:ring-primary/10 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden relative">
              <User size={20} className="relative z-10" />
              <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
