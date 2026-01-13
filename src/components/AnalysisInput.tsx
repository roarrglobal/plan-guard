import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { DocumentUploadModal } from "@/components/upload/DocumentUploadModal";
import { UpgradePromptModal } from "@/components/upload/UpgradePromptModal";
import LimitReachedModal from "@/components/usage/LimitReachedModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useUsage } from "@/hooks/useUsage";

interface AnalysisInputProps {
  onSubmit: (text: string) => void;
  isLoading?: boolean;
  className?: string;
  placeholder?: string;
  compact?: boolean;
  showAttachLink?: boolean;
}

const MAX_CHARS = 1000;
const MIN_CHARS = 20;

export function AnalysisInput({
  onSubmit,
  isLoading = false,
  className,
  placeholder = "Describe your plan or decision...",
  compact = false,
  showAttachLink = true,
}: AnalysisInputProps) {
  const [text, setText] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [limitType, setLimitType] = useState<"analysis" | "document" | "storage">("document");
  const [isUploading, setIsUploading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { tier, canUseFeatureSync, canUploadFile, refetch: refetchUsage } = useUsage();
  
  // Check if user has Pro tier or higher
  const isPro = tier !== "free";

  const charCount = text.length;
  const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;
  const charCountColor = charCount > MAX_CHARS 
    ? "text-destructive" 
    : charCount >= MIN_CHARS 
      ? "text-success" 
      : "text-muted-foreground";

  const handleSubmit = () => {
    if (isValid && !isLoading) {
      onSubmit(text);
    }
  };

  const handleAttachClick = () => {
    if (!isPro) {
      setUpgradeModalOpen(true);
      return;
    }
    
    // Check document upload limit
    if (!canUseFeatureSync("document_upload")) {
      setLimitType("document");
      setLimitModalOpen(true);
      return;
    }
    
    setUploadModalOpen(true);
  };

  const handleDocumentUpload = async (file: File, context: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to upload documents.",
        variant: "destructive",
      });
      return;
    }

    // Check storage limit
    if (!canUploadFile(file.size)) {
      setLimitType("storage");
      setLimitModalOpen(true);
      setUploadModalOpen(false);
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to Supabase Storage
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("analysis-uploads")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error("Failed to upload file");
      }

      // Get the file URL
      const { data: urlData } = supabase.storage
        .from("analysis-uploads")
        .getPublicUrl(filePath);

      // Determine source type
      let sourceType = "text";
      if (file.type === "application/pdf") sourceType = "pdf";
      else if (file.type.includes("word")) sourceType = "docx";
      else if (file.type.startsWith("image/")) sourceType = "image";

      let extractedText = "";
      let imageBase64 = "";

      // Handle different file types
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else if (file.type === "text/plain") {
        extractedText = await file.text();
      } else {
        extractedText = `[Document: ${file.name}]\n\nNote: Full text extraction for PDF/DOCX files requires additional processing.`;
        if (context) {
          extractedText = `Document uploaded: ${file.name}\n\nUser's description: ${context}`;
        }
      }

      // Call the analyze-document edge function
      const { data, error } = await supabase.functions.invoke("analyze-document", {
        body: {
          extractedText,
          userContext: context,
          sourceType,
          imageBase64: sourceType === "image" ? imageBase64 : undefined,
          mimeType: sourceType === "image" ? file.type : undefined,
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Save analysis to database
      const analysisResult = data.analysis;
      const { error: saveError } = await supabase.from("analyses").insert({
        user_id: user.id,
        original_input: context || `Document analysis: ${file.name}`,
        result: analysisResult,
        category: analysisResult.category || "other",
        title: analysisResult.documentType || file.name,
        source_type: sourceType,
        source_file_url: urlData.publicUrl,
      });

      if (saveError) {
        console.error("Failed to save analysis:", saveError);
      }

      // Refetch usage to update counts
      refetchUsage();

      setUploadModalOpen(false);
      
      toast({
        title: "Analysis complete!",
        description: "Your document has been analyzed.",
      });

      navigate("/dashboard");
      
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to analyze document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className={cn("w-full", className)}>
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className={cn(
              "w-full bg-white border border-[#E0E0E0] rounded-lg px-4 py-4 text-[16px] text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:border-[#0047AB] transition-colors resize-none",
              compact ? "min-h-[120px]" : "min-h-[180px]",
              "leading-relaxed"
            )}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey && isValid) {
                handleSubmit();
              }
            }}
          />
          
          <div className="flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-4">
              <span className={cn("text-sm font-medium transition-colors", charCountColor)}>
                {charCount}/{MAX_CHARS}
              </span>
              
              {showAttachLink && (
                <button
                  onClick={handleAttachClick}
                  className="flex items-center gap-1.5 text-[14px] text-[#0047AB] hover:text-[#003A8C] transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                  Attach document
                </button>
              )}
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isLoading}
              className="bg-[#BE3455] hover:bg-[#A02D48] text-white font-semibold px-6 py-3 rounded-lg gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-pulse">Analyzing</span>
                  <span className="flex gap-0.5">
                    <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                  </span>
                </>
              ) : (
                <>
                  Analyze
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </div>
        
        {charCount > 0 && charCount < MIN_CHARS && (
          <p className="text-sm text-muted-foreground mt-2">
            Need at least {MIN_CHARS - charCount} more characters
          </p>
        )}
      </div>

      <DocumentUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUpload={handleDocumentUpload}
        isLoading={isUploading}
      />

      <UpgradePromptModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
      />

      <LimitReachedModal
        open={limitModalOpen}
        onOpenChange={setLimitModalOpen}
        limitType={limitType}
        currentTier={tier}
      />
    </>
  );
}
