import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronDown,
  AlertTriangle,
  Eye,
  Skull,
  Bell,
  XCircle,
  Users,
  HelpCircle,
  Lightbulb,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---
interface BlindSpot {
  spot: string;
  category: "strategic" | "operational" | "financial" | "political";
  why_it_matters: string;
  how_to_test: string;
}

interface FailureMode {
  what: string;
  mechanism: string;
  likelihood: "high" | "medium" | "low";
  impact: "high" | "medium" | "low";
  detectability: "easy" | "hard";
  mitigation: string;
}

interface WarningSignal {
  timeframe: "30" | "60" | "90";
  signal: string;
  owner: string;
  action_if_seen: string;
}

interface KillCriterion {
  condition: string;
  deadline: string;
  action: string;
  escalation: string;
}

interface StakeholderEntry {
  stakeholder: string;
  impact: "positive" | "negative" | "neutral";
  intensity: number;
  influence: "high" | "medium" | "low";
  action: string;
}

interface Recommendation {
  option: string;
  rationale: string;
  dissenting_view: string;
  confidence: "high" | "medium" | "low";
}

interface BottomLine {
  verdict: string;
  primary_risk: string;
  key_action: string;
  confidence_note: string;
}

export interface SnagAnalysis {
  summary?: string;
  blind_spots?: BlindSpot[];
  failure_modes?: FailureMode[];
  warning_signals?: WarningSignal[];
  kill_criteria?: KillCriterion[];
  stakeholder_map?: StakeholderEntry[];
  unasked_question?: string;
  recommendation?: Recommendation;
  bottom_line?: BottomLine;
}

interface Props {
  analysis: SnagAnalysis;
  showStakeholders?: boolean;
}

// --- Helpers ---
const categoryColors: Record<string, string> = {
  strategic: "bg-[hsl(215,100%,33%)]/10 text-[hsl(215,100%,33%)]",
  operational: "bg-muted text-muted-foreground",
  financial: "bg-[hsl(160,84%,39%)]/10 text-[hsl(160,84%,39%)]",
  political: "bg-primary/10 text-primary",
};

const likelihoodColors: Record<string, string> = {
  high: "bg-primary/10 text-primary border-primary/20",
  medium: "bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,50%)] border-[hsl(38,92%,50%)]/20",
  low: "bg-[hsl(160,84%,39%)]/10 text-[hsl(160,84%,39%)] border-[hsl(160,84%,39%)]/20",
};

const verdictColors: Record<string, string> = {
  "Proceed with Confidence": "bg-[hsl(160,84%,39%)]/10 text-[hsl(160,84%,39%)] border-[hsl(160,84%,39%)]/30",
  "Proceed with Caution": "bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,50%)] border-[hsl(38,92%,50%)]/30",
  "Investigate Further": "bg-[hsl(215,100%,33%)]/10 text-[hsl(215,100%,33%)] border-[hsl(215,100%,33%)]/30",
  "Reconsider": "bg-primary/10 text-primary border-primary/30",
};

