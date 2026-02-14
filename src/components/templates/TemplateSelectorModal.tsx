import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DepartmentBadge } from "./DepartmentBadge";
import { DEPARTMENTS } from "@/lib/departments";
import { Search, FileText, ArrowRight } from "lucide-react";
import type { DecisionTemplate } from "@/hooks/useDecisionTemplates";

interface TemplateSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: DecisionTemplate[];
  onSelect: (template: DecisionTemplate) => void;
}

export function TemplateSelectorModal({ open, onOpenChange, templates, onSelect }: TemplateSelectorModalProps) {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState<string>("all");

  const filtered = useMemo(() => {
    let list = templates;
    if (dept !== "all") list = list.filter(t => t.department === dept);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
    }
    return list;
  }, [templates, dept, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="pl-9"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          <Button
            size="sm"
            variant={dept === "all" ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => setDept("all")}
          >
            All
          </Button>
          {DEPARTMENTS.map(d => (
            <Button
              key={d.value}
              size="sm"
              variant={dept === d.value ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() => setDept(d.value)}
            >
              {d.label}
            </Button>
          ))}
        </div>

        <div className="flex-1 overflow-auto space-y-2 min-h-0">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No templates found</div>
          ) : (
            filtered.map(t => (
              <button
                key={t.id}
                onClick={() => { onSelect(t); onOpenChange(false); }}
                className="w-full p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{t.name}</span>
                      <DepartmentBadge department={t.department} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{t.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
