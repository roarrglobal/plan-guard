import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Users } from "lucide-react";

export default function TeamNewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);

  const handleCreate = async () => {
    if (!user || !name.trim()) return;
    setIsCreating(true);

    const slug = generateSlug(name);
    
    // Create team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({
        name: name.trim(),
        slug,
        owner_id: user.id,
        subscription_status: "trialing" as any,
        subscription_tier: "team" as any,
        trial_ends_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (teamError) {
      toast.error(teamError.message.includes("unique") ? "A team with that name already exists" : teamError.message);
      setIsCreating(false);
      return;
    }

    // Add creator as owner member
    const { error: memberError } = await supabase
      .from("team_members")
      .insert({ team_id: team.id, user_id: user.id, role: "owner", status: "active", joined_at: new Date().toISOString() });

    if (memberError) {
      toast.error("Team created but failed to add you as member");
      setIsCreating(false);
      return;
    }

    toast.success("Team created!");
    navigate(`/team/${slug}/dashboard`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Create a Team</CardTitle>
          <CardDescription>Set up a workspace for your team's decision intelligence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                placeholder="e.g. Acme Corp"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              {name && (
                <p className="text-xs text-muted-foreground">
                  URL: /team/{generateSlug(name)}
                </p>
              )}
            </div>
            <Button onClick={handleCreate} disabled={!name.trim() || isCreating} className="w-full">
              {isCreating ? "Creating..." : "Create Team"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
