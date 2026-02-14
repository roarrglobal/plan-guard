import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface ShortcutItem {
  keys: string[];
  description: string;
}

const shortcuts: ShortcutItem[] = [
  { keys: ["⌘", "K"], description: "Quick Snag — rapid decision analysis" },
  { keys: ["⌘", "N"], description: "New Decision — create a full decision" },
  { keys: ["?"], description: "Show this shortcuts panel" },
];

const windowsMap: Record<string, string> = { "⌘": "Ctrl" };

function KeyCombo({ keys, platform }: { keys: string[]; platform: "mac" | "win" }) {
  return (
    <span className="flex items-center gap-1">
      {keys.map((k, i) => (
        <span key={i} className="flex items-center gap-0.5">
          {i > 0 && <span className="text-muted-foreground text-xs">+</span>}
          <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md bg-muted border border-border text-xs font-mono font-medium text-foreground">
            {platform === "win" && windowsMap[k] ? windowsMap[k] : k}
          </kbd>
        </span>
      ))}
    </span>
  );
}

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Mac shortcuts */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Mac</p>
            <div className="space-y-2">
              {shortcuts.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-foreground">{s.description}</span>
                  <KeyCombo keys={s.keys} platform="mac" />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Windows shortcuts */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Windows / Linux</p>
            <div className="space-y-2">
              {shortcuts.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-foreground">{s.description}</span>
                  <KeyCombo keys={s.keys} platform="win" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
