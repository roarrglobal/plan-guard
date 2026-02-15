interface ChatSuggestionsProps {
  suggestions: string[];
  onSelect: (text: string) => void;
}

export function ChatSuggestions({ suggestions, onSelect }: ChatSuggestionsProps) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-muted text-foreground transition"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
