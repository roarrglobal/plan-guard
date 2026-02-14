import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ListChecks, BarChart3, Users, Settings, X, Keyboard } from "lucide-react";
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
import type { Team } from "@/hooks/useTeams";
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";

interface TeamSidebarProps {
  slug: string;
  teamName: string;
  open: boolean;
  onClose: () => void;
  teamId?: string;
}

export function TeamSidebar({ slug, teamName, open, onClose, teamId }: TeamSidebarProps) {
  const location = useLocation();
  const { can } = useTeamPermissions(teamId);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const items = [
    { label: "Dashboard", icon: LayoutDashboard, href: `/team/${slug}/dashboard`, show: can("view_dashboard") },
    { label: "Decisions", icon: ListChecks, href: `/team/${slug}/decisions`, show: can("view_decisions") },
    { label: "Analytics", icon: BarChart3, href: `/team/${slug}/analytics`, show: can("view_analytics") },
    { label: "Members", icon: Users, href: `/team/${slug}/members`, show: can("view_members") },
    { label: "Settings", icon: Settings, href: `/team/${slug}/settings`, show: can("view_settings") },
  ].filter((i) => i.show);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}
      
      <aside className={cn(
        "fixed md:sticky top-0 left-0 z-50 md:z-0 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-300",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-sm truncate text-foreground">{teamName}</h2>
          <button onClick={onClose} className="md:hidden p-1 rounded hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {items.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-border">
          <button
            onClick={() => setShortcutsOpen(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full"
          >
            <Keyboard className="w-4 h-4 shrink-0" />
            Shortcuts
            <kbd className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono border border-border">?</kbd>
          </button>
        </div>
        <KeyboardShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      </aside>
    </>
  );
}
