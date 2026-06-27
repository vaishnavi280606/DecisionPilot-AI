import { useState, useEffect } from "react";
import { 
  Network, Cpu, Database, ShieldCheck, Play, ArrowRight,
  Info, Sparkles, Layers, Activity
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ArchitectureView() {
  const [selectedComp, setSelectedComp] = useState("orchestrator");
  const [runningAgent, setRunningAgent] = useState<string | null>(null);

  // WebSocket live highlighting
  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname || "localhost"}:8000/api/ws`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "agent_update") {
          if (data.status === "running") {
            setRunningAgent(data.agent);
          } else if (data.agent === "memory" && data.status === "completed") {
            setRunningAgent(null);
          }
        }
      } catch (err) {
        console.error("Architecture WS error:", err);
      }
    };
    return () => ws.close();
  }, []);

  // Component details dictionary
  const componentDetails: Record<string, { title: string; desc: string; inputs: string[]; outputs: string[]; apis: string[]; deps: string[] }> = {
    ingestion: {
      title: "1. Data Ingestion Layer",
      desc: "Parses, cleans, and chunks multi-structured enterprise files (transcripts, emails, support logs, CRM values). Generates 1536-dimensional semantic vector embeddings using Google GenAI models.",
      inputs: ["Zoom Transcripts (.txt)", "CRM raw files (.csv)", "Jira Support JSON pings", "Knowledge articles (.pdf)"],
      outputs: ["Token chunks", "Vector Embeddings"],
      apis: ["POST /api/upload"],
      deps: ["Vector Database"]
    },
    orchestrator: {
      title: "2. Agent Orchestrator Layer (LangGraph)",
      desc: "Orchestrated by a specialized Planner Agent. It creates a dynamic Directed Acyclic Graph (DAG) coordinating 12 specialized sub-agents to synthesize customer state contexts.",
      inputs: ["Context logs", "ChromaDB vector articles"],
      outputs: ["Agent decision contexts", "Attribution weights", "Generated recommendations"],
      apis: ["POST /api/analyze/{id}"],
      deps: ["Planner", "Transcript", "CRM", "Support", "Knowledge", "Usage", "Risk", "Rules", "Recommendation", "Explainability", "Review", "Memory"]
    },
    memory: {
      title: "3. Multi-Tier Memory Manager",
      desc: "Manages three distinct retention scopes. Short-term Session memory, mid-term Customer interaction profiles, and long-term Organizational playbook playbooks.",
      inputs: ["Agent outputs", "Approved recommendations", "Outcome notes"],
      outputs: ["Session tokens", "Customer memories", "Corporate playbooks"],
      apis: ["GET /api/customer/{id}/memory"],
      deps: ["Database", "Vector Database"]
    },
    tools: {
      title: "4. Tool Connector Layer (Connections)",
      desc: "Exposes active pipelines to corporate services. Connects to Salesforce CRM, ChromaDB vector store, O365 email sync, Mixpanel telemetry, and Slack gateways.",
      inputs: ["Agent query payloads"],
      outputs: ["Tool transaction logs", "API response contexts"],
      apis: ["GET /api/connections", "POST /api/connections/{name}/test"],
      deps: ["External services"]
    },
    review: {
      title: "5. Human-in-the-Loop Review Gate (HITL)",
      desc: "Provides compliance control over AI strategic suggestions. Allows customer success leads to approve, modify, edit, or reject recommendations before execution.",
      inputs: ["Generated recommendations", "Explainability Attributions"],
      outputs: ["Approved strategies", "Rejected records"],
      apis: ["POST /api/recommendations/{id}/action"],
      deps: ["Memory Manager"]
    },
    learning: {
      title: "6. Continuous Learning Center",
      desc: "A reinforcement learning feedback mechanism. Analyses finalized approved decisions and outcomes, modifying vector weights and refining rule criteria for future analysis.",
      inputs: ["Approved decisions", "Outcome logs"],
      outputs: ["Refined prompt weights", "Playbook discoveries"],
      apis: ["GET /api/learning"],
      deps: ["Memory Manager", "Ingestion Layer"]
    }
  };

  const current = componentDetails[selectedComp] || componentDetails["orchestrator"];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black font-heading tracking-tight text-slate-800 dark:text-white uppercase">System Architecture Blueprint</h1>
          <p className="text-slate-500 text-xs font-semibold mt-1">Interactive schematic blueprint of DecisionPilot AI. Click components to inspect APIs and flows.</p>
        </div>
        {runningAgent && (
          <Badge className="bg-primary text-white border-none font-bold text-[10px] uppercase px-2.5 py-0.5 animate-pulse">
            Active Running Node: {runningAgent.toUpperCase()}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Clickable SVG Diagram */}
        <Card className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-805 rounded-3xl flex justify-center items-center overflow-x-auto">
          <svg className="w-full min-w-[500px]" viewBox="0 0 600 420" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800/40" />
              </pattern>
            </defs>
            <rect width="600" height="420" fill="url(#grid)" rx="24" />

            {/* Links / Paths */}
            <path d="M120 110 H170" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" className="dark:stroke-slate-700" />
            <path d="M280 110 H330" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" className="dark:stroke-slate-700" />
            <path d="M440 110 H490" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" className="dark:stroke-slate-700" />
            <path d="M225 150 V210" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" className="dark:stroke-slate-700" />
            <path d="M385 150 V210" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" className="dark:stroke-slate-700" />
            <path d="M385 290 V330" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" className="dark:stroke-slate-700" />
            
            <g 
              onClick={() => setSelectedComp("ingestion")} 
              className={`cursor-pointer transition-all hover:scale-[1.01] ${selectedComp === "ingestion" ? "filter drop-shadow-md" : ""}`}
            >
              <rect x="20" y="60" width="100" height="100" rx="16" fill={selectedComp === "ingestion" ? "#3b82f6" : "#f8fafc"} stroke={selectedComp === "ingestion" ? "#2563eb" : "#e2e8f0"} strokeWidth="2" className="dark:fill-slate-800 dark:stroke-slate-700" />
              <text x="70" y="105" textAnchor="middle" fill={selectedComp === "ingestion" ? "#fff" : "#475569"} className="dark:fill-slate-300" fontSize="10" fontWeight="bold">DATA INGESTION</text>
              <text x="70" y="120" textAnchor="middle" fill={selectedComp === "ingestion" ? "#93c5fd" : "#94a3b8"} fontSize="8" fontWeight="bold">EMBEDDING LAYER</text>
            </g>

            {/* 2. Orchestrator */}
            <g 
              onClick={() => setSelectedComp("orchestrator")} 
              className={`cursor-pointer transition-all hover:scale-[1.01] ${selectedComp === "orchestrator" ? "filter drop-shadow-md" : ""}`}
            >
              <rect x="170" y="60" width="110" height="100" rx="16" fill={selectedComp === "orchestrator" ? "#3b82f6" : runningAgent ? "#eff6ff" : "#f8fafc"} stroke={selectedComp === "orchestrator" ? "#2563eb" : runningAgent ? "#3b82f6" : "#e2e8f0"} strokeWidth="2" className="dark:fill-slate-800 dark:stroke-slate-700" />
              <text x="225" y="105" textAnchor="middle" fill={selectedComp === "orchestrator" ? "#fff" : "#475569"} className="dark:fill-slate-300" fontSize="10" fontWeight="bold">ORCHESTRATOR</text>
              <text x="225" y="120" textAnchor="middle" fill={selectedComp === "orchestrator" ? "#93c5fd" : "#94a3b8"} fontSize="8" fontWeight="bold">LANGGRAPH DAG</text>
              {runningAgent && (
                <circle cx="260" cy="80" r="5" fill="#3b82f6" className="animate-ping" />
              )}
            </g>

            {/* 3. Memory */}
            <g 
              onClick={() => setSelectedComp("memory")} 
              className={`cursor-pointer transition-all hover:scale-[1.01] ${selectedComp === "memory" ? "filter drop-shadow-md" : ""}`}
            >
              <rect x="330" y="60" width="110" height="100" rx="16" fill={selectedComp === "memory" ? "#3b82f6" : "#f8fafc"} stroke={selectedComp === "memory" ? "#2563eb" : "#e2e8f0"} strokeWidth="2" className="dark:fill-slate-800 dark:stroke-slate-700" />
              <text x="385" y="105" textAnchor="middle" fill={selectedComp === "memory" ? "#fff" : "#475569"} className="dark:fill-slate-300" fontSize="10" fontWeight="bold">MEMORY HUB</text>
              <text x="385" y="120" textAnchor="middle" fill={selectedComp === "memory" ? "#93c5fd" : "#94a3b8"} fontSize="8" fontWeight="bold">3-TIER SILOS</text>
            </g>

            {/* 4. Tools */}
            <g 
              onClick={() => setSelectedComp("tools")} 
              className={`cursor-pointer transition-all hover:scale-[1.01] ${selectedComp === "tools" ? "filter drop-shadow-md" : ""}`}
            >
              <rect x="490" y="60" width="90" height="100" rx="16" fill={selectedComp === "tools" ? "#3b82f6" : "#f8fafc"} stroke={selectedComp === "tools" ? "#2563eb" : "#e2e8f0"} strokeWidth="2" className="dark:fill-slate-800 dark:stroke-slate-700" />
              <text x="535" y="105" textAnchor="middle" fill={selectedComp === "tools" ? "#fff" : "#475569"} className="dark:fill-slate-300" fontSize="10" fontWeight="bold">TOOL LAYER</text>
              <text x="535" y="120" textAnchor="middle" fill={selectedComp === "tools" ? "#93c5fd" : "#94a3b8"} fontSize="8" fontWeight="bold">CONNECTORS</text>
            </g>

            {/* 5. Review */}
            <g 
              onClick={() => setSelectedComp("review")} 
              className={`cursor-pointer transition-all hover:scale-[1.01] ${selectedComp === "review" ? "filter drop-shadow-md" : ""}`}
            >
              <rect x="330" y="210" width="110" height="80" rx="16" fill={selectedComp === "review" ? "#3b82f6" : "#f8fafc"} stroke={selectedComp === "review" ? "#2563eb" : "#e2e8f0"} strokeWidth="2" className="dark:fill-slate-800 dark:stroke-slate-700" />
              <text x="385" y="245" textAnchor="middle" fill={selectedComp === "review" ? "#fff" : "#475569"} className="dark:fill-slate-300" fontSize="10" fontWeight="bold">HUMAN REVIEW</text>
              <text x="385" y="260" textAnchor="middle" fill={selectedComp === "review" ? "#93c5fd" : "#94a3b8"} fontSize="8" fontWeight="bold">HITL PROTOCOL</text>
            </g>

            {/* 6. Learning */}
            <g 
              onClick={() => setSelectedComp("learning")} 
              className={`cursor-pointer transition-all hover:scale-[1.01] ${selectedComp === "learning" ? "filter drop-shadow-md" : ""}`}
            >
              <rect x="330" y="330" width="110" height="70" rx="16" fill={selectedComp === "learning" ? "#3b82f6" : "#f8fafc"} stroke={selectedComp === "learning" ? "#2563eb" : "#e2e8f0"} strokeWidth="2" className="dark:fill-slate-800 dark:stroke-slate-700" />
              <text x="385" y="360" textAnchor="middle" fill={selectedComp === "learning" ? "#fff" : "#475569"} className="dark:fill-slate-300" fontSize="10" fontWeight="bold">LEARNING HUB</text>
              <text x="385" y="375" textAnchor="middle" fill={selectedComp === "learning" ? "#93c5fd" : "#94a3b8"} fontSize="8" fontWeight="bold">FEEDBACK LOOPS</text>
            </g>
          </svg>
        </Card>

        {/* Component Inspector */}
        <div className="space-y-6">
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4">
            <div>
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block">Architecture Inspector</span>
              <h3 className="text-sm font-black dark:text-white uppercase tracking-tight mt-1">{current.title}</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">{current.desc}</p>

            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-850 text-xs font-semibold">
              <div>
                <span className="text-[9px] text-slate-450 uppercase block mb-1">Inputs</span>
                <div className="flex flex-wrap gap-1">
                  {current.inputs.map((i, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[9px] font-bold">{i}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[9px] text-slate-455 uppercase block mb-1">Outputs</span>
                <div className="flex flex-wrap gap-1">
                  {current.outputs.map((o, idx) => (
                    <Badge key={idx} className="bg-primary/5 text-primary border-none text-[9px] font-bold">{o}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[9px] text-slate-460 uppercase block mb-1">API Endpoints</span>
                <div className="flex flex-wrap gap-1">
                  {current.apis.map((a, idx) => (
                    <Badge key={idx} className="bg-slate-950 text-slate-300 font-mono text-[9px] border border-slate-800">{a}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[9px] text-slate-465 uppercase block mb-1">Core Modules</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {current.deps.map((d, idx) => (
                    <span key={idx} className="px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-650 dark:text-slate-350 border border-slate-100 dark:border-slate-750">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
