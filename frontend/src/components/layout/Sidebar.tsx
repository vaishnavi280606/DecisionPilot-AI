import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  Sparkles, 
  BookOpen, 
  BrainCircuit, 
  ListChecks, 
  Link2, 
  BarChart3, 
  Network, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Sun,
  Moon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeItem: string;
  onItemSelect: (item: string) => void;
}

export function Sidebar({ activeItem, onItemSelect }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Initialize theme on mount
  useEffect(() => {
    const root = window.document.documentElement;
    const initialDark = root.classList.contains("dark") || localStorage.getItem("theme") === "dark";
    if (initialDark) {
      root.classList.add("dark");
      setIsDark(true);
    } else {
      root.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const menuItems = [
    { title: "Dashboard", id: "dashboard", icon: LayoutDashboard },
    { title: "Customers", id: "customers", icon: Users },
    { title: "AI Analysis", id: "workflow-monitor", icon: Activity },
    { title: "Recommendations", id: "recommendations", icon: Sparkles },
    { title: "Knowledge Base", id: "kb", icon: BookOpen },
    { title: "Memory", id: "memory", icon: BrainCircuit },
    { title: "Reports", id: "reports", icon: BarChart3 },
    { title: "Settings", id: "settings", icon: Settings },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? "80px" : "280px" }}
      className="relative flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white transition-all duration-300 ease-in-out dark:bg-slate-900 shadow-lg"
    >
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20">
              <BrainCircuit className="text-white animate-pulse" size={20} />
            </div>
            <span className="font-heading text-base font-bold tracking-tight text-slate-800 dark:text-white">DecisionPilot AI</span>
          </motion.div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn("h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500", isCollapsed && "mx-auto")}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onItemSelect(item.id)}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-all text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white",
              activeItem === item.id && "bg-primary/5 text-primary dark:text-white font-bold dark:bg-primary/10 border-l-2 border-primary rounded-l-none"
            )}
          >
            <item.icon size={18} className={cn(activeItem === item.id ? "text-primary" : "text-slate-400")} />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs font-semibold tracking-tight"
              >
                {item.title}
              </motion.span>
            )}
          </div>
        ))}
      </nav>

      {/* Theme Toggler and Session protocol footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
        <Button
          variant="ghost"
          onClick={toggleTheme}
          className="w-full flex items-center justify-start gap-3 rounded-lg px-3 py-2.5 h-auto text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {isDark ? (
            <>
              <Sun size={18} className="text-amber-500" />
              {!isCollapsed && <span className="text-xs font-bold">Light Mode</span>}
            </>
          ) : (
            <>
              <Moon size={18} className="text-slate-600" />
              {!isCollapsed && <span className="text-xs font-bold">Dark Mode</span>}
            </>
          )}
        </Button>

        {!isCollapsed && (
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 border border-slate-100 dark:border-slate-800">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Session Protocol</p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Active (v2.4)</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}

