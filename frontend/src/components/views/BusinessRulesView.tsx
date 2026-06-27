import { useState, useEffect } from "react";
import { 
  ListChecks, Plus, Edit, Trash2, CheckCircle2, XCircle, 
  HelpCircle, Settings, Play, RefreshCw, BarChart2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getRules, createRule, updateRule, deleteRule, testRules } from "../../lib/api";
import { BusinessRule } from "../../lib/types";

export function BusinessRulesView() {
  const [rules, setRules] = useState<BusinessRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [activeRuleId, setActiveRuleId] = useState<number | null>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Risk");
  const [conditionType, setConditionType] = useState("health_threshold");
  const [parametersJson, setParametersJson] = useState("{}");
  const [priority, setPriority] = useState(1);
  const [isEnabled, setIsEnabled] = useState(true);

  // Test Console state
  const [testHealth, setTestHealth] = useState(50);
  const [testRevenue, setTestRevenue] = useState(3000000);
  const [testCompetitors, setTestCompetitors] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<any>(null);

  const fetchRules = async () => {
    try {
      const data = await getRules();
      setRules(data);
    } catch (err) {
      console.error("Rules fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      description,
      category,
      condition_type: conditionType,
      parameters_json: parametersJson,
      priority: Number(priority),
      is_enabled: isEnabled
    };

    try {
      if (activeRuleId !== null) {
        await updateRule(activeRuleId, payload);
      } else {
        await createRule(payload);
      }
      resetForm();
      fetchRules();
    } catch (err) {
      console.error("Save rule error:", err);
    }
  };

  const handleEditRule = (rule: BusinessRule) => {
    setIsEditing(true);
    setActiveRuleId(rule.id);
    setTitle(rule.title);
    setDescription(rule.description);
    setCategory(rule.category);
    setConditionType(rule.condition_type);
    setParametersJson(rule.parameters_json);
    setPriority(rule.priority);
    setIsEnabled(rule.is_enabled);
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    try {
      await deleteRule(id);
      fetchRules();
    } catch (err) {
      console.error("Delete rule error:", err);
    }
  };

  const handleToggleEnable = async (rule: BusinessRule) => {
    const payload = {
      title: rule.title,
      description: rule.description,
      category: rule.category,
      condition_type: rule.condition_type,
      parameters_json: rule.parameters_json,
      priority: rule.priority,
      is_enabled: !rule.is_enabled
    };
    try {
      await updateRule(rule.id, payload);
      fetchRules();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setActiveRuleId(null);
    setTitle("");
    setDescription("");
    setCategory("Risk");
    setConditionType("health_threshold");
    setParametersJson("{}");
    setPriority(1);
    setIsEnabled(true);
  };

  const handleDryRunTest = async () => {
    try {
      const res = await testRules({
        health: testHealth,
        revenue: testRevenue,
        competitors: testCompetitors
      });
      setTestResult(res);
    } catch (err) {
      console.error("Dry run test failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-12 items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Loading Rules Schema...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black font-heading tracking-tight text-slate-800 dark:text-white uppercase font-heading">Business Rules Engine</h1>
          <p className="text-slate-500 text-xs font-semibold mt-1">Configure logic policies directly influencing AI strategic recommendation weights.</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="rounded-xl flex items-center gap-2 font-bold text-xs uppercase px-5 shadow-lg shadow-primary/20">
            <Plus size={14} />
            <span>Create Rule</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rules listing & Form */}
        <div className="lg:col-span-2 space-y-6">
          {isEditing ? (
            <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4">
              <h3 className="text-sm font-black dark:text-white uppercase tracking-tight">
                {activeRuleId !== null ? "Edit Constraint Rule" : "Create New Rule Constraint"}
              </h3>
              
              <form onSubmit={handleSaveRule} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Rule Title</label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Extreme Health Threshold Alert" className="h-10" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <option value="Risk">Risk</option>
                      <option value="Expansion">Expansion</option>
                      <option value="Competitor">Competitor Threat</option>
                      <option value="Compliance">Compliance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the trigger parameters and business rationale..." className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl min-h-[60px]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Condition Type</label>
                    <select value={conditionType} onChange={(e) => setConditionType(e.target.value)} className="w-full px-3 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <option value="health_threshold">Health Threshold</option>
                      <option value="revenue_threshold">Revenue Threshold</option>
                      <option value="regex_match">Competitor Match</option>
                      <option value="ticket_staleness">Ticket Staleness</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Parameters (JSON)</label>
                    <Input value={parametersJson} onChange={(e) => setParametersJson(e.target.value)} required placeholder='{"health": 50}' className="h-10 font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Priority Order</label>
                    <Input type="number" value={priority} onChange={(e) => setPriority(Number(e.target.value))} required className="h-10" />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} className="accent-primary h-4 w-4" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Enable Rule Immediately</span>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-805">
                  <Button type="button" variant="ghost" onClick={resetForm} className="rounded-xl font-bold uppercase text-[10px]">Cancel</Button>
                  <Button type="submit" className="rounded-xl font-bold uppercase text-[10px] px-6">Save Ruleset</Button>
                </div>
              </form>
            </Card>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Active Database Rules</h3>
              {rules.map((rule) => (
                <Card key={rule.id} className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/5 text-primary border-none font-black text-[9px] uppercase px-2 py-0">Priority #{rule.priority}</Badge>
                      <Badge variant="secondary" className="font-bold text-[9px] uppercase">{rule.category}</Badge>
                    </div>
                    <h4 className="font-black text-slate-850 dark:text-white uppercase tracking-tight mt-2">{rule.title}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">{rule.description}</p>
                    <span className="text-[10px] text-slate-400 font-mono block mt-2">Trigger Condition: {rule.condition_type} • Params: {rule.parameters_json}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleToggleEnable(rule)} 
                      className={`h-9 w-9 rounded-lg p-0 ${rule.is_enabled ? "text-emerald-500 hover:text-emerald-600" : "text-slate-400 hover:text-slate-500"}`}
                    >
                      {rule.is_enabled ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    </Button>
                    <Button variant="ghost" onClick={() => handleEditRule(rule)} className="h-9 w-9 rounded-lg p-0 text-slate-500 hover:bg-slate-50"><Edit size={16} /></Button>
                    <Button variant="ghost" onClick={() => handleDeleteRule(rule.id)} className="h-9 w-9 rounded-lg p-0 text-red-500 hover:bg-red-50"><Trash2 size={16} /></Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Dry run scenario simulation test */}
        <div className="space-y-6">
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Play size={16} className="text-primary fill-primary/10" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Rules Scenario Dry Run</h3>
            </div>
            
            <div className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Mock Customer Health ({testHealth}%)</label>
                <input type="range" min="0" max="100" value={testHealth} onChange={(e) => setTestHealth(Number(e.target.value))} className="w-full accent-primary" />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1.5">Mock Contract Revenue (${(testRevenue / 1000000).toFixed(1)}M)</label>
                <input type="range" min="0" max="10000000" step="500000" value={testRevenue} onChange={(e) => setTestRevenue(Number(e.target.value))} className="w-full accent-primary" />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-2">Flag Competitor Mentions</label>
                <div className="flex gap-2">
                  {["LinearCorp", "ZendeskPlus", "HubSpotAI"].map((comp) => {
                    const active = testCompetitors.includes(comp);
                    return (
                      <button 
                        key={comp}
                        type="button"
                        onClick={() => {
                          if (active) {
                            setTestCompetitors(prev => prev.filter(c => c !== comp));
                          } else {
                            setTestCompetitors(prev => [...prev, comp]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all ${active ? "bg-primary border-primary text-white shadow-md shadow-primary/20" : "bg-slate-50 border-slate-100 text-slate-650 hover:bg-slate-100"}`}
                      >
                        {comp}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button onClick={handleDryRunTest} className="w-full rounded-xl font-bold uppercase text-[10px] h-10 mt-2">Test Scenario Rules</Button>
            </div>
          </Card>

          {/* Dry run results */}
          {testResult && (
            <Card className="p-6 bg-slate-950 text-slate-200 border border-slate-800 rounded-3xl space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-primary font-black uppercase text-[10px]">Simulation Output</span>
                <span className="text-emerald-500 text-[10px]">SUCCESS</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div>Rules evaluated: {rules.length} (Enabled)</div>
                <div>Rules triggered: <span className="text-violet-400 font-black">{testResult.triggered_rules_count} rules</span></div>
                
                {testResult.triggered_rules.length > 0 && (
                  <div className="pl-3 border-l border-slate-800 space-y-1 my-2">
                    {testResult.triggered_rules.map((tr: any) => (
                      <div key={tr.id} className="text-slate-400">• [{tr.category}] {tr.title}</div>
                    ))}
                  </div>
                )}
                
                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                  Orchestrated Outcome: <span className="text-white font-bold">{testResult.recommendation_outcome}</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
