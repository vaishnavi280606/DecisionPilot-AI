import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  title: string;
  subtitle: string;
  icon: any;
}

export function FileUpload({ onUpload, title, subtitle, icon: Icon }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsUploading(true);
    // Simulate upload delay for premium feel
    setTimeout(() => {
      onUpload(acceptedFiles);
      setIsUploading(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1500);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group relative cursor-pointer rounded-2xl border-2 border-dashed p-6 transition-all duration-300 ease-in-out",
        isDragActive ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900",
        isSuccess && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center text-center">
        <div className={cn(
          "mb-3 p-3 rounded-xl transition-transform group-hover:scale-110 duration-300",
          isSuccess ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400 group-hover:text-primary dark:bg-slate-800"
        )}>
          {isUploading ? <Loader2 className="animate-spin" size={24} /> : 
           isSuccess ? <CheckCircle size={24} /> : <Icon size={24} />}
        </div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h4>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 text-[10px] font-bold text-emerald-600 uppercase tracking-widest"
            >
              Upload Successful
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { SourceType } from "../../lib/types";

export function UploadSection({ onFilesSelected }: { onFilesSelected: (type: SourceType, files: File[]) => void }) {
  const uploadTypes: { id: SourceType; title: string; subtitle: string; icon: any }[] = [
    { id: "transcript", title: "Transcripts", subtitle: "JSON, TXT, DOCX", icon: Upload },
    { id: "crm", title: "CRM Data", subtitle: "CSV, JSON", icon: File },
    { id: "support", title: "Support Tickets", subtitle: "CSV, PDF", icon: AlertCircle },
    { id: "knowledge_base", title: "Knowledge Base", subtitle: "PDF, MD", icon: CheckCircle },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {uploadTypes.map((type) => (
        <FileUpload 
          key={type.id} 
          title={type.title} 
          subtitle={type.subtitle} 
          icon={type.icon} 
          onUpload={(files) => onFilesSelected(type.id, files)}
        />
      ))}
    </div>
  );
}
