import { useNavigate, useLocation } from "react-router-dom";
import { useTeams } from "@/hooks/useTeams";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, Plus, ChevronDown, Check } from "lucide-react";
import { useCurrentTeamRole } from "@/hooks/useTeams";
import { cn } from "@/lib/utils";

function TeamAvatar({ name, className }: { name: string; className?: string }) {
  const initial = (name || "T")[0].toUpperCase();
  const colors = [
    "bg-primary/15 text-primary",
    "bg-destructive/15 text-destructive",
    "bg-secondary text-secondary-foreground",
    "bg-accent text-accent-foreground",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const colorClass = colors[Math.abs(hash) % colors.length];

  return (
    <div className={cn("w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0", colorClass, className)}>
      {initial}
    </div>
  );
}

const roleBadgeVariant: Record<string, string> = {
  owner: "bg-foreground text-background",
  admin: "bg-primary/15 text-primary",
  member: "bg-muted text-muted-foreground",
  viewer: "bg-muted/60 text-muted-foreground",
};

export function TeamSwitcher() {
  const { teams, isLoading } = useTeams();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect current team from URL
  const slugMatch = location.pathname.match(/^\/team\/([^/]+)/);
  const currentSlug = slugMatch?.[1];
  const currentTeam = teams.find((t) => t.slug === currentSlug);

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
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground max-w-[180px]">
          {currentTeam ? (
            <>
              <TeamAvatar name={currentTeam.name} className="w-6 h-6 text-[10px]" />
              <span className="hidden sm:inline truncate">{currentTeam.name}</span>
            </>
          ) : (
            <>
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Teams</span>
            </>
          )}
          <ChevronDown className="w-3 h-3 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Teams</p>
        </div>
        {teams.map((t) => {
          const isActive = t.slug === currentSlug;
          return (
            <DropdownMenuItem
              key={t.id}
              onClick={() => navigate(`/team/${t.slug}/dashboard`)}
              className={cn("flex items-center gap-3 py-2.5", isActive && "bg-muted")}
            >
              <TeamAvatar name={t.name} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.name}</p>
              </div>
              {isActive && <Check className="w-4 h-4 text-primary shrink-0" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/team/new")} className="gap-2">
          <Plus className="w-4 h-4" /> New Team
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
