import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface TeamReportExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (dateRange: string, filter: string) => void;
  totalDecisions: number;
}

export function TeamReportExportModal({
  open,
  onOpenChange,
  onExport,
  totalDecisions,
}: TeamReportExportModalProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState("30");
  const [filter, setFilter] = useState("all");

  const handleExport = async () => {
    setIsExporting(true);
    try {
      onExport(dateRange, filter);
      toast({ title: "Report exported", description: "Your team summary PDF has been downloaded." });
      onOpenChange(false);
    } catch {
      toast({ title: "Export failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Export Team Report
          </DialogTitle>
          <DialogDescription>
            Generate a summary PDF of team decision intelligence
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm">Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Include Decisions</Label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All decisions</SelectItem>
                <SelectItem value="completed">Completed only</SelectItem>
                <SelectItem value="high_stakes">High stakes only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{totalDecisions}</p>
            <p className="text-xs text-muted-foreground">decisions will be included</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleExport}
            disabled={totalDecisions === 0 || isExporting}
          >
            {isExporting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
            ) : (
              <><Download className="w-4 h-4 mr-2" />Download PDF</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
