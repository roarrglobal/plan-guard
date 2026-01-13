import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, Copy, Download, Share2, Trash2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Json } from "@/integrations/supabase/types";

interface AnalysisResult {
  blind_spots?: Array<string | { title: string; description: string }>;
  failure_modes?: Array<{ mode: string; likelihood: string; impact: string; mitigation: string }>;
  warning_signals?: Array<string | { signal: string; timeframe: string }>;
  kill_criteria?: Array<string | { criterion: string; threshold: string }>;
  unasked_question?: string;
  adversarial_views?: Array<{ perspective: string; critique: string }>;
}

interface SavedAnalysis {
  id: string;
  title: string | null;
  original_input: string;
  result: Json;
  created_at: string;
  category: string | null;
}

interface AnalysisCardExpandedProps {
  analysis: SavedAnalysis;
  onCollapse: () => void;
  onDelete: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  career: "#0047AB",
  business: "#059669",
  personal: "#7C3AED",
  travel: "#D97706",
  other: "#666666",
};

export default function AnalysisCardExpanded({
  analysis,
  onCollapse,
  onDelete,
}: AnalysisCardExpandedProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const result = analysis.result as AnalysisResult;

  const formatForCopy = () => {
    let text = `PRE-MORTEM ANALYSIS\n`;
    text += `Date: ${format(new Date(analysis.created_at), "MMMM d, yyyy")}\n`;
    text += `Category: ${analysis.category || "other"}\n\n`;
    text += `ORIGINAL PLAN:\n${analysis.original_input}\n\n`;

    if (result.blind_spots?.length) {
      text += `BLIND SPOTS:\n`;
      result.blind_spots.forEach((spot, i) => {
        if (typeof spot === "string") {
          text += `${i + 1}. ${spot}\n`;
        } else {
          text += `${i + 1}. ${spot.title}: ${spot.description}\n`;
        }
      });
      text += "\n";
    }

    if (result.failure_modes?.length) {
      text += `FAILURE MODES:\n`;
      result.failure_modes.forEach((mode, i) => {
        text += `${i + 1}. ${mode.mode}\n`;
        text += `   Likelihood: ${mode.likelihood} | Impact: ${mode.impact}\n`;
        text += `   Mitigation: ${mode.mitigation}\n`;
      });
      text += "\n";
    }

    if (result.warning_signals?.length) {
      text += `WARNING SIGNALS:\n`;
      result.warning_signals.forEach((signal, i) => {
        if (typeof signal === "string") {
          text += `${i + 1}. ${signal}\n`;
        } else {
          text += `${i + 1}. ${signal.signal} (${signal.timeframe})\n`;
        }
      });
      text += "\n";
    }

    if (result.kill_criteria?.length) {
      text += `KILL CRITERIA:\n`;
      result.kill_criteria.forEach((criterion, i) => {
        if (typeof criterion === "string") {
          text += `${i + 1}. ${criterion}\n`;
        } else {
          text += `${i + 1}. ${criterion.criterion} (Threshold: ${criterion.threshold})\n`;
        }
      });
      text += "\n";
    }

    if (result.unasked_question) {
      text += `THE UNASKED QUESTION:\n${result.unasked_question}\n`;
    }

    return text;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatForCopy());
      setCopied(true);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleDownloadPDF = () => {
    toast({ title: "PDF export coming soon" });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Pre-Mortem Analysis",
        text: formatForCopy(),
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#E5E5E5]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <span
              className="inline-block text-[11px] font-medium uppercase tracking-wide mb-2"
              style={{ color: CATEGORY_COLORS[analysis.category || "other"] }}
            >
              {analysis.category || "other"}
            </span>
            <p className="text-[13px] text-[#999999]">
              {format(new Date(analysis.created_at), "MMM d, yyyy")}
            </p>
          </div>
          <button
            onClick={onCollapse}
            className="p-2 text-[#666666] hover:text-[#1A1A1A] transition-colors"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Original Input */}
      <div className="p-4 bg-[#F8F8F8] border-b border-[#E5E5E5]">
        <p className="text-[12px] font-medium text-[#999999] uppercase mb-2">Your Plan</p>
        <p className="text-[14px] text-[#333333]">{analysis.original_input}</p>
      </div>

      {/* Analysis Content */}
      <div className="p-4 space-y-6">
        {/* Blind Spots */}
        {result.blind_spots && result.blind_spots.length > 0 && (
          <section>
            <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-3">Blind Spots</h3>
            <ul className="space-y-2">
              {result.blind_spots.map((spot, i) => (
                <li key={i} className="text-[14px] text-[#333333] pl-4 border-l-2 border-[#0047AB]">
                  {typeof spot === "string" ? spot : `${spot.title}: ${spot.description}`}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Failure Modes */}
        {result.failure_modes && result.failure_modes.length > 0 && (
          <section>
            <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-3">Failure Modes</h3>
            <div className="space-y-3">
              {result.failure_modes.map((mode, i) => (
                <div key={i} className="p-3 bg-[#FEF2F2] rounded-lg border border-[#FECACA]">
                  <p className="text-[14px] font-medium text-[#333333] mb-2">{mode.mode}</p>
                  <div className="flex gap-3 text-[12px] text-[#666666] mb-2">
                    <span>Likelihood: <span className="font-medium">{mode.likelihood}</span></span>
                    <span>Impact: <span className="font-medium">{mode.impact}</span></span>
                  </div>
                  <p className="text-[13px] text-[#666666]">
                    <span className="font-medium">Mitigation:</span> {mode.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Warning Signals */}
        {result.warning_signals && result.warning_signals.length > 0 && (
          <section>
            <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-3">Warning Signals</h3>
            <ul className="space-y-2">
              {result.warning_signals.map((signal, i) => (
                <li key={i} className="text-[14px] text-[#333333] pl-4 border-l-2 border-[#D97706]">
                  {typeof signal === "string" ? signal : `${signal.signal} (${signal.timeframe})`}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Kill Criteria */}
        {result.kill_criteria && result.kill_criteria.length > 0 && (
          <section>
            <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-3">Kill Criteria</h3>
            <ul className="space-y-2">
              {result.kill_criteria.map((criterion, i) => (
                <li key={i} className="text-[14px] text-[#333333] pl-4 border-l-2 border-[#DC2626]">
                  {typeof criterion === "string" ? criterion : `${criterion.criterion} (Threshold: ${criterion.threshold})`}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Unasked Question */}
        {result.unasked_question && (
          <section className="p-4 bg-[#F0F9FF] rounded-lg border border-[#BAE6FD]">
            <h3 className="text-[14px] font-semibold text-[#0369A1] mb-2">The Unasked Question</h3>
            <p className="text-[14px] text-[#0C4A6E]">{result.unasked_question}</p>
          </section>
        )}
      </div>

      {/* Export Actions */}
      <div className="p-4 border-t border-[#E5E5E5] bg-[#FAFAFA]">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="text-[13px] gap-1.5"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              className="text-[13px] gap-1.5"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="text-[13px] gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-[13px] text-[#DC2626] hover:text-[#DC2626] hover:bg-[#FEE2E2] gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
