import { useState } from "react";
import { Zap, Compass, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { DocumentUploadModal } from "@/components/upload/DocumentUploadModal";
import { UpgradePromptModal } from "@/components/upload/UpgradePromptModal";
import LimitReachedModal from "@/components/usage/LimitReachedModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUsage } from "@/hooks/useUsage";

export function DashboardQuickActionsEnhanced() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { tier, canUseFeatureSync, canUploadFile, refetch: refetchUsage } = useUsage();
  
  const isPro = tier !== "free";
  
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [limitType, setLimitType] = useState<"analysis" | "document" | "storage">("document");
  const [isUploading, setIsUploading] = useState(false);

  const handleProFeature = (feature: string) => {
    toast({
      title: "Coming Soon",
      description: `${feature} will be available in the Pro plan.`,
    });
  };

  const handleUploadClick = () => {
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
      <div className="mb-6">
        <h2
          className="text-[16px] font-semibold text-[#1A1A1A] mb-3"
          style={{ fontFamily: "Inter" }}
        >
          What's on your mind?
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {/* Quick Snag - Primary */}
          <button
            onClick={() => navigate("/analyze")}
            className="flex flex-col items-center justify-center gap-2 bg-[#0047AB] text-white rounded-xl p-4 min-h-[100px] hover:bg-[#003A8C] transition-colors"
          >
            <Zap className="w-6 h-6" />
            <span className="text-[13px] font-medium">Quick Snag</span>
          </button>

          {/* Deep Snag - Pro */}
          <button
            onClick={() => handleProFeature("Deep Snag wizard")}
            className="relative flex flex-col items-center justify-center gap-2 bg-white border border-[#0047AB] text-[#0047AB] rounded-xl p-4 min-h-[100px] hover:bg-[#F0F7FF] transition-colors"
          >
            <Compass className="w-6 h-6" />
            <span className="text-[13px] font-medium">Deep Snag</span>
            <span className="absolute top-2 right-2 text-[9px] font-bold bg-[#0047AB] text-white px-1.5 py-0.5 rounded">
              PRO
            </span>
          </button>

          {/* Upload & Snag */}
          <button
            onClick={handleUploadClick}
            className={`relative flex flex-col items-center justify-center gap-2 rounded-xl p-4 min-h-[100px] transition-colors ${
              isPro
                ? "bg-white border border-[#0047AB] text-[#0047AB] hover:bg-[#F0F7FF]"
                : "bg-white border border-[#E5E5E5] text-[#666666] hover:bg-[#F8F8F8]"
            }`}
          >
            <Upload className="w-6 h-6" />
            <span className="text-[13px] font-medium">Upload</span>
            {!isPro && (
              <span className="absolute top-2 right-2 text-[9px] font-bold bg-[#666666] text-white px-1.5 py-0.5 rounded">
                PRO
              </span>
            )}
          </button>
        </div>
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
