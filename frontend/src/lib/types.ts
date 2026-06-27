export type SourceType = "transcript" | "crm" | "support" | "email" | "knowledge_base";

export interface Customer {
  id: number;
  customer_id: string;
  name: string;
  tier: string;
  revenue: string;
  contract_renewal: string;
  health_score: number;
  churn_risk: number;
  upsell_opp: number;
  summary: string;
  key_insights: string[];
  metadata_json?: string;
  updated_at: string;
}

export interface SummaryResponse {
  health_score: number;
  churn_risk: number;
  upsell_opp: number;
  summary: string;
  key_insights: string[];
}


export interface Document {
  id: number;
  customer_id: string;
  source_type: string;
  filename: string;
  status: string;
  created_at: string;
}

export interface Recommendation {
  id: number;
  customer_id: string;
  title: string;
  details: string;
  priority: string;
  confidence_score: number;
  impact: string;
  evidence: string;
  reasoning_chain: string[];
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface HistoryItem {
  recommendation_id: number;
  title: string;
  decision: string;
  edited_action: string;
  outcome_notes: string;
  created_at: string;
}

export interface Notification {
  id: number;
  type: "recommendation" | "upload" | "system";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface UserSettings {
  llm_model: string;
  confidence_threshold: number;
  theme: string;
  business_rules: string[];
}

export interface DashboardAnalytics {
  total_customers: number;
  active_recommendations: number;
  avg_health_score: number;
  high_risk_customers: number;
  revenue_at_risk: string;
}

export interface BusinessRule {
  id: number;
  title: string;
  description: string;
  category: string;
  condition_type: string;
  parameters_json: string;
  priority: number;
  is_enabled: boolean;
  created_at: string;
}

export interface ToolConnection {
  id: number;
  name: string;
  category: string;
  status: "healthy" | "warning" | "offline";
  latency_ms: number;
  last_sync: string;
  config_json: string;
}

export interface LearningItem {
  id: number;
  customer_id: string;
  outcome: string;
  accuracy: number;
  notes: string;
  pattern: string;
  playbook_updated: boolean;
  created_at: string;
}

export interface LearningData {
  learning_accuracy: number;
  patterns_discovered_count: number;
  timeline: LearningItem[];
}

export interface AgentPerformance {
  agent: string;
  latency: string;
  accuracy: string;
}

export interface ChurnTrend {
  month: string;
  churn: number;
  accuracy: number;
}

export interface ReportsData {
  accuracy: number;
  recommendation_total: number;
  playbook_success_rate: number;
  agent_performance: AgentPerformance[];
  churn_trends: ChurnTrend[];
}

export interface MemoryPartition {
  session_memory: Array<{ key: string; value: string; scope: string }>;
  customer_memory: Array<{ event: string; status: string; confidence: number }>;
  organization_memory: Array<{ rule_title: string; rule_priority: number; rule_category: string }>;
}

export interface ConversationThreads {
  transcripts: Array<{ filename: string; content: string; created_at: string }>;
  emails: Array<{ filename: string; content: string; created_at: string }>;
  tickets: Array<{ filename: string; content: string; created_at: string }>;
}

