import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardProfileHeader() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Get display name - prioritize profile, then email prefix
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "there";
  const firstName = displayName.split(" ")[0];

  // Generate initials for avatar fallback
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Generate consistent color from name
  const getColorFromName = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "#0047AB", // cobalt
      "#059669", // green
      "#7C3AED", // purple
      "#D97706", // amber
      "#BE3455", // coral
      "#0891B2", // cyan
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const avatarColor = getColorFromName(displayName);

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-[16px] border-2 border-white shadow-sm"
            style={{ backgroundColor: avatarColor }}
          >
            {initials}
          </div>
        )}

        {/* Greeting */}
        <h1
          className="text-[18px] font-semibold text-[#1A1A1A]"
          style={{ fontFamily: "Inter" }}
        >
          Hey, {firstName}
        </h1>
      </div>

      {/* Settings */}
      <button
        onClick={() => navigate("/settings")}
        className="p-2 text-[#666666] hover:text-[#1A1A1A] transition-colors rounded-lg hover:bg-[#F2F2F2]"
        aria-label="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
}
