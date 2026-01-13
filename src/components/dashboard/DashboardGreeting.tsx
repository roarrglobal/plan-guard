import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardGreetingProps {
  analysisCount: number;
}

export function DashboardGreeting({ analysisCount }: DashboardGreetingProps) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data?.display_name) {
        setDisplayName(data.display_name);
      }
    }
    fetchProfile();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = displayName || user?.email?.split("@")[0] || "";
    
    if (hour >= 5 && hour < 12) {
      return { text: `Good morning${name ? `, ${name}` : ""}`, emoji: "☀️" };
    } else if (hour >= 12 && hour < 17) {
      return { text: `Good afternoon${name ? `, ${name}` : ""}`, emoji: "" };
    } else if (hour >= 17 && hour < 21) {
      return { text: `Good evening${name ? `, ${name}` : ""}`, emoji: "" };
    } else {
      return { text: `Burning the midnight oil${name ? `, ${name}` : ""}?`, emoji: "🌙" };
    }
  };

  const greeting = getGreeting();

  return (
    <div className="mb-6">
      <h1 className="text-[24px] font-bold text-[#1A1A1A]" style={{ fontFamily: 'Inter' }}>
        {greeting.text} {greeting.emoji}
      </h1>
      {analysisCount > 0 && (
        <p className="text-[14px] text-[#666666] mt-1">
          You've stress-tested {analysisCount} decision{analysisCount !== 1 ? "s" : ""} so far
        </p>
      )}
    </div>
  );
}
