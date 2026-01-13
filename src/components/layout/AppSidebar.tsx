import { 
  Home, 
  BookOpen, 
  Zap, 
  Target, 
  Search, 
  Settings,
  ChevronRight,
  ChevronLeft,
  Plus,
  PenLine,
  Heart,
  Sparkles,
  CheckSquare,
  Clock,
  CheckCircle2,
  FileText,
  BarChart3,
  Lightbulb,
  X
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const quickActions = [
  { label: "New Journal Entry", href: "/journal/new", icon: <Plus className="w-4 h-4" /> },
  { label: "Capture Decision", href: "/decisions/new", icon: <Zap className="w-4 h-4" /> },
  { label: "Deep Snag", href: "/analyze", icon: <Target className="w-4 h-4" /> },
  { label: "Post-Mortem", href: "/post-mortem/new", icon: <Search className="w-4 h-4" /> },
];

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <Home className="w-4 h-4" /> },
  { 
    label: "Journal", 
    href: "/journal", 
    icon: <BookOpen className="w-4 h-4" />,
    children: [
      { label: "All Entries", href: "/journal", icon: <FileText className="w-4 h-4" /> },
      { label: "Gratitude", href: "/journal?type=gratitude", icon: <Heart className="w-4 h-4" /> },
      { label: "Manifestation", href: "/journal?type=manifestation", icon: <Sparkles className="w-4 h-4" /> },
      { label: "Habits", href: "/habits", icon: <CheckSquare className="w-4 h-4" /> },
    ]
  },
  { 
    label: "Decisions", 
    href: "/decisions", 
    icon: <Zap className="w-4 h-4" />,
    children: [
      { label: "Captured", href: "/decisions?status=pending", icon: <PenLine className="w-4 h-4" /> },
      { label: "Pending Outcomes", href: "/decisions?status=made", icon: <Clock className="w-4 h-4" /> },
      { label: "Completed", href: "/decisions?status=completed", icon: <CheckCircle2 className="w-4 h-4" /> },
    ]
  },
  { 
    label: "Frameworks", 
    href: "/frameworks", 
    icon: <Target className="w-4 h-4" />,
    children: [
      { label: "Pre-Mortem", href: "/analyze", icon: <Target className="w-4 h-4" /> },
      { label: "Post-Mortem", href: "/post-mortem", icon: <Search className="w-4 h-4" /> },
      { label: "Business Tools", href: "/frameworks", icon: <BarChart3 className="w-4 h-4" /> },
    ]
  },
  { label: "Patterns & Insights", href: "/patterns", icon: <Lightbulb className="w-4 h-4" /> },
  { label: "Settings", href: "/settings", icon: <Settings className="w-4 h-4" /> },
];

export function AppSidebar({ open, onClose, collapsed, onToggleCollapse }: AppSidebarProps) {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/dashboard") return location.pathname === "/dashboard";
    if (href.includes("?")) {
      const [path, query] = href.split("?");
      return location.pathname === path && location.search.includes(query.split("=")[1]);
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-white border-r border-border h-full",
          "transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Quick Actions */}
        {!collapsed && (
          <div className="p-4 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Quick Actions
            </p>
            <div className="space-y-1">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="text-primary">{action.icon}</span>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {!collapsed && (
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Navigation
            </p>
          )}
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavItemComponent
                key={item.href}
                item={item}
                collapsed={collapsed}
                isActive={isActive}
              />
            ))}
          </div>
        </nav>

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full justify-center"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-border",
          "transform transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-lg font-bold text-primary">Snag</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Quick Actions
          </p>
          <div className="space-y-1">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                to={action.href}
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                <span className="text-primary">{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Navigation
          </p>
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavItemComponent
                key={item.href}
                item={item}
                collapsed={false}
                isActive={isActive}
                onNavigate={onClose}
              />
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}

function NavItemComponent({ 
  item, 
  collapsed, 
  isActive,
  onNavigate
}: { 
  item: NavItem; 
  collapsed: boolean; 
  isActive: (href: string) => boolean;
  onNavigate?: () => void;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isItemActive = isActive(item.href);
  const hasActiveChild = hasChildren && item.children?.some(child => isActive(child.href));

  if (collapsed) {
    return (
      <Link
        to={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center justify-center p-2 rounded-lg transition-colors",
          isItemActive || hasActiveChild
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        title={item.label}
      >
        {item.icon}
      </Link>
    );
  }

  if (!hasChildren) {
    return (
      <Link
        to={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
          isItemActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        {item.icon}
        {item.label}
      </Link>
    );
  }

  return (
    <div className="space-y-1">
      <Link
        to={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
          isItemActive || hasActiveChild
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        {item.icon}
        {item.label}
      </Link>
      <div className="pl-6 space-y-1">
        {item.children?.map((child) => (
          <Link
            key={child.href}
            to={child.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors",
              isActive(child.href)
                ? "text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {child.icon}
            {child.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
