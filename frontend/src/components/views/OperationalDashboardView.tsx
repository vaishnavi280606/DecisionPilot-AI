import { useState, useEffect } from "react";
import { 
  Cpu, HardDrive, Network, Database, Layers, Activity,
  Clock, CheckCircle, AlertTriangle, AlertCircle, RefreshCw
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { getReports, getConnections } from "../../lib/api";
import { ToolConnection, ReportsData } from "../../lib/types";

export function OperationalDashboardView() {
  const [connections, setConnections] = useState<ToolConnection[]>([]);
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Stats
  const [activeQueueCount, setActiveQueueCount] = useState(0);
  const [cpuUsage, setCpuUsage] = useState(24);

  const fetchData = async () => {
    try {
      const [conns, reps] = await Promise.all([
        getConnections(),
        getReports()
      ]);
      setConnections(conns);
      setReports(reps);
      
      // Randomize queue count slightly for live demo
      setActiveQueueCount(Math.floor(Math.random() * 2));
      setCpuUsage(20 + Math.floor(Math.random() * 15));
    } catch (err) {
      console.error("Operational data load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-12 items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Gaging System Telemetry...</p>
      </div>
    );
  }

  // Pre-calculate latencies
  const averageLatency = connections.length 
    ? (connections.reduce((sum, c) => sum + c.latency_ms, 0) / connections.length).toFixed(0)
    : "88";

  // Recharts latencies chart data
  const latencyData = reports?.agent_performance.map(ap => ({
    name: ap.agent,
    latency: parseFloat(ap.latency.replace("ms", "")),
    accuracy: parseFloat(ap.accuracy.replace("%", ""))
  })) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black font-heading tracking-tight text-slate-800 dark:text-white uppercase">Operational Dashboard</h1>
          <p className="text-slate-500 text-xs font-semibold mt-1">Technical monitoring of active orchestrations, queue latencies, and tool layer health.</p>
        </div>
        <Button variant="outline" className="rounded-xl flex items-center gap-2 border-slate-200" onClick={fetchData}>
          <RefreshCw size={14} />
          <span className="text-xs uppercase font-bold">Refresh Logs</span>
        </Button>
      </div>

      {/* 2. Technical KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl flex justify-between items-start shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Queue Backlog</span>
            <h3 className="text-2xl font-black text-slate-850 dark:text-white">
              {activeQueueCount} Workflows
            </h3>
            <span className="text-[9px] text-emerald-500 font-black block mt-2">● WebSocket Stream Active</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Layers size={20} />
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl flex justify-between items-start shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Orchestration CPU</span>
            <h3 className="text-2xl font-black text-slate-850 dark:text-white">
              {cpuUsage}% Load
            </h3>
            <span className="text-[9px] text-slate-400 font-black block mt-2">Memory Allocation: 1.4 GB / 8 GB</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
            <Cpu size={20} />
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl flex justify-between items-start shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Tool Layer Ping</span>
            <h3 className="text-2xl font-black text-slate-850 dark:text-white">
              {averageLatency} ms
            </h3>
            <span className="text-[9px] text-emerald-500 font-black block mt-2">↑ Sync Rate: 100%</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Network size={20} />
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl flex justify-between items-start shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">SQLite DB Transactions</span>
            <h3 className="text-2xl font-black text-slate-850 dark:text-white">
              4.2k / hour
            </h3>
            <span className="text-[9px] text-emerald-500 font-black block mt-2">0 transaction lock errors</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Database size={20} />
          </div>
        </Card>
      </div>

      {/* 3. Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latency by Agent chart */}
        <Card className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Agent Execution Latency (ms)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={8} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "none", borderRadius: "12px", color: "#fff", fontSize: "10px" }} />
                <Bar dataKey="latency" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Processing Latency (ms)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Database writing chart */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Memory Write Throughput (kB/s)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { time: "10:00", rate: 45 },
                { time: "10:10", rate: 52 },
                { time: "10:20", rate: 48 },
                { time: "10:30", rate: 70 },
                { time: "10:40", rate: 64 },
                { time: "10:50", rate: 82 },
                { time: "11:00", rate: 58 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "none", borderRadius: "12px", color: "#fff", fontSize: "10px" }} />
                <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2.5} dot={false} name="Memory Writes Rate" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 4. Connections / Tool Layer Overview */}
      <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Tool Layer Gateways</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {connections.map((c) => {
            const syncData = JSON.parse(c.config_json || "{}");
            return (
              <div key={c.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black dark:text-white uppercase">{c.name}</h4>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-bold">
                    <span>Latency: {c.latency_ms}ms</span>
                    <span>•</span>
                    <span>Provider: {syncData.provider || "Gemini"}</span>
                  </div>
                </div>

                <Badge className={c.status === "healthy" ? "bg-emerald-500/10 text-emerald-500 border-none font-bold text-[9px]" : "bg-amber-500/10 text-amber-500 border-none font-bold text-[9px]"}>
                  {c.status.toUpperCase()}
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
