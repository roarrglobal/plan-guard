import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useTemplateById } from "@/hooks/useDecisionTemplates";
import { useCurrentTeamRole, type Team } from "@/hooks/useTeams";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DepartmentBadge } from "@/components/templates/DepartmentBadge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, Zap, Copy, ChevronDown, Eye, AlertTriangle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function TeamTemplateDetailPage() {
  const { team } = useOutletContext<{ team: Team }>();
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { data: template, isLoading } = useTemplateById(templateId);
  const isBusinessTier = team?.subscription_tier === "business" || team?.subscription_tier === "enterprise";

  const [blindSpotsOpen, setBlindSpotsOpen] = useState(true);
  const [failureModesOpen, setFailureModesOpen] = useState(true);

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto text-center py-16">
        <p className="text-muted-foreground">Template not found</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(`/team/${team.slug}/templates`)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Templates
      </button>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <DepartmentBadge department={template.department} size="md" />
          {template.is_system && <Badge variant="outline">System Template</Badge>}
        </div>
        <h1 className="text-2xl font-bold text-foreground">{template.name}</h1>
        <p className="text-sm text-muted-foreground">{template.description}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={() => navigate(`/team/${team.slug}/decisions/new?template=${template.id}`)}>
          <Zap className="w-4 h-4 mr-1" /> Use This Template
        </Button>
        {isBusinessTier && (
          <Button variant="outline" onClick={() => navigate(`/team/${team.slug}/templates/new?from=${template.id}`)}>
            <Copy className="w-4 h-4 mr-1" /> Duplicate & Customize
          </Button>
        )}
      </div>

      {/* Input Fields Preview */}
      {template.input_fields?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Input Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {template.input_fields.map((field: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted">
                <div>
                  <span className="text-sm font-medium text-foreground">{field.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">({field.type})</span>
                </div>
                {field.required && <Badge variant="outline" className="text-[10px]">Required</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Blind Spots Library */}
      {template.blind_spot_library?.length > 0 && (
        <Collapsible open={blindSpotsOpen} onOpenChange={setBlindSpotsOpen}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <CardTitle className="text-base">Blind Spot Library ({template.blind_spot_library.length})</CardTitle>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${blindSpotsOpen ? "rotate-180" : ""}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-2 pt-0">
                {template.blind_spot_library.map((spot: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg border border-border space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{spot.spot}</span>
                      <Badge variant="outline" className="text-[10px]">{spot.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{spot.prompt}</p>
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Failure Mode Library */}
      {template.failure_mode_library?.length > 0 && (
        <Collapsible open={failureModesOpen} onOpenChange={setFailureModesOpen}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <CardTitle className="text-base">Failure Mode Library ({template.failure_mode_library.length})</CardTitle>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${failureModesOpen ? "rotate-180" : ""}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-2 pt-0">
                {template.failure_mode_library.map((mode: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg border border-border space-y-1.5">
                    <span className="text-sm font-medium text-foreground">{mode.mode}</span>
                    <p className="text-xs text-muted-foreground">{mode.mechanism}</p>
                    {mode.likelihood_factors?.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {mode.likelihood_factors.map((f: string, j: number) => (
                          <Badge key={j} variant="secondary" className="text-[10px]">{f}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  );
}
