import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const individual = [
  { name: "Free", price: "$0", desc: "Basic access" },
  { name: "Pro", price: "$12/mo", desc: "Full personal features" },
];

const teams = [
  { name: "Team", price: "$59/mo", desc: "Up to 5 members" },
  { name: "Business", price: "$199/mo", desc: "Up to 20 members" },
  { name: "Enterprise", price: "Custom", desc: "Unlimited" },
];

export function PricingPreviewSection() {
  return (
    <section className="py-20 md:py-28 bg-[#F9FAFB]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">Simple pricing. Serious value.</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Individuals */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-crimson mb-6">For Individuals</h3>
            <div className="space-y-3">
              {individual.map((p) => (
                <div key={p.name} className="flex items-center justify-between bg-white border border-border rounded-xl px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                  <p className="text-lg font-bold text-[#1A1A1A]">{p.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Teams */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cobalt mb-6">For Teams</h3>
            <div className="space-y-3">
              {teams.map((p) => (
                <div key={p.name} className="flex items-center justify-between bg-white border border-border rounded-xl px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                  <p className="text-lg font-bold text-[#1A1A1A]">{p.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <Link to="/pricing" className="text-sm font-semibold text-cobalt hover:underline underline-offset-4">
            See full pricing →
          </Link>
          <p className="text-sm text-muted-foreground">All plans include 15-day free trial. No credit card required.</p>
        </div>
      </div>
    </section>
  );
}
