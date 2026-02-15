import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section className="py-20 md:py-28 bg-[#1A1A1A]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Stop deciding blind</h2>
        <p className="text-lg text-white/60 mb-10">Join thousands making better decisions with Snag</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link to="/signup?type=individual">
            <Button className="bg-crimson hover:bg-crimson-hover text-white px-8 h-12 text-base font-semibold min-w-[220px]">
              Start Free — Personal
            </Button>
          </Link>
          <Link to="/signup?type=team">
            <Button className="bg-cobalt hover:bg-cobalt-hover text-white px-8 h-12 text-base font-semibold min-w-[220px]">
              Start Free — Teams
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/40">
          <span>15-day full access</span>
          <span>•</span>
          <span>No credit card</span>
          <span>•</span>
          <span>Cancel anytime</span>
        </div>
      </div>
    </section>
  );
}
