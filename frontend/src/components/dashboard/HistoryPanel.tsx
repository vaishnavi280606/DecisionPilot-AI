import { HistoryItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HistoryPanelProps {
  history: HistoryItem[];
}

export function HistoryPanel({ history }: HistoryPanelProps) {
  return (
    <Card className="animate-slide-in">
      <CardHeader>
        <CardTitle>Recommendation History</CardTitle>
      </CardHeader>
      <CardContent>
        {!history.length ? (
          <p className="text-sm text-slate-500">No historical decisions recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={`${item.recommendation_id}-${item.created_at}`} className="rounded-xl border border-border p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h4 className="font-semibold">{item.title}</h4>
                  <Badge>{item.decision.toUpperCase()}</Badge>
                </div>
                {item.edited_action ? <p className="text-sm text-slate-700">Edited action: {item.edited_action}</p> : null}
                {item.outcome_notes ? <p className="text-sm text-slate-700">Outcome: {item.outcome_notes}</p> : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
