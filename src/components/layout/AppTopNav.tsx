import { Menu, X, ChevronDown } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUsage } from "@/hooks/useUsage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { SnagLogo } from "@/components/SnagLogo";
import { TeamSwitcher } from "@/components/team/TeamSwitcher";
import { NotificationBell } from "@/components/notifications/NotificationBell";

interface AppTopNavProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export function AppTopNav({ onMenuClick, sidebarOpen }: AppTopNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { usage } = useUsage();

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;
  const isActivePrefix = (prefix: string) => location.pathname.startsWith(prefix);

  // Usage display
  const analysesUsed = usage?.analyses_used || 0;
  const analysesLimit = usage?.analyses_limit || 50;
  const usageText = analysesLimit === -1 
    ? `${analysesUsed} Deep Snags` 
    : `${analysesUsed}/${analysesLimit} Deep Snags`;

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Logo + Mobile Menu */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 md:hidden rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <SnagLogo size="sm" />
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/dashboard"
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              isActive("/dashboard")
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Dashboard
          </Link>

          <Link
            to="/journal"
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              isActivePrefix("/journal")
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Journal
          </Link>

          <Link
            to="/decisions"
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              isActivePrefix("/decisions")
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Decisions
          </Link>

          {/* Frameworks Dropdown */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-transparent",
                    isActivePrefix("/frameworks") || isActive("/analyze") || isActivePrefix("/post-mortem")
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Frameworks
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[280px] gap-1 p-2">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/analyze"
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted focus:bg-muted"
                        >
                          <div className="text-sm font-medium text-foreground">🎯 Pre-Mortem (Deep Snag)</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Stress-test a plan before you commit
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/post-mortem"
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted focus:bg-muted"
                        >
                          <div className="text-sm font-medium text-foreground">🔍 Post-Mortem</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Analyze what happened after
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/frameworks"
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted focus:bg-muted"
                        >
                          <div className="text-sm font-medium text-foreground">📊 Business Frameworks</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            SWOT, Porter's Five Forces, MEDDPICC, and more
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Right: Usage + Profile */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <NotificationBell />

          {/* Team switcher */}
          <TeamSwitcher />

          {/* Usage indicator - desktop only */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
            <span className="text-xs font-medium text-muted-foreground">
              {usageText}
            </span>
          </div>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-muted transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium truncate text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings?tab=billing")}>
                Billing
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