// --- Accordion Section ---
function AccordionSection({
  title,
  icon: Icon,
  accentClass,
  children,
  defaultOpen = false,
  count,
}: {
  title: string;
  icon: any;
  accentClass: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn("border border-border rounded-lg overflow-hidden border-l-[3px]", accentClass)}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground uppercase tracking-wide">{title}</span>
          {count !== undefined && (
            <span className="text-xs text-muted-foreground">({count})</span>
          )}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Main Component ---
export function SnagAnalysisDisplay({ analysis, showStakeholders = false }: Props) {
  const { summary, blind_spots, failure_modes, warning_signals, kill_criteria, stakeholder_map, unasked_question, recommendation, bottom_line } = analysis;

  const verdictClass = bottom_line?.verdict ? verdictColors[bottom_line.verdict] || verdictColors["Investigate Further"] : "";

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      {(summary || bottom_line) && (
        <Card className="border-2 border-border">
          <CardContent className="p-5 space-y-3">
            {summary && <p className="text-sm text-foreground leading-relaxed">{summary}</p>}
            <div className="flex items-center gap-3 flex-wrap">
              {bottom_line?.verdict && (
                <Badge className={cn("text-xs px-3 py-1 border", verdictClass)}>
                  {bottom_line.verdict}
                </Badge>
              )}
              {recommendation?.confidence && (
                <span className="text-xs text-muted-foreground">
                  Confidence: <span className="font-medium capitalize">{recommendation.confidence}</span>
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blind Spots */}
      {blind_spots && blind_spots.length > 0 && (
        <AccordionSection title="Blind Spots" icon={Eye} accentClass="border-l-[hsl(215,100%,33%)]" defaultOpen count={blind_spots.length}>
          <div className="space-y-3">
            {blind_spots.map((bs, i) => (
              <div key={i} className="bg-muted/30 rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{bs.spot}</p>
                  <Badge variant="outline" className={cn("text-[10px] shrink-0 capitalize", categoryColors[bs.category] || "")}>
                    {bs.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground"><span className="font-medium">Why it matters:</span> {bs.why_it_matters}</p>
                <p className="text-xs text-muted-foreground"><span className="font-medium">How to test:</span> {bs.how_to_test}</p>
              </div>
            ))}
          </div>
        </AccordionSection>
      )}

      {/* Failure Modes */}
      {failure_modes && failure_modes.length > 0 && (
        <AccordionSection title="Failure Modes" icon={Skull} accentClass="border-l-primary" count={failure_modes.length}>
          <div className="space-y-3">
            {failure_modes.map((fm, i) => (
              <div key={i} className="bg-muted/30 rounded-lg p-3 space-y-2">
                <p className="text-sm font-medium text-foreground">{fm.what}</p>
                <p className="text-xs text-muted-foreground">{fm.mechanism}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={cn("text-[10px] border capitalize", likelihoodColors[fm.likelihood] || "")}>
                    {fm.likelihood} likelihood
                  </Badge>
                  <Badge variant="outline" className={cn("text-[10px] border capitalize", likelihoodColors[fm.impact] || "")}>
                    {fm.impact} impact
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {fm.detectability === "easy" ? "Easy to detect" : "Hard to detect"}
                  </Badge>
                </div>
                {fm.mitigation && <p className="text-xs text-muted-foreground"><span className="font-medium">Mitigation:</span> {fm.mitigation}</p>}
              </div>
            ))}
          </div>
        </AccordionSection>
      )}

      {/* Warning Signals */}
      {warning_signals && warning_signals.length > 0 && (
        <AccordionSection title="Warning Signals" icon={Bell} accentClass="border-l-warning">
          <div className="space-y-1">
            {["30", "60", "90"].map((tf) => {
              const signals = warning_signals.filter((ws) => ws.timeframe === tf);
              if (signals.length === 0) return null;
              return (
                <div key={tf} className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2">{tf} Days</p>
                  {signals.map((ws, i) => (
                    <div key={i} className="bg-muted/30 rounded-lg p-3 space-y-1">
                      <p className="text-sm text-foreground">{ws.signal}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        {ws.owner && <span><span className="font-medium">Owner:</span> {ws.owner}</span>}
                        {ws.action_if_seen && <span><span className="font-medium">Action:</span> {ws.action_if_seen}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </AccordionSection>
      )}

      {/* Kill Criteria */}
      {kill_criteria && kill_criteria.length > 0 && (
        <AccordionSection title="Kill Criteria" icon={XCircle} accentClass="border-l-destructive">
          <div className="space-y-3">
            {kill_criteria.map((kc, i) => (
              <div key={i} className="bg-muted/30 rounded-lg p-3 space-y-1">
                <p className="text-sm text-foreground">
                  If <span className="font-medium">{kc.condition}</span>
                  {kc.deadline && <> by <span className="font-medium">{kc.deadline}</span></>}
                  , then <span className="font-medium">{kc.action}</span>
                </p>
                {kc.escalation && <p className="text-xs text-muted-foreground"><span className="font-medium">Escalation:</span> {kc.escalation}</p>}
              </div>
            ))}
          </div>
        </AccordionSection>
      )}

      {/* Stakeholder Map */}
      {showStakeholders && stakeholder_map && stakeholder_map.length > 0 && (
        <AccordionSection title="Stakeholder Map" icon={Users} accentClass="border-l-muted-foreground">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Stakeholder</th>
                  <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Impact</th>
                  <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Intensity</th>
                  <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Influence</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {stakeholder_map.map((sh, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 pr-3 font-medium text-foreground">{sh.stakeholder}</td>
                    <td className="py-2 pr-3">
                      <Badge variant="outline" className={cn("text-[10px] capitalize",
                        sh.impact === "positive" ? "text-[hsl(160,84%,39%)]" :
                        sh.impact === "negative" ? "text-primary" : "text-muted-foreground"
                      )}>
                        {sh.impact}
                      </Badge>
                    </td>
                    <td className="py-2 pr-3 text-foreground">{sh.intensity}/10</td>
                    <td className="py-2 pr-3 capitalize text-foreground">{sh.influence}</td>
                    <td className="py-2 text-muted-foreground">{sh.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AccordionSection>
      )}

      {/* Unasked Question */}
      {unasked_question && (
        <Card className="border-l-[3px] border-l-primary border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">The Unasked Question</p>
                <p className="text-sm text-foreground font-medium italic">{unasked_question}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendation */}
      {recommendation && (
        <AccordionSection title="Recommendation" icon={Lightbulb} accentClass="border-l-[hsl(160,84%,39%)]">
          <div className="space-y-3">
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium text-foreground">{recommendation.option}</p>
              <p className="text-xs text-muted-foreground">{recommendation.rationale}</p>
              {recommendation.dissenting_view && (
                <details className="text-xs">
                  <summary className="text-muted-foreground cursor-pointer hover:text-foreground font-medium">Dissenting view</summary>
                  <p className="mt-1 text-muted-foreground pl-3 border-l-2 border-border">{recommendation.dissenting_view}</p>
                </details>
              )}
            </div>
          </div>
        </AccordionSection>
      )}

      {/* Bottom Line */}
      {bottom_line && (
        <Card className="border-2 border-border bg-muted/20">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-foreground" />
              <span className="text-sm font-bold text-foreground uppercase tracking-wide">Bottom Line</span>
            </div>
            <Badge className={cn("text-sm px-3 py-1.5 border", verdictClass)}>{bottom_line.verdict}</Badge>
            {bottom_line.primary_risk && (
              <p className="text-sm text-foreground"><span className="font-medium">Primary Risk:</span> {bottom_line.primary_risk}</p>
            )}
            {bottom_line.key_action && (
              <p className="text-sm text-foreground"><span className="font-medium">Key Action:</span> {bottom_line.key_action}</p>
            )}
            {bottom_line.confidence_note && (
              <p className="text-xs text-muted-foreground italic">{bottom_line.confidence_note}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
