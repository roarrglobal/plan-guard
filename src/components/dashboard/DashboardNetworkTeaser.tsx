import { Users } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardNetworkTeaser() {
  const [email, setEmail] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleJoinWaitlist = () => {
    // Use the logged-in user's email
    const waitlistEmail = user?.email || email;

    if (!waitlistEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email to join the waitlist.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would call an API to save the email
    // For now, we'll just show a success message
    setIsJoined(true);
    toast({
      title: "You're on the list! 🎉",
      description: "We'll notify you when Snagger Network launches.",
    });
  };

  return (
    <div
      className="rounded-xl p-6 mb-6 text-center"
      style={{
        background: "linear-gradient(135deg, #F8F8F8 0%, #F0F7FF 100%)",
      }}
    >
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-[#0047AB]/10 flex items-center justify-center mx-auto mb-4">
        <Users className="w-8 h-8 text-[#0047AB]" />
      </div>

      {/* Title */}
      <h3
        className="text-[18px] font-semibold text-[#1A1A1A] mb-2"
        style={{ fontFamily: "Inter" }}
      >
        Snagger Network Coming Soon
      </h3>

      {/* Description */}
      <p className="text-[14px] text-[#666666] mb-4 max-w-[300px] mx-auto leading-relaxed">
        Connect with other strategic thinkers. Share insights. Learn from each
        other's blind spots.
      </p>

      {/* CTA */}
      {isJoined ? (
        <div className="inline-flex items-center gap-2 bg-[#059669]/10 text-[#059669] rounded-lg px-4 py-2 text-[14px] font-medium">
          <span>✓</span>
          You're on the waitlist!
        </div>
      ) : (
        <button
          onClick={handleJoinWaitlist}
          className="bg-[#0047AB] text-white rounded-lg px-6 py-3 text-[14px] font-medium hover:bg-[#003A8C] transition-colors"
        >
          Join Waitlist
        </button>
      )}
    </div>
  );
}
