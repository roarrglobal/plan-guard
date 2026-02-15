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

function Cell({ value }: { value: boolean | null | string }) {
  if (typeof value === "string") return <span className="text-sm font-medium text-[#1A1A1A]">{value}</span>;
  if (value === null) return <Minus className="w-4 h-4 text-muted-foreground mx-auto" />;
  return value ? <Check className="w-5 h-5 text-emerald-600 mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />;
}

export function ComparisonSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] text-center mb-12">
          Not another AI chatbot
        </h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="overflow-x-auto"
        >
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="py-4 pr-4 text-sm font-medium text-muted-foreground">What you need</th>
                <th className="py-4 px-4 text-sm font-medium text-muted-foreground text-center">Gut Feel</th>
                <th className="py-4 px-4 text-sm font-medium text-muted-foreground text-center">ChatGPT</th>
                <th className="py-4 px-4 text-sm font-medium text-muted-foreground text-center">Consultants</th>
                <th className="py-4 px-4 text-sm font-semibold text-cobalt text-center bg-cobalt/5 rounded-t-lg">Snag</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature} className="border-b border-border/50">
                  <td className="py-4 pr-4 text-sm text-[#1A1A1A] font-medium">{row.feature}</td>
                  <td className="py-4 px-4 text-center"><Cell value={row.gut} /></td>
                  <td className="py-4 px-4 text-center"><Cell value={row.chatgpt} /></td>
                  <td className="py-4 px-4 text-center"><Cell value={row.consultants} /></td>
                  <td className="py-4 px-4 text-center bg-cobalt/5"><Cell value={row.snag} /></td>
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
