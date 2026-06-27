import { useMemo, useState } from "react";

import { takeAction } from "@/lib/api";
import { Recommendation } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface RecommendationPanelProps {
  recommendations: Recommendation[];
  onDecisionSaved: () => void;
}

export function RecommendationPanel({ recommendations, onDecisionSaved }: RecommendationPanelProps) {
  const [editedAction, setEditedAction] = useState("");
  const [outcomeNotes, setOutcomeNotes] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const recommendation = useMemo(() => recommendations[0], [recommendations]);

  const submitDecision = async (decision: "approved" | "rejected" | "edited") => {
    if (!recommendation) {
      return;
    }
    try {
      const apiDecision = decision === "rejected" ? "rejected" : "approved";
      await takeAction(recommendation.id, {
        decision: apiDecision,
        edited_action: editedAction,
        outcome_notes: outcomeNotes,
      });
      setStatusMessage("Decision saved to memory and history.");
      onDecisionSaved();
    } catch {
      setStatusMessage("Could not save decision.");
    }
  };

  if (!recommendation) {
    return (
      <Card className="animate-slide-in">
        <CardHeader>
          <CardTitle>Recommendations + Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Run analysis to generate next-best-action recommendations.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-slide-in">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Recommendations + Approval</CardTitle>
          <Badge className="bg-cyan-100 text-cyan-700">
            Confidence {(recommendation.confidence_score * 100).toFixed(0)}%
          </Badge>
        </div>
        <h4 className="font-heading text-lg">{recommendation.title}</h4>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed text-slate-700">{recommendation.details}</p>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:bg-blue-50">
            <h5 className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-800">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Evidence Signals
            </h5>
            <p className="text-sm leading-snug text-slate-700/90">{recommendation.evidence}</p>
          </div>
          
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:bg-emerald-50">
            <h5 className="mb-2 flex items-center gap-2 text-sm font-bold text-emerald-800">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Strategic Explainability
            </h5>
            <p className="text-sm leading-snug text-slate-700/90">
              {recommendation.reasoning_chain && recommendation.reasoning_chain.length > 0 
                ? recommendation.reasoning_chain.join(" → ") 
                : recommendation.details}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">Edit Action (optional)</label>
          <Textarea value={editedAction} onChange={(event) => setEditedAction(event.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">Outcome Notes (optional)</label>
          <Textarea value={outcomeNotes} onChange={(event) => setOutcomeNotes(event.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => submitDecision("approved")}>Approve</Button>
          <Button variant="destructive" onClick={() => submitDecision("rejected")}>Reject</Button>
          <Button variant="secondary" onClick={() => submitDecision("edited")}>Approve with Edit</Button>
        </div>
        {statusMessage ? <p className="text-xs text-slate-600">{statusMessage}</p> : null}
      </CardContent>
    </Card>
  );
}
