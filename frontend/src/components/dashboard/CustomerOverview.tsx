import { motion } from "framer-motion";
import { User, Building2, Calendar, DollarSign, Activity, AlertTriangle, TrendingUp, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CustomerOverview({ summary, customerId }: { summary: any, customerId: string }) {
  const health = summary?.health_score ?? 0;
  const churn = summary?.churn_risk ?? 0;
  const tier = summary?.tier ?? 'Premium Tier';
  const revenue = summary?.revenue ?? '$0';
  const renewal = summary?.contract_renewal ?? 'N/A';
  const desc = summary?.summary ?? 'No analysis summary available.';

  const stats = [
    { label: "Company", value: (summary?.name || customerId).toUpperCase(), icon: Building2 },
    { label: "Plan", value: tier, icon: Activity },
    { label: "Revenue (ARR)", value: revenue, icon: DollarSign },
    { label: "Renewal", value: renewal, icon: Calendar },
  ];

  return (
    <Card className="border-none shadow-sm dark:bg-slate-900 overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Building2 size={32} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-black font-heading tracking-tight">{(summary?.name || customerId).toUpperCase()}</h1>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[10px] uppercase">Active Account</Badge>
                </div>
                <p className="text-slate-400 text-sm font-medium">Account ID: {customerId} • Strategic Global Segment</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center px-4 border-r border-white/10">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Health Score</p>
                <p className="text-xl font-black text-emerald-400">{health.toFixed(0)}</p>
              </div>
              <div className="text-center px-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Risk Level</p>
                <div className={cn(
                  "px-3 py-0.5 rounded-full text-xs font-bold border",
                  churn > 0.5 ? "bg-red-500/20 text-red-400 border-red-500/20" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                )}>
                  {churn > 0.5 ? "High" : "Optimal"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
          {stats.map((stat) => (
            <div key={stat.label} className="p-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <stat.icon size={12} /> {stat.label}
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">AI Summary</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic">
            "{desc}"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
