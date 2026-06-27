import { motion } from "framer-motion";
import { BrainCircuit, Cpu, Database, History, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function MemoryBrain({ history }: { history: any[] }) {
  return (
    <Card className="border-none shadow-sm dark:bg-slate-900 h-full relative overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <BrainCircuit size={16} className="text-purple-500" />
            Enterprise Memory Brain
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <RefreshCw size={14} className="text-slate-400" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="flex flex-col items-center justify-center py-6">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="h-32 w-32 rounded-full bg-gradient-to-tr from-purple-500/20 via-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-purple-500/20 shadow-2xl shadow-purple-500/20"
          >
            <Cpu size={48} className="text-purple-600 dark:text-purple-400" />
          </motion.div>
          <div className="mt-6 text-center">
            <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">Knowledge Density: 84%</p>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Active context retrieved: 4.2 MB</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Recent Learnings</h4>
          {history.slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <Database size={14} className="mt-0.5 text-slate-400" />
              <div>
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">New Pattern Detected</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">{item.title}</p>
              </div>
            </div>
          ))}
          {!history.length && (
            <p className="text-[10px] text-slate-400 italic py-4 text-center">Initial knowledge ingestion complete. Awaiting first decision outcomes.</p>
          )}
        </div>
      </CardContent>
      
      {/* Abstract background blobs */}
      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500/5 blur-3xl" />
    </Card>
  );
}
