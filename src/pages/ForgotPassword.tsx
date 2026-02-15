import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SnagLogo } from "@/components/SnagLogo";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      // Always show success for security (don't reveal if email exists)
      setEmailSent(true);
      if (error) {
        console.error("Reset password error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="bg-card rounded-xl p-8 border border-border shadow-card">
          <Link to="/" className="flex justify-center mb-6">
            <SnagLogo size="lg" />
          </Link>

          {emailSent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-h3 font-bold text-foreground mb-2">Check your email</h2>
              <p className="text-body-small text-muted-foreground mb-4">
                We've sent a password reset link to <strong className="text-foreground">{email}</strong>
              </p>
              <p className="text-caption text-muted-foreground mb-6">
                Didn't receive it? Check your spam folder or{" "}
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-primary hover:underline"
                >
                  try again
                </button>.
              </p>
              <Link
                to="/login"
                className="text-body-small text-primary font-medium hover:underline"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-h3 font-bold text-foreground text-center mb-2">
                Reset your password
              </h2>
              <p className="text-body-small text-muted-foreground text-center mb-8">
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-caption font-medium text-foreground mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="input-field"
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>

              <p className="text-body-small text-muted-foreground text-center mt-6">
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
