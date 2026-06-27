import { useState, useEffect } from "react";
import { 
  Link2, RefreshCw, AlertTriangle, ShieldCheck, Database, 
  Cpu, MessageSquare, Mail, Calendar, Settings2, Shield
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getConnections, testConnection, reconnectConnection, configureConnection } from "../../lib/api";
import { ToolConnection } from "../../lib/types";
import { motion } from "framer-motion";

export function ConnectionsView() {
  const [connections, setConnections] = useState<ToolConnection[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Config Modal State
  const [activeConfigConn, setActiveConfigConn] = useState<ToolConnection | null>(null);
  const [editedConfigJson, setEditedConfigJson] = useState("");
  const [pingingMap, setPingingMap] = useState<Record<string, boolean>>({});

  const fetchConnections = async () => {
    try {
      const data = await getConnections();
      setConnections(data);
    } catch (err) {
      console.error("Connections fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleTestConnection = async (name: string) => {
    setPingingMap(prev => ({ ...prev, [name]: true }));
    try {
      const updated = await testConnection(name);
      setConnections(prev => prev.map(c => c.name === name ? updated : c));
    } catch (err) {
      console.error(err);
    } finally {
      setPingingMap(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleReconnectConnection = async (name: string) => {
    try {
      const updated = await reconnectConnection(name);
      setConnections(prev => prev.map(c => c.name === name ? updated : c));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveConfig = async () => {
    if (!activeConfigConn) return;
    try {
      await configureConnection(activeConfigConn.name, editedConfigJson);
      setActiveConfigConn(null);
      fetchConnections();
    } catch (err) {
      console.error(err);
      alert("Invalid JSON format");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-12 items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Pinging System Connectors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black font-heading tracking-tight text-slate-800 dark:text-white uppercase">Connections Manager</h1>
          <p className="text-slate-500 text-xs font-semibold mt-1">Monitor credentials, API sync schedules, and pings across tool layer integrations.</p>
        </div>
        <Button variant="outline" className="rounded-xl flex items-center gap-2 border-slate-200" onClick={fetchConnections}>
          <RefreshCw size={14} />
          <span className="text-xs uppercase font-bold">Refresh Ports</span>
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connections.map((c) => {
          const config = JSON.parse(c.config_json || "{}");
          const pinging = pingingMap[c.name] || false;

          return (
            <Card key={c.id} className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col justify-between hover:shadow-lg transition-all space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500">
                    {c.category === "CRM" && <ShieldCheck size={20} className="text-primary" />}
                    {c.category === "VectorDB" && <Database size={20} className="text-violet-500" />}
                    {c.category === "LLM" && <Cpu size={20} className="text-emerald-500" />}
                    {c.category === "Email" && <Mail size={20} className="text-amber-500" />}
                    {c.category === "Calendar" && <Calendar size={20} className="text-indigo-500" />}
                    {c.category === "Analytics" && <MessageSquare size={20} className="text-sky-500" />}
                    {c.category === "Notification" && <Link2 size={20} className="text-pink-500" />}
                  </div>

                  <Badge className={c.status === "healthy" ? "bg-emerald-500/10 text-emerald-500 border-none font-bold text-[9px] uppercase" : "bg-amber-500/10 text-amber-500 border-none font-bold text-[9px] uppercase"}>
                    {c.status}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-black text-slate-850 dark:text-white uppercase tracking-tight">{c.name}</h4>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.category} Integration</span>
                </div>

                <div className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 uppercase font-black">Sync latency</span>
                    <span className="font-mono text-slate-850 dark:text-white font-black">{c.latency_ms} ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 uppercase font-black">Last handshake</span>
                    <span className="font-mono italic text-[11px]">{new Date(c.last_sync).toLocaleTimeString()}</span>
                  </div>
                  {Object.entries(config).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 uppercase font-black">{key.replace(/_/g, " ")}</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-[15ch]">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                <Button 
                  onClick={() => handleTestConnection(c.name)}
                  disabled={pinging}
                  variant="outline" 
                  className="flex-1 rounded-xl text-[9px] font-black uppercase h-8 border-slate-200"
                >
                  {pinging ? "Testing..." : "Test Ping"}
                </Button>
                <Button 
                  onClick={() => handleReconnectConnection(c.name)}
                  variant="outline" 
                  className="flex-1 rounded-xl text-[9px] font-black uppercase h-8 border-slate-200"
                >
                  Reconnect
                </Button>
                <Button 
                  onClick={() => {
                    setActiveConfigConn(c);
                    setEditedConfigJson(JSON.stringify(config, null, 2));
                  }}
                  variant="ghost" 
                  className="h-8 w-8 p-0 rounded-xl hover:bg-slate-50"
                >
                  <Settings2 size={16} className="text-slate-400" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Connection Config Modal */}
      {activeConfigConn && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-black dark:text-white uppercase tracking-tight">Configure {activeConfigConn.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Edit sync parameters and connection options in JSON format</p>
            </div>
            
            <textarea 
              value={editedConfigJson}
              onChange={(e) => setEditedConfigJson(e.target.value)}
              className="w-full text-xs font-mono p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 dark:text-white min-h-[160px] leading-relaxed"
            />

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-805 text-xs">
              <Button variant="ghost" onClick={() => setActiveConfigConn(null)} className="rounded-xl font-bold uppercase text-[10px]">Cancel</Button>
              <Button onClick={handleSaveConfig} className="rounded-xl font-bold uppercase text-[10px] px-6">Save config</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
