import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Disclaimer() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-2xl font-bold text-cobalt">Snag</span>
            <div className="w-9" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-h1 mb-8">Disclaimer</h1>

        <div className="bg-[#FFF9E6] border-l-4 border-[#D97706] rounded-r-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-[#D97706] flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-h3 text-[#1A1A1A] mb-3">Important Notice</h2>
              <p className="text-body text-foreground leading-relaxed">
                This analysis surfaces possibilities, not predictions. Do not rely solely on this output. Consider multiple perspectives, consult professionals where appropriate, and apply your own judgment before making decisions.
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-h2 mb-4">What Snag Provides</h2>
            <p className="text-body text-foreground">
              Snag is a decision-support tool that uses artificial intelligence to perform pre-mortem analysis on plans and decisions. It identifies:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-body text-foreground mt-4">
              <li>Potential blind spots you may have overlooked</li>
              <li>Possible failure modes and their mechanisms</li>
              <li>Warning signals to watch for</li>
              <li>Kill criteria — conditions that should trigger a decision reversal</li>
              <li>Questions you haven't asked yet</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h2 mb-4">What Snag Does NOT Provide</h2>
            <ul className="list-disc pl-6 space-y-2 text-body text-foreground">
              <li><strong>Predictions:</strong> The output shows what <em>could</em> happen, not what <em>will</em> happen</li>
              <li><strong>Professional advice:</strong> Snag does not replace legal, financial, medical, or other professional counsel</li>
              <li><strong>Decision-making:</strong> You are solely responsible for your decisions</li>
              <li><strong>Guarantees:</strong> There is no guarantee of success or failure based on following or ignoring the analysis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h2 mb-4">Your Responsibility</h2>
            <p className="text-body text-foreground mb-4">By using Snag, you acknowledge that:</p>
            <ul className="list-disc pl-6 space-y-2 text-body text-foreground">
              <li>The analysis is AI-generated and may contain errors or omissions</li>
              <li>You should consider multiple sources of information</li>
              <li>You should consult qualified professionals for specialized matters</li>
              <li>You retain full responsibility for any decisions you make</li>
              <li>Roarr Consulting Group is not liable for outcomes of your decisions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h2 mb-4">Best Practices</h2>
            <p className="text-body text-foreground mb-4">To get the most value from Snag:</p>
            <ul className="list-disc pl-6 space-y-2 text-body text-foreground">
              <li>Use it as one input among many in your decision-making process</li>
              <li>Discuss the analysis with trusted advisors</li>
              <li>Seek professional advice for high-stakes decisions</li>
              <li>Revisit your analysis as circumstances change</li>
              <li>Trust your own judgment as the final arbiter</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h2 mb-4">Contact</h2>
            <p className="text-body text-foreground">
              For questions about this disclaimer or how to use Snag responsibly:<br />
              Email: legal@roarrconsulting.com
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-small text-[#666666]">
            © 2026 Roarr Consulting Group. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
