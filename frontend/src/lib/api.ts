import axios from "axios";
import { 
  Customer, 
  HistoryItem, 
  Recommendation, 
  SourceType, 
  Notification, 
  UserSettings, 
  DashboardAnalytics,
  BusinessRule,
  ToolConnection,
  LearningData,
  ReportsData,
  MemoryPartition,
  ConversationThreads
} from "./types";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// --- Customer APIs ---
export async function getCustomers() {
  const { data } = await api.get<Customer[]>("/customers");
  return data;
}

export async function getCustomer(customerId: string) {
  const { data } = await api.get<Customer>(`/customer/${customerId}`);
  return data;
}

// --- Upload & Knowledge APIs ---
export async function uploadFiles(customerId: string, sourceType: SourceType, files: File[]) {
  const form = new FormData();
  form.append("customer_id", customerId);
  form.append("source_type", sourceType);
  files.forEach((file) => form.append("files", file));
  return api.post("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

// --- Analysis & AI APIs ---
export async function analyzeCustomer(customerId: string) {
  const { data } = await api.post<Recommendation>(`/analyze/${customerId}`);
  return data;
}

export async function getRecommendations(customerId: string) {
  const { data } = await api.get<Recommendation[]>(`/customer/${customerId}/recommendations`);
  return data;
}

export async function takeAction(
  recommendationId: number,
  payload: { decision: "approved" | "rejected"; edited_action?: string; outcome_notes?: string }
) {
  const { data } = await api.post<Recommendation>(`/recommendations/${recommendationId}/action`, payload);
  return data;
}

// --- Notification APIs ---
export async function getNotifications() {
  const { data } = await api.get<Notification[]>("/notifications");
  return data;
}

export async function markNotificationsRead() {
  return api.put("/notifications/read");
}

// --- Settings & Analytics APIs ---
export async function getSettings() {
  const { data } = await api.get<UserSettings>("/settings");
  return data;
}

export async function updateSettings(settings: UserSettings) {
  const { data } = await api.put<UserSettings>("/settings", settings);
  return data;
}

export async function getAnalytics() {
  const { data } = await api.get<DashboardAnalytics>("/analytics");
  return data;
}

export async function getHistory(customerId: string) {
  const { data } = await api.get<HistoryItem[]>(`/customer/${customerId}/history`);
  return data;
}

export async function getReports() {
  const { data } = await api.get<ReportsData>("/reports");
  return data;
}

export async function getMemory(customerId: string) {
  const { data } = await api.get<MemoryPartition>(`/customer/${customerId}/memory`);
  return data;
}

export async function getConversations(customerId: string) {
  const { data } = await api.get<ConversationThreads>(`/customer/${customerId}/conversations`);
  return data;
}

// --- Business Rules APIs ---
export async function getRules() {
  const { data } = await api.get<BusinessRule[]>("/rules");
  return data;
}

export async function createRule(payload: Omit<BusinessRule, 'id' | 'created_at'>) {
  const { data } = await api.post<BusinessRule>("/rules", payload);
  return data;
}

export async function updateRule(id: number, payload: Omit<BusinessRule, 'id' | 'created_at'>) {
  const { data } = await api.put<BusinessRule>(`/rules/${id}`, payload);
  return data;
}

export async function deleteRule(id: number) {
  const { data } = await api.delete<{ message: string }>(`/rules/${id}`);
  return data;
}

export async function testRules(payload: { health: number; revenue: number; competitors: string[] }) {
  const { data } = await api.post("/rules/test", payload);
  return data;
}

// --- Tool Connections APIs ---
export async function getConnections() {
  const { data } = await api.get<ToolConnection[]>("/connections");
  return data;
}

export async function testConnection(name: string) {
  const { data } = await api.post<ToolConnection>(`/connections/${name}/test`);
  return data;
}

export async function reconnectConnection(name: string) {
  const { data } = await api.post<ToolConnection>(`/connections/${name}/reconnect`);
  return data;
}

export async function configureConnection(name: string, configJson: string) {
  const { data } = await api.put<ToolConnection>(`/connections/${name}/config`, { config_json: configJson });
  return data;
}

// --- Continuous Learning APIs ---
export async function getLearning() {
  const { data } = await api.get<LearningData>("/learning");
  return data;
}

// --- Re-seeding API ---
export async function reseedDatabase() {
  const { data } = await api.post<{ message: string }>("/seed");
  return data;
}

export async function globalSearch(query: string) {
  const { data } = await api.get(`/search?q=${query}`);
  return data;
}

