import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Mail, ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginViewProps {
  onLogin: () => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState("admin@decisionpilot.ai");
  const [password, setPassword] = useState("••••••••••••");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate premium validation delay
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1200);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#05070f] overflow-hidden">
      {/* 1. Neon Radial Background Glows */}
      <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />

      {/* 2. Abstract Particle Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* 3. Login Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md px-4 z-10"
      >
        <Card className="p-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-[32px] shadow-2xl relative overflow-hidden">
          {/* Subtle top light reflection */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="space-y-6">
            {/* Logo and Brand Header */}
            <div className="text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/25">
                <Shield className="text-white" size={24} />
              </div>
              <h1 className="text-xl font-black font-heading uppercase tracking-tight text-white mt-4 flex items-center justify-center gap-1.5">
                DecisionPilot <span className="text-primary font-light text-sm tracking-widest font-sans">AI</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                Enterprise Agentic Decision System
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Security Credentials</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 bg-slate-950/50 border-slate-800 rounded-xl text-xs text-white placeholder-slate-600"
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Access Key</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-12 bg-slate-950/50 border-slate-800 rounded-xl text-xs text-white placeholder-slate-600"
                    placeholder="Enter access key"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 mt-6 group"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Connecting Gateway...</span>
                  </>
                ) : (
                  <>
                    <span>Access Platform Gateway</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {/* Sandbox Notice Banner */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2 text-[10px] text-slate-400 font-semibold justify-center">
              <Sparkles size={12} className="text-primary animate-pulse" />
              <span>Sandbox Access Configured (Active Directories Synced)</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
