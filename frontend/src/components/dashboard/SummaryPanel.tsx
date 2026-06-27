import { AlertTriangle, Sparkles } from "lucide-react";

import { SummaryResponse } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SummaryPanelProps {
  summary: SummaryResponse;
}

export function SummaryPanel({ summary }: SummaryPanelProps) {
  const riskScore = (summary.churn_risk ?? 0) * 100;

  return (
    <Card className="animate-slide-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Customer Summary</CardTitle>
          <Badge className="gap-1 bg-orange-100 text-orange-700">
            <AlertTriangle size={14} />
            Risk Index
          </Badge>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Aggregated Risk Score</span>
            <span>{riskScore.toFixed(0)} / 100</span>
          </div>
          <Progress value={riskScore} className={riskScore > 70 ? "bg-red-500" : riskScore > 40 ? "bg-orange-500" : "bg-emerald-500"} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed text-slate-700">{summary.summary}</p>
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Key Insights</h4>
          {summary.key_insights.length ? (
            <ul className="space-y-1 text-sm text-slate-700">
              {summary.key_insights.map((insight) => (
                <li key={insight} className="flex items-start gap-2">
                  <Sparkles className="mt-0.5" size={14} />
                  {insight}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Run analysis to generate insights.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
