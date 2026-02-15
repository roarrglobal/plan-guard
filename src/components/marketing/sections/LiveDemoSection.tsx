import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, HelpCircle, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const examples = [
  "Should I accept this job offer at a startup?",
  "Should we pursue the Acme Corp deal?",
  "Is this the right candidate to hire?",
  "Should we launch this feature now?",
];

const sampleOutput = {
  verdict: "Proceed with Caution",
  summary: "This decision has strong upside potential but carries meaningful execution risk. Two critical blind spots were identified that could undermine the outcome if not addressed proactively.",
  blindSpots: [
    "Over-indexing on short-term gains while neglecting long-term positioning",
    "Assumption that current team capacity can absorb additional workload",
    "Missing competitive response analysis from incumbent players",
  ],
  unaskedQuestion: "What happens to your fallback position if this doesn't work within 90 days?",
};

export function LiveDemoSection() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleAnalyze = () => {
    if (!input.trim()) return;
    setLoading(true);
    setShowResult(false);
    setTimeout(() => {
      setLoading(false);
      setShowResult(true);
    }, 2500);
  };

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">Try it now</h2>
          <p className="text-lg text-muted-foreground">See what Snag reveals about a decision</p>
        </div>

        <div className="space-y-4 mb-4">
          <textarea
            className="w-full border border-border rounded-xl px-5 py-4 text-base bg-[#F9FAFB] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cobalt/30 focus:border-cobalt transition-all resize-none h-28"
            placeholder="Describe a decision you're facing..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => setInput(ex)}
                className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-[#1A1A1A] transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={!input.trim() || loading}
            className="w-full bg-cobalt hover:bg-cobalt-hover text-white h-12 text-base font-semibold"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </Button>
        </div>

        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-12">
              <div className="w-10 h-10 border-3 border-border border-t-cobalt rounded-full animate-spin" />
            </motion.div>
          )}

          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border rounded-2xl overflow-hidden"
            >
              <div className="p-6 md:p-8">
                <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {sampleOutput.verdict}
                </div>
                <p className="text-sm text-[#1A1A1A] leading-relaxed mb-6">{sampleOutput.summary}</p>

                <h4 className="text-sm font-semibold text-[#1A1A1A] mb-3">Top Blind Spots</h4>
                <ul className="space-y-2 mb-6">
                  {sampleOutput.blindSpots.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="w-5 h-5 rounded-full bg-crimson/10 text-crimson flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="bg-cobalt/5 border border-cobalt/10 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-cobalt" />
                    <span className="text-sm font-semibold text-cobalt">The Unasked Question</span>
                  </div>
                  <p className="text-sm text-[#1A1A1A] italic">"{sampleOutput.unaskedQuestion}"</p>
                </div>

                {/* Blurred teaser */}
                <div className="relative">
                  <div className="h-24 bg-gradient-to-b from-transparent to-white/90 backdrop-blur-sm rounded-xl flex items-end justify-center pb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      More insights available...
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border p-4 bg-[#F9FAFB]">
                <a href="/signup?type=individual">
                  <Button className="w-full bg-cobalt hover:bg-cobalt-hover text-white">
                    See Full Analysis — Sign Up Free
                  </Button>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
