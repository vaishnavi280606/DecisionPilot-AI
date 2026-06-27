import { useState, useEffect } from "react";
import { 
  Save, Shield, Cpu, Bell, Globe, Plus, Edit, Trash2, 
  CheckCircle2, XCircle, Play, RefreshCw, Settings2, Link2, 
  Mail, Calendar, MessageSquare, ShieldCheck, Sun, Moon, Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  getRules, createRule, updateRule, deleteRule, testRules,
  getConnections, testConnection, reconnectConnection, configureConnection,
  updateSettings
} from "../../lib/api";
import { UserSettings, BusinessRule, ToolConnection } from "../../lib/types";

export function SettingsView({ settings, onUpdate }: { settings: UserSettings | null, onUpdate: () => void }) {
  const [activeTab, setActiveTab] = useState<"general" | "rules" | "connections" | "notifications" | "ai" | "theme">("general");
  const [localSettings, setLocalSettings] = useState<UserSettings | null>(settings);

  // --- Rules Engine States ---
  const [rules, setRules] = useState<BusinessRule[]>([]);
  const [isEditingRule, setIsEditingRule] = useState(false);
  const [activeRuleId, setActiveRuleId] = useState<number | null>(null);
  const [ruleTitle, setRuleTitle] = useState("");
  const [ruleDescription, setRuleDescription] = useState("");
  const [ruleCategory, setRuleCategory] = useState("Risk");
  const [ruleConditionType, setRuleConditionType] = useState("health_threshold");
  const [ruleParametersJson, setRuleParametersJson] = useState("{}");
  const [rulePriority, setRulePriority] = useState(1);
  const [ruleIsEnabled, setRuleIsEnabled] = useState(true);

  // Test Console States
  const [testHealth, setTestHealth] = useState(50);
  const [testRevenue, setTestRevenue] = useState(3000000);
  const [testCompetitors, setTestCompetitors] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<any>(null);

  // --- Connections Manager States ---
  const [connections, setConnections] = useState<ToolConnection[]>([]);
  const [activeConfigConn, setActiveConfigConn] = useState<ToolConnection | null>(null);
  const [editedConfigJson, setEditedConfigJson] = useState("");
  const [pingingMap, setPingingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Fetch Logic
  const fetchRules = async () => {
    try {
      const data = await getRules();
      setRules(data);
    } catch (err) {
      console.error("Rules fetch error:", err);
    }
  };

  const fetchConnections = async () => {
    try {
      const data = await getConnections();
      setConnections(data);
    } catch (err) {
      console.error("Connections fetch error:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "rules") {
      fetchRules();
    } else if (activeTab === "connections") {
      fetchConnections();
    }
  }, [activeTab]);

  // --- Rules Handlers ---
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: ruleTitle,
      description: ruleDescription,
      category: ruleCategory,
      condition_type: ruleConditionType,
      parameters_json: ruleParametersJson,
      priority: Number(rulePriority),
      is_enabled: ruleIsEnabled
    };

    try {
      if (activeRuleId !== null) {
        await updateRule(activeRuleId, payload);
      } else {
        await createRule(payload);
      }
      resetRuleForm();
      fetchRules();
    } catch (err) {
      console.error("Save rule error:", err);
    }
  };

  const handleEditRule = (rule: BusinessRule) => {
    setIsEditingRule(true);
    setActiveRuleId(rule.id);
    setRuleTitle(rule.title);
    setRuleDescription(rule.description);
    setRuleCategory(rule.category);
    setRuleConditionType(rule.condition_type);
    setRuleParametersJson(rule.parameters_json);
    setRulePriority(rule.priority);
    setRuleIsEnabled(rule.is_enabled);
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

  const handleToggleEnableRule = async (rule: BusinessRule) => {
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

  const resetRuleForm = () => {
    setIsEditingRule(false);
    setActiveRuleId(null);
    setRuleTitle("");
    setRuleDescription("");
    setRuleCategory("Risk");
    setRuleConditionType("health_threshold");
    setRuleParametersJson("{}");
    setRulePriority(1);
    setRuleIsEnabled(true);
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

  // --- Connections Handlers ---
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

  // --- Settings Handlers ---
  const handleSaveSettings = async () => {
    if (!localSettings) return;
    try {
      await updateSettings(localSettings);
      onUpdate();
      alert("Configuration updated successfully");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectLlm = (model: string) => {
    if (!localSettings) return;
    setLocalSettings({ ...localSettings, llm_model: model });
  };

  const handleThresholdChange = (val: number) => {
    if (!localSettings) return;
    setLocalSettings({ ...localSettings, confidence_threshold: val });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black font-heading tracking-tight uppercase">System Settings</h1>
          <p className="text-slate-500 text-xs font-semibold mt-1">Configure global AI parameters, rules logic, and API port connections.</p>
        </div>
        <Button onClick={handleSaveSettings} className="rounded-xl px-6 shadow-xl shadow-primary/20 flex items-center gap-2 font-bold text-xs uppercase">
          <Save size={16} />
          <span>Save Configuration</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Tabs List */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: "general", label: "General Settings", icon: Globe },
            { id: "rules", label: "Business Rules", icon: CheckCircle2 },
            { id: "connections", label: "Connections Manager", icon: Link2 },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "ai", label: "AI Configuration", icon: Cpu },
            { id: "theme", label: "Theme Options", icon: Sun }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-xs font-black uppercase transition-all ${activeTab === tab.id ? "bg-primary text-white border-primary shadow-md shadow-primary/10" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"}`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="lg:col-span-3">
          {/* TAB 1: General */}
          {activeTab === "general" && (
            <Card className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-6">
              <div className="pb-4 border-b border-slate-55 dark:border-slate-800">
                <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm">General Parameters</h3>
                <p className="text-xs text-slate-400 mt-1">Configure global variables and cloud deployment targets.</p>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Deployment Cluster Region</label>
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <Globe size={16} className="text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-450 font-bold">Global Cluster: us-east-1 (Primary)</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Cluster Version</label>
                  <Input value="v1.2.4-agentic" readOnly className="h-10 bg-slate-50/50" />
                </div>
              </div>
            </Card>
          )}

          {/* TAB 2: Business Rules */}
          {activeTab === "rules" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm">Rules Engine</h3>
                  <p className="text-xs text-slate-400 mt-1">Override model behaviors with deterministic policies.</p>
                </div>
                {!isEditingRule && (
                  <Button onClick={() => setIsEditingRule(true)} className="rounded-xl flex items-center gap-2 font-bold text-xs uppercase px-5 shadow-lg shadow-primary/10">
                    <Plus size={14} />
                    <span>Create Rule</span>
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  {isEditingRule ? (
                    <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4">
                      <h4 className="text-xs font-black dark:text-white uppercase tracking-tight">
                        {activeRuleId !== null ? "Edit Constraint Rule" : "Create New Rule Constraint"}
                      </h4>
                      
                      <form onSubmit={handleSaveRule} className="space-y-4 text-xs font-semibold">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] text-slate-400 font-black uppercase block mb-1">Rule Title</label>
                            <Input value={ruleTitle} onChange={(e) => setRuleTitle(e.target.value)} required placeholder="e.g. Health Score Alert" className="h-10" />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 font-black uppercase block mb-1">Category</label>
                            <select value={ruleCategory} onChange={(e) => setRuleCategory(e.target.value)} className="w-full px-3 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                              <option value="Risk">Risk</option>
                              <option value="Expansion">Expansion</option>
                              <option value="Competitor">Competitor Threat</option>
                              <option value="Compliance">Compliance</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 font-black uppercase block mb-1">Description</label>
                          <textarea value={ruleDescription} onChange={(e) => setRuleDescription(e.target.value)} placeholder="Describe the policy parameters..." className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl min-h-[60px]" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-[10px] text-slate-400 font-black uppercase block mb-1">Condition Type</label>
                            <select value={ruleConditionType} onChange={(e) => setRuleConditionType(e.target.value)} className="w-full px-3 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                              <option value="health_threshold">Health Threshold</option>
                              <option value="revenue_threshold">Revenue Threshold</option>
                              <option value="regex_match">Competitor Match</option>
                              <option value="ticket_staleness">Ticket Staleness</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 font-black uppercase block mb-1">Parameters (JSON)</label>
                            <Input value={ruleParametersJson} onChange={(e) => setRuleParametersJson(e.target.value)} required placeholder='{"health": 50}' className="h-10 font-mono" />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 font-black uppercase block mb-1">Priority Order</label>
                            <Input type="number" value={rulePriority} onChange={(e) => setRulePriority(Number(e.target.value))} required className="h-10" />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <input type="checkbox" checked={ruleIsEnabled} onChange={(e) => setRuleIsEnabled(e.target.checked)} className="accent-primary h-4 w-4" />
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-350">Enable Rule Immediately</span>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                          <Button type="button" variant="ghost" onClick={resetRuleForm} className="rounded-xl font-bold uppercase text-[10px]">Cancel</Button>
                          <Button type="submit" className="rounded-xl font-bold uppercase text-[10px] px-6">Save Rule</Button>
                        </div>
                      </form>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {rules.map((rule) => (
                        <Card key={rule.id} className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-primary/5 text-primary border-none font-black text-[9px] uppercase px-2 py-0">Priority #{rule.priority}</Badge>
                              <Badge variant="secondary" className="font-bold text-[9px] uppercase">{rule.category}</Badge>
                            </div>
                            <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight mt-2">{rule.title}</h4>
                            <p className="text-slate-500 text-xs mt-1">{rule.description}</p>
                            <span className="text-[10px] text-slate-400 font-mono block mt-2">Condition: {rule.condition_type} • Params: {rule.parameters_json}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              onClick={() => handleToggleEnableRule(rule)} 
                              className={`h-8 w-8 rounded-lg p-0 ${rule.is_enabled ? "text-emerald-500" : "text-slate-400"}`}
                            >
                              {rule.is_enabled ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                            </Button>
                            <Button variant="ghost" onClick={() => handleEditRule(rule)} className="h-8 w-8 p-0 text-slate-505"><Edit size={14} /></Button>
                            <Button variant="ghost" onClick={() => handleDeleteRule(rule.id)} className="h-8 w-8 p-0 text-red-500"><Trash2 size={14} /></Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dry Run Simulation */}
                <div className="space-y-6">
                  <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <Play size={16} className="text-primary fill-primary/10" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Scenario Simulation</h4>
                    </div>

                    <div className="space-y-4 text-xs font-semibold">
                      <div>
                        <label className="text-[10px] text-slate-400 font-black block mb-1">Customer Health ({testHealth}%)</label>
                        <input type="range" min="0" max="100" value={testHealth} onChange={(e) => setTestHealth(Number(e.target.value))} className="w-full accent-primary" />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-black block mb-1">Contract Revenue (${(testRevenue / 1000000).toFixed(1)}M)</label>
                        <input type="range" min="0" max="10000000" step="500000" value={testRevenue} onChange={(e) => setTestRevenue(Number(e.target.value))} className="w-full accent-primary" />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-black block mb-2">Competitor Mention</label>
                        <div className="flex gap-2">
                          {["LinearCorp", "ZendeskPlus"].map((comp) => {
                            const active = testCompetitors.includes(comp);
                            return (
                              <button
                                key={comp}
                                type="button"
                                onClick={() => {
                                  if (active) setTestCompetitors(prev => prev.filter(c => c !== comp));
                                  else setTestCompetitors(prev => [...prev, comp]);
                                }}
                                className={`px-2.5 py-1.5 rounded-xl border text-[9px] font-bold uppercase transition-all ${active ? "bg-primary border-primary text-white" : "bg-slate-50 border-slate-100 text-slate-600 dark:text-slate-400"}`}
                              >
                                {comp}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <Button onClick={handleDryRunTest} className="w-full rounded-xl font-bold uppercase text-[10px] h-9 mt-2">Test Scenario</Button>
                    </div>
                  </Card>

                  {testResult && (
                    <Card className="p-5 bg-slate-950 text-slate-200 border border-slate-800 rounded-3xl space-y-3 font-mono text-[10px]">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-900 text-primary font-black uppercase">
                        <span>Dry Run Log</span>
                        <span className="text-emerald-500">Success</span>
                      </div>
                      <div>Rules triggered: {testResult.triggered_rules_count}</div>
                      <div>Outcome: <span className="text-white font-bold">{testResult.recommendation_outcome}</span></div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Connections */}
          {activeTab === "connections" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm">Connections Manager</h3>
                <p className="text-xs text-slate-400 mt-1">Configure database connections and external API access tokens.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {connections.map((c) => {
                  const config = JSON.parse(c.config_json || "{}");
                  const pinging = pingingMap[c.name] || false;
                  return (
                    <Card key={c.id} className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col justify-between hover:shadow-lg transition-all space-y-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-550">
                            {c.category === "CRM" && <ShieldCheck size={18} className="text-primary" />}
                            {c.category === "VectorDB" && <Database size={18} className="text-violet-500" />}
                            {c.category === "LLM" && <Cpu size={18} className="text-emerald-500" />}
                            {c.category === "Email" && <Mail size={18} className="text-amber-500" />}
                            {c.category === "Calendar" && <Calendar size={18} className="text-indigo-500" />}
                            {c.category === "Analytics" && <MessageSquare size={18} className="text-sky-500" />}
                            {c.category === "Notification" && <Link2 size={18} className="text-pink-500" />}
                          </div>
                          <Badge className={c.status === "healthy" ? "bg-emerald-500/10 text-emerald-500 border-none font-bold text-[8px] uppercase" : "bg-amber-500/10 text-amber-500 border-none font-bold text-[8px] uppercase"}>
                            {c.status}
                          </Badge>
                        </div>

                        <div>
                          <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-xs">{c.name}</h4>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{c.category} Integration</span>
                        </div>

                        <div className="space-y-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-slate-400 uppercase font-black">Sync latency</span>
                            <span className="font-mono text-slate-800 dark:text-white font-black">{c.latency_ms} ms</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-slate-400 uppercase font-black">Handshake</span>
                            <span className="font-mono italic text-[10px]">{new Date(c.last_sync).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <Button onClick={() => handleTestConnection(c.name)} disabled={pinging} variant="outline" className="flex-1 rounded-xl text-[8px] font-black uppercase h-8 border-slate-200">
                          {pinging ? "Testing..." : "Test Ping"}
                        </Button>
                        <Button onClick={() => handleReconnectConnection(c.name)} variant="outline" className="flex-1 rounded-xl text-[8px] font-black uppercase h-8 border-slate-200">
                          Reconnect
                        </Button>
                        <Button onClick={() => {
                          setActiveConfigConn(c);
                          setEditedConfigJson(JSON.stringify(config, null, 2));
                        }} variant="ghost" className="h-8 w-8 p-0 rounded-xl hover:bg-slate-50">
                          <Settings2 size={14} className="text-slate-400" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {activeConfigConn && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
                    <div>
                      <h3 className="text-sm font-black dark:text-white uppercase">Configure {activeConfigConn.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Edit credentials payload details (JSON):</p>
                    </div>
                    <textarea value={editedConfigJson} onChange={(e) => setEditedConfigJson(e.target.value)} className="w-full text-xs font-mono p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 dark:text-white min-h-[120px]" />
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <Button variant="ghost" onClick={() => setActiveConfigConn(null)} className="rounded-xl font-bold uppercase text-[9px]">Cancel</Button>
                      <Button onClick={handleSaveConfig} className="rounded-xl font-bold uppercase text-[9px] px-6">Save</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Notifications */}
          {activeTab === "notifications" && (
            <Card className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-6">
              <div className="pb-4 border-b border-slate-50 dark:border-slate-800">
                <h3 className="font-black text-slate-855 dark:text-white uppercase text-sm">Notification Channels</h3>
                <p className="text-xs text-slate-400 mt-1">Configure active channels for critical system alarms.</p>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Email Alerts</span>
                    <span className="text-[11px] text-slate-400 font-normal">Sends summaries of flagged customer renewals.</span>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-primary h-4.5 w-4.5" />
                </div>

                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Slack Integration Gateway</span>
                    <span className="text-[11px] text-slate-400 font-normal">Pushes risk triggers directly to target CS channels.</span>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-primary h-4.5 w-4.5" />
                </div>
              </div>
            </Card>
          )}

          {/* TAB 5: AI Configuration */}
          {activeTab === "ai" && (
            <Card className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-6">
              <div className="pb-4 border-b border-slate-50 dark:border-slate-800">
                <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm">AI Orchestrator Engine</h3>
                <p className="text-xs text-slate-400 mt-1">Adjust accuracy metrics, models, and temperature levels.</p>
              </div>

              <div className="space-y-6 text-xs font-semibold">
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">LLM Engine</label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => handleSelectLlm("gemini-1.5-pro")}
                      className={`rounded-xl border-2 py-6 transition-all font-bold text-xs uppercase ${localSettings?.llm_model === 'gemini-1.5-pro' ? 'border-primary bg-primary/5 text-primary' : 'hover:border-primary/20 text-slate-700 dark:text-slate-350'}`}
                    >
                      Gemini 1.5 Pro (Recommended)
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => handleSelectLlm("gemini-1.5-flash")}
                      className={`rounded-xl border-2 py-6 transition-all font-bold text-xs uppercase ${localSettings?.llm_model === 'gemini-1.5-flash' ? 'border-primary bg-primary/5 text-primary' : 'hover:border-primary/20 text-slate-700 dark:text-slate-350'}`}
                    >
                      Gemini 1.5 Flash (Fast)
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Confidence Review Threshold</label>
                    <span className="text-xs font-black text-primary">
                      {localSettings?.confidence_threshold ? (localSettings.confidence_threshold * 100).toFixed(0) : 70}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={localSettings?.confidence_threshold ? localSettings.confidence_threshold * 100 : 70} 
                      onChange={(e) => handleThresholdChange(Number(e.target.value) / 100)}
                      className="w-full accent-primary" 
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 6: Theme */}
          {activeTab === "theme" && (
            <Card className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-6">
              <div className="pb-4 border-b border-slate-50 dark:border-slate-800">
                <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm">Theme Preferences</h3>
                <p className="text-xs text-slate-400 mt-1">Select the default layout mode for visual comfort.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    document.documentElement.classList.remove("dark");
                  }}
                  className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl text-slate-600 dark:text-slate-400 transition-colors"
                >
                  <Sun size={24} className="mb-2 text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">Light Theme</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    document.documentElement.classList.add("dark");
                  }}
                  className="flex flex-col items-center justify-center p-6 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-2xl text-slate-200 transition-colors"
                >
                  <Moon size={24} className="mb-2 text-violet-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">Dark Theme</span>
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
