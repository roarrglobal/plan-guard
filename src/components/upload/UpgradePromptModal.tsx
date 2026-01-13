import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UpgradePromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradePromptModal({
  open,
  onOpenChange,
}: UpgradePromptModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[20px] font-bold text-[#1A1A1A]">
            <Lock className="w-5 h-5 text-[#0047AB]" />
            Pro Feature
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-[15px] text-[#333333] leading-relaxed">
            Upload & Analyze is a Pro feature. Upgrade to analyze documents, images, and contracts.
          </p>

          <div className="bg-[#F0F7FF] border border-[#0047AB]/20 rounded-xl p-4 space-y-3">
            <p className="text-[14px] font-semibold text-[#0047AB]">
              What you get with Pro:
            </p>
            <ul className="text-[13px] text-[#333333] space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#0047AB]">✓</span>
                Analyze PDFs, Word docs, and images
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0047AB]">✓</span>
                OCR for scanned documents
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0047AB]">✓</span>
                Deep Snag wizard for complex decisions
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0047AB]">✓</span>
                Unlimited analyses
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={() => {
                // TODO: Integrate with Stripe when available
                onOpenChange(false);
              }}
              className="flex-1 bg-[#0047AB] hover:bg-[#003A8C] text-white"
            >
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
