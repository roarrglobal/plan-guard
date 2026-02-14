import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SnagLogo } from "@/components/SnagLogo";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationPreferences } from "@/components/settings/NotificationPreferences";

export default function NotificationSettingsPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4 safe-top">
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <SnagLogo size="sm" />
          <div className="w-11" />
        </div>
      </header>

      <main className="flex-1 p-4 max-w-[600px] mx-auto w-full">
        <h1 className="text-2xl font-bold text-foreground mb-2">Email Notifications</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Choose which emails you'd like to receive
        </p>
        <NotificationPreferences />
      </main>
    </div>
  );
}
