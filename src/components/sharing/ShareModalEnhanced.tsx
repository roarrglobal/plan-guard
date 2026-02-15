import { useState, useRef, useEffect } from "react";
import { Download, Linkedin, Link2, Copy, Check, Instagram, X as XIcon, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ShareImage } from "./ShareImage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import html2canvas from "html2canvas";

interface ShareModalEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  planPreview: string;
  blindSpotsCount: number;
  failureModesCount: number;
  analysisId?: string;
  verdict?: string;
}

const SHARE_DOMAIN = "https://snagme.app";

export function ShareModalEnhanced({
  isOpen,
  onClose,
  planPreview,
  blindSpotsCount,
  failureModesCount,
  analysisId,
  verdict,
}: ShareModalEnhancedProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const shareImageRef = useRef<HTMLDivElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [creatingLink, setCreatingLink] = useState(false);

  // Share config toggles
  const [showTitle, setShowTitle] = useState(true);
  const [showVerdict, setShowVerdict] = useState(true);
  const [showBlindSpots, setShowBlindSpots] = useState(true);
  const [showTopBlindSpot, setShowTopBlindSpot] = useState(false);

  const twitterText = `Just stress-tested a big decision with @snagapp 🎯\n\nFound ${blindSpotsCount} blind spot${blindSpotsCount !== 1 ? "s" : ""} I would have missed.\n\nTry it free → ${SHARE_DOMAIN}`;

  const linkedInText = `I used Snag to stress-test a major decision.\n\nThe pre-mortem analysis surfaced ${blindSpotsCount} blind spot${blindSpotsCount !== 1 ? "s" : ""} I hadn't considered.\n\nIf you're facing a tough decision, try ${SHARE_DOMAIN}`;

  const instagramCaption = `Just snagged my decision 🎯\n\nFound ${blindSpotsCount} blind spot${blindSpotsCount !== 1 ? "s" : ""} I completely missed.\n\nBefore your next big move, stress-test it → link in bio\n\n#snag #premortem #decisionmaking #strategy`;

  useEffect(() => {
    if (isOpen && shareImageRef.current) {
      generatePreview();
    }
  }, [isOpen]);

  const generatePreview = async () => {
    if (!shareImageRef.current) return;
    setIsGenerating(true);
    try {
      await document.fonts.ready;
      const canvas = await html2canvas(shareImageRef.current, {
        scale: 0.25,
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
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const link = document.createElement("a");
      link.download = "my-snag-analysis.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({ title: "Image downloaded!", description: "Share it on your favorite platform." });
    } catch {
      toast({ title: "Download failed", description: "Please try again", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SHARE_DOMAIN)}`;
    window.open(url, "_blank", "width=600,height=600");
    navigator.clipboard.writeText(linkedInText);
    toast({ title: "LinkedIn opened", description: "Post text copied to clipboard" });
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(instagramCaption);
      setCopiedCaption(true);
      toast({ title: "Caption copied!", description: "Ready to paste in Instagram" });
      setTimeout(() => setCopiedCaption(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleCreateShareLink = async () => {
    if (!analysisId || !user) {
      toast({ title: "Login required", description: "Sign in to create shareable links" });
      return;
    }
    setCreatingLink(true);
    try {
      const { data, error } = await supabase
        .from("shared_snags")
        .insert({
          analysis_id: analysisId,
          user_id: user.id,
          share_config: {
            title: showTitle,
            verdict: showVerdict,
            blind_spots_count: showBlindSpots,
            top_blind_spot: showTopBlindSpot,
          },
        })
        .select("short_code")
        .single();

      if (error) throw error;
      const link = `${SHARE_DOMAIN}/s/${data.short_code}`;
      setShareLink(link);
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      toast({ title: "Link created & copied!", description: link });
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to create link", variant: "destructive" });
    } finally {
      setCreatingLink(false);
    }
  };

  return (
    <>
      <ShareImage
        ref={shareImageRef}
        planPreview={planPreview}
        blindSpotsCount={blindSpotsCount}
        failureModesCount={failureModesCount}
        variant="square"
      />

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          <DialogHeader className="p-6 pb-3">
            <DialogTitle className="text-lg font-bold text-foreground">
              Share Your Snag
            </DialogTitle>
            <DialogDescription className="sr-only">
              Share your analysis on social media or create a public link
            </DialogDescription>
          </DialogHeader>

          {/* Preview */}
          <div className="px-6 pb-3">
            <div className="border border-border rounded-xl overflow-hidden bg-muted">
              {isGenerating ? (
                <div className="aspect-square flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-muted border-t-primary rounded-full animate-spin" />
                </div>
              ) : previewUrl ? (
                <img src={previewUrl} alt="Share preview" className="w-full aspect-square object-cover" />
              ) : (
                <div className="aspect-square flex items-center justify-center text-muted-foreground text-sm">
                  Generating preview...
                </div>
              )}
            </div>
          </div>

          {/* Privacy Toggles */}
          <div className="px-6 pb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">What to share</p>
            <div className="space-y-2">
              <ToggleRow label="Decision title" checked={showTitle} onChange={setShowTitle} />
              <ToggleRow label="Verdict" checked={showVerdict} onChange={setShowVerdict} />
              <ToggleRow label="Number of blind spots" checked={showBlindSpots} onChange={setShowBlindSpots} />
              <ToggleRow label="Top blind spot (redacted)" checked={showTopBlindSpot} onChange={setShowTopBlindSpot} />
            </div>
          </div>

          {/* Share Actions */}
          <div className="px-6 pb-4 space-y-2">
            <Button onClick={handleDownloadImage} disabled={isGenerating} className="w-full h-11 font-medium">
              <Download className="w-4 h-4 mr-2" />
              Download Image
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleShareX} variant="outline" className="h-11 font-medium bg-foreground text-background hover:bg-foreground/90">
                <XIcon className="w-4 h-4 mr-1.5" />
                Post on 𝕏
              </Button>
              <Button onClick={handleShareLinkedIn} variant="outline" className="h-11 font-medium bg-[hsl(210,80%,40%)] text-white border-0 hover:bg-[hsl(210,80%,35%)]">
                <Linkedin className="w-4 h-4 mr-1.5" />
                LinkedIn
              </Button>
            </div>

            <Button onClick={handleCopyCaption} variant="outline"
              className="w-full h-11 font-medium bg-gradient-to-r from-[hsl(280,70%,50%)] via-[hsl(350,80%,50%)] to-[hsl(25,95%,53%)] text-white border-0 hover:opacity-90"
            >
              {copiedCaption ? <><Check className="w-4 h-4 mr-2" />Copied!</> : <><Instagram className="w-4 h-4 mr-2" />Copy IG Caption</>}
            </Button>

            <Button
              onClick={handleCreateShareLink}
              disabled={creatingLink || !analysisId}
              variant="outline"
              className="w-full h-11 font-medium"
            >
              {copiedLink ? (
                <><Check className="w-4 h-4 mr-2" />Link Copied!</>
              ) : (
                <><Link2 className="w-4 h-4 mr-2" />{shareLink ? "Copy Link Again" : "Create Share Link"}</>
              )}
            </Button>
          </div>

          <div className="px-6 pb-5">
            <p className="text-[11px] text-muted-foreground text-center">
              Tip: Download the image, then share it on Instagram with the caption
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
