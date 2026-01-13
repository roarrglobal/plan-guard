import { useState, useCallback } from "react";
import { Upload, X, FileText, Image, File } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File, context: string) => void;
  isLoading?: boolean;
}

const ACCEPTED_TYPES = {
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "text/plain": "TXT",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function DocumentUploadModal({
  open,
  onOpenChange,
  onUpload,
  isLoading = false,
}: DocumentUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [context, setContext] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    if (!Object.keys(ACCEPTED_TYPES).includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, Word document, image (JPG/PNG), or text file.",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSubmit = () => {
    if (file) {
      onUpload(file, context);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="w-8 h-8 text-[#0047AB]" />;
    if (type === "application/pdf") return <FileText className="w-8 h-8 text-[#D64045]" />;
    return <File className="w-8 h-8 text-[#666666]" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleClose = () => {
    setFile(null);
    setContext("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle
            className="text-[20px] font-bold text-[#1A1A1A]"
            style={{ fontFamily: "Inter" }}
          >
            Upload for Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Supported formats */}
          <p className="text-[13px] text-[#666666]">
            Supported: PDF, Word (.doc, .docx), Images (JPG, PNG), Text (.txt) • Max 10MB
          </p>

          {/* Drop zone */}
          {!file ? (
            <div
              className={`relative border-2 border-dashed rounded-xl h-[160px] flex flex-col items-center justify-center gap-3 transition-colors ${
                dragActive
                  ? "border-[#0047AB] bg-[#F0F7FF]"
                  : "border-[#E0E0E0] bg-[#F8F8F8]"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-10 h-10 text-[#999999]" />
              <p className="text-[14px] text-[#666666]">
                Drop file here or{" "}
                <label className="text-[#0047AB] cursor-pointer hover:underline">
                  click to browse
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                    onChange={handleFileSelect}
                  />
                </label>
              </p>
            </div>
          ) : (
            <div className="border border-[#E0E0E0] rounded-xl p-4 bg-white">
              <div className="flex items-center gap-3">
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[#1A1A1A] truncate">
                    {file.name}
                  </p>
                  <p className="text-[12px] text-[#666666]">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="text-[#666666] hover:text-[#D64045] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Context input */}
          <div className="space-y-2">
            <label className="text-[14px] font-medium text-[#1A1A1A]">
              What decision does this relate to?{" "}
              <span className="text-[#999999] font-normal">(optional)</span>
            </label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., This is a job offer I received..."
              className="resize-none h-[80px] text-[14px]"
            />
          </div>

          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={!file || isLoading}
            className="w-full bg-[#BE3455] hover:bg-[#A02D48] text-white font-semibold"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-pulse">Processing</span>
                <span className="flex gap-0.5">
                  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                </span>
              </span>
            ) : (
              "Analyze Document"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
