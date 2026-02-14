import { useState, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useDecisionTemplates, type DecisionTemplate } from "@/hooks/useDecisionTemplates";
import { useCurrentTeamRole, type Team } from "@/hooks/useTeams";
import { Button } from "@/components/ui/button";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { DepartmentBadge } from "@/components/templates/DepartmentBadge";
import { DEPARTMENTS } from "@/lib/departments";
import { Plus, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamTemplatesPage() {
  const { team } = useOutletContext<{ team: Team }>();
  const navigate = useNavigate();
  const { data: templates, isLoading } = useDecisionTemplates(team?.id);
  const { role } = useCurrentTeamRole(team?.id);
  const [deptFilter, setDeptFilter] = useState<string>("all");

  const isBusinessTier = team?.subscription_tier === "business" || team?.subscription_tier === "enterprise";

  const filtered = useMemo(() => {
    if (!templates) return [];
    if (deptFilter === "all") return templates;
    return templates.filter(t => t.department === deptFilter);
  }, [templates, deptFilter]);

  const handleUse = (template: DecisionTemplate) => {
    navigate(`/team/${team.slug}/decisions/new?template=${template.id}`);
  };

  const handleCustomize = (template: DecisionTemplate) => {
    navigate(`/team/${team.slug}/templates/new?from=${template.id}`);
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Decision Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Templates help you analyze faster with domain expertise built in
          </p>
        </div>
        {isBusinessTier && (
          <Button onClick={() => navigate(`/team/${team.slug}/templates/new`)}>
            <Plus className="w-4 h-4 mr-1" /> Create Template
          </Button>
        )}
      </div>

      {/* Department filter */}
      <div className="flex gap-1.5 flex-wrap">
        <Button
          size="sm"
          variant={deptFilter === "all" ? "default" : "outline"}
          className="h-8 text-xs"
          onClick={() => setDeptFilter("all")}
        >
          All ({templates?.length || 0})
        </Button>
        {DEPARTMENTS.map(d => {
          const count = templates?.filter(t => t.department === d.value).length || 0;
          if (count === 0) return null;
          return (
            <Button
              key={d.value}
              size="sm"
              variant={deptFilter === d.value ? "default" : "outline"}
              className="h-8 text-xs"
              onClick={() => setDeptFilter(d.value)}
            >
              {d.label} ({count})
            </Button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">No templates found</h2>
          <p className="text-sm text-muted-foreground">
            {deptFilter !== "all" ? "Try selecting a different department." : "Templates will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              onUse={handleUse}
              onCustomize={handleCustomize}
              canCustomize={isBusinessTier}
            />
          ))}
        </div>
      )}
    </div>
  );
}
