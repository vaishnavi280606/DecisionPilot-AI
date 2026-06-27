import { useState, useEffect } from "react";
import { 
  Activity, CheckCircle2, XCircle, Clock, Cpu, 
  MessageSquare, Play, Sparkles
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCustomers, analyzeCustomer } from "../../lib/api";
import { Customer } from "../../lib/types";

interface NodeDetail {
  logs: string;
  input: string;
  output: string;
  toolCalls: { name: string; latency: string; request: string; response: string }[];
  time: string;
}

const nodeDataMapFallback: Record<string, NodeDetail> = {
  planner: {
    logs: "Planner Agent: Initializing LangGraph state graph. Mapping dependencies.\nRouting execution steps based on customer ARR criteria.",
    input: "System Prompt: You are a Customer Success Planner. Analyze account signals to map execution tasks.\nUser Input: Generate a churn analysis plan for Nexus Corp.",
    output: "Plan: 1. Parse raw call transcripts for frustration. 2. Verify contract value in CRM. 3. Check open support SLA breaches. 4. Query vector index for playbooks. 5. Output strategic recommendation.",
    toolCalls: [],
    time: "0.12s"
  },
  transcript: {
    logs: "Transcript Agent: Scanning dialogue vectors.\nAnalyzed Q2 CS Milestone Review Meeting.txt.\nCompetitor LinearCorp found on line 18.",
    input: "System Prompt: Analyze meeting call logs. Extract core complaints and competitor mentions.\nSource File: call_log_27_june.txt",
    output: "Analysis: Customer expressed severe frustration about call refresh latencies. Active competitor evaluation (LinearCorp) detected.",
    toolCalls: [
      { name: "SQLite Read Document", latency: "8ms", request: "SELECT content FROM documents WHERE type='transcript'", response: "Client mentions evaluating competitor..." }
    ],
    time: "0.41s"
  },
  crm: {
    logs: "CRM Context: Connecting to Salesforce API.\nFetched metadata. Handshake success.\nContract ARR loaded.",
    input: "System Prompt: Query Salesforce CRM parameters. Identify account ARR tier, renewal window, and manager assignment.",
    output: "Account Info: Strategic Enterprise tier. ARR: $2.8M. Contract Renewal: Q2 2026. Account Manager: Sarah Jenkins.",
    toolCalls: [
      { name: "Salesforce CRM API Sync", latency: "124ms", request: "GET /services/data/v54.0/sobjects/Account/SF-9042", response: "{Name: Nexus Corp, AnnualRevenue: 2800000}" }
    ],
    time: "0.32s"
  },
  knowledge: {
    logs: "Knowledge Retrieval: Querying ChromaDB collection.\nMatching playbooks retrieved.\nMetadata weights processed.",
    input: "System Prompt: Retrieve matching playbooks in vector index using similarity search. Search Query: auto-refresh latency SLA compensation credits.",
    output: "Retrieved Playbook: Playbook_SLA_Compensation_v1 (Matched SLA credit guidelines for system lag incidents).",
    toolCalls: [
      { name: "ChromaDB Retrieval Search", latency: "16ms", request: "query_collection(name='playbooks', text='escalation credits')", response: "Matched chunk ID 8042: Playbook_SLA_Compensation_v1" }
    ],
    time: "0.24s"
  },
  risk: {
    logs: "Risk Agent: Running churn risk regressions.\nCustomer health index falling below critical threshold.\nAlert trigger committed.",
    input: "System Prompt: Compute churn risk weights based on: Call signals (0.8), Support ticket volume (2), Uptime (94%).",
    output: "Risk Assessment: Churn probability: 74% (High Risk). Account Health: 46/100 (Unsatisfactory).",
    toolCalls: [
      { name: "Risk Model Regression Execution", latency: "3ms", request: "predict_churn(features=[0.4, 2, 0.94])", response: "{churn_probability: 0.74}" }
    ],
    time: "0.15s"
  },
  recommendation: {
    logs: "Recommendation Agent: Synthesizing next best actions.\nPlaybook SLA credit injected.\nReview flag submitted to database queue.",
    input: "System Prompt: Generate next best action steps combining churn risk (74%) and SLA guidelines. Target Client: Nexus Corp.",
    output: "Recommendation Title: Competitor Deflection Strategy & SLA Credits\nDetails: Schedule urgent executive call, offer 10% SLA credits package, and start a feature-matching comparison trial.",
    toolCalls: [
      { name: "Save Draft Recommendation", latency: "11ms", request: "INSERT INTO recommendations (title, details, status) VALUES (...)", response: "Row written successfully" }
    ],
    time: "0.33s"
  }
};

const nodeNames: Record<string, string> = {
  planner: "Planner",
  transcript: "Transcript Analysis",
  crm: "CRM Context",
  knowledge: "Knowledge Retrieval",
  risk: "Risk Analysis",
  recommendation: "Recommendation"
};

