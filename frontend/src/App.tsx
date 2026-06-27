import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { CustomerListView } from "./components/views/CustomerListView";
import { CustomerDetailView } from "./components/views/CustomerDetailView";
import { BusinessDashboardView } from "./components/views/BusinessDashboardView";
import { OperationalDashboardView } from "./components/views/OperationalDashboardView";
import { WorkflowMonitorView } from "./components/views/WorkflowMonitorView";
import { RecommendationsView } from "./components/views/RecommendationsView";
import { KnowledgeExplorerView } from "./components/views/KnowledgeExplorerView";
import { MemoryHubView } from "./components/views/MemoryHubView";
import { ReportsView } from "./components/views/ReportsView";
import { SettingsView } from "./components/views/SettingsView";
import { LoginView } from "./components/views/LoginView";
import { useSystem } from "./hooks/useSystem";
import { Info, HelpCircle, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardSubTab, setDashboardSubTab] = useState("business");
  const [customerId, setCustomerId] = useState("nexus-corp");
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  const { settings, notifications, clearNotifications, refreshSystem } = useSystem();

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCustomerSelect = (id: string) => {
    setCustomerId(id);
    setActiveTab("customer-detail");
  };

  // WebSocket notifications sync
  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname || "localhost"}:8000/api/ws`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "notification") {
          showNotification(`${data.notification.title}: ${data.notification.message}`);
          refreshSystem(); // Refresh standard notifications tray
        }
      } catch (err) {
        console.error("WS error in App shell:", err);
      }
    };
    return () => ws.close();
  }, [refreshSystem]);

  const currentView = useMemo(() => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Tabs value={dashboardSubTab} onValueChange={setDashboardSubTab} className="w-64">
                <TabsList className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-0.5">
                  <TabsTrigger value="business" className="text-[10px] font-black uppercase rounded-lg">Business View</TabsTrigger>
                  <TabsTrigger value="operational" className="text-[10px] font-black uppercase rounded-lg">Operations View</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {dashboardSubTab === "business" ? (
              <BusinessDashboardView onSelectCustomer={handleCustomerSelect} onNavigateToView={setActiveTab} />
            ) : (
              <OperationalDashboardView />
            )}
          </div>
        );
      case "customers":
        return <CustomerListView onSelectCustomer={handleCustomerSelect} />;
      case "customer-detail":
        return <CustomerDetailView customerId={customerId} onBack={() => setActiveTab("customers")} />;
      case "workflow-monitor":
        return <WorkflowMonitorView />;
      case "recommendations":
        return <RecommendationsView />;
      case "kb":
        return <KnowledgeExplorerView customerId={customerId} />;
      case "memory":
        return <MemoryHubView />;
      case "reports":
        return <ReportsView />;
      case "settings":
        return <SettingsView settings={settings} onUpdate={refreshSystem} />;
      default:
        return <BusinessDashboardView onSelectCustomer={handleCustomerSelect} onNavigateToView={setActiveTab} />;
    }
  }, [activeTab, dashboardSubTab, customerId, settings, refreshSystem]);

  if (!isLoggedIn) {
    return <LoginView onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex h-screen bg-slate-50/50 dark:bg-slate-950 font-sans selection:bg-primary/10 overflow-hidden text-slate-900 dark:text-slate-100">
      <Sidebar activeItem={activeTab} onItemSelect={setActiveTab} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          notifications={notifications}
          onSearch={setSearchQuery}
          onClearNotifications={clearNotifications}
          onProfileClick={() => showNotification("Profile management is governed by AD Group permissions.")}
        />
        
        <main className="flex-1 overflow-y-auto px-8 py-8 scrollbar-hide">
          <div className="mx-auto max-w-7xl px-4">
            <AnimatePresence>
              {notification && (
                <motion.div
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700/50 backdrop-blur-xl"
                >
                  <Info className="text-primary animate-pulse" size={18} />
                  <span className="text-xs font-bold tracking-tight">{notification}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + "_" + dashboardSubTab}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
              >
                {currentView}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

