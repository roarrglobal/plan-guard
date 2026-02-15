import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isTeam?: boolean;
}

// Simple markdown-ish renderer: bold, links, bullets
function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, li) => {
    if (line.startsWith("- ") || line.startsWith("• ")) {
      elements.push(
        <li key={li} className="ml-4 list-disc">
          {renderInline(line.slice(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(line)) {
      elements.push(
        <li key={li} className="ml-4 list-decimal">
          {renderInline(line.replace(/^\d+\.\s/, ""))}
        </li>
      );
    } else if (line.trim() === "") {
      elements.push(<br key={li} />);
    } else {
      elements.push(<p key={li}>{renderInline(line)}</p>);
    }
  });

  return elements;
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Match **bold**, [text](/link), `code`
  const regex = /(\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    } else if (match[3] && match[4]) {
      const href = match[4];
      if (href.startsWith("/")) {
        parts.push(
          <Link key={match.index} to={href} className="text-primary underline hover:no-underline">
            {match[3]}
          </Link>
        );
      } else {
        parts.push(
          <a key={match.index} href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
            {match[3]}
          </a>
        );
      }
    } else if (match[5]) {
      parts.push(
        <code key={match.index} className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
          {match[5]}
        </code>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

export function ChatMessage({ role, content, isTeam }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? cn(
                "text-white",
                isTeam ? "bg-[hsl(215,100%,33%)]" : "bg-primary"
              )
            : "bg-muted text-foreground"
        )}
      >
        <div className="space-y-1 [&>p]:mb-1 [&>li]:mb-0.5">{renderContent(content)}</div>
      </div>
    </div>
  );
}
