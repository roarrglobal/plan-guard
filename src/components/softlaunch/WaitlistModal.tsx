import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Sparkles, Target, Clock, PenLine, Headphones } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSoftLaunch } from "@/hooks/useSoftLaunch";
import { useToast } from "@/hooks/use-toast";

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limitType?: "deep_snag" | "journal" | "retro" | "general";
}

const LIMIT_MESSAGES: Record<string, string> = {
  deep_snag: "You've used your free Deep Snag",
  journal: "You've reached today's journal limit",
  retro: "You've used your free Quick Retro",
  general: "Upgrade to unlock more features",
};

const BENEFITS = [
  { icon: Target, text: "50 Deep Snags/month" },
  { icon: PenLine, text: "Unlimited journals" },
  { icon: Clock, text: "Full post-mortems" },
  { icon: Sparkles, text: "Complete decision history" },
  { icon: Headphones, text: "Priority support" },
];

export function WaitlistModal({ open, onOpenChange, limitType = "general" }: WaitlistModalProps) {
  const { user } = useAuth();
  const { joinWaitlist, isJoiningWaitlist, waitlistJoined } = useSoftLaunch();
  const { toast } = useToast();
  const [email, setEmail] = useState(user?.email || "");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

  // Confirmation view after joining
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
              Back to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] p-0 gap-0 overflow-hidden">
        <div className="bg-primary/5 p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-bold text-foreground">
              Pro is launching soon
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground mt-2">
            {LIMIT_MESSAGES[limitType]}
          </p>
        </div>
        
        <div className="p-6">
          {/* Benefits */}
          <div className="space-y-3 mb-6">
            {BENEFITS.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{benefit.text}</span>
                </div>
              );
            })}
          </div>
          
          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
            <Button 
              type="submit" 
              className="w-full"
              disabled={isJoiningWaitlist}
            >
              {isJoiningWaitlist ? "Joining..." : "Join Waitlist for Pro"}
            </Button>
          </form>
          
          {/* Footer */}
          <p className="text-xs text-center text-muted-foreground mt-4">
            🎁 30% early supporter discount locked in.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
