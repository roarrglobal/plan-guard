import React from "react";

interface Props {
  content: string;
}

/**
 * Renders markdown-like help content as styled HTML.
 * Supports: ###, **, tables, lists, inline code.
 */
export function HelpArticleRenderer({ content }: Props) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Table detection
    if (line.includes("|") && i + 1 < lines.length && lines[i + 1]?.match(/^\|[\s\-|]+\|$/)) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      elements.push(<MarkdownTable key={`table-${i}`} lines={tableLines} />);
      continue;
    }

    // Heading ###
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-base font-semibold text-foreground mt-5 mb-2">
          {renderInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // Unordered list
    if (line.match(/^[-✅❌➖•] /)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^[-✅❌➖•] /)) {
        listItems.push(lines[i].replace(/^[-•] /, ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-1.5 my-2">
          {listItems.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/50 flex-shrink-0" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\. /)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        listItems.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="space-y-1.5 my-2 list-decimal list-inside">
          {listItems.map((item, j) => (
            <li key={j} className="text-sm text-muted-foreground">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-sm text-muted-foreground my-2 leading-relaxed">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function renderInline(text: string): React.ReactNode {
  // Bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-medium text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Inline code `text`
    const codeParts = part.split(/(`[^`]+`)/g);
    if (codeParts.length > 1) {
      return codeParts.map((cp, j) => {
        if (cp.startsWith("`") && cp.endsWith("`")) {
          return (
            <code key={`${i}-${j}`} className="px-1 py-0.5 rounded bg-muted text-xs font-mono">
              {cp.slice(1, -1)}
            </code>
          );
        }
        return cp;
      });
    }
    return part;
  });
}

function MarkdownTable({ lines }: { lines: string[] }) {
  const parseRow = (line: string) =>
    line
      .split("|")
      .filter((c) => c.trim() !== "")
      .map((c) => c.trim());

  const headers = parseRow(lines[0]);
  const rows = lines.slice(2).map(parseRow); // skip separator

  return (
    <div className="my-3 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left font-medium text-foreground text-xs">
                {renderInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-muted-foreground text-xs">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
