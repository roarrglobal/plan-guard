import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, User, CreditCard, LogOut, Trash2, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SnagLogo } from "@/components/SnagLogo";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut, isLoading } = useAuth();

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
      <main className="flex-1 p-4">
        <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

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
                  <p className="text-sm text-primary">Pro Plan • ₹499/month</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </section>

        {/* Subscription section */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Subscription
          </h2>
          <div className="analysis-card">
            <button className="w-full flex items-center justify-between p-4 touch-target">
              <div className="flex items-center gap-3">
                <ExternalLink className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">Manage subscription</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
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
