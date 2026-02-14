import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Users, CheckCircle, XCircle, LogIn, Clock, UserX } from "lucide-react";

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
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [details, setDetails] = useState<InviteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [declined, setDeclined] = useState(false);

  // Fetch invite details using the public RPC function
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

  // Auto-accept if user is logged in and came from signup with invite token
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
      // Store token and redirect to login
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
      if (result.error === "email_mismatch") {
        toast.error(result.message);
      } else if (result.error === "expired") {
        toast.error("This invitation has expired.");
      } else {
        toast.error(result.message || "Failed to accept invitation");
      }
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

    // Find and delete the invitation
    const { error } = await supabase
      .from("team_invitations")
      .delete()
      .eq("token", token);

    if (error) {
      toast.error("Failed to decline invitation");
      setIsDeclining(false);
      return;
    }

    setDeclined(true);
    setIsDeclining(false);
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
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

  // Declined state
  if (declined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <UserX className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle>Invitation Declined</CardTitle>
            <CardDescription>You've declined this team invitation.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not found
  if (!details?.found) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle>Invitation Not Found</CardTitle>
            <CardDescription>This invitation link is invalid or has been removed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Expired
  if (details.expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle>Invitation Expired</CardTitle>
            <CardDescription>This invitation has expired. Please ask the team admin to send a new one.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already accepted
  if (details.already_accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Already Accepted</CardTitle>
            <CardDescription>This invitation has already been accepted.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not logged in — show invitation details + login prompt
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Join {details.team_name}</CardTitle>
            <CardDescription>
              {details.inviter_name} invited you to join as{" "}
              <Badge variant="outline" className="ml-1 capitalize">{details.role}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Log in or create an account to accept this invitation.
            </p>
            <Button onClick={() => {
              localStorage.setItem("pending_invite_token", token!);
              navigate(`/login?redirect=/invite/${token}`);
            }} className="w-full gap-2">
              <LogIn className="w-4 h-4" /> Log In to Accept
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logged in — show full invitation with accept/decline
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Join {details.team_name}</CardTitle>
          <CardDescription className="space-y-2">
            <span className="block">
              Invited by <span className="font-medium text-foreground">{details.inviter_name}</span>
            </span>
            <span className="block">
              Role: <Badge variant="outline" className="ml-1 capitalize">{details.role}</Badge>
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleAccept} disabled={isAccepting} className="w-full">
            {isAccepting ? "Joining..." : "Accept Invitation"}
          </Button>
          <Button
            variant="outline"
            onClick={handleDecline}
            disabled={isDeclining}
            className="w-full text-destructive hover:text-destructive"
          >
            {isDeclining ? "Declining..." : "Decline"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
