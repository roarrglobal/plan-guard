import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UsageLimitsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const limitsData = [
  { category: "Analyses", free: "3 lifetime", pro: "100/mo", team: "500/mo", business: "2,000/mo" },
  { category: "Document uploads", free: "—", pro: "15/mo", team: "75/mo", business: "300/mo" },
  { category: "Storage", free: "—", pro: "500 MB", team: "5 GB", business: "25 GB" },
  { category: "Max file size", free: "—", pro: "5 MB", team: "10 MB", business: "25 MB" },
  { category: "Max word count", free: "—", pro: "10,000", team: "25,000", business: "50,000" },
  { category: "Team members", free: "1", pro: "1", team: "5", business: "20" },
  { category: "API requests", free: "—", pro: "—", team: "—", business: "1,000/mo*" },
];

const fileTypesData = [
  { type: "PDF (.pdf)", free: "—", pro: "✓", team: "✓", business: "✓" },
  { type: "Word (.doc, .docx)", free: "—", pro: "✓", team: "✓", business: "✓" },
  { type: "Text (.txt)", free: "—", pro: "✓", team: "✓", business: "✓" },
  { type: "Images (.jpg, .png)", free: "—", pro: "✓", team: "✓", business: "✓" },
  { type: "Excel (.xlsx)", free: "—", pro: "—", team: "✓", business: "✓" },
  { type: "PowerPoint (.pptx)", free: "—", pro: "—", team: "✓", business: "✓" },
  { type: "Custom formats", free: "—", pro: "—", team: "—", business: "Enterprise" },
];

export default function UsageLimitsModal({ open, onOpenChange }: UsageLimitsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Usage Limits by Plan
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            All plans include fair usage limits. Limits reset monthly on your billing date.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Usage Limits Table */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Usage Limits</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Limit</TableHead>
                    <TableHead className="text-center font-semibold">Free</TableHead>
                    <TableHead className="text-center font-semibold">Pro</TableHead>
                    <TableHead className="text-center font-semibold text-crimson">Team</TableHead>
                    <TableHead className="text-center font-semibold">Business</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {limitsData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.category}</TableCell>
                      <TableCell className="text-center text-muted-foreground">{row.free}</TableCell>
                      <TableCell className="text-center">{row.pro}</TableCell>
                      <TableCell className="text-center font-medium">{row.team}</TableCell>
                      <TableCell className="text-center">{row.business}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* File Types Table */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Supported File Types</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">File Type</TableHead>
                    <TableHead className="text-center font-semibold">Free</TableHead>
                    <TableHead className="text-center font-semibold">Pro</TableHead>
                    <TableHead className="text-center font-semibold text-crimson">Team</TableHead>
                    <TableHead className="text-center font-semibold">Business</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fileTypesData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.type}</TableCell>
                      <TableCell className="text-center text-muted-foreground">{row.free}</TableCell>
                      <TableCell className="text-center">{row.pro}</TableCell>
                      <TableCell className="text-center font-medium">{row.team}</TableCell>
                      <TableCell className="text-center">{row.business}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Top-up Packs Info */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Need more?</h3>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>• <strong>Analysis top-up:</strong> $5 for 25 additional analyses</li>
              <li>• <strong>Storage top-up:</strong> $3 for 1 GB additional storage</li>
              <li>• <strong>Upgrade anytime:</strong> Switch plans mid-cycle and pay the prorated difference</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3">
              * API access is an add-on for Business plans. Contact sales for Enterprise pricing with unlimited usage.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
