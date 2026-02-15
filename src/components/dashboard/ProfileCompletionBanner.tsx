import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ProfileCompletionBanner() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  // Show if profile completed but DOB is missing
  if (dismissed || !profile || profile.profile_completed !== true || profile.date_of_birth) return null;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">Complete your birth details</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Add your date of birth to unlock personalized zodiac insights and mystical decision guidance.
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => navigate("/settings?tab=personal")}
        className="flex-shrink-0"
      >
        Add now
      </Button>
      <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
