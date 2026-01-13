import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface FirstUseAcknowledgmentProps {
  onAcknowledged: () => void;
}

const ACKNOWLEDGMENT_KEY = "snag_disclaimer_acknowledged";

export function FirstUseAcknowledgment({ onAcknowledged }: FirstUseAcknowledgmentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const acknowledged = localStorage.getItem(ACKNOWLEDGMENT_KEY);
    if (!acknowledged) {
      setIsOpen(true);
    } else {
      onAcknowledged();
    }
  }, [onAcknowledged]);

  const handleAcknowledge = () => {
    localStorage.setItem(ACKNOWLEDGMENT_KEY, "true");
    setIsOpen(false);
    onAcknowledged();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-[20px] font-bold text-[#1A1A1A]" style={{ fontFamily: 'Inter' }}>
            Before you see your results
          </DialogTitle>
          <DialogDescription className="sr-only">
            Acknowledgment that Snag is for informational purposes only
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-[15px] text-[#333333] leading-relaxed" style={{ fontFamily: 'Inter' }}>
            Snag is a thinking tool, not a decision-maker.
          </p>
          <p className="text-[15px] text-[#333333] leading-relaxed" style={{ fontFamily: 'Inter' }}>
            The analysis you're about to see identifies possibilities and considerations — not predictions.
          </p>
          <p className="text-[15px] text-[#333333] leading-relaxed" style={{ fontFamily: 'Inter' }}>
            You remain responsible for your decisions. Always consider multiple sources and consult professionals for specialized matters.
          </p>
        </div>

        <div className="flex items-start gap-3 py-4 border-t border-[#E5E5E5]">
          <Checkbox
            id="acknowledge"
            checked={isChecked}
            onCheckedChange={(checked) => setIsChecked(checked === true)}
            className="mt-0.5"
          />
          <label
            htmlFor="acknowledge"
            className="text-[14px] text-[#333333] leading-relaxed cursor-pointer"
            style={{ fontFamily: 'Inter' }}
          >
            I understand that Snag is for informational purposes and I am responsible for my own decisions.
          </label>
        </div>

        <Button
          onClick={handleAcknowledge}
          disabled={!isChecked}
          className="w-full bg-[#0047AB] hover:bg-[#003A8C] text-white font-medium py-3"
        >
          Show My Analysis
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function useFirstUseAcknowledgment() {
  const [hasAcknowledged, setHasAcknowledged] = useState(() => {
    return localStorage.getItem(ACKNOWLEDGMENT_KEY) === "true";
  });

  return {
    hasAcknowledged,
    setHasAcknowledged,
  };
}
