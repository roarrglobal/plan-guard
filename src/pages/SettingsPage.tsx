import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, User, LogOut, Trash2, ChevronRight, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SnagLogo } from "@/components/SnagLogo";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SubscriptionSettings } from "@/components/subscription/SubscriptionSettings";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, signOut, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "See you next time!",
    });
    navigate("/");
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Delete account",
      description: "Please contact support to delete your account",
      variant: "destructive",
    });
  };

  // Generate initials for avatar fallback
  const getInitials = () => {
    const name = profile?.display_name || user?.email?.split("@")[0] || "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate consistent color from name
  const getAvatarColor = () => {
    const name = profile?.display_name || user?.email || "";
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ["#0047AB", "#059669", "#7C3AED", "#D97706", "#BE3455", "#0891B2"];
    return colors[Math.abs(hash) % colors.length];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#E5E5E5] border-t-[#0047AB] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4 safe-top">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <SnagLogo size="sm" />
          <div className="w-11" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 max-w-[600px] mx-auto w-full">
        <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

        {/* Profile section */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Profile
          </h2>
          <div className="analysis-card">
            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center justify-between p-4 touch-target hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: getAvatarColor() }}
                  >
                    {getInitials()}
                  </div>
                )}
                <div className="text-left">
                  <p className="font-medium text-foreground">
                    {profile?.display_name || user?.email?.split("@")[0] || "Your Profile"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.role || "Edit your profile"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* Account section */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Account
          </h2>
          <div className="analysis-card divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email || "Not signed in"}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Subscription</p>
                  <p className="text-sm text-primary">Free Plan</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </section>

        {/* Subscription section */}
        <section className="mb-8">
          <SubscriptionSettings />
        </section>

        {/* Danger zone */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Danger Zone
          </h2>
          <div className="analysis-card divide-y divide-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 touch-target text-left hover:bg-muted/50 transition-colors"
            >
              <LogOut className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Logout</span>
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center gap-3 p-4 touch-target text-left hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-5 h-5 text-destructive" />
              <span className="font-medium text-destructive">Delete account</span>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Snag v1.0.0
        </p>
      </footer>
    </div>
  );
}
