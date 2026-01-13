import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisInputProps {
  onSubmit: (text: string) => void;
  isLoading?: boolean;
  className?: string;
  placeholder?: string;
  compact?: boolean;
}

const MAX_CHARS = 1000;
const MIN_CHARS = 20;

export function AnalysisInput({
  onSubmit,
  isLoading = false,
  className,
  placeholder = "Describe your plan or decision...",
  compact = false,
}: AnalysisInputProps) {
  const [text, setText] = useState("");

  const charCount = text.length;
  const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;
  const charCountColor = charCount > MAX_CHARS 
    ? "text-destructive" 
    : charCount >= MIN_CHARS 
      ? "text-success" 
      : "text-muted-foreground";

  const handleSubmit = () => {
    if (isValid && !isLoading) {
      onSubmit(text);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className={cn(
            "input-field resize-none w-full",
            compact ? "min-h-[120px]" : "min-h-[180px]",
            "text-base leading-relaxed"
          )}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey && isValid) {
              handleSubmit();
            }
          }}
        />
        
        <div className="flex items-center justify-between mt-3 px-1">
          <span className={cn("text-sm font-medium transition-colors", charCountColor)}>
            {charCount}/{MAX_CHARS}
          </span>
          
          <Button
            variant="hero"
            size="lg"
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-pulse">Analyzing</span>
                <span className="flex gap-0.5">
                  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                </span>
              </>
            ) : (
              <>
                Analyze
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </div>
      
      {charCount > 0 && charCount < MIN_CHARS && (
        <p className="text-sm text-muted-foreground mt-2">
          Need at least {MIN_CHARS - charCount} more characters
        </p>
      )}
    </div>
  );
}
