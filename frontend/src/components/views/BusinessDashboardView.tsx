import { useState, useEffect } from "react";
import { 
  Heart, AlertCircle, TrendingUp, Sparkles, Trophy, 
  MessageSquare, HelpCircle, ArrowUpRight, Search, ShieldAlert,
  Calendar, CheckCircle, XCircle, ChevronRight, Play, RefreshCw,
  Info
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { getAnalytics, getCustomers, getRecommendations, takeAction, analyzeCustomer } from "../../lib/api";
import { Customer, Recommendation, DashboardAnalytics } from "../../lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { UploadPanel } from "../dashboard/UploadPanel";

interface BusinessDashboardViewProps {
  onSelectCustomer: (id: string) => void;
  onNavigateToView: (view: string) => void;
}

export function BusinessDashboardView({ onSelectCustomer, onNavigateToView }: BusinessDashboardViewProps) {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  
  // Copilot centerpiece states
  const [selectedCustomerId, setSelectedCustomerId] = useState("nexus-corp");
  const [copilotInput, setCopilotInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  // Review modal state
  const [reviewRec, setReviewRec] = useState<Recommendation | null>(null);
  const [outcomeNotes, setOutcomeNotes] = useState("");
  const [editedAction, setEditedAction] = useState("");

  const fetchData = async () => {
    try {
      const [an, custs] = await Promise.all([
        getAnalytics(),
        getCustomers()
      ]);
      setAnalytics(an);
      setCustomers(custs);
      
      // Load recommendations for the current customer
      const recs = await getRecommendations(selectedCustomerId);
      setRecommendations(recs);
    } catch (err) {
      console.error("Dashboard data load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCustomerId]);

  // WebSocket refresh listener
  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname || "localhost"}:8000/api/ws`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "dashboard_refresh" || data.type === "learning_update") {
          fetchData();
        }
      } catch (err) {
        console.error("Dashboard WS parse error:", err);
      }
    };
    return () => ws.close();
  }, [selectedCustomerId]);

  const handleRunAnalysis = async () => {
    if (!selectedCustomerId) return;
    setIsRunning(true);
    try {
      await analyzeCustomer(selectedCustomerId);
      // Wait slightly, then navigate to AI Workflow to watch execution
      setTimeout(() => {
        onNavigateToView("workflow-monitor");
      }, 500);
    } catch (err) {
      console.error("Run analysis error:", err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDecision = async (id: number, decision: "approved" | "rejected") => {
    try {
      await takeAction(id, {
        decision,
        edited_action: editedAction || undefined,
        outcome_notes: outcomeNotes || undefined
      });
      setReviewRec(null);
      setOutcomeNotes("");
      setEditedAction("");
      fetchData();
    } catch (err) {
      console.error("Decision update failed:", err);
    }
  };

  // Prepare Recharts Mock Data based on Customers
  const healthDistribution = customers.map(c => ({
    name: c.name,
    health: c.health_score,
    churn: (c.churn_risk * 100),
    expansion: (c.upsell_opp * 100),
  }));

  const pieData = [
    { name: "Strategic Tier", value: customers.filter(c => c.tier === "Strategic").length, color: "#3b82f6" },
    { name: "Enterprise Tier", value: customers.filter(c => c.tier === "Enterprise").length, color: "#8b5cf6" },
    { name: "Growth Tier", value: customers.filter(c => c.tier === "Growth Enterprise" || c.tier === "Scale").length, color: "#10b981" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-12 items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Constructing Analytics Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header banner */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black font-heading tracking-tight text-slate-800 dark:text-white uppercase">Business Performance Console</h1>
          <p className="text-slate-500 text-xs font-semibold mt-1">Real-time health telemetry, churn risks, and strategic next-best-actions.</p>
        </div>
        <Button variant="outline" className="rounded-xl flex items-center gap-2 border-slate-200" onClick={fetchData}>
          <RefreshCw size={14} />
          <span className="text-xs uppercase font-bold">Sync Data</span>
        </Button>
      </div>

      {/* 2. KPI Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* 1. Total Customers */}
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Total Customers</span>
          <h3 className="text-xl font-black text-slate-850 dark:text-white">{customers.length}</h3>
          <span className="text-[9px] text-emerald-500 font-bold block mt-1">Active Accounts</span>
        </Card>
        
        {/* 2. High Risk Customers */}
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">High Risk Accounts</span>
          <h3 className="text-xl font-black text-red-500">{analytics?.high_risk_customers ?? 0}</h3>
          <span className="text-[9px] text-red-500 font-bold block mt-1">Requires Attention</span>
        </Card>

        {/* 3. Recommendations Generated */}
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Recommendations</span>
          <h3 className="text-xl font-black text-primary">{analytics?.active_recommendations ?? 0}</h3>
          <span className="text-[9px] text-primary font-bold block mt-1">System Generated</span>
        </Card>

        {/* 4. Renewals This Month */}
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Renewals This Month</span>
          <h3 className="text-xl font-black text-violet-500">
            {customers.filter(c => c.contract_renewal.toLowerCase().includes("jun") || c.contract_renewal.toLowerCase().includes("q2") || c.contract_renewal.toLowerCase().includes("2026")).length}
          </h3>
          <span className="text-[9px] text-violet-500 font-bold block mt-1">In Renewal Window</span>
        </Card>

        {/* 5. Avg Confidence */}
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Avg Confidence</span>
          <h3 className="text-xl font-black text-emerald-500">
            {recommendations.length > 0 ? `${(recommendations.reduce((sum, r) => sum + r.confidence_score, 0) / recommendations.length * 100).toFixed(0)}%` : "92%"}
          </h3>
          <span className="text-[9px] text-emerald-500 font-bold block mt-1">High Accuracy</span>
        </Card>

        {/* 6. Pending Human Reviews */}
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Pending Review</span>
          <h3 className="text-xl font-black text-amber-500">
            {recommendations.filter(r => r.status === "pending").length}
          </h3>
          <span className="text-[9px] text-amber-500 font-bold block mt-1">HITL Gated</span>
        </Card>
      </div>

      {/* 3. AI Copilot Centerpiece Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-gradient-to-br from-primary/10 via-white to-transparent dark:from-primary/10 dark:via-slate-900 dark:to-transparent border border-primary/20 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary text-white border-none font-bold text-[9px] uppercase px-2 py-0.5 animate-pulse">Enterprise AI Copilot</Badge>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active Model: Gemini 2.5 Flash</span>
              </div>
              <h3 className="text-lg font-black dark:text-white uppercase font-heading tracking-tight">Ask anything about an account, telemetry, or conversation...</h3>
              
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g. Find SLA credits criteria or check Nexus Corp seat count..." 
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  className="bg-white/80 dark:bg-slate-950 border-slate-100 dark:border-slate-800 rounded-xl text-xs h-12 shadow-inner"
                />
                <Button 
                  onClick={handleRunAnalysis}
                  disabled={isRunning}
                  className="rounded-xl px-6 h-12 shadow-lg shadow-primary/20 font-black text-xs uppercase flex items-center gap-2"
                >
                  <Play size={12} fill="white" />
                  <span>{isRunning ? "Running Agent..." : "Run AI Analysis"}</span>
                </Button>
              </div>

              {/* Copilot panel pills */}
              <div className="flex flex-wrap gap-2 pt-2 text-[10px] font-bold text-slate-500">
                <span className="text-slate-400">Context Actions:</span>
                <select 
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="px-2 py-1 rounded bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-[10px] outline-none"
                >
                  {customers.map(c => (
                    <option key={c.customer_id} value={c.customer_id}>{c.name}</option>
                  ))}
                </select>
                <button 
                  onClick={() => setCopilotInput("Load context profiles and contract terms.")} 
                  className="px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  Load Context
                </button>
                <button 
                  onClick={() => setCopilotInput("Check recent meeting summaries and complaints.")}
                  className="px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  Recent Conversations
                </button>
              </div>
            </div>
            <div className="absolute right-[-10%] bottom-[-20%] opacity-5">
              <Sparkles size={250} className="text-primary animate-pulse" />
            </div>
          </Card>

          {/* Business Analytics charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Customer Health & Risks Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={healthDistribution}>
                    <defs>
                      <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "none", borderRadius: "12px", color: "#fff", fontSize: "10px" }} />
                    <Area type="monotone" dataKey="health" stroke="#10b981" fillOpacity={1} fill="url(#colorHealth)" name="Health Score %" />
                    <Area type="monotone" dataKey="churn" stroke="#ef4444" fillOpacity={1} fill="url(#colorChurn)" name="Churn Risk %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Expansion Opportunities vs Churn</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={healthDistribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "none", borderRadius: "12px", color: "#fff", fontSize: "10px" }} />
                    <Bar dataKey="expansion" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Expansion Opportunity %" />
                    <Bar dataKey="churn" fill="#ef4444" radius={[4, 4, 0, 0]} name="Churn Risk %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>

        {/* 4. Left Sidebar Next Best Actions */}
        <div className="space-y-6">
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Next Best Action Stack</h3>
            <div className="space-y-4">
              {recommendations.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-bold bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  No active actions. Select customer above and run analysis.
                </div>
              ) : (
                recommendations.filter(r => r.status === "pending").slice(0, 2).map((rec) => (
                  <div key={rec.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <Badge className="bg-red-500/10 text-red-500 border-none font-bold text-[8px] uppercase px-1.5 py-0">{rec.priority}</Badge>
                      <span className="text-[10px] text-primary font-black">Conf: {(rec.confidence_score*100).toFixed(0)}%</span>
                    </div>
                    <h4 className="text-xs font-black dark:text-white uppercase tracking-tight">{rec.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed truncate">{rec.details}</p>
                    
                    <div className="pt-2 flex gap-2 border-t border-slate-100 dark:border-slate-905">
                      <Button 
                        size="sm"
                        onClick={() => {
                          setReviewRec(rec);
                          setEditedAction(rec.details);
                        }}
                        className="flex-1 rounded-lg text-[9px] font-black uppercase h-8 bg-primary shadow-md shadow-primary/10"
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <UploadPanel customerId={selectedCustomerId} onUploaded={fetchData} />

          {/* System status widget */}
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">System Gateway Integrity</h3>
            <div className="space-y-2">
              {[
                { name: "API Service", status: "Healthy" },
                { name: "Vector Database", status: "Healthy" },
                { name: "LLM Orchestrator", status: "Healthy" },
                { name: "Memory Middleware", status: "Healthy" },
                { name: "Database Cluster", status: "Healthy" },
                { name: "WebSocket Gateway", status: "Healthy" },
                { name: "Tool Connector Layer", status: "Warning" }
              ].map((svc) => (
                <div key={svc.name} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl font-semibold">
                  <span className="text-slate-600 dark:text-slate-300 font-bold">{svc.name}</span>
                  <Badge className={svc.status === "Healthy" ? "bg-emerald-500/10 text-emerald-500 border-none font-bold text-[9px] uppercase" : "bg-amber-500/10 text-amber-500 border-none font-bold text-[9px] uppercase"}>
                    {svc.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* 5. Customer list highlighting risk */}
      <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Enterprise Portfolio Risk Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 uppercase font-black">
                <th className="py-3 pl-4">Account Company</th>
                <th className="py-3">Tier</th>
                <th className="py-3">ARR</th>
                <th className="py-3">Health Score</th>
                <th className="py-3">Churn risk</th>
                <th className="py-3 pr-4">Timeline Renewal</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr 
                  key={c.id} 
                  onClick={() => onSelectCustomer(c.customer_id)}
                  className="border-b border-slate-50 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer font-semibold transition-colors"
                >
                  <td className="py-3.5 pl-4 font-black dark:text-white uppercase">{c.name}</td>
                  <td><Badge variant="secondary" className="font-bold text-[9px] uppercase">{c.tier}</Badge></td>
                  <td>{c.revenue}</td>
                  <td>
                    <span className={`font-black ${c.health_score > 80 ? "text-emerald-500" : c.health_score > 60 ? "text-amber-500" : "text-red-500"}`}>
                      {c.health_score}%
                    </span>
                  </td>
                  <td>
                    <span className={`font-black ${c.churn_risk > 0.5 ? "text-red-500" : "text-slate-600 dark:text-slate-400"}`}>
                      {(c.churn_risk * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 italic text-slate-500">{c.contract_renewal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 6. Human Review Modal */}
      {reviewRec && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative"
          >
            <h3 className="text-lg font-black dark:text-white uppercase tracking-tight">Human-in-the-Loop Review</h3>
            <p className="text-xs text-slate-400 mt-0.5">Approve, Modify, or Reject generated Strategic Recommendations</p>
            
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                <span className="text-[9px] text-slate-400 font-bold block mb-1">RECOMMENDATION</span>
                <span className="text-xs font-black dark:text-white uppercase">{reviewRec.title}</span>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{reviewRec.details}</p>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1.5">Modify Recommended Action</label>
                <textarea 
                  value={editedAction}
                  onChange={(e) => setEditedAction(e.target.value)}
                  className="w-full text-xs font-semibold p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 dark:text-white min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1.5">Outcome Notes & Comments</label>
                <textarea 
                  placeholder="e.g. Approved seats contract draft. Client will sign tomorrow."
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  className="w-full text-xs font-semibold p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 dark:text-white min-h-[60px]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setReviewRec(null)} className="rounded-xl font-bold text-xs uppercase px-5">Cancel</Button>
              <div className="flex gap-2">
                <Button onClick={() => handleDecision(reviewRec.id, "rejected")} variant="destructive" className="rounded-xl font-bold text-xs uppercase px-5">Reject</Button>
                <Button onClick={() => handleDecision(reviewRec.id, "approved")} className="rounded-xl font-bold text-xs uppercase px-5 shadow-xl shadow-primary/20">Approve & Save</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
