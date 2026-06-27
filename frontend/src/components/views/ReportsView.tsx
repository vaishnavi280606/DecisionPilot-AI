import { useState, useEffect } from "react";
import { 
  FileSpreadsheet, FileText, CheckCircle, Target, Layers, 
  TrendingUp, ShieldAlert, BadgeDollarSign
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  BarChart, Bar
} from "recharts";
import { getReports } from "../../lib/api";
import { ReportsData } from "../../lib/types";

export function ReportsView() {
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const data = await getReports();
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCsv = () => {
    if (!reports) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Agent,Latency,Accuracy\n";
    reports.agent_performance.forEach(ap => {
      csvContent += `${ap.agent},${ap.latency},${ap.accuracy}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "decisionpilot_agent_performance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPdf = () => {
    const pdfContent = `data:text/plain;charset=utf-8,
DECISIONPILOT AI - ENTERPRISE STRATEGIC ANALYTICS REPORT
======================================================
Recommendation Accuracy: ${reports?.accuracy.toFixed(1)}%
Playbook Success Rate: ${reports?.playbook_success_rate}%
Total Recommendations Generated: ${reports?.recommendation_total}

Agent Latency Summary:
${reports?.agent_performance.map(ap => `- ${ap.agent}: Latency ${ap.latency}, Accuracy ${ap.accuracy}`).join("\n")}
`;
    const encodedUri = encodeURI(pdfContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "decisionpilot_enterprise_report.pdf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-12 items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Generating Enterprise Reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black font-heading tracking-tight text-slate-800 dark:text-white uppercase">Analytics & Reports</h1>
          <p className="text-slate-500 text-xs font-semibold mt-1">Export executive summaries and check system and agent accuracies.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCsv} variant="outline" className="rounded-xl flex items-center gap-2 border-slate-200 text-xs uppercase font-bold">
            <FileSpreadsheet size={14} />
            <span>Export CSV</span>
          </Button>
          <Button onClick={handleExportPdf} className="rounded-xl flex items-center gap-2 text-xs uppercase font-bold shadow-lg shadow-primary/20">
            <FileText size={14} />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* 1. Accuracy */}
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Recommendation Accuracy</span>
          <h3 className="text-xl font-black text-slate-850 dark:text-white">{reports?.accuracy.toFixed(1)}%</h3>
          <span className="text-[9px] text-emerald-500 font-bold block mt-1">SLA Compliant</span>
        </Card>

        {/* 2. Churn */}
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Avg Churn Rate</span>
          <h3 className="text-xl font-black text-red-500">14.2%</h3>
          <span className="text-[9px] text-red-500 font-bold block mt-1">Down 2.4% MoM</span>
        </Card>

        {/* 3. Renewals Pipeline */}
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Renewals Pipeline</span>
          <h3 className="text-xl font-black text-violet-500">$8.4M</h3>
          <span className="text-[9px] text-violet-500 font-bold block mt-1">Q2 Target Cycle</span>
        </Card>

        {/* 4. Revenue at Risk */}
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Revenue at Risk</span>
          <h3 className="text-xl font-black text-amber-500">$1.2M</h3>
          <span className="text-[9px] text-amber-500 font-bold block mt-1">3 Accounts Flagged</span>
        </Card>

        {/* 5. Business Rules Success */}
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Rule Success Rate</span>
          <h3 className="text-xl font-black text-emerald-500">98.4%</h3>
          <span className="text-[9px] text-emerald-500 font-bold block mt-1">Direct Engine Override</span>
        </Card>

        {/* 6. Playbook Success */}
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Playbook Success</span>
          <h3 className="text-xl font-black text-primary">{reports?.playbook_success_rate}%</h3>
          <span className="text-[9px] text-primary font-bold block mt-1">Matched vectors success</span>
        </Card>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Recommendation Success over Churn (Monthly)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reports?.churn_trends || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "none", borderRadius: "12px", color: "#fff", fontSize: "10px" }} />
                <Area type="monotone" dataKey="accuracy" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} name="Accuracy Index %" />
                <Area type="monotone" dataKey="churn" stroke="#ef4444" fill="#ef4444" fillOpacity={0.05} name="Churn incidents %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">CS Team Latency & Accuracy Scorecard</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports?.agent_performance.map(ap => ({
                name: ap.agent,
                accuracy: parseFloat(ap.accuracy)
              })) || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={8} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "none", borderRadius: "12px", color: "#fff", fontSize: "10px" }} />
                <Bar dataKey="accuracy" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Decision Precision Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
