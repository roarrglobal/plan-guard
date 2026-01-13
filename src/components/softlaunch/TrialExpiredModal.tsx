import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, PenLine, Lightbulb, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSoftLaunch } from "@/hooks/useSoftLaunch";
import { useToast } from "@/hooks/use-toast";

interface TrialExpiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats?: {
    deepSnags: number;
    journals: number;
    blindSpots: number;
  };
}

export function TrialExpiredModal({ 
  open, 
  onOpenChange,
  stats = { deepSnags: 0, journals: 0, blindSpots: 0 }
}: TrialExpiredModalProps) {
  const { user } = useAuth();
  const { joinWaitlist, isJoiningWaitlist, waitlistJoined } = useSoftLaunch();
  const { toast } = useToast();
  const [email, setEmail] = useState(user?.email || "");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleJoinWaitlist = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    try {
      await joinWaitlist(email);
      setShowConfirmation(true);
    } catch (error) {
      console.error("Error joining waitlist:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleContinueFree = () => {
    onOpenChange(false);
  };

  // Confirmation view
  if (showConfirmation || waitlistJoined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[420px] p-0 gap-0 overflow-hidden">
          <div className="bg-primary/5 p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-foreground">
                You're on the list
              </DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground mt-2">
              We'll email you when Pro goes live. Your 30% discount is locked in.
            </p>
          </div>
          
          <div className="p-6">
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-center">
              <p className="text-sm text-muted-foreground">Your discount code</p>
              <p className="text-lg font-bold text-primary mt-1">EARLY30</p>
            </div>
            
            <Button 
              onClick={() => onOpenChange(false)} 
              className="w-full"
            >
              Continue to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-[480px] p-0 gap-0 overflow-hidden [&>button]:hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 text-center">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-bold text-foreground">
              Your free trial has ended
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground mt-2">
            Thanks for trying Snag! Here's what you accomplished:
          </p>
        </div>
        
        {/* Stats */}
        <div className="p-6 border-b border-border">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.deepSnags}</p>
              <p className="text-xs text-muted-foreground">Deep Snags run</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <PenLine className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.journals}</p>
              <p className="text-xs text-muted-foreground">Journals written</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lightbulb className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.blindSpots}</p>
              <p className="text-xs text-muted-foreground">Blind spots found</p>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-6 space-y-4">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
          />
          
          <Button 
            onClick={handleJoinWaitlist}
            className="w-full"
            disabled={isJoiningWaitlist}
          >
            {isJoiningWaitlist ? "Joining..." : "Join Waitlist for Pro"}
          </Button>
          
          <Button 
            variant="ghost"
            onClick={handleContinueFree}
            className="w-full text-muted-foreground"
          >
            Continue with limited free access
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            Free access includes 3 journals/day. No Deep Snags or Retros.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
