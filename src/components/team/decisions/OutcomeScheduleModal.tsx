import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format } from "date-fns";
import { CalendarDays, Clock } from "lucide-react";

interface OutcomeScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchedule: (date: Date) => void;
}

const PRESETS = [
  { label: "30 days", days: 30 },
  { label: "60 days", days: 60 },
  { label: "90 days", days: 90 },
];

export function OutcomeScheduleModal({ open, onOpenChange, onSchedule }: OutcomeScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 30));
  const [showCalendar, setShowCalendar] = useState(false);

  const handlePreset = (days: number) => {
    setSelectedDate(addDays(new Date(), days));
    setShowCalendar(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Schedule Outcome Check-in
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            When should we check in on how this decision turned out?
          </p>

          {/* Preset options */}
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p) => {
              const presetDate = addDays(new Date(), p.days);
              const isSelected = selectedDate && format(selectedDate, "yyyy-MM-dd") === format(presetDate, "yyyy-MM-dd");
              return (
                <button
                  key={p.days}
                  onClick={() => handlePreset(p.days)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{p.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {format(presetDate, "MMM d")}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Custom date toggle */}
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <Clock className="w-3 h-3" />
            {showCalendar ? "Hide calendar" : "Pick a custom date"}
          </button>

          {showCalendar && (
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>
          )}

          {/* Preview */}
          {selectedDate && (
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-center">
              <p className="text-sm text-foreground">
                We'll check in on <span className="font-semibold">{format(selectedDate, "MMMM d, yyyy")}</span>
              </p>
            </div>
          )}

          <Button
            onClick={() => selectedDate && onSchedule(selectedDate)}
            disabled={!selectedDate}
            className="w-full"
          >
            Schedule Check-in
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
