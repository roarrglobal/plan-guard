import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DepartmentBadge } from "./DepartmentBadge";
import { FileText, Copy } from "lucide-react";
import type { DecisionTemplate } from "@/hooks/useDecisionTemplates";

interface TemplateCardProps {
  template: DecisionTemplate;
  onUse: (template: DecisionTemplate) => void;
  onCustomize?: (template: DecisionTemplate) => void;
  canCustomize?: boolean;
  usageCount?: number;
}

export function TemplateCard({ template, onUse, onCustomize, canCustomize, usageCount }: TemplateCardProps) {
  return (
    <Card className="group hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <DepartmentBadge department={template.department} />
              {template.is_system && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">System</Badge>
              )}
            </div>
            <h3 className="font-semibold text-sm text-foreground truncate">{template.name}</h3>
          </div>
          <div className="shrink-0 w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{template.blind_spot_library?.length || 0} blind spots</span>
          <span>·</span>
          <span>{template.failure_mode_library?.length || 0} failure modes</span>
          {(template.usage_count > 0 || (usageCount !== undefined && usageCount > 0)) && (
            <>
              <span>·</span>
              <span>{template.usage_count || usageCount} uses</span>
            </>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <Button size="sm" className="flex-1 h-8 text-xs" onClick={() => onUse(template)}>
            Use Template
          </Button>
          {canCustomize && (
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => onCustomize?.(template)}>
              <Copy className="w-3 h-3 mr-1" /> Customize
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
