import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Target, ShieldCheck, Zap, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function RecommendationSection({ recommendations, onDecisionSaved }: { recommendations: any[], onDecisionSaved: () => void }) {
  if (!recommendations.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Sparkles size={40} className="text-slate-200 mb-4" />
        <h3 className="text-lg font-bold text-slate-400 font-heading">Waiting for Intelligence Analysis</h3>
        <p className="text-sm text-slate-400 max-w-xs mt-2">Upload enterprise signals to receive explainable Next Best Actions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-heading flex items-center gap-2">
          <Target className="text-primary" />
          Strategic Recommendations
        </h2>
        <Badge variant="outline" className="text-xs font-bold border-primary/20 text-primary uppercase">
          {recommendations.length} Actions Available
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {recommendations.map((rec, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group relative overflow-hidden border-none shadow-sm hover:shadow-xl transition-all dark:bg-slate-900 border-l-4 border-l-primary">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="default" className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">Priority: High</Badge>
                          <Badge variant="success" className="text-[10px] font-bold uppercase tracking-wider">Confidence: {(rec.confidence_score * 100).toFixed(0)}%</Badge>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{rec.title}</h3>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                      {rec.details}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                          <Info size={12} /> Supporting Evidence
                        </p>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{rec.evidence}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-50/50 dark:border-emerald-800/20">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                          <Zap size={12} /> Est. Business Outcome
                        </p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold italic">Reduce churn probability by 40% within 30 days.</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-auto">
                      <Button className="rounded-full px-6 bg-primary hover:bg-primary/90 text-white font-bold h-10 gap-2">
                        Approve Action <ArrowRight size={16} />
                      </Button>
                      <Button variant="outline" className="rounded-full px-6 font-bold h-10 border-slate-200">Reject</Button>
                      <Button variant="ghost" className="rounded-full px-6 font-bold h-10 text-slate-500">Edit Proposal</Button>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-32 bg-slate-50 dark:bg-slate-800/50 flex md:flex-col items-center justify-center p-4 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Impact</p>
                      <div className="h-16 w-16 rounded-full bg-white dark:bg-slate-900 shadow-inner flex items-center justify-center border-4 border-primary/20">
                        <span className="text-lg font-black text-primary">A+</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
