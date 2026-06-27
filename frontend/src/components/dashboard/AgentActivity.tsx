import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Clock, Loader2, Bot, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AgentStep {
  id: string;
  name: string;
  status: "idle" | "running" | "completed";
  description: string;
  time?: string;
}

export function AgentActivity({ 
  loading, 
  status, 
  progress 
}: { 
  loading: boolean; 
  status: string | null; 
  progress: number;
}) {
  const agents: AgentStep[] = [
    { id: "planner", name: "Planner Agent", status: progress > 10 ? "completed" : (loading && progress <= 10 ? "running" : "idle"), description: "Defining multi-source analysis strategy" },
    { id: "transcript", name: "Transcript Agent", status: progress > 25 ? "completed" : (loading && progress <= 25 && progress > 10 ? "running" : "idle"), description: "Analyzing sentiment and commitments" },
    { id: "crm", name: "CRM Agent", status: progress > 40 ? "completed" : (loading && progress <= 40 && progress > 25 ? "running" : "idle"), description: "Evaluating pipeline and renewal risk" },
    { id: "kb", name: "Knowledge Agent", status: progress > 75 ? "completed" : (loading && progress <= 75 && progress > 60 ? "running" : "idle"), description: "Retrieving relevant playbooks from RAG" },
    { id: "risk", name: "Risk Agent", status: progress > 85 ? "completed" : (loading && progress <= 85 && progress > 75 ? "running" : "idle"), description: "Computing churn and opportunity scores" },
    { id: "recommendation", name: "Recommendation Agent", status: progress >= 95 ? "completed" : (loading && progress < 95 && progress > 85 ? "running" : "idle"), description: "Synthesizing next best actions" },
  ];

  return (
    <Card className="border-none shadow-sm dark:bg-slate-900 h-full overflow-hidden flex flex-col">
      <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Bot size={16} className="text-primary" />
            Agent Orchestration
          </CardTitle>
          {loading && (
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Loader2 size={14} className="animate-spin" />
              {progress}%
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-y-auto">
        {status && (
           <div className="p-4 bg-primary/5 border-b border-primary/10">
             <p className="text-[10px] font-black uppercase text-primary tracking-tighter mb-1">Current Task</p>
             <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{status}</p>
           </div>
        )}
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "group relative flex items-start gap-4 p-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50",
                agent.status === "running" && "bg-blue-50/30 dark:bg-blue-900/10"
              )}
            >
              <div className="mt-0.5 relative">
                {agent.status === "completed" ? (
                  <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={14} />
                  </div>
                ) : agent.status === "running" ? (
                  <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Loader2 size={14} className="animate-spin" />
                  </div>
                ) : (
                  <div className="h-5 w-5 rounded-full border border-slate-200 flex items-center justify-center text-slate-300">
                    <Circle size={14} />
                  </div>
                )}
                {index < agents.length - 1 && (
                  <div className="absolute top-5 left-2.5 w-[1px] h-8 bg-slate-100 dark:bg-slate-800" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={cn(
                    "text-sm font-bold truncate",
                    agent.status === "completed" ? "text-slate-900 dark:text-white" : 
                    agent.status === "running" ? "text-primary" : "text-slate-400"
                  )}>
                    {agent.name}
                  </p>
                  <span className="text-[10px] font-medium text-slate-400 uppercase">{agent.time}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{agent.description}</p>
              </div>
              
              <ChevronRight size={14} className="mt-1 text-slate-200 group-hover:text-slate-400" />
            </motion.div>
          ))}
        </div>
      </CardContent>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
        <Button variant="outline" className="w-full text-xs font-bold gap-2 h-9 border-slate-200 hover:bg-white dark:border-slate-700">
          View Detailed Agent Logs
        </Button>
      </div>
    </Card>
  );
}
