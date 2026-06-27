import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const riskData = [
  { month: "Jan", risk: 45 },
  { month: "Feb", risk: 52 },
  { month: "Mar", risk: 48 },
  { month: "Apr", risk: 61 },
  { month: "May", risk: 55 },
  { month: "Jun", risk: 40 },
];

const distributionData = [
  { group: "Healthy", count: 42, color: "#10b981" },
  { group: "Warning", count: 28, color: "#f59e0b" },
  { risk: "Critical", count: 12, color: "#ef4444" },
];

export function InsightsCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-none shadow-sm dark:bg-slate-900 overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Risk Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={riskData}>
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
              />
              <Area 
                type="monotone" 
                dataKey="risk" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorRisk)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm dark:bg-slate-900 overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Portfolio Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="group" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} 
              />
              <Tooltip 
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
