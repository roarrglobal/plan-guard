import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Users, CheckCircle, XCircle, LogIn, Clock, UserX, Eye, EyeOff } from "lucide-react";
import { SnagLogo } from "@/components/SnagLogo";

interface InviteDetails {
  found: boolean;
  error?: string;
  expired?: boolean;
  already_accepted?: boolean;
  team_name?: string;
  inviter_name?: string;
  role?: string;
  email?: string;
}

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const { user, signUp, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [details, setDetails] = useState<InviteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [declined, setDeclined] = useState(false);

  // Signup form state for non-logged-in users
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchDetails = async () => {
      const { data, error } = await supabase.rpc("get_invite_details", { p_token: token });
      if (error || !data) {
        setDetails({ found: false, error: "not_found" });
      } else {
        setDetails(data as unknown as InviteDetails);
      }
      setIsLoading(false);
    };
    fetchDetails();
  }, [token]);

  useEffect(() => {
    if (!user || !token || !details?.found || details.expired || details.already_accepted) return;
    const pendingToken = localStorage.getItem("pending_invite_token");
    if (pendingToken === token) {
      localStorage.removeItem("pending_invite_token");
      handleAccept();
    }
  }, [user, token, details]);

  const handleAccept = async () => {
    if (!user) {
      localStorage.setItem("pending_invite_token", token!);
      navigate(`/login?redirect=/invite/${token}`);
      return;
    }
    setIsAccepting(true);
    const { data, error } = await supabase.rpc("accept_invitation", {
      p_token: token!,
      p_user_id: user.id,
    });
    if (error) {
      toast.error(error.message);
      setIsAccepting(false);
      return;
    }
    const result = data as any;
    if (!result.success) {
      toast.error(result.message || "Failed to accept invitation");
      setIsAccepting(false);
      return;
    }
    if (result.already_member) {
      toast.info("You're already a member of this team!");
    } else {
      toast.success(`You've joined ${result.team_name}!`);
    }
    navigate(`/team/${result.team_slug}/dashboard`);
  };

  const handleDecline = async () => {
    if (!user || !token) return;
    setIsDeclining(true);
    const { error } = await supabase.from("team_invitations").delete().eq("token", token);
    if (error) {
      toast.error("Failed to decline invitation");
      setIsDeclining(false);
      return;
    }
    setDeclined(true);
    setIsDeclining(false);
  };

  const handleSignupAndJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setIsSigningUp(true);
    try {
      localStorage.setItem("pending_invite_token", token!);
      const { error } = await signUp(details?.email || "", signupPassword, signupName, "business");
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Check your email to verify your account, then log in to join the team.");
        navigate("/login");
      }
    } finally {
      setIsSigningUp(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 space-y-4">
            <Skeleton className="h-12 w-12 rounded-full mx-auto" />
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Declined
  if (declined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4"><SnagLogo size="md" /></div>
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <UserX className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle>Invitation Declined</CardTitle>
            <CardDescription>You've declined this team invitation.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate("/")} className="w-full">Go to Homepage</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not found
  if (!details?.found) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4"><SnagLogo size="md" /></div>
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>This invitation has expired or is invalid. Contact your team admin for a new invitation.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate("/")} className="w-full">Go to Homepage</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Expired
  if (details.expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4"><SnagLogo size="md" /></div>
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle>Invitation Expired</CardTitle>
            <CardDescription>This invitation has expired. Please ask the team admin to send a new one.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate("/")} className="w-full">Go to Homepage</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already accepted
  if (details.already_accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4"><SnagLogo size="md" /></div>
            <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <CardTitle>Already Accepted</CardTitle>
            <CardDescription>This invitation has already been accepted.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")} className="w-full">Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4"><SnagLogo size="md" /></div>
            <div className="mx-auto w-12 h-12 rounded-full bg-cobalt/10 flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-cobalt" />
            </div>
            <CardTitle>You've been invited to join {details.team_name}</CardTitle>
            <CardDescription>
              Invited by {details.inviter_name} as{" "}
              <Badge variant="outline" className="ml-1 capitalize">{details.role}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {showSignupForm ? (
              <form onSubmit={handleSignupAndJoin} className="space-y-4">
                <h3 className="text-body font-semibold text-foreground">Create your account to join</h3>
                <div>
                  <label htmlFor="signup-name" className="block text-caption font-medium text-foreground mb-1.5">Name</label>
                  <input id="signup-name" type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} required className="input-field" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-caption font-medium text-foreground mb-1.5">Email</label>
                  <input type="email" value={details.email || ""} readOnly className="input-field opacity-60 cursor-not-allowed" />
                </div>
                <div>
                  <label htmlFor="signup-password" className="block text-caption font-medium text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <input id="signup-password" type={showPassword ? "text" : "password"} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required minLength={8} className="input-field pr-12" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-caption text-muted-foreground mt-1">8+ characters</p>
                </div>
                <Button type="submit" disabled={isSigningUp} className="w-full bg-cobalt hover:bg-cobalt-hover text-white">
                  {isSigningUp ? "Creating account..." : "Join Team"}
                </Button>
              </form>
            ) : (
              <>
                <Button onClick={() => {
                  localStorage.setItem("pending_invite_token", token!);
                  navigate(`/login?redirect=/invite/${token}`);
                }} className="w-full gap-2 bg-cobalt hover:bg-cobalt-hover text-white">
                  <LogIn className="w-4 h-4" /> Log In to Accept
                </Button>
                <button
                  onClick={() => setShowSignupForm(true)}
                  className="w-full text-center text-body-small text-muted-foreground hover:text-foreground"
                >
                  Don't have an account? <span className="text-primary font-medium hover:underline">Create one</span>
                </button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logged in — accept/decline
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4"><SnagLogo size="md" /></div>
          <div className="mx-auto w-12 h-12 rounded-full bg-cobalt/10 flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-cobalt" />
          </div>
          <CardTitle>Join {details.team_name}?</CardTitle>
          <CardDescription className="space-y-2">
            <span className="block">Invited by <span className="font-medium text-foreground">{details.inviter_name}</span></span>
            <span className="block">Role: <Badge variant="outline" className="ml-1 capitalize">{details.role}</Badge></span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleAccept} disabled={isAccepting} className="w-full bg-cobalt hover:bg-cobalt-hover text-white">
            {isAccepting ? "Joining..." : "Accept Invitation"}
          </Button>
          <button
            onClick={handleDecline}
            disabled={isDeclining}
            className="w-full text-center text-body-small text-muted-foreground hover:text-destructive transition-colors"
          >
            {isDeclining ? "Declining..." : "Decline"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
