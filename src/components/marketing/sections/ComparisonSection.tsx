import { Check, X, Minus } from "lucide-react";
import { motion } from "framer-motion";

const rows = [
  { feature: "Structured framework",   gut: false, chatgpt: false, consultants: true, snag: true },
  { feature: "Remembers your decisions", gut: null,  chatgpt: false, consultants: false, snag: true },
  { feature: "Tracks outcomes",          gut: false, chatgpt: false, consultants: false, snag: true },
  { feature: "Learns your patterns",     gut: false, chatgpt: false, consultants: false, snag: true },
  { feature: "Available 24/7",           gut: true,  chatgpt: true,  consultants: false, snag: true },
  { feature: "Cost per decision",        gut: "Free", chatgpt: "Free", consultants: "$10,000+", snag: "~$3" },
];

function Cell({ value, highlight }: { value: boolean | null | string; highlight?: boolean }) {
  if (typeof value === "string") return <span className={`text-sm font-medium ${highlight ? "text-white" : "text-foreground"}`}>{value}</span>;
  if (value === null) return <Minus className="w-4 h-4 text-muted-foreground mx-auto" />;
  return value ? (
    <div className={`w-6 h-6 rounded-full ${highlight ? "bg-success/20" : "bg-success/10"} flex items-center justify-center mx-auto`}>
      <Check className="w-4 h-4 text-success" />
    </div>
  ) : (
    <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
      <X className="w-4 h-4 text-destructive/50" />
    </div>
  );
}

export function ComparisonSection() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Not another AI chatbot
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-x-auto rounded-2xl border border-border"
        >
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="py-4 pr-4 pl-6 text-sm font-medium text-muted-foreground">What you need</th>
                <th className="py-4 px-4 text-sm font-medium text-muted-foreground text-center">Gut Feel</th>
                <th className="py-4 px-4 text-sm font-medium text-muted-foreground text-center">ChatGPT</th>
                <th className="py-4 px-4 text-sm font-medium text-muted-foreground text-center">Consultants</th>
                <th className="py-4 px-6 text-sm font-semibold text-white text-center bg-gradient-to-b from-cobalt to-[hsl(216,100%,28%)] rounded-tr-xl">Snag</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.feature} className={`border-b border-border/50 ${i === rows.length - 1 ? "border-b-0" : ""}`}>
                  <td className="py-4 pr-4 pl-6 text-sm text-foreground font-medium">{row.feature}</td>
                  <td className="py-4 px-4 text-center"><Cell value={row.gut} /></td>
                  <td className="py-4 px-4 text-center"><Cell value={row.chatgpt} /></td>
                  <td className="py-4 px-4 text-center"><Cell value={row.consultants} /></td>
                  <td className="py-4 px-6 text-center bg-cobalt/5"><Cell value={row.snag} highlight /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <p className="text-center text-sm text-muted-foreground mt-8 max-w-xl mx-auto">
          ChatGPT forgets everything. Consultants cost $500/hour. Snag remembers every decision and learns from every outcome.
        </p>
      </div>
    </section>
  );
}
