import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Team } from "@/hooks/useTeams";

export default function TeamSettingsPage() {
  const { team } = useOutletContext<{ team: Team }>();
  const { can } = useTeamPermissions(team?.id);
  const navigate = useNavigate();

  const [name, setName] = useState(team.name);
  const [slug, setSlug] = useState(team.slug);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 48);
    const { error } = await supabase.from("teams").update({ name: name.trim(), slug: cleanSlug }).eq("id", team.id);
    if (error) {
      toast.error(error.message.includes("unique") ? "That slug is already taken" : error.message);
    } else {
      toast.success("Settings saved");
      if (cleanSlug !== team.slug) navigate(`/team/${cleanSlug}/settings`, { replace: true });
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure? This will permanently delete the team and all associated data.")) return;
    if (!confirm("This cannot be undone. Type the team name to confirm.")) return;
    const { error } = await supabase.from("teams").delete().eq("id", team.id);
    if (error) toast.error(error.message);
    else { toast.success("Team deleted"); navigate("/dashboard"); }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Team Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Team Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!can("edit_settings")} />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} disabled={!can("edit_settings")} />
            <p className="text-xs text-muted-foreground">URL: /team/{slug}</p>
          </div>
          {can("edit_settings") && (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </CardContent>
      </Card>

      {can("delete_team") && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
            <CardDescription>Permanently delete this team and all data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleDelete}>Delete Team</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
