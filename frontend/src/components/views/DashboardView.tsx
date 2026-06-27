import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit } from "lucide-react";
import { KPISection } from "../dashboard/KPISection";
import { CustomerOverview } from "../dashboard/CustomerOverview";
import { UploadSection } from "../dashboard/UploadSection";
import { RecommendationSection } from "../dashboard/RecommendationSection";
import { InsightsCharts } from "../dashboard/InsightsCharts";
import { CustomerTimeline } from "../dashboard/CustomerTimeline";
import { MemoryBrain } from "../dashboard/MemoryBrain";
import { AgentActivity } from "../dashboard/AgentActivity";
import { RiskDashboard } from "../dashboard/RiskDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomer } from "../../hooks/useCustomers";
import { useWorkflow } from "../../hooks/useWorkflow";
import { getRecommendations, getHistory } from "../../lib/api";
import { Recommendation, HistoryItem } from "../../lib/types";

interface DashboardViewProps {
  customerId: string;
  activeSection: string;
  onSectionChange: (s: string) => void;
}

export function DashboardView({ customerId, activeSection, onSectionChange }: DashboardViewProps) {
  const { customer, refresh: refreshProfile } = useCustomer(customerId);
  const { isRunning, currentStep, progress, result, handleUploadAndAnalyze } = useWorkflow(customerId);
  
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const uploadRef = useRef<HTMLDivElement>(null);
  const memoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [recs, hist] = await Promise.all([
        getRecommendations(customerId),
        getHistory(customerId)
      ]);
      setRecommendations(recs);
      setHistory(hist);
    };
    fetchData();
  }, [customerId, result]);

  useEffect(() => {
    if (activeSection === "upload") {
      uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (activeSection === "memory") {
      memoryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeSection]);

  return (
    <div className="space-y-8 pb-20">
      <KPISection summary={customer || { health_score: 0 }} historyCount={history.length} />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {customer && <CustomerOverview summary={customer} customerId={customerId} />}

          <div ref={uploadRef} className="scroll-mt-24">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 px-1">Signal Ingestion</h3>
            <UploadSection onFilesSelected={handleUploadAndAnalyze} />
          </div>

          <Tabs 
            value={activeSection === "history" ? "timeline" : (activeSection === "kb" ? "insights" : "recommendations")}
            onValueChange={(v) => onSectionChange(v === "timeline" ? "history" : "dashboard")}
            className="w-full"
          >
            <TabsList className="bg-white dark:bg-slate-900 p-1 border border-slate-100 dark:border-slate-800 rounded-xl mb-6">
              <TabsTrigger value="recommendations" className="rounded-lg font-bold text-xs uppercase">Active Actions</TabsTrigger>
              <TabsTrigger value="insights" className="rounded-lg font-bold text-xs uppercase">Strategic Analysis</TabsTrigger>
              <TabsTrigger value="timeline" className="rounded-lg font-bold text-xs uppercase">Event History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recommendations">
              <RecommendationSection recommendations={recommendations} onDecisionSaved={refreshProfile} />
            </TabsContent>
            
            <TabsContent value="insights">
              <div className="space-y-6">
                <InsightsCharts />
                <RiskDashboard summary={customer || { health_score: 0 }} />
              </div>
            </TabsContent>

            <TabsContent value="timeline">
              <CustomerTimeline />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-8">
          <AgentActivity loading={isRunning} status={currentStep} progress={progress} />
          <div ref={memoryRef} className="scroll-mt-24">
            <MemoryBrain history={history} />
          </div>
          
          <div className="p-6 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
            <div className="relative z-10 font-sans">
              <h4 className="text-sm font-bold mb-1">AI Orchestrator</h4>
              <p className="text-xs text-blue-100 mb-4 opacity-80 leading-relaxed">Processing multi-vector signals to optimize {customer?.name || 'Customer'} lifecycle.</p>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isRunning ? 'bg-blue-300 animate-ping' : 'bg-blue-300'}`}></div>
                <span className="text-[10px] font-black uppercase tracking-widest">{isRunning ? 'Analyzing...' : 'Standby'}</span>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <BrainCircuit size={120} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
