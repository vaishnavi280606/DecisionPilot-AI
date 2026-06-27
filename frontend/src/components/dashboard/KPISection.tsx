import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Users, ShieldAlert, Ticket, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  trend: string;
  isUp: boolean;
  icon: any;
  color: string;
  delay: number;
}

function KPICard({ title, value, trend, isUp, icon: Icon, color, delay }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow dark:bg-slate-900">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className={cn("p-2.5 rounded-xl bg-opacity-10", color)}>
              <Icon className={cn("h-5 w-5", color.replace("bg-", "text-").replace("-10", ""))} />
            </div>
            <div className={cn(
              "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
              isUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            )}>
              {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 dark:text-white">{value}</h3>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "70%" }}
              transition={{ duration: 1, delay: delay + 0.5 }}
              className={cn("h-full", color.replace("bg-opacity-10", ""))}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function KPISection({ summary, historyCount }: { summary: any, historyCount: number }) {
  const health = summary?.health_score ?? 0;
  const churn = summary?.churn_risk ?? 0;

  const kpis = [
    {
      title: "Customer Health",
      value: `${health.toFixed(0)}%`,
      trend: "+2.4%",
      isUp: true,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Churn Risk",
      value: `${(churn * 100).toFixed(0)}%`,
      trend: "-1.2%",
      isUp: false,
      icon: ShieldAlert,
      color: "bg-amber-500",
    },
    {
      title: "Open Tickets",
      value: "14",
      trend: "+3",
      isUp: false,
      icon: Ticket,
      color: "bg-purple-500",
    },
    {
      title: "AI Recommendations",
      value: "4 Active",
      trend: "+100%",
      isUp: true,
      icon: Sparkles,
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <KPICard key={kpi.title} {...kpi} delay={index * 0.1} />
      ))}
    </div>
  );
}
