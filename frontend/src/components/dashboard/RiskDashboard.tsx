import { motion } from "framer-motion";
import { ShieldAlert, Zap, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

function CircularProgress({ value, color, size = 60 }: { value: number; color: string; size?: number }) {
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          className="text-slate-100 dark:text-slate-800"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={color}
        />
      </svg>
      <span className="absolute text-[10px] font-bold">{value}%</span>
    </div>
  );
}

export function RiskDashboard({ summary }: { summary: any }) {
  const health = summary?.health_score ?? 0;
  const churn = summary?.churn_risk ?? 0;
  const upsell = summary?.upsell_opp ?? 0;

  const risks = [
    { name: "Customer Health", value: health, color: "text-emerald-500", icon: CheckCircle },
    { name: "Churn Risk", value: churn * 100, color: "text-red-500", icon: AlertCircle },
    { name: "Renewal Risk", value: 35, color: "text-amber-500", icon: ShieldAlert },
    { name: "Upsell Op.", value: upsell * 100, color: "text-blue-500", icon: Zap },
  ];

  return (
    <Card className="border-none shadow-sm dark:bg-slate-900 overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Risk & Opportunity Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {risks.map((risk, index) => (
            <motion.div
              key={risk.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <CircularProgress value={risk.value} color={risk.color} />
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{risk.name}</p>
                <div className={cn("mt-1 flex items-center gap-1 text-xs font-bold justify-center", risk.color)}>
                  <risk.icon size={12} />
                  {risk.value > 50 ? "High" : risk.value > 30 ? "Medium" : "Low"}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase flex items-center gap-2">
              <TrendingUp size={14} className="text-primary" />
              Strategic Insight
            </h5>
            <p className="text-xs text-slate-500 leading-relaxed">
              Customer sentiment has improved by 12% following the last engagement. Churn risk is currently decoupled from support volume, suggesting adoption-side friction.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
