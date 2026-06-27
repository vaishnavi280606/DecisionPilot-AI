import { useState, useEffect } from "react";
import { 
  BrainCircuit, Search, Database, Layers, Clock, ShieldCheck, 
  MessageSquare, HelpCircle, Activity
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getMemory, getCustomers } from "../../lib/api";
import { MemoryPartition } from "../../lib/types";

export function MemoryHubView() {
  const [memory, setMemory] = useState<MemoryPartition | null>(null);
  const [customers, setCustomers] = useState<Array<{ customer_id: string; name: string }>>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("nexus-corp");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      const custs = await getCustomers();
      setCustomers(custs);
      const data = await getMemory(selectedCustomerId);
      setMemory(data);
    } catch (err) {
      console.error("Memory load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCustomerId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-12 items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Querying Memory Hub...</p>
      </div>
    );
  }

  const filteredSession = memory?.session_memory.filter(sm => 
    sm.key.toLowerCase().includes(search.toLowerCase()) || 
    sm.value.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const filteredCustomer = memory?.customer_memory.filter(cm => 
    cm.event.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const filteredOrg = memory?.organization_memory.filter(om => 
    om.rule_title.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black font-heading tracking-tight text-slate-850 dark:text-white uppercase">Multi-Tier Memory Hub</h1>
          <p className="text-slate-500 text-xs font-semibold mt-1">Inspecting memory silos: Session variables, mid-term Customer history, and long-term playbook rules.</p>
        </div>
        <div className="flex gap-2 items-center">
          <select 
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold"
          >
            {customers.map(c => (
              <option key={c.customer_id} value={c.customer_id}>{c.name}</option>
            ))}
          </select>
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <Input 
              placeholder="Search memory..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-slate-55 border-none rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Three Cards Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 1. Session Memory Card */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col justify-between hover:shadow-lg transition-all space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Session Memory</span>
              <Badge className="bg-primary/5 text-primary border-none font-bold text-[8px] uppercase">Short-Term</Badge>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">Caches active session context, runtime tokens, and short-term variables of the current analysis loop.</p>
            
            <div className="space-y-2">
              {filteredSession.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">No active keys.</div>
              ) : (
                filteredSession.slice(0, 5).map((sm, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] font-mono p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <span className="text-slate-400 font-bold truncate max-w-[12ch]">{sm.key}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-black truncate max-w-[15ch]">{sm.value}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* 2. Customer Memory Card */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col justify-between hover:shadow-lg transition-all space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Customer Memory</span>
              <Badge className="bg-violet-500/10 text-violet-500 border-none font-bold text-[8px] uppercase">Mid-Term</Badge>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">Tracks historical strategic actions, CSM decisions, feedback loops, and learning outcomes.</p>
            
            <div className="space-y-2">
              {filteredCustomer.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">No history logged.</div>
              ) : (
                filteredCustomer.slice(0, 4).map((cm, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl font-semibold">
                    <span className="text-slate-800 dark:text-slate-200 truncate max-w-[20ch]">{cm.event}</span>
                    <Badge className="bg-emerald-500/10 text-emerald-500 font-bold text-[8px] border-none">Conf: {(cm.confidence*100).toFixed(0)}%</Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* 3. Organization Memory Card */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col justify-between hover:shadow-lg transition-all space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Organization Memory</span>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-bold text-[8px] uppercase">Long-Term</Badge>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">Accumulates global organizational playbooks, learned decision patterns, and policy constraints.</p>
            
            <div className="space-y-2">
              {filteredOrg.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">No rules indexed.</div>
              ) : (
                filteredOrg.slice(0, 4).map((om, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl font-semibold">
                    <span className="text-slate-800 dark:text-slate-200 truncate max-w-[20ch]">{om.rule_title}</span>
                    <Badge className="bg-slate-200 text-slate-650 border-none font-bold text-[8px] uppercase">Priority #{om.rule_priority}</Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
