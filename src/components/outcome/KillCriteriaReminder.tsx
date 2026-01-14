import { useState } from "react";
import { AlertTriangle, Calendar, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format, addDays } from "date-fns";

interface KillCriteriaReminderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  criterion: {
    id?: string;
    condition: string;
    action: string;
    threshold?: string;
  };
  onSetReminder: (date: Date, criterionId: string) => void;
  onSkip: () => void;
}

export function KillCriteriaReminder({ 
  open, 
  onOpenChange, 
  criterion,
  onSetReminder,
  onSkip 
}: KillCriteriaReminderProps) {
  const [reminderDate, setReminderDate] = useState("");

  const handleSetReminder = () => {
    if (reminderDate && criterion.id) {
      onSetReminder(new Date(reminderDate), criterion.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Set Kill Criteria Reminder
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm font-medium text-amber-900 mb-2">
              Kill Criterion:
            </p>
            <p className="text-sm text-amber-800">
              "{criterion.condition}" → {criterion.action}
            </p>
            {criterion.threshold && (
              <p className="text-xs text-amber-700 mt-1">
                Threshold: {criterion.threshold}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">
              When should I remind you to check this?
            </label>
            <input
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="default"
              className="flex-1"
              onClick={handleSetReminder}
              disabled={!reminderDate}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Set Reminder
            </Button>
            <Button variant="outline" onClick={onSkip}>
              Skip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface KillCriteriaCheckInProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  criterion: {
    id: string;
    condition: string;
    action: string;
  };
  onRespond: (criterionId: string, happened: boolean, reason?: string) => void;
}

export function KillCriteriaCheckIn({ 
  open, 
  onOpenChange, 
  criterion,
  onRespond 
}: KillCriteriaCheckInProps) {
  const [happened, setHappened] = useState<boolean | null>(null);
  const [continueReason, setContinueReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);

  const handleYes = () => {
    onRespond(criterion.id, true);
    onOpenChange(false);
  };

  const handleNo = () => {
    setHappened(false);
    setShowReasonInput(true);
  };

  const handleContinueAnyway = () => {
    onRespond(criterion.id, false, continueReason);
    onOpenChange(false);
  };

  const handleReassess = () => {
    onRespond(criterion.id, false, "Reassessing as planned");
    onOpenChange(false);
  };

  const handlePivoted = () => {
    onRespond(criterion.id, false, "Already pivoted");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Kill Criteria Check-In
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-900 mb-2">
              You said:
            </p>
            <p className="text-sm text-red-800 italic">
              "{criterion.condition}"
            </p>
            <p className="text-sm text-red-800 mt-2">
              → {criterion.action}
            </p>
          </div>

          {!showReasonInput ? (
            <>
              <p className="text-sm font-medium">Did this happen?</p>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleYes}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Yes
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleNo}
                >
                  <X className="w-4 h-4 mr-2" />
                  No
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-red-800">
                You defined this as your walk-away point. What will you do?
              </p>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleReassess}
                >
                  Reassess as planned
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handlePivoted}
                >
                  Already pivoted
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Continue anyway (tell me why):
                </label>
                <Textarea
                  value={continueReason}
                  onChange={(e) => setContinueReason(e.target.value)}
                  placeholder="Why are you continuing despite this kill criterion?"
                  rows={2}
                />
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleContinueAnyway}
                  disabled={!continueReason.trim()}
                >
                  Continue Anyway
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
