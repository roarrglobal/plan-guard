import { motion } from "framer-motion";
import { Check, X, Brain, MessageSquare, Bot, Zap } from "lucide-react";

interface ComparisonItem {
  feature: string;
  snag: boolean | string;
  chatgpt: boolean | string;
  claude: boolean | string;
  meta: boolean | string;
  grok: boolean | string;
}

const comparisonData: ComparisonItem[] = [
  {
    feature: "Pre-mortem analysis structure",
    snag: true,
    chatgpt: "Manual prompting",
    claude: "Manual prompting",
    meta: "Manual prompting",
    grok: "Manual prompting",
  },
  {
    feature: "Remembers your decisions",
    snag: true,
    chatgpt: false,
    claude: false,
    meta: false,
    grok: false,
  },
  {
    feature: "Outcome tracking (30/60/90 days)",
    snag: true,
    chatgpt: false,
    claude: false,
    meta: false,
    grok: false,
  },
  {
    feature: "Personal decision patterns",
    snag: true,
    chatgpt: false,
    claude: false,
    meta: false,
    grok: false,
  },
  {
    feature: "Visual frameworks (SWOT, Porter's)",
    snag: true,
    chatgpt: false,
    claude: false,
    meta: false,
    grok: false,
  },
  {
    feature: "Decision journal integration",
    snag: true,
    chatgpt: false,
    claude: false,
    meta: false,
    grok: false,
  },
  {
    feature: "Post-mortem analysis",
    snag: true,
    chatgpt: "Manual",
    claude: "Manual",
    meta: "Manual",
    grok: "Manual",
  },
  {
    feature: "Success rate by category",
    snag: true,
    chatgpt: false,
    claude: false,
    meta: false,
    grok: false,
  },
];

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check className="w-5 h-5 text-success mx-auto" />;
  }
  if (value === false) {
    return <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />;
  }
  return <span className="text-xs text-muted-foreground">{value}</span>;
}

export function LLMComparisonSection() {
  return (
    <section className="py-16 md:py-20 bg-muted overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            <span className="gradient-text">Why not just use ChatGPT?</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            LLMs can run a pre-mortem if you prompt them well. But they forget everything, 
            won't follow up, and can't tell you your decision patterns.
          </p>
        </motion.div>

        {/* Mobile: Card-based comparison */}
        <div className="md:hidden space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-background border-2 border-primary rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">Snag</h3>
                <p className="text-xs text-muted-foreground">Purpose-built for decisions</p>
              </div>
            </div>
            <ul className="space-y-2">
              {comparisonData.filter(item => item.snag === true).map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                  {item.feature}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-background border border-border rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-bold">General LLMs</h3>
                <p className="text-xs text-muted-foreground">ChatGPT, Claude, Meta AI, Grok</p>
              </div>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                No memory between sessions
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Won't ping you in 90 days to check outcomes
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Can't analyze your decision patterns
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Requires careful prompting every time
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Desktop: Table comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="hidden md:block overflow-x-auto"
        >
          <table className="w-full max-w-5xl mx-auto bg-background rounded-2xl border border-border">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium">Feature</th>
                <th className="p-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-bold text-primary">Snag</span>
                  </div>
                </th>
                <th className="p-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-1">
                      <Bot className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-sm">ChatGPT</span>
                  </div>
                </th>
                <th className="p-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-1">
                      <Brain className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-sm">Claude</span>
                  </div>
                </th>
                <th className="p-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-1">
                      <MessageSquare className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-sm">Meta AI</span>
                  </div>
                </th>
                <th className="p-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-1">
                      <Bot className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-sm">Grok</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, i) => (
                <tr key={i} className={`border-b border-border ${i % 2 === 0 ? 'bg-muted/30' : ''}`}>
                  <td className="p-4 text-sm">{row.feature}</td>
                  <td className="p-4 text-center bg-primary/5">
                    <CellValue value={row.snag} />
                  </td>
                  <td className="p-4 text-center">
                    <CellValue value={row.chatgpt} />
                  </td>
                  <td className="p-4 text-center">
                    <CellValue value={row.claude} />
                  </td>
                  <td className="p-4 text-center">
                    <CellValue value={row.meta} />
                  </td>
                  <td className="p-4 text-center">
                    <CellValue value={row.grok} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Bottom callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10 max-w-3xl mx-auto bg-primary/5 border-l-4 border-primary rounded-lg p-5"
        >
          <p className="text-foreground">
            <strong>The bottom line:</strong> ChatGPT can run a pre-mortem if you prompt it well. 
            But it forgets everything after each session. It won't ping you in 90 days to check what happened. 
            It can't tell you that your career decisions succeed 73% of the time while your business decisions 
            succeed 48%.
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            <strong className="text-foreground">Snag builds personal decision intelligence that compounds over time.</strong>{" "}
            That's not something you can export to ChatGPT.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
