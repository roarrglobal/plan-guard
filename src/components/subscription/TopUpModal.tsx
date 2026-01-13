import { Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TopUpPack {
  id: string;
  name: string;
  amount: number;
  price: number;
  type: "deep_snag" | "post_mortem" | "document";
}

const topUpPacks: TopUpPack[] = [
  { id: "deep-snag-10", name: "10 Deep Snags", amount: 10, price: 5, type: "deep_snag" },
  { id: "post-mortem-5", name: "5 Post-Mortems", amount: 5, price: 5, type: "post_mortem" },
  { id: "document-5", name: "5 Document Uploads", amount: 5, price: 3, type: "document" },
];

interface TopUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureType?: "deep_snag" | "post_mortem" | "document";
  daysUntilReset?: number;
}

export function TopUpModal({
  open,
  onOpenChange,
  featureType,
  daysUntilReset = 0,
}: TopUpModalProps) {
  const relevantPacks = featureType 
    ? topUpPacks.filter(p => p.type === featureType)
    : topUpPacks;

  const handlePurchase = (pack: TopUpPack) => {
    // TODO: Integrate with Stripe when available
    console.log("Purchase top-up pack:", pack);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Zap className="w-5 h-5 text-primary" />
            Top Up Your Usage
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Need more before your monthly reset? Get a one-time top-up pack.
          </p>

          <div className="space-y-2">
            {relevantPacks.map((pack) => (
              <button
                key={pack.id}
                onClick={() => handlePurchase(pack)}
                className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium">{pack.name}</span>
                <span className="text-primary font-bold">${pack.price}</span>
              </button>
            ))}
          </div>

          {daysUntilReset > 0 && (
            <p className="text-xs text-center text-muted-foreground">
              Or wait {daysUntilReset} days for your usage to reset
            </p>
          )}

          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
