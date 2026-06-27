import { useState } from "react";
import { Search, FileText, Database, ShieldCheck, Cpu, HardDrive } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UploadPanel } from "../dashboard/UploadPanel";

interface SearchResult {
  docName: string;
  chunk: string;
  confidence: number;
  tokens: number;
}

export function KnowledgeExplorerView({ customerId }: { customerId: string }) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [latency, setLatency] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Mock data for indexed documents
  const indexedFiles = [
    { id: 1, title: "Executive Churn Deflection Playbook v2.1", type: "PDF", date: "2026-05-12", chunks: 14, embeddings: "1,400", status: "Indexed" },
    { id: 2, title: "SLA Billing Compensation Guidelines", type: "DOCX", date: "2026-06-01", chunks: 8, embeddings: "800", status: "Indexed" },
    { id: 3, title: "Customer Success Escalation Hierarchy", type: "PDF", date: "2026-06-15", chunks: 11, embeddings: "1,100", status: "Processed" },
  ];

  const handleKbSearch = () => {
    if (!query) return;
    setIsSearching(true);
    // Simulate vector search latency
    setTimeout(() => {
      setSearchResults([
        {
          docName: "SLA Billing Compensation Guidelines.docx",
          chunk: "Chunk #4: In cases where system uptime falls below 95.0% for more than 4 hours, enterprise Tier 1 customers are entitled to a 10% contract value credit compensation, subject to CS VP review.",
          confidence: 0.94,
          tokens: 142
        },
        {
          docName: "Executive Churn Deflection Playbook v2.1.pdf",
          chunk: "Chunk #12: Churn intervention protocols must be triggered when customer health scores drop below 60%. Pre-approved concessions include matching competitor integration offerings.",
          confidence: 0.88,
          tokens: 184
        }
      ]);
      setLatency("14ms");
      setIsSearching(false);
    }, 400);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold font-heading tracking-tight uppercase">Enterprise Knowledge Base</h1>
          <p className="text-slate-500 text-sm mt-1 mb-8">Query, index, and analyze playbooks across the local vector database cluster.</p>
          
          <div className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="Search playbooks, transcripts, or vector chunks..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleKbSearch()}
                className="pl-10 h-12 bg-slate-50/50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>
            <Button onClick={handleKbSearch} disabled={isSearching} className="rounded-xl px-8 h-12 shadow-xl shadow-primary/20 font-bold text-xs uppercase">
              {isSearching ? "Searching..." : "Find Answers"}
            </Button>
          </div>
        </div>
        
        <div className="absolute right-[-10%] top-[-20%] opacity-5">
          <Database size={300} className="text-primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Search Results / Indexed Files */}
        <div className="md:col-span-2 space-y-6">
          {/* Matching documents / vector chunks */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Retrieved Context & Chunks</h3>
                {latency && <span className="text-[10px] text-primary font-mono font-bold">Latency: {latency}</span>}
              </div>
              
              <div className="space-y-4">
                {searchResults.map((res, idx) => (
                  <Card key={idx} className="p-5 bg-slate-950 text-slate-200 border border-slate-800 rounded-3xl space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-900 font-sans">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-primary" />
                        <span className="text-xs font-bold text-white uppercase">{res.docName}</span>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-bold text-[8px] uppercase">
                        Score: {(res.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-350 font-mono italic">
                      {res.chunk}
                    </p>
                    <div className="text-[9px] text-slate-500 font-bold">Tokens: {res.tokens}</div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Indexed Files checklist */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Indexed Signal Files</h3>
            <div className="space-y-3">
              {indexedFiles.map(doc => (
                <div key={doc.id} className="group flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-tight">{doc.title}</h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{doc.type}</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                        <span className="text-[10px] text-slate-400 font-bold">{doc.chunks} chunks</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                        <span className="text-[10px] text-slate-400 font-bold">{doc.embeddings} embeddings</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] font-bold py-0.5 uppercase">{doc.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Global Uploads & Performance metrics */}
        <div className="space-y-6">
          <UploadPanel customerId={customerId || "global-silo"} onUploaded={() => {}} />

          <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-xl shadow-slate-900/10">
            <ShieldCheck className="text-primary mb-4" size={32} />
            <h4 className="font-bold uppercase tracking-tight text-sm mb-2">Vector Security</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              All documents are ingested via 256-bit AES encryption and stored in a multi-tenant vector silo. 
              Embeddings are refreshed automatically upon file modification.
            </p>
          </div>

          <div className="p-6 border border-slate-100 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-4">
              <HardDrive size={18} className="text-violet-500" />
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Vector Storage Metrics</h4>
            </div>
            
            <div className="space-y-4 text-xs font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Total Collections</span>
                <span className="font-bold">8 active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Total Vectors</span>
                <span className="font-bold">1,248,902</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Avg Retrieval Latency</span>
                <span className="font-bold text-emerald-500 italic">14ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
