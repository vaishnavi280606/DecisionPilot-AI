import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, MoreHorizontal, ArrowUpRight, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCustomers } from "../../hooks/useCustomers";

export function CustomerListView({ onSelectCustomer }: { onSelectCustomer: (id: string) => void }) {
  const { customers, loading } = useCustomers();
  const [filter, setFilter] = useState("");

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(filter.toLowerCase()) || 
    c.customer_id.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight text-slate-800 dark:text-white uppercase">Enterprise Portfolio</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage and monitor strategic accounts at scale.</p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search accounts..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 h-11 bg-slate-50/50 border-none rounded-xl focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-24 w-full bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
          ))
        ) : (
          filtered.map((customer) => (
            <motion.div 
              key={customer.id}
              whileHover={{ y: -2 }}
              onClick={() => onSelectCustomer(customer.customer_id)}
              className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{customer.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0">{customer.tier}</Badge>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{customer.customer_id}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-4 md:mt-0 px-4">
                <div className="text-center md:text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Health Score</p>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${customer.health_score}%` }} />
                    </div>
                    <span className="text-xs font-black text-emerald-600 italic">%{customer.health_score}</span>
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Churn Risk</p>
                  <p className={`text-sm font-black ${customer.churn_risk > 0.5 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                    {(customer.churn_risk * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="hidden md:block">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Contract Value</p>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-300">{customer.revenue}</p>
                </div>
                <div className="hidden md:block">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Renewal</p>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-300 italic">{customer.contract_renewal}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <Button size="icon" variant="ghost" className="rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                  <ArrowUpRight size={18} />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
