import { useState } from "react";
import { Calendar, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, addDays } from "date-fns";

interface FollowUpPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetFollowUp: (date: Date) => void;
  onSkip: () => void;
}

const PRESET_OPTIONS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

export function FollowUpPrompt({ open, onOpenChange, onSetFollowUp, onSkip }: FollowUpPromptProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customDate, setCustomDate] = useState("");

  const handlePresetClick = (days: number) => {
    const date = addDays(new Date(), days);
    onSetFollowUp(date);
  };

  const handleCustomSubmit = () => {
    if (customDate) {
      onSetFollowUp(new Date(customDate));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
            Want Snag to follow up on this decision?
          </DialogTitle>
        </DialogHeader>

        {!showCustom ? (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground text-center">
              We'll remind you to check in and log how it went.
            </p>

            <div className="flex gap-2">
              <Button
                variant="default"
                className="flex-1 bg-primary"
                onClick={() => setShowCustom(true)}
              >
                Yes, check in with me
              </Button>
              <Button variant="outline" onClick={onSkip}>
                No thanks
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <p className="text-sm font-medium text-center">
              When should I check in?
            </p>

            <div className="grid grid-cols-3 gap-2">
              {PRESET_OPTIONS.map((option) => (
                <Button
                  key={option.days}
                  variant="outline"
                  className="flex flex-col py-3 h-auto"
                  onClick={() => handlePresetClick(option.days)}
                >
                  <span className="text-lg font-bold">{option.days}</span>
                  <span className="text-xs text-muted-foreground">days</span>
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Custom date</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <Button 
                  variant="default"
                  onClick={handleCustomSubmit}
                  disabled={!customDate}
                >
                  Set
                </Button>
              </div>
            </div>

            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground"
              onClick={onSkip}
            >
              Skip for now
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
