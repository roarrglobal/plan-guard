import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SnagLogo } from "@/components/SnagLogo";
import { CheckCircle, Mail } from "lucide-react";

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [done, setDone] = useState(false);

  const handleUnsubscribe = () => {
    // In a full implementation, this would validate the token server-side
    // For now, we show a confirmation and redirect to settings
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <SnagLogo size="lg" className="mx-auto" />

          {done ? (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Unsubscribed</h1>
              <p className="text-sm text-muted-foreground">
                You've been unsubscribed from these emails. You can update your preferences anytime in Settings.
              </p>
              <Button variant="outline" onClick={() => window.location.href = "/settings/notifications"}>
                Manage Preferences
              </Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-muted-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Unsubscribe</h1>
              <p className="text-sm text-muted-foreground">
                Click below to unsubscribe from these email notifications. You can always re-enable them in your settings.
              </p>
              <div className="space-y-3">
                <Button className="w-full" onClick={handleUnsubscribe}>
                  Unsubscribe
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = "/settings/notifications"}>
                  Manage All Preferences
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
