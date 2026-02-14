import { useNavigate } from "react-router-dom";
import { useTeams } from "@/hooks/useTeams";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, Plus, ChevronDown } from "lucide-react";

export function TeamSwitcher() {
  const { teams, isLoading } = useTeams();
  const navigate = useNavigate();

  if (isLoading) return null;

  if (teams.length === 0) {
    return (
      <Button variant="ghost" size="sm" onClick={() => navigate("/team/new")} className="gap-2 text-muted-foreground">
        <Users className="w-4 h-4" /> Create Team
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">Teams</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {teams.map((t) => (
          <DropdownMenuItem key={t.id} onClick={() => navigate(`/team/${t.slug}/dashboard`)}>
            {t.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/team/new")}>
          <Plus className="w-4 h-4 mr-2" /> New Team
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
