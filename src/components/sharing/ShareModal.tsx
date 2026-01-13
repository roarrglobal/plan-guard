import { useState, useRef, useEffect } from "react";
import { X, Download, Linkedin, Link2, Copy, Check, Instagram } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShareImage } from "./ShareImage";
import html2canvas from "html2canvas";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  planPreview: string;
  blindSpotsCount: number;
  failureModesCount: number;
}

export function ShareModal({
  isOpen,
  onClose,
  planPreview,
  blindSpotsCount,
  failureModesCount,
}: ShareModalProps) {
  const { toast } = useToast();
  const shareImageRef = useRef<HTMLDivElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const shareUrl = "https://snag.app";
  
  const linkedInText = `Just stress-tested a big decision with Snag — found ${blindSpotsCount} blind spot${blindSpotsCount !== 1 ? "s" : ""} I hadn't considered. 

If you're facing a career move, product launch, or any high-stakes choice, this tool surfaces what could go wrong before it does.

Try it free: ${shareUrl}`;

  const instagramCaption = `Just snagged my decision 🎯

Found ${blindSpotsCount} blind spot${blindSpotsCount !== 1 ? "s" : ""} I completely missed.

Before your next big move, stress-test it → link in bio

#snag #premortem #decisionmaking #strategy`;

  // Generate preview when modal opens
  useEffect(() => {
    if (isOpen && shareImageRef.current) {
      generatePreview();
    }
  }, [isOpen]);

  const generatePreview = async () => {
    if (!shareImageRef.current) return;
    
    setIsGenerating(true);
    try {
      // Wait for fonts to load
      await document.fonts.ready;
      
      const canvas = await html2canvas(shareImageRef.current, {
        scale: 0.25, // Lower scale for preview
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      
      setPreviewUrl(canvas.toDataURL("image/png"));
    } catch (err) {
      console.error("Failed to generate preview:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!shareImageRef.current) return;
    
    setIsGenerating(true);
    try {
      await document.fonts.ready;
      
      const canvas = await html2canvas(shareImageRef.current, {
        scale: 2, // High quality for download
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      
      const link = document.createElement("a");
      link.download = "my-snag-analysis.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast({
        title: "Image downloaded!",
        description: "Open Instagram and share from your gallery.",
      });
    } catch (err) {
      console.error("Failed to download:", err);
      toast({
        title: "Download failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, "_blank", "width=600,height=600");
    
    // Copy text as fallback
    navigator.clipboard.writeText(linkedInText);
    toast({
      title: "LinkedIn opened",
      description: "Post text copied to clipboard",
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      toast({
        title: "Link copied!",
        description: shareUrl,
      });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(instagramCaption);
      setCopiedCaption(true);
      toast({
        title: "Caption copied!",
        description: "Ready to paste in Instagram",
      });
      setTimeout(() => setCopiedCaption(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Hidden share image for canvas generation */}
      <ShareImage
        ref={shareImageRef}
        planPreview={planPreview}
        blindSpotsCount={blindSpotsCount}
        failureModesCount={failureModesCount}
        variant="square"
      />

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[360px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-[20px] font-bold text-[#1A1A1A]" style={{ fontFamily: 'Inter' }}>
                Share Your Snag
              </DialogTitle>
            </div>
            <DialogDescription className="sr-only">
              Share your analysis on social media or download as an image
            </DialogDescription>
          </DialogHeader>

          {/* Preview Card */}
          <div className="px-6 pb-4">
            <div className="border border-[#E5E5E5] rounded-lg overflow-hidden bg-[#FAFAFA]">
              {isGenerating ? (
                <div className="aspect-square flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-[#E5E5E5] border-t-[#0047AB] rounded-full animate-spin" />
                </div>
              ) : previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Share preview" 
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="aspect-square flex items-center justify-center text-[#999999] text-sm">
                  Generating preview...
                </div>
              )}
            </div>
          </div>

          {/* Share Options */}
          <div className="px-6 pb-6 space-y-3">
            <Button
              onClick={handleDownloadImage}
              disabled={isGenerating}
              className="w-full bg-[#0047AB] hover:bg-[#003A8C] text-white font-medium py-3 h-12"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Image
            </Button>

            <Button
              onClick={handleShareLinkedIn}
              className="w-full bg-[#0077B5] hover:bg-[#006699] text-white font-medium py-3 h-12"
            >
              <Linkedin className="w-4 h-4 mr-2" />
              Share to LinkedIn
            </Button>

            <Button
              onClick={handleCopyCaption}
              variant="outline"
              className="w-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white border-0 font-medium py-3 h-12 hover:opacity-90"
            >
              {copiedCaption ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Caption Copied!
                </>
              ) : (
                <>
                  <Instagram className="w-4 h-4 mr-2" />
                  Copy Instagram Caption
                </>
              )}
            </Button>

            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full bg-[#F2F2F2] hover:bg-[#E8E8E8] text-[#333333] border-[#E0E0E0] font-medium py-3 h-12"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>

          {/* Tip */}
          <div className="px-6 pb-6">
            <p className="text-[12px] text-[#999999] text-center">
              Tip: Download the image and share it on Instagram with the caption
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
