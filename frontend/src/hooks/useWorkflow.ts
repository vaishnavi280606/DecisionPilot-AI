import { useState, useCallback } from 'react';
import { analyzeCustomer, uploadFiles } from '../lib/api';
import { Recommendation, SourceType } from '../lib/types';

export function useWorkflow(customerId: string) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Recommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startAnalysis = useCallback(async () => {
    setIsRunning(true);
    setProgress(10);
    setCurrentStep('Planner: Drafting analysis strategy...');
    setError(null);

    try {
      // In a real implementation, we would listen to a WebSocket or SSE stream here.
      // For now, we simulate the agent steps for a premium UX feel while the backend works.
      
      const steps = [
        { label: 'Transcript Agent: Analyzing sentiment and commitments...', p: 25 },
        { label: 'CRM Agent: Syncing lifecycle and revenue signals...', p: 40 },
        { label: 'Support Agent: Identifying recurring friction patterns...', p: 60 },
        { label: 'Knowledge Agent: Retrieving strategic playbooks...', p: 75 },
        { label: 'Risk Agent: Computing health and churn indices...', p: 85 },
        { label: 'Recommendation Agent: Finalizing next-best-actions...', p: 95 },
      ];

      for (const step of steps) {
        setCurrentStep(step.label);
        setProgress(step.p);
        await new Promise(r => setTimeout(r, 800)); // Simulate agent "thinking" time
      }

      const rec = await analyzeCustomer(customerId);
      setResult(rec);
      setProgress(100);
      setCurrentStep('Analysis Complete');
    } catch (err) {
      setError('AI Orchestration failed. Check backend logs.');
      setCurrentStep('Error');
    } finally {
      setIsRunning(false);
    }
  }, [customerId]);

  const handleUploadAndAnalyze = useCallback(async (type: SourceType, files: File[]) => {
    setIsRunning(true);
    setCurrentStep(`Ingesting ${files.length} signals...`);
    try {
      await uploadFiles(customerId, type, files);
      await startAnalysis();
    } catch (err) {
      setError('Signal ingestion failed.');
      setIsRunning(false);
    }
  }, [customerId, startAnalysis]);

  return {
    isRunning,
    currentStep,
    progress,
    result,
    error,
    startAnalysis,
    handleUploadAndAnalyze
  };
}
