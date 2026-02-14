import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

/**
 * Hook that checks for pending team invitations matching the current user's email.
 * Shows a toast notification prompting them to accept.
 */
export function usePendingInvitations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user?.email || checked) return;

    const checkInvitations = async () => {
      const { data } = await supabase
        .from("team_invitations")
        .select("id, token, team_id, role")
        .eq("email", user.email!.toLowerCase())
        .is("accepted_at", null);

      if (data && data.length > 0) {
        // Get team names
        const teamIds = data.map((inv: any) => inv.team_id);
        const { data: teams } = await supabase
          .from("teams")
          .select("id, name, slug")
          .in("id", teamIds);

        data.forEach((inv: any) => {
          const team = teams?.find((t: any) => t.id === inv.team_id);
          if (team) {
            toast.info(`You've been invited to join ${(team as any).name}`, {
              action: {
                label: "View",
                onClick: () => navigate(`/invite/${inv.token}`),
              },
              duration: 10000,
            });
          }
        });
      }
      setChecked(true);
    };

    checkInvitations();
  }, [user, checked]);
}
