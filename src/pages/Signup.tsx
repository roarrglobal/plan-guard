import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Check, User, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SnagLogo } from "@/components/SnagLogo";
import { lovable } from "@/integrations/lovable/index";
import { cn } from "@/lib/utils";

type UserType = "individual" | "business";

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const typeParam = searchParams.get("type");
  const initialType: UserType | null =
    typeParam === "individual" || typeParam === "team"
      ? typeParam === "team"
        ? "business"
        : "individual"
      : null;

  const [userType, setUserType] = useState<UserType | null>(initialType);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await signUp(email, password, displayName, userType || "individual");
      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a verification link. Please verify your email to continue.",
          duration: 10000,
        });
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast({ title: "Google sign in failed", description: String(error), variant: "destructive" });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Step 1: Choose path
  if (!userType) {
    return (
      <div className="min-h-screen bg-muted flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <Link to="/" className="flex justify-center mb-8">
            <SnagLogo size="lg" />
          </Link>
          <h2 className="text-h2 font-bold text-foreground text-center mb-2">
            How will you use Snag?
          </h2>
          <p className="text-body text-muted-foreground text-center mb-10">
            This helps us personalize your experience
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal */}
            <button
              onClick={() => setUserType("individual")}
              className="bg-card rounded-xl p-6 border-2 border-border text-left transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1 hover:border-crimson group"
            >
              <div className="w-14 h-14 rounded-xl bg-crimson/10 flex items-center justify-center mb-4">
                <User className="w-7 h-7 text-crimson" />
              </div>
              <h3 className="text-h3 font-semibold text-foreground mb-1">For Myself</h3>
              <p className="text-body-small text-muted-foreground">
                Personal decisions, career moves, life choices
              </p>
            </button>

            {/* Team */}
            <button
              onClick={() => setUserType("business")}
              className="bg-card rounded-xl p-6 border-2 border-border text-left transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1 hover:border-cobalt group"
            >
              <div className="w-14 h-14 rounded-xl bg-cobalt/10 flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-cobalt" />
              </div>
              <h3 className="text-h3 font-semibold text-foreground mb-1">For My Team</h3>
              <p className="text-body-small text-muted-foreground">
                Team decisions, collaboration, analytics
              </p>
            </button>
          </div>

          <p className="text-body-small text-muted-foreground text-center mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const isPersonal = userType === "individual";
  const accentColor = isPersonal ? "crimson" : "cobalt";

  // Step 2: Signup form
  return (
    <div className="min-h-screen bg-muted flex flex-col lg:flex-row">
      {/* Left panel - value props */}
      <div
        className={cn(
          "lg:w-1/2 flex flex-col justify-center px-8 py-12 lg:px-16",
          isPersonal ? "bg-crimson" : "bg-cobalt"
        )}
      >
        <Link to="/">
          <SnagLogo size="lg" className="brightness-0 invert mb-8" />
        </Link>
        <h2 className="text-h2 font-bold text-white mb-6">
          {isPersonal ? "Start your free trial" : "Start your team trial"}
        </h2>
        <ul className="space-y-4">
          <li className="flex items-center gap-3 text-white/90">
            <Check className="w-5 h-5 text-white flex-shrink-0" />
            <span>15 days full access</span>
          </li>
          <li className="flex items-center gap-3 text-white/90">
            <Check className="w-5 h-5 text-white flex-shrink-0" />
            <span>{isPersonal ? "All Pro features included" : "All Business features included"}</span>
          </li>
          {!isPersonal && (
            <li className="flex items-center gap-3 text-white/90">
              <Check className="w-5 h-5 text-white flex-shrink-0" />
              <span>Up to 20 team members</span>
            </li>
          )}
          <li className="flex items-center gap-3 text-white/90">
            <Check className="w-5 h-5 text-white flex-shrink-0" />
            <span>No credit card required</span>
          </li>
        </ul>
      </div>

      {/* Right panel - form */}
      <div className="lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          <h3 className="text-h3 font-bold text-foreground mb-6">
            {isPersonal ? "Create your personal account" : "Create your team account"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-caption font-medium text-foreground mb-1.5">
                {isPersonal ? "Name" : "Your Name"}
              </label>
              <input
                id="name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                required
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-caption font-medium text-foreground mb-1.5">
                {isPersonal ? "Email" : "Work Email"}
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

            <div>
              <label htmlFor="password" className="block text-caption font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-caption text-muted-foreground mt-1">8+ characters</p>
            </div>

            {!isPersonal && (
              <div>
                <label htmlFor="teamName" className="block text-caption font-medium text-foreground mb-1.5">
                  Team or Company Name
                </label>
                <input
                  id="teamName"
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Acme Inc."
                  required
                  className="input-field"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full mt-2 text-white",
                isPersonal
                  ? "bg-crimson hover:bg-crimson-hover"
                  : "bg-cobalt hover:bg-cobalt-hover"
              )}
            >
              {isLoading
                ? "Creating account..."
                : isPersonal
                ? "Create Account"
                : "Create Team Account"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-caption text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {isGoogleLoading ? "Connecting..." : "Continue with Google"}
          </Button>

          {/* Terms */}
          <p className="text-caption text-muted-foreground text-center mt-6">
            By signing up, you agree to our{" "}
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>

          {/* Footer links */}
          <div className="text-body-small text-muted-foreground text-center mt-6 space-y-2">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link>
            </p>
            <p>
              {isPersonal ? "Want a team account?" : "Looking for personal use?"}{" "}
              <button
                onClick={() => setUserType(isPersonal ? "business" : "individual")}
                className="text-primary font-medium hover:underline"
              >
                {isPersonal ? "Switch to Teams" : "Switch to Personal"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
