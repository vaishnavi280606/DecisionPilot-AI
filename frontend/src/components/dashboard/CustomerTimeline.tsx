import { motion } from "framer-motion";
import { MessageSquare, Ticket, FileText, Calendar, CheckSquare, HeartHandshake } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CustomerTimeline() {
  const events = [
    { title: "Contract Renewed", type: "contract", icon: HeartHandshake, date: "Sep 12, 2025", desc: "Enterprise plan extended for 2 years.", color: "text-emerald-600 bg-emerald-50" },
    { title: "Strategic Review Held", type: "meeting", icon: MessageSquare, date: "Aug 22, 2025", desc: "Q3 objectives defined with stakeholder team.", color: "text-blue-600 bg-blue-50" },
    { title: "Issue Resolved", type: "support", icon: CheckSquare, date: "Aug 15, 2025", desc: "API integration bottleneck resolved by dev team.", color: "text-purple-600 bg-purple-50" },
    { title: "Trouble Ticket Opened", type: "support", icon: Ticket, date: "Aug 14, 2025", desc: "Customer reported latency during peak hours.", color: "text-amber-600 bg-amber-50" },
    { title: "New Documentation Shared", type: "kb", icon: FileText, date: "Aug 01, 2025", desc: "Custom onboarding guide uploaded to knowledge base.", color: "text-slate-600 bg-slate-50" },
  ];

  return (
    <Card className="border-none shadow-sm dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <Calendar size={16} />
          Customer Event Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6 before:absolute before:left-[17px] before:top-2 before:h-[calc(100%-16px)] before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
          {events.map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-10"
            >
              <div className={`absolute left-0 top-0 h-9 w-9 rounded-xl flex items-center justify-center border-4 border-white dark:border-slate-950 shadow-sm z-10 ${event.color}`}>
                <event.icon size={16} />
              </div>
              <div className="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-50 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{event.title}</h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{event.date}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{event.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
