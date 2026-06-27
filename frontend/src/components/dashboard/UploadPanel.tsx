import { useState } from "react";

import { uploadFiles } from "@/lib/api";
import { SourceType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface UploadPanelProps {
  customerId: string;
  onUploaded: () => void;
}

const sourceOptions: SourceType[] = ["transcript", "crm", "support", "email", "knowledge_base"];

export function UploadPanel({ customerId, onUploaded }: UploadPanelProps) {
  const [sourceType, setSourceType] = useState<SourceType>("transcript");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState("");

  const onSubmit = async () => {
    if (!customerId || files.length === 0) {
      setStatus("Enter a customer ID and select at least one file.");
      return;
    }
    try {
      await uploadFiles(customerId, sourceType, files);
      setStatus("Upload completed and indexed.");
      setFiles([]);
      onUploaded();
    } catch (error) {
      setStatus("Upload failed. Ensure the backend is running and file type is supported.");
    }
  };

  return (
    <Card className="animate-slide-in">
      <CardHeader>
        <CardTitle>Data Uploads</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="text-sm font-semibold">Source Type</label>
        <select
          value={sourceType}
          onChange={(event) => setSourceType(event.target.value as SourceType)}
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
        >
          {sourceOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <label className="text-sm font-semibold">Files (PDF, DOCX, CSV, TXT/MD, EML)</label>
        <Input type="file" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
        <Button onClick={onSubmit} className="w-full">
          Upload Data
        </Button>
        {status ? <p className="text-xs text-slate-600">{status}</p> : null}
      </CardContent>
    </Card>
  );
}
