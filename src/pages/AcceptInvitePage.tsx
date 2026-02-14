import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Users, CheckCircle, XCircle, LogIn } from "lucide-react";

interface InviteData {
  id: string;
  team_id: string;
  email: string;
  role: string;
  expires_at: string;
  accepted_at: string | null;
  team_name?: string;
}

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch invite details (using edge function or direct query)
  useEffect(() => {
    if (!token) return;
    const fetchInvite = async () => {
      // We need to fetch the invitation - but RLS requires the user to be the invitee or admin
      // For unauthenticated users, we'll show a generic "log in to accept" message
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("token", token)
        .maybeSingle();

      if (fetchError || !data) {
        setError("Invitation not found or has expired.");
        setIsLoading(false);
        return;
      }

      // Fetch team name
      const { data: team } = await supabase
        .from("teams")
        .select("name")
        .eq("id", data.team_id)
        .maybeSingle();

      setInvite({
        ...data,
        team_name: (team as any)?.name || "Unknown Team",
      } as InviteData);
      setIsLoading(false);
    };

    fetchInvite();
  }, [token, user]);

  const handleAccept = async () => {
    if (!user || !invite) return;
    setIsAccepting(true);

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      toast.error("This invitation has expired.");
      setIsAccepting(false);
      return;
    }

    if (invite.accepted_at) {
      toast.error("This invitation has already been accepted.");
      setIsAccepting(false);
      return;
    }

    // Check email matches
    if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
      toast.error(`This invitation was sent to ${invite.email}. Please log in with that email.`);
      setIsAccepting(false);
      return;
    }

    // Accept: update invitation, create team member
    const { error: updateError } = await supabase
      .from("team_invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invite.id);

    if (updateError) {
      toast.error(updateError.message);
      setIsAccepting(false);
      return;
    }

    // Insert team member - need admin to do this, but we use a workaround:
    // The invitation acceptance creates the member record
    // We need an RLS policy or function for this. Let's use direct insert with the invited role.
    const { error: memberError } = await supabase
      .from("team_members")
      .insert({
        team_id: invite.team_id,
        user_id: user.id,
        role: invite.role as any,
        invited_by: null,
        status: "active",
        joined_at: new Date().toISOString(),
      });

    if (memberError) {
      // Might already be a member
      if (memberError.message.includes("unique") || memberError.message.includes("duplicate")) {
        toast.info("You're already a member of this team!");
      } else {
        toast.error("Failed to join team: " + memberError.message);
        setIsAccepting(false);
        return;
      }
    } else {
      toast.success("You've joined the team!");
    }

    // Fetch team slug for redirect
    const { data: team } = await supabase
      .from("teams")
      .select("slug")
      .eq("id", invite.team_id)
      .maybeSingle();

    navigate(`/team/${(team as any)?.slug || ""}/dashboard`);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 space-y-4">
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <LogIn className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Team Invitation</CardTitle>
            <CardDescription>Log in or sign up to accept this team invitation</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(`/login?redirect=/invite/${token}`)} className="w-full">
              Log In to Accept
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
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
  if (invite?.accepted_at) {
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
            <Button onClick={() => navigate("/dashboard")} className="w-full">Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show invitation
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Join {invite?.team_name}</CardTitle>
          <CardDescription>
            You've been invited to join as <span className="font-medium text-foreground">{invite?.role}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleAccept} disabled={isAccepting} className="w-full">
            {isAccepting ? "Joining..." : "Accept Invitation"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full">
            Decline
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
