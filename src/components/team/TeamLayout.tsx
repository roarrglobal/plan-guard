import { useState, useEffect } from "react";
import { Outlet, useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamBySlug } from "@/hooks/useTeams";
import { TeamSidebar } from "./TeamSidebar";
import { Menu } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function TeamLayout() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const { team, isLoading: teamLoading } = useTeamBySlug(slug);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user]);

  if (authLoading || teamLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Skeleton className="w-48 h-6" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Team not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <TeamSidebar slug={team.slug} teamName={team.name} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-3 p-3 border-b border-border bg-background">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-muted">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-sm text-foreground truncate">{team.name}</span>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet context={{ team }} />
        </main>
      </div>
    </div>
  );
}
