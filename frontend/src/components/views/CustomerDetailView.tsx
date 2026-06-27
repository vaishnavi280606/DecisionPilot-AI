import { useState, useEffect } from "react";
import { 
  Building2, DollarSign, Calendar, TrendingUp, ShieldCheck, 
  Clock, AlertTriangle, Play, CheckCircle2, ChevronRight, 
  HelpCircle, Search, Mail, FileText, ArrowRight, UserCheck, 
  Plus, History, Database, Cpu, MessageSquare, Wrench, Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getCustomer, getConversations, getMemory, getRecommendations, takeAction, analyzeCustomer } from "../../lib/api";
import { Customer, ConversationThreads, MemoryPartition, Recommendation } from "../../lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { UploadPanel } from "../dashboard/UploadPanel";

interface CustomerDetailViewProps {
  customerId: string;
  onBack: () => void;
}

export function CustomerDetailView({ customerId, onBack }: CustomerDetailViewProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [conversations, setConversations] = useState<ConversationThreads | null>(null);
  const [memory, setMemory] = useState<MemoryPartition | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  // RAG Search State
  const [kbQuery, setKbQuery] = useState("");
  const [kbResults, setKbResults] = useState<Array<{ chunk: string; confidence: number; docName: string }>>([]);

  // Workflow Analysis states
  const [isRunning, setIsRunning] = useState(false);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [agentLogs, setAgentLogs] = useState<Record<string, { status: string; logs: string; output: string; time: number; tool_calls: any[] }>>({});

  // Human review modal state
  const [reviewRec, setReviewRec] = useState<Recommendation | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewAction, setReviewAction] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cData, convData, memData, recs] = await Promise.all([
        getCustomer(customerId),
        getConversations(customerId),
        getMemory(customerId),
        getRecommendations(customerId)
      ]);
      setCustomer(cData);
      setConversations(convData);
      setMemory(memData);
      setRecommendations(recs);
    } catch (err) {
      console.error("Error loading customer profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [customerId]);

  // WebSocket Live Updates listener
  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname || "localhost"}:8000/api/ws`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "agent_update" && data.customer_id === customerId) {
          setIsRunning(true);
          setRunningAgent(data.agent);
          setAgentLogs(prev => ({
            ...prev,
            [data.agent]: {
              status: data.status,
              logs: data.logs,
              output: data.output,
              time: data.time_taken,
              tool_calls: data.tool_calls || []
            }
          }));
          if (data.agent === "memory" && data.status === "completed") {
            setIsRunning(false);
            setRunningAgent(null);
            fetchData(); // Refresh metrics and recommendations
          }
        }
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };

    return () => ws.close();
  }, [customerId]);

  const triggerAnalysis = async () => {
    setAgentLogs({});
    setIsRunning(true);
    setActiveTab("analysis");
    try {
      await analyzeCustomer(customerId);
    } catch (err) {
      console.error("Trigger analysis error:", err);
      setIsRunning(false);
    }
  };

  const handleReviewAction = async (decision: "approved" | "rejected") => {
    if (!reviewRec) return;
    try {
      await takeAction(reviewRec.id, {
        decision,
        edited_action: reviewAction,
        outcome_notes: reviewNotes
      });
      setReviewRec(null);
      setReviewNotes("");
      setReviewAction("");
      fetchData();
    } catch (err) {
      console.error("Action submit error:", err);
    }
  };

  const handleKbSearch = () => {
    if (!kbQuery) return;
    // Mock ChromaDB hybrid search output
    setKbResults([
      {
        docName: "Executive Renewal Playbook v2.1",
        chunk: "...If contract volume exceeds $2.5M, custom discount approvals MUST navigate through the Compliance Gate. Standard seat discount cap is set at 15%...",
        confidence: 0.94
      },
      {
        docName: "SLA Escalation Policy Guidelines",
        chunk: "...Any Priority-1 server outage open for > 4 hours requires immediate Account Manager outreach and RCA credit compensation calculation...",
        confidence: 0.88
      }
    ]);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-12 items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Loading Account Portfolio...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
        <p className="text-red-500 font-bold">Error: Customer profile not found.</p>
        <Button onClick={onBack} className="mt-4">Back to Portfolio</Button>
      </div>
    );
  }

  // Calculate health colors
  const healthColor = customer.health_score > 80 ? "text-emerald-500" : customer.health_score > 60 ? "text-amber-500" : "text-red-500";
  const healthBg = customer.health_score > 80 ? "bg-emerald-500/10 text-emerald-500" : customer.health_score > 60 ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500";

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xl">
            {customer.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black font-heading tracking-tight dark:text-white uppercase">{customer.name}</h1>
              <Badge className={healthBg + " font-bold text-[10px] uppercase border-none px-2.5 py-0.5"}>Health: {customer.health_score}%</Badge>
            </div>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              Account Reference: <span className="text-slate-600 dark:text-slate-300 font-mono font-bold uppercase">{customer.customer_id}</span> • Manager: {JSON.parse(customer.metadata_json || "{}").account_manager || "Sarah Jenkins"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack} className="rounded-xl font-bold text-xs uppercase px-5">Portfolio</Button>
          <Button 
            onClick={triggerAnalysis} 
            disabled={isRunning}
            className="rounded-xl font-bold text-xs uppercase px-6 shadow-xl shadow-primary/20 flex items-center gap-2"
          >
            <Cpu size={14} className={isRunning ? "animate-spin" : ""} />
            <span>{isRunning ? "Running Agent..." : "Run AI Analysis"}</span>
          </Button>
        </div>
      </div>

      {/* Customer Context Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Company</span>
          <span className="text-sm font-black dark:text-white uppercase truncate">{customer.name}</span>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Health</span>
          <span className={`text-sm font-black ${healthColor}`}>{customer.health_score}%</span>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Renewal</span>
          <span className="text-sm font-bold dark:text-white truncate">{customer.contract_renewal}</span>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Open Tickets</span>
          <span className="text-sm font-black dark:text-white">{conversations?.tickets.length ?? 0}</span>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Industry</span>
          <span className="text-sm font-bold dark:text-white truncate">
            {JSON.parse(customer.metadata_json || "{}").industry || "Enterprise SaaS"}
          </span>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Tier</span>
          <span className="text-sm font-bold dark:text-white truncate">{customer.tier}</span>
        </Card>
      </div>

      {/* 2. Main Tab View layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-1 mb-6 flex flex-wrap h-auto gap-1">
              {["overview", "transcript", "crm", "tickets", "emails", "kb", "upload-docs", "analysis", "timeline", "memory"].map((tab) => (
                <TabsTrigger 
                  key={tab} 
                  value={tab} 
                  className="rounded-xl text-[10px] font-black uppercase tracking-tight py-2 px-3 flex-1 text-center"
                >
                  {tab === "kb" ? "Knowledge Base" : tab === "analysis" ? "AI Analysis" : tab === "upload-docs" ? "Upload Documents" : tab === "transcript" ? "Meeting Transcript" : tab === "tickets" ? "Support Tickets" : tab}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* TAB: Overview */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-3xl">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Contract Status</p>
                  <h3 className="text-xl font-black dark:text-white uppercase">{customer.revenue} / year</h3>
                  <div className="flex items-center gap-2 mt-4 text-xs font-bold text-slate-500">
                    <Calendar size={14} />
                    <span>Renewal: {customer.contract_renewal}</span>
                  </div>
                </Card>
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-3xl">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Churn Probability</p>
                  <h3 className={`text-xl font-black uppercase ${(customer.churn_risk * 100) > 40 ? "text-red-500" : "text-emerald-500"}`}>
                    {(customer.churn_risk * 100).toFixed(0)}% Risk
                  </h3>
                  <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-800 rounded-full mt-5 overflow-hidden">
                    <div 
                      className={`h-full ${customer.churn_risk > 0.4 ? "bg-red-500" : "bg-emerald-500"}`} 
                      style={{ width: `${customer.churn_risk * 100}%` }} 
                    />
                  </div>
                </Card>
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-3xl">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Upsell Opportunity</p>
                  <h3 className="text-xl font-black text-primary uppercase">
                    {(customer.upsell_opp * 100).toFixed(0)}% Opp
                  </h3>
                  <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-800 rounded-full mt-5 overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${customer.upsell_opp * 100}%` }} />
                  </div>
                </Card>
              </div>

              {/* Summary */}
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-3xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Account Summary</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">{customer.summary}</p>
                
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Key Insights</h4>
                  <div className="flex flex-wrap gap-2">
                    {(customer.key_insights || []).map((ins: string, idx: number) => (
                      <span key={idx} className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 border border-slate-100 dark:border-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {ins}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Active recommendations */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Active Next Best Actions</h3>
                <div className="grid grid-cols-1 gap-4">
                  {recommendations.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                      <p className="text-slate-400 text-sm font-bold">No active actions. Click Run AI Analysis to generate recommendations.</p>
                    </div>
                  ) : (
                    recommendations.filter(r => r.status === "pending").map((rec) => (
                      <Card key={rec.id} className="p-6 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-3xl hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-red-500/10 text-red-500 border-none font-bold text-[9px] uppercase px-2 py-0">{rec.priority} Priority</Badge>
                              <Badge className="bg-primary/10 text-primary border-none font-bold text-[9px] uppercase px-2 py-0">Confidence: {(rec.confidence_score*100).toFixed(0)}%</Badge>
                            </div>
                            <h4 className="font-black text-slate-850 dark:text-white uppercase mt-2">{rec.title}</h4>
                            <p className="text-slate-500 text-xs mt-1 leading-relaxed">{rec.details}</p>
                            
                            <div className="mt-4 grid grid-cols-2 gap-4 text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                              <div>
                                <span className="text-[9px] text-slate-400 uppercase block mb-0.5">Estimated Outcome</span>
                                <span className="text-slate-900 dark:text-white">{rec.impact}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 uppercase block mb-0.5">Supporting Evidence</span>
                                <span className="text-slate-900 dark:text-white truncate block">{rec.evidence}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button 
                              onClick={() => {
                                setReviewRec(rec);
                                setReviewAction(rec.details);
                              }}
                              className="rounded-lg text-[10px] font-black uppercase px-4 h-9 bg-primary"
                            >
                              Review & Act
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB: Meeting Transcript */}
            <TabsContent value="transcript" className="space-y-6">
              {conversations?.transcripts.map((t, idx) => (
                <Card key={idx} className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="text-primary" size={18} />
                      <span className="font-bold text-slate-800 dark:text-white">{t.filename}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold italic">{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Highlighter helper */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl mb-4 flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Signals Found in Transcript:</span>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px]">Complaints</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px]">Competitors</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px]">Features</span>
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-line bg-slate-950 p-6 rounded-2xl text-slate-200">
                    {/* Case-insensitive key signal highlighters */}
                    {t.content.split("\n").map((line, lIdx) => {
                      const lower = line.toLowerCase();
                      
                      const complaintKeywords = ["complaint", "outage", "offline", "crash", "issue", "bug", "down", "lag", "slow", "delay", "error", "failed", "frustrated", "unhappy", "bad", "downtime", "problem", "incident"];
                      const isComplaint = complaintKeywords.some(kw => lower.includes(kw));

                      const competitorKeywords = ["hubspot", "linear", "zendesk", "competitor", "copilot", "salesforce", "competitors"];
                      const isCompetitor = competitorKeywords.some(kw => lower.includes(kw));

                      const featureKeywords = ["seat", "expansion", "expand", "upsell", "tier", "contract", "add-on", "feature", "upgrade", "buy", "renew", "analytics", "dashboard", "api"];
                      const isFeature = featureKeywords.some(kw => lower.includes(kw));

                      if (isComplaint) {
                        return <div key={lIdx} className="bg-red-500/20 border-l-2 border-red-500 pl-2 my-1">{line}</div>;
                      }
                      if (isCompetitor) {
                        return <div key={lIdx} className="bg-amber-500/20 border-l-2 border-amber-500 pl-2 my-1">{line}</div>;
                      }
                      if (isFeature) {
                        return <div key={lIdx} className="bg-blue-500/20 border-l-2 border-blue-500 pl-2 my-1">{line}</div>;
                      }
                      return <div key={lIdx}>{line}</div>;
                    })}
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* TAB: CRM */}
            <TabsContent value="crm" className="space-y-6">
              <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Salesforce CRM Metadata</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {Object.entries(JSON.parse(customer.metadata_json || "{}")).map(([key, val]) => (
                    <div key={key} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">
                        {key.replace(/_/g, " ")}
                      </span>
                      {Array.isArray(val) ? (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {val.map((v, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] font-bold">{v}</Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm font-black text-slate-850 dark:text-white italic">{String(val)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* TAB: Support Tickets */}
            <TabsContent value="tickets" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">SLA Resolution Uptime</p>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase">99.8%</h3>
                  </div>
                  <CheckCircle2 size={36} className="text-emerald-500" />
                </Card>
                <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Customer Effort Score (CES)</p>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase">8.8 / 10</h3>
                  </div>
                  <TrendingUp size={36} className="text-primary" />
                </Card>
              </div>

              {conversations?.tickets.map((t, idx) => (
                <Card key={idx} className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
                  <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{t.filename}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                    <Badge className="bg-red-500/10 text-red-500 border-none text-[9px] font-bold">Severity: High</Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-mono whitespace-pre-line bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
                    {t.content}
                  </p>
                </Card>
              ))}
            </TabsContent>

            {/* TAB: Emails */}
            <TabsContent value="emails" className="space-y-6">
              {conversations?.emails.map((e, idx) => (
                <Card key={idx} className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="text-slate-400" size={18} />
                      <span className="font-bold text-slate-800 dark:text-white">{e.filename}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold italic">{new Date(e.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-mono whitespace-pre-line bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
                    {e.content}
                  </p>
                </Card>
              ))}
            </TabsContent>

            {/* TAB: Knowledge Base */}
            <TabsContent value="kb" className="space-y-6">
              <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">ChromaDB Vector Retrieval</h3>
                <div className="flex gap-3 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      placeholder="Query playbooks and contract clauses..." 
                      value={kbQuery}
                      onChange={(e) => setKbQuery(e.target.value)}
                      className="pl-10 h-11 bg-slate-50 dark:bg-slate-950 border-none rounded-xl"
                    />
                  </div>
                  <Button onClick={handleKbSearch} className="rounded-xl font-bold text-xs uppercase px-6">Search KB</Button>
                </div>
              </Card>

              {kbResults.map((res, idx) => (
                <Card key={idx} className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-primary" />
                      <span className="text-sm font-black text-slate-900 dark:text-white">{res.docName}</span>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] font-bold">
                      Confidence: {(res.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <p className="text-xs leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-slate-600 dark:text-slate-350 font-mono italic border border-slate-100 dark:border-slate-800">
                    {res.chunk}
                  </p>
                </Card>
              ))}
            </TabsContent>

            {/* TAB: Upload Documents */}
            <TabsContent value="upload-docs" className="space-y-6">
              <UploadPanel customerId={customerId} onUploaded={fetchData} />
            </TabsContent>

            {/* TAB: AI Analysis (LangSmith clone) */}
            <TabsContent value="analysis" className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase">LangGraph Execution Dag</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Real-time status ticks stream via WebSockets</p>
                </div>
                {isRunning && (
                  <Badge className="bg-blue-500 text-white font-bold text-[10px] px-2 py-0.5 animate-pulse uppercase">Execution In Progress</Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* 12 node list */}
                <div className="md:col-span-1 space-y-3">
                  {[
                    "planner", "transcript", "crm", "support", "knowledge", "usage",
                    "risk", "rules", "recommendation", "explainability", "review", "memory"
                  ].map((nodeId, idx) => {
                    const lData = agentLogs[nodeId];
                    const active = runningAgent === nodeId;
                    const done = lData && lData.status === "completed";
                    
                    const nodeNames: Record<string, string> = {
                      planner: "Planner Agent",
                      transcript: "Transcript Analysis",
                      crm: "CRM Context",
                      support: "Support Analysis",
                      knowledge: "Knowledge Retrieval",
                      usage: "Usage Analytics",
                      risk: "Risk Analysis",
                      rules: "Business Rule Engine",
                      recommendation: "Recommendation",
                      explainability: "Explainability",
                      review: "Human Review",
                      memory: "Memory Manager"
                    };

                    return (
                      <div 
                        key={nodeId}
                        onClick={() => {
                          if (lData) {
                            // Focus node details if available
                          }
                        }}
                        className={cn(
                          "flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 rounded-xl border transition-all cursor-pointer",
                          active ? "border-primary bg-primary/5 ring-2 ring-primary/20" : done ? "border-emerald-500/30 bg-emerald-500/[0.02]" : "border-slate-100 dark:border-slate-800 opacity-60"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 font-mono w-4">#{idx+1}</span>
                          <span className="text-xs font-black dark:text-white uppercase tracking-tight">
                            {nodeNames[nodeId] || nodeId}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {active ? (
                            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                          ) : done ? (
                            <CheckCircle2 size={14} className="text-emerald-500" />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                          )}
                          <span className="text-[10px] font-bold text-slate-400">
                            {lData ? `${lData.time}s` : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Agent details panel / logs */}
                <div className="md:col-span-2 space-y-6">
                  {Object.entries(agentLogs).length === 0 ? (
                    <Card className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col justify-center items-center min-h-[300px]">
                      <Cpu size={32} className="text-slate-400 mb-2" />
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No active execution logs loaded.</p>
                      <Button onClick={triggerAnalysis} className="mt-4 rounded-xl px-6 font-bold text-xs uppercase">Trigger Dry Run</Button>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Active Execution Trace</h3>
                      <AnimatePresence>
                        {Object.entries(agentLogs).map(([nodeId, lData]) => {
                          const nodeNames: Record<string, string> = {
                            planner: "Planner Agent",
                            transcript: "Transcript Analysis",
                            crm: "CRM Context",
                            support: "Support Analysis",
                            knowledge: "Knowledge Retrieval",
                            usage: "Usage Analytics",
                            risk: "Risk Analysis",
                            rules: "Business Rule Engine",
                            recommendation: "Recommendation",
                            explainability: "Explainability",
                            review: "Human Review",
                            memory: "Memory Manager"
                          };
                          return (
                            <motion.div 
                              key={nodeId}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 space-y-4"
                            >
                              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                  {(nodeNames[nodeId] || nodeId).toUpperCase()} TRACE
                                </span>
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-bold text-[9px] uppercase px-2 py-0.5">Success ({lData.time}s)</Badge>
                              </div>
                              
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold block mb-1">Execution Outputs</span>
                                <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl font-mono">
                                  {lData.output}
                                </p>
                              </div>

                              {lData.tool_calls && lData.tool_calls.length > 0 && (
                                <div className="pt-2">
                                  <span className="text-[10px] text-slate-400 font-bold block mb-2 flex items-center gap-1">
                                    <MessageSquare size={12} className="text-primary" />
                                    <span>Connector Tool Calls</span>
                                  </span>
                                  <div className="space-y-2">
                                    {lData.tool_calls.map((tc: any, tcIdx: number) => (
                                      <div key={tcIdx} className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-xl p-3 text-[11px] font-mono space-y-1">
                                        <div className="flex justify-between items-center">
                                          <span className="text-primary font-black uppercase text-[10px]">{tc.name}</span>
                                          <span className="text-slate-400 font-bold">{tc.latency}</span>
                                        </div>
                                        <div className="text-slate-500 dark:text-slate-400">Request: {tc.request}</div>
                                        <div className="text-slate-800 dark:text-slate-200">Response: {tc.response}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div>
                                <span className="text-[10px] text-slate-400 font-bold block mb-1">Standard Output Logs</span>
                                <pre className="text-[10px] leading-relaxed text-slate-400 dark:text-slate-500 whitespace-pre-wrap font-mono max-h-24 overflow-y-auto bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl">
                                  {lData.logs}
                                </pre>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                  
                  {/* Show generated recommendation at the end of execution */}
                  {(agentLogs.recommendation || agentLogs.memory) && (
                    <Card className="p-6 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-3xl mt-6 space-y-4 animate-in fade-in duration-300">
                      <div className="flex justify-between items-center pb-2 border-b border-primary/20">
                        <div className="flex items-center gap-2">
                          <Sparkles className="text-primary animate-pulse" size={18} />
                          <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Final Recommendation Result</span>
                        </div>
                        <Badge className="bg-red-500/10 text-red-500 border-none font-bold text-[9px] uppercase px-2.5 py-0.5">High Priority</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Competitor Deflection Strategy & SLA Credits</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                          Offer a 10% SLA compensation credit on the next billing cycle due to verified auto-refresh call lag, and schedule an executive alignment call to introduce the new roadmap features, deflecting competitor LinearCorp outreach.
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-primary/20 text-xs font-semibold">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-400 font-black uppercase">Confidence Rating</span>
                          <span className="text-sm font-black text-primary">94%</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="destructive" className="rounded-xl font-bold uppercase text-[9px] h-8 px-4" onClick={() => alert("Recommendation rejected")}>Reject Action</Button>
                          <Button className="rounded-xl font-bold uppercase text-[9px] h-8 px-5 shadow-md shadow-primary/20" onClick={() => alert("Recommendation approved & saved to memory")}>Approve & Save</Button>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>            {/* TAB: Memory */}
            <TabsContent value="memory" className="space-y-6">
              <Tabs defaultValue="session-mem" className="w-full">
                <TabsList className="bg-slate-100 dark:bg-slate-950 p-1 rounded-xl mb-4 flex gap-1 border border-slate-100 dark:border-slate-800">
                  <TabsTrigger value="session-mem" className="rounded-lg text-[9px] font-black uppercase flex-1 text-center py-1.5">Session Memory</TabsTrigger>
                  <TabsTrigger value="customer-mem" className="rounded-lg text-[9px] font-black uppercase flex-1 text-center py-1.5">Customer Memory</TabsTrigger>
                  <TabsTrigger value="org-mem" className="rounded-lg text-[9px] font-black uppercase flex-1 text-center py-1.5">Organization Memory</TabsTrigger>
                </TabsList>

                <TabsContent value="session-mem" className="space-y-4 animate-in fade-in duration-200">
                  <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-3">
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Active Session Variables</h4>
                    {memory?.session_memory.map((sm, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs font-mono p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block font-bold">{sm.key}</span>
                        <span className="text-slate-800 dark:text-slate-200 font-black">{sm.value}</span>
                      </div>
                    ))}
                  </Card>
                </TabsContent>

                <TabsContent value="customer-mem" className="space-y-4 animate-in fade-in duration-200">
                  <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-3">
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Discovered Customer Actions & Outcomes</h4>
                    {memory?.customer_memory.map((cm, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 font-mono">
                        <span className="text-slate-850 dark:text-slate-200 font-bold block">{cm.event}</span>
                        <Badge className="bg-emerald-500/10 text-emerald-500 font-bold text-[9px] uppercase border-none px-2 py-0">Conf: {(cm.confidence*100).toFixed(0)}%</Badge>
                      </div>
                    ))}
                  </Card>
                </TabsContent>

                <TabsContent value="org-mem" className="space-y-4 animate-in fade-in duration-200">
                  <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-3">
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Global Organization Governance & Playbook Associations</h4>
                    <div className="space-y-3 text-xs font-semibold">
                      <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="text-[10px] text-slate-400 font-black uppercase">ASSOCIATED PLAYBOOK</div>
                        <div className="font-bold dark:text-white">Playbook_SLA_Compensation_v1</div>
                        <div className="text-slate-500 leading-relaxed">Triggered automatic credits calculation in cases of database lag and SLA breach.</div>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="text-[10px] text-slate-400 font-black uppercase">RETENTION RULE</div>
                        <div className="font-bold dark:text-white">Enterprise Churn Intervention Threshold</div>
                        <div className="text-slate-500 leading-relaxed">Ensures any account with contract value ARR &gt; $2.5M triggers Executive review automatically.</div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* TAB: Timeline */}
            <TabsContent value="timeline" className="space-y-6">
              <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Chronological Lifecycle Logger</h3>
                <div className="relative pl-6 border-l border-slate-100 dark:border-slate-800 space-y-8">
                  <div className="relative">
                    <div className="absolute -left-[30px] top-1 h-3 w-3 rounded-full bg-primary border-4 border-white dark:border-slate-900" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800 dark:text-white uppercase">1. Meeting Happened</span>
                      <span className="text-[10px] text-slate-400 font-bold">Today</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Interactive zoom meeting transcript uploaded and stored.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[30px] top-1 h-3 w-3 rounded-full bg-violet-500 border-4 border-white dark:border-slate-900" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800 dark:text-white uppercase">2. Latest Document Ingested & Embedded</span>
                      <span className="text-[10px] text-slate-400 font-bold">Today</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Document processed by Ingestion Engine and indexed in ChromaDB vector space.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[30px] top-1 h-3 w-3 rounded-full bg-blue-500 border-4 border-white dark:border-slate-900" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800 dark:text-white uppercase">3. AI Analysis Triggered</span>
                      <span className="text-[10px] text-slate-400 font-bold">Today</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Multi-agent LangGraph orchestrator executed Planner, CRM, Support, and Risk nodes.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[30px] top-1 h-3 w-3 rounded-full bg-amber-500 border-4 border-white dark:border-slate-900" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800 dark:text-white uppercase">4. Recommendation Generated</span>
                      <span className="text-[10px] text-slate-400 font-bold">Today</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Next Best Action generated: Churn intervention playbooks compiled at 94% confidence.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[30px] top-1 h-3 w-3 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800 dark:text-white uppercase">5. Strategic Approval Logged</span>
                      <span className="text-[10px] text-slate-400 font-bold">Today</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Human-in-the-loop portal received and approved the counter-strategy action plan.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[30px] top-1 h-3 w-3 rounded-full bg-teal-500 border-4 border-white dark:border-slate-900" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800 dark:text-white uppercase">6. Memory Updated</span>
                      <span className="text-[10px] text-slate-400 font-bold">Today</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Outcome feedback synchronized back to learning models and saved inside Session & Customer memory partitions.</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* 3. Right Sidebar Details Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Account Portfolio</h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Contract ARR</span>
                <span className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-tight">{customer.revenue}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Contract Renewal</span>
                <span className="text-sm font-bold text-slate-850 dark:text-white">{customer.contract_renewal}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Tier Category</span>
                <Badge variant="secondary" className="bg-slate-50 text-slate-600 border-slate-150 font-bold text-[9px] uppercase px-2 py-0">{customer.tier}</Badge>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Products in Use</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {JSON.parse(customer.metadata_json || "{}").products_in_use?.map((p: string, idx: number) => (
                    <Badge key={idx} className="bg-primary/5 text-primary text-[9px] font-bold border-none px-2 py-0">{p}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent">
            <Cpu className="text-primary mb-3" size={24} />
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">AI Orchestrator Status</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Multi-agent workflow is configured for live context fusion across CRM telemetry.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${isRunning ? "bg-primary animate-ping" : "bg-emerald-500"}`} />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRunning ? "Analyzing..." : "Synced"}</span>
            </div>
          </Card>

          <UploadPanel customerId={customerId} onUploaded={fetchData} />
        </div>
      </div>

      {/* 4. Human Review Modal */}
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
                  value={reviewAction}
                  onChange={(e) => setReviewAction(e.target.value)}
                  className="w-full text-xs font-semibold p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 dark:text-white min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1.5">Outcome Notes & Comments</label>
                <textarea 
                  placeholder="e.g. Approved seats contract draft. Client will sign tomorrow."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full text-xs font-semibold p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 dark:text-white min-h-[60px]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setReviewRec(null)} className="rounded-xl font-bold text-xs uppercase px-5">Cancel</Button>
              <div className="flex gap-2">
                <Button onClick={() => handleReviewAction("rejected")} variant="destructive" className="rounded-xl font-bold text-xs uppercase px-5">Reject</Button>
                <Button onClick={() => handleReviewAction("approved")} className="rounded-xl font-bold text-xs uppercase px-5 shadow-xl shadow-primary/20">Approve & Save</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
