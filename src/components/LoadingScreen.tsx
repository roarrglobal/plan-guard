import { useEffect, useState } from "react";
import { SnagLogo } from "./SnagLogo";

const loadingMessages = [
  "Finding the snags...",
  "Stress-testing assumptions...",
  "Mapping failure modes...",
  "Identifying blind spots...",
  "Crafting the unasked question...",
];

export function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6 z-50">
      <div className="flex flex-col items-center gap-8">
        {/* Animated logo */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30">
            <SnagLogo size="lg" />
          </div>
        </div>

        {/* Loading message */}
        <div className="text-center">
          <p className="text-lg font-medium text-foreground animate-fade-in-up" key={messageIndex}>
            {loadingMessages[messageIndex]}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This usually takes 15-30 seconds
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