export function WorkflowMonitorView() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("nexus-corp");
  
  // Real-time states
  const [isRunning, setIsRunning] = useState(false);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [agentLogs, setAgentLogs] = useState<Record<string, { status: string; logs: string; output: string; time: number; tool_calls: any[] }>>({});
  
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<"running" | "queued" | "completed" | "failed">("completed");
  const [selectedNode, setSelectedNode] = useState<string>("planner");
  const [selectedRunId, setSelectedRunId] = useState("run_1042");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const custs = await getCustomers();
        setCustomers(custs);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCustomers();
  }, []);

  // WebSockets integration for real-time trace updates
  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname || "localhost"}:8000/api/ws`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "agent_update") {
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
          
          if (nodeNames[data.agent]) {
            setSelectedNode(data.agent);
          }

          if (data.agent === "memory" && data.status === "completed") {
            setIsRunning(false);
            setRunningAgent(null);
            setActiveWorkflowTab("completed");
            setSelectedRunId("run_1043");
          }
        }
      } catch (err) {
        console.error("Workflow Monitor WS error:", err);
      }
    };
    return () => ws.close();
  }, []);

  const triggerAnalysis = async () => {
    setAgentLogs({});
    setIsRunning(true);
    setActiveWorkflowTab("running");
    setSelectedRunId("run_1043");
    try {
      await analyzeCustomer(selectedCustomerId);
    } catch (err) {
      console.error(err);
      setIsRunning(false);
    }
  };

  const getWorkflowsForTab = () => {
    switch (activeWorkflowTab) {
      case "running":
        return [
          { id: "run_1043", customer: selectedCustomerId.toUpperCase().replace("-", " "), time: "Analyzing...", status: "running", date: "Just now" }
        ];
      case "queued":
        return [
          { id: "run_1044", customer: "Vertex Systems", time: "Queued", status: "queued", date: "Scheduled" }
        ];
      case "completed":
        return [
          { id: "run_1042", customer: "Nexus Corp", time: "1.2s", status: "completed", date: "5 mins ago" },
          { id: "run_1041", customer: "Acme Logistics", time: "1.6s", status: "completed", date: "1 hour ago" },
          { id: "run_1040", customer: "Globex Analytics", time: "1.1s", status: "completed", date: "4 hours ago" }
        ];
      case "failed":
        return [
          { id: "run_1038", customer: "Heliux Energy", time: "0.4s", status: "failed", date: "2 days ago" }
        ];
    }
  };

  // Get details of selected node
  const liveLog = agentLogs[selectedNode];
  const selectedNodeDetails: NodeDetail = liveLog ? {
    logs: liveLog.logs,
    input: `System Prompt Instructions for ${nodeNames[selectedNode] || selectedNode} Node Execution.`,
    output: liveLog.output,
    toolCalls: (liveLog.tool_calls || []).map(tc => ({
      name: tc.name,
      latency: tc.latency,
      request: tc.request,
      response: tc.response
    })),
    time: `${liveLog.time}s`
  } : nodeDataMapFallback[selectedNode] || nodeDataMapFallback.planner;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black font-heading tracking-tight text-slate-800 dark:text-white uppercase">AI Analysis Dashboard</h1>
          <p className="text-slate-500 text-xs font-semibold mt-1">Platform-wide LangGraph orchestration monitor, active execution paths, and agent telemetry.</p>
        </div>
        
        <div className="flex gap-2 items-center">
          <select 
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-350"
          >
            {customers.map(c => (
              <option key={c.customer_id} value={c.customer_id}>{c.name}</option>
            ))}
          </select>
          <Button 
            onClick={triggerAnalysis} 
            disabled={isRunning}
            className="rounded-xl font-bold text-xs uppercase px-5 shadow-xl shadow-primary/20 flex items-center gap-2"
          >
            <Play size={12} fill="white" className={isRunning ? "animate-spin" : ""} />
            <span>{isRunning ? "Running Agent..." : "Trigger Analysis"}</span>
          </Button>
        </div>
      </div>

      {/* 2. Filter tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800">
        {(["running", "queued", "completed", "failed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveWorkflowTab(tab);
              const first = tab === "running" ? "run_1043" : tab === "queued" ? "run_1044" : tab === "completed" ? "run_1042" : "run_1038";
              setSelectedRunId(first);
            }}
            className={`pb-4 px-6 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeWorkflowTab === tab ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-500"}`}
          >
            {tab} Workflows
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Workflows Queue */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Workflows List</h3>
          <div className="space-y-3">
            {getWorkflowsForTab().map((run) => (
              <Card 
                key={run.id}
                onClick={() => setSelectedRunId(run.id)}
                className={`p-4 bg-white dark:bg-slate-900 border rounded-2xl flex items-center justify-between cursor-pointer transition-all ${selectedRunId === run.id ? "border-primary shadow-md shadow-primary/5" : "border-slate-100 dark:border-slate-850 opacity-80"}`}
              >
                <div className="flex items-center gap-3">
                  {run.status === "running" && <Activity className="text-primary animate-pulse" size={16} />}
                  {run.status === "completed" && <CheckCircle2 className="text-emerald-500" size={16} />}
                  {run.status === "queued" && <Clock className="text-slate-400" size={16} />}
                  {run.status === "failed" && <XCircle className="text-red-500" size={16} />}
                  <div>
                    <span className="text-xs font-black text-slate-800 dark:text-white uppercase block">{run.id.replace("_", " ")}</span>
                    <span className="text-[10px] text-slate-400 font-bold block truncate max-w-[12ch]">Client: {run.customer}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[9px] font-bold py-0">{run.time}</Badge>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: DAG & Node Details */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">LangGraph Node Execution DAG</h3>
            
            {/* Visual Horizontal Node flow */}
            <div className="flex flex-wrap items-center gap-2 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6 overflow-x-auto">
              {["planner", "transcript", "crm", "knowledge", "risk", "recommendation"].map((nodeId, idx) => {
                const active = selectedNode === nodeId;
                const isNodeRunning = runningAgent === nodeId;
                const done = activeWorkflowTab === "completed" || (agentLogs[nodeId]?.status === "completed");
                return (
                  <div key={nodeId} className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedNode(nodeId)}
                      className={`px-4 py-3 rounded-xl border text-xs font-black uppercase transition-all flex items-center gap-2 ${active ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-105" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-805 text-slate-655 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${isNodeRunning ? "bg-primary animate-ping" : done ? "bg-emerald-500" : "bg-slate-400"}`} />
                      <span>{nodeNames[nodeId]}</span>
                    </button>
                    {idx < 5 && <span className="text-slate-400 font-black">→</span>}
                  </div>
                );
              })}
            </div>

            {/* Clicked Agent console trace logs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prompt Input & Output */}
              <div className="space-y-4">
                <div className="p-5 bg-slate-950 text-slate-200 border border-slate-800 rounded-2xl font-mono text-xs space-y-3 min-h-[160px]">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                    <span className="text-primary font-black uppercase tracking-wider">{nodeNames[selectedNode]} Console Details</span>
                    <span className="text-emerald-500 text-[10px] font-bold">ACTIVE</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-sans font-black mb-1">System Prompt / Instructions</span>
                    <p className="text-slate-300 leading-relaxed font-sans font-medium whitespace-pre-wrap">{selectedNodeDetails.input}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-900">
                    <span className="text-slate-500 block text-[9px] uppercase font-sans font-black mb-1">Reasoning Output</span>
                    <p className="text-white leading-relaxed font-sans font-bold whitespace-pre-wrap">{selectedNodeDetails.output}</p>
                  </div>
                </div>

                <div className="p-5 bg-slate-950 text-slate-300 border border-slate-800 rounded-2xl font-mono text-xs space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900 text-slate-400">
                    <span className="text-[10px] font-black uppercase">Standard Output Logs</span>
                    <span className="text-[10px] font-bold">{selectedNodeDetails.time}</span>
                  </div>
                  <pre className="whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto pr-2 scrollbar-hide text-slate-400 font-mono">{selectedNodeDetails.logs}</pre>
                </div>
              </div>

              {/* Tool Calls */}
              <div className="space-y-4">
                <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-slate-400">
                    <MessageSquare size={16} className="text-primary" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Active Tool Calls</h4>
                  </div>
                  
                  {selectedNodeDetails.toolCalls.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      No tool connector calls for this node.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedNodeDetails.toolCalls.map((tc, tcIdx) => (
                        <div key={tcIdx} className="bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-800 rounded-xl p-3 text-[11px] font-mono space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-primary font-black uppercase text-[10px]">{tc.name}</span>
                            <span className="text-slate-400 font-bold">{tc.latency}</span>
                          </div>
                          <div className="text-slate-550 dark:text-slate-400">Request: {tc.request}</div>
                          <div className="text-slate-800 dark:text-slate-200">Response: {tc.response}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* At the end of AI Analysis, show recommendations */}
            {(activeWorkflowTab === "completed" || activeWorkflowTab === "running") && (
              <Card className="p-6 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-3xl mt-6 space-y-4 animate-in fade-in duration-300">
                <div className="flex justify-between items-center pb-2 border-b border-primary/20">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-primary animate-pulse" size={18} />
                    <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Final Strategic Recommendations Output</span>
                  </div>
                  <Badge className="bg-red-500/10 text-red-500 border-none font-bold text-[9px] uppercase px-2.5 py-0.5">High Priority</Badge>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Offer SLA Billing Compensation & Competitor Deflection Trial</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                    Offer a 10% SLA credit on the next contract billing cycle due to auto-refresh latency complaints, and initiate a trial of integrated roadmap features to mitigate evaluated churn risks from HubSpotAI.
                  </p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-primary/20 text-xs font-semibold">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-black uppercase">Decision Accuracy Confidence</span>
                    <span className="text-sm font-black text-primary">94%</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="destructive" className="rounded-xl font-bold uppercase text-[9px] h-8 px-4" onClick={() => alert("Recommendation rejected")}>Reject Action</Button>
                    <Button className="rounded-xl font-bold uppercase text-[9px] h-8 px-5 shadow-md shadow-primary/20" onClick={() => alert("Recommendation approved & saved to memory silos")}>Approve & Write to Memory</Button>
                  </div>
                </div>
              </Card>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
