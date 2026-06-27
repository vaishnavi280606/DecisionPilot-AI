import { useState, useEffect } from "react";
import { 
  Sparkles, Search, CheckCircle2, XCircle, Clock, 
  MessageSquare, UserCheck, Calendar, ShieldAlert
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getCustomers, getRecommendations, takeAction } from "../../lib/api";
import { Customer, Recommendation } from "../../lib/types";

export function RecommendationsView() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Review states
  const [activeRec, setActiveRec] = useState<Recommendation | null>(null);
  const [editedAction, setEditedAction] = useState("");
  const [notes, setNotes] = useState("");
  const [owner, setOwner] = useState("Sarah Jenkins");
  const [followUpDate, setFollowUpDate] = useState("2026-07-15");

  const fetchData = async () => {
    try {
      const custs = await getCustomers();
      setCustomers(custs);
      
      // Parallel fetch across all customers
      const allRecsPromises = custs.map(c => getRecommendations(c.customer_id));
      const allRecsNested = await Promise.all(allRecsPromises);
      const allRecs = allRecsNested.flat();
      
      // Deduplicate recommendations by unique ID
      const uniqueRecs = allRecs.filter((value, index, self) =>
        self.findIndex(r => r.id === value.id) === index
      );
      
      setRecommendations(uniqueRecs);
    } catch (err) {
      console.error("Recommendations fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (decision: "approved" | "rejected") => {
    if (!activeRec) return;
    try {
      await takeAction(activeRec.id, {
        decision,
        edited_action: editedAction || undefined,
        outcome_notes: notes || undefined
      });
      setActiveRec(null);
      setNotes("");
      setEditedAction("");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getCustomerName = (cId: string) => {
    const found = customers.find(c => c.customer_id === cId);
    return found ? found.name : cId.replace("-", " ").toUpperCase();
  };

  const filtered = recommendations.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.priority.toLowerCase().includes(search.toLowerCase()) ||
    r.customer_id.toLowerCase().includes(search.toLowerCase()) ||
    r.status.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-12 items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Aggregating Decision Console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black font-heading tracking-tight text-slate-800 dark:text-white uppercase">Decision Console</h1>
          <p className="text-slate-500 text-xs font-semibold mt-1">Review next-best-actions, explain reasoning chains, and update database memory.</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <Input 
            placeholder="Search by customer, status, priority..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* All Recommendations Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 px-1">Action queue</h3>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                No active recommendations in queue. Run analysis for a customer profile.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 uppercase font-black">
                      <th className="py-3 pl-2">Customer</th>
                      <th className="py-3">Recommendation</th>
                      <th className="py-3 text-center">Priority</th>
                      <th className="py-3 text-center">Confidence</th>
                      <th className="py-3 text-center">Status</th>
                      <th className="py-3 text-right pr-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((rec) => (
                      <tr 
                        key={rec.id}
                        onClick={() => {
                          setActiveRec(rec);
                          setEditedAction(rec.details);
                        }}
                        className={`border-b border-slate-50 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer font-semibold transition-colors ${activeRec?.id === rec.id ? "bg-primary/5 dark:bg-primary/10" : ""}`}
                      >
                        <td className="py-3.5 pl-2 font-black text-slate-800 dark:text-white uppercase">{getCustomerName(rec.customer_id)}</td>
                        <td className="py-3.5 truncate max-w-[20ch]">
                          <span className="font-bold block text-slate-800 dark:text-white">{rec.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{rec.details}</span>
                        </td>
                        <td className="py-3.5 text-center">
                          <Badge className={rec.priority === "High" ? "bg-red-500/10 text-red-500 border-none font-bold text-[8px] uppercase" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none font-bold text-[8px] uppercase"}>
                            {rec.priority}
                          </Badge>
                        </td>
                        <td className="py-3.5 text-center font-bold text-primary">{(rec.confidence_score*100).toFixed(0)}%</td>
                        <td className="py-3.5 text-center">
                          <Badge className={rec.status === "approved" ? "bg-emerald-500/10 text-emerald-500 border-none font-bold text-[8px] uppercase" : rec.status === "pending" ? "bg-amber-500/10 text-amber-500 border-none font-bold text-[8px] uppercase" : "bg-red-500/10 text-red-500 border-none font-bold text-[8px] uppercase"}>
                            {rec.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 text-right pr-2 text-slate-400 text-[10px]">{new Date(rec.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Selected Recommendation Detail Drawer Panel */}
        <div className="space-y-6">
          {activeRec ? (
            <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-6">
              <div>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block">Explainability Details</span>
                <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight mt-1">{activeRec.title}</h4>
              </div>

              {/* Attribution Weights */}
              <div className="space-y-3 p-4 bg-slate-55 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs font-semibold">
                <span className="text-[9px] text-slate-400 font-black uppercase block">Signal Attribution Weights</span>
                <div className="space-y-2">
                  {[
                    { name: "Support Ticket SLA breach", weight: "45%" },
                    { name: "Competitor evaluation signals", weight: "35%" },
                    { name: "ChromaDB matching playbooks", weight: "20%" }
                  ].map((attr) => (
                    <div key={attr.name} className="flex justify-between items-center text-slate-700 dark:text-slate-350 font-medium">
                      <span>{attr.name}</span>
                      <span className="font-black text-primary">{attr.weight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation Timeline */}
              <div className="space-y-4">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block">Lifecycle Status Timeline</span>
                <div className="relative pl-6 border-l border-slate-100 dark:border-slate-800 space-y-4 text-xs font-semibold">
                  <div className="relative">
                    <div className="absolute -left-[30px] top-1.5 h-2 w-2 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900" />
                    <span className="text-slate-800 dark:text-white block font-bold uppercase text-[10px]">1. Generated</span>
                    <span className="text-[10px] text-slate-400">Agent built recommendation reasoning chain</span>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[30px] top-1.5 h-2 w-2 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900" />
                    <span className="text-slate-800 dark:text-white block font-bold uppercase text-[10px]">2. Approved</span>
                    <span className="text-[10px] text-slate-400">Decision committed in histories database</span>
                  </div>
                  <div className="relative">
                    <div className={`absolute -left-[30px] top-1.5 h-2 w-2 rounded-full border-4 border-white dark:border-slate-900 ${activeRec.status !== "pending" ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`} />
                    <span className="text-slate-800 dark:text-white block font-bold uppercase text-[10px]">3. Memory Synchronized</span>
                    <span className="text-[10px] text-slate-400">Outcome feedback mapped to customer profiles</span>
                  </div>
                </div>
              </div>

              {/* HITL Inputs */}
              {activeRec.status === "pending" && (
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Human-in-the-Loop Actions</span>
                  
                  <div className="space-y-3 text-xs font-semibold">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] text-slate-400 uppercase font-black block mb-1">Assign owner</label>
                        <Input value={owner} onChange={(e) => setOwner(e.target.value)} className="h-9 text-xs" />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400 uppercase font-black block mb-1">Follow-up</label>
                        <Input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className="h-9 text-xs" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 uppercase font-black block mb-1">Modify Recommendation Action</label>
                      <textarea value={editedAction} onChange={(e) => setEditedAction(e.target.value)} className="w-full text-xs p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 dark:text-white min-h-[80px]" />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 uppercase font-black block mb-1">Add Outcome Notes</label>
                      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Outcome notes to update memory loops..." className="w-full text-xs p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-55 dark:bg-slate-950 dark:text-white min-h-[60px]" />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => handleAction("rejected")} variant="destructive" className="flex-1 rounded-xl font-bold uppercase text-[10px] h-9">Reject</Button>
                    <Button onClick={() => handleAction("approved")} className="flex-1 rounded-xl font-bold uppercase text-[10px] h-9 shadow-lg shadow-primary/10">Approve & Save</Button>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 font-bold bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl min-h-[300px]">
              <Sparkles size={32} className="text-slate-300 mb-2" />
              <span className="text-xs uppercase tracking-widest block">No action selected</span>
              <p className="text-[10px] text-slate-400 font-normal max-w-xs mt-1">Select a recommendation row from the table on the left to inspect its details and review steps.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
