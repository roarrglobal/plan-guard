import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, FileText, Brain, Shield, Check, Plus, Minus, ArrowRight, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import AnimatedScorecard from "@/components/landing/AnimatedScorecard";

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [planText, setPlanText] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  const handleAnalyze = () => {
    if (planText.trim().length > 10) {
      sessionStorage.setItem("snag_input", planText);
      navigate("/analyze");
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-cobalt">Snag</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection("how-it-works")} className="text-small text-foreground hover:text-primary transition-colors">
                How it Works
              </button>
              <button onClick={() => scrollToSection("pricing")} className="text-small text-foreground hover:text-primary transition-colors">
                Pricing
              </button>
              <button onClick={() => navigate("/login")} className="text-small text-foreground hover:text-primary transition-colors">
                Login
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border py-4">
            <div className="container mx-auto px-4 flex flex-col gap-4">
              <button onClick={() => scrollToSection("how-it-works")} className="text-left text-body text-foreground py-2">
                How it Works
              </button>
              <button onClick={() => scrollToSection("pricing")} className="text-left text-body text-foreground py-2">
                Pricing
              </button>
              <button onClick={() => { setMobileMenuOpen(false); navigate("/login"); }} className="text-left text-body text-foreground py-2">
                Login
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="min-h-[calc(100vh-64px)] flex flex-col justify-center py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-display-mobile md:text-display text-center mb-6">
            <span className="gradient-text">Find the snag before it finds you.</span>
          </h1>
          
          <p className="text-body-lg text-muted-foreground text-center mb-8 max-w-xl mx-auto">
            Stress-test any plan in 2 minutes. Surface blind spots, failure modes, and warning signs you'd never think of alone.
          </p>

          {/* Input */}
          <div className="space-y-4">
            <textarea
              value={planText}
              onChange={(e) => setPlanText(e.target.value)}
              placeholder="Describe your plan or decision..."
              rows={4}
              className="w-full bg-background border border-border rounded-lg px-4 py-4 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cobalt transition-colors resize-none"
            />
            
            <Button 
              onClick={handleAnalyze}
              disabled={planText.trim().length < 10}
              className="w-full bg-crimson hover:bg-crimson-hover text-white font-semibold py-4 rounded-lg transition-colors"
            >
              Analyze My Plan — Free
            </Button>
            
            <p className="text-small text-muted-foreground text-center">
              No signup required. 3 free analyses.
            </p>
          </div>
        </div>
      </section>

      {/* Animated Scorecard */}
      <AnimatedScorecard />

      {/* Trust Bar */}
      <section className="bg-muted py-6">
        <div className="container mx-auto px-4">
          <p className="text-small font-medium text-muted-foreground text-center">
            Join 500+ professionals making smarter decisions
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section-padding">
        <div className="container mx-auto px-4">
          <h2 className="text-h1 text-center mb-12">
            <span className="gradient-text">How Snag Works</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: FileText,
                title: "Describe your plan",
                description: "Type any decision — career move, product launch, investment, hire."
              },
              {
                icon: Brain,
                title: "Get instant analysis",
                description: "Snag identifies blind spots, failure modes, warning signals, and the question you haven't asked."
              },
              {
                icon: Shield,
                title: "Decide with confidence",
                description: "Move forward knowing you've stress-tested what could go wrong — before it does."
              }
            ].map((step, i) => (
              <div key={i} className="bg-card rounded-xl p-8 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-cobalt" />
                </div>
                <h3 className="text-h3 text-foreground mb-2">{step.title}</h3>
                <p className="text-body text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="section-padding bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-h1 text-center mb-12">
            <span className="gradient-text">What will you Snag?</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              { quote: "Should I leave my job for this startup offer?", label: "Career Decisions" },
              { quote: "Is this product ready to launch?", label: "Product Launches" },
              { quote: "Should we expand into this new market?", label: "Business Strategy" },
              { quote: "Is this hire the right call?", label: "Team Decisions" }
            ].map((item, i) => (
              <div key={i} className="bg-background border border-border rounded-xl p-6">
                <p className="text-body-lg font-medium text-foreground mb-3">"{item.quote}"</p>
                <span className="text-micro uppercase text-cobalt font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Output */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <h2 className="text-h1 text-center mb-12">
            <span className="gradient-text">See Snag in Action</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Input Card */}
            <div className="bg-card rounded-xl p-6">
              <p className="text-micro uppercase text-muted-foreground font-semibold mb-4">THE PLAN</p>
              <p className="text-body text-foreground">
                I'm considering leaving my senior PM role to join an early-stage AI startup as co-founder with 8% equity and no salary for 6 months.
              </p>
            </div>

            {/* Output Card */}
            <div className="bg-background border border-border rounded-xl p-6">
              <p className="text-micro uppercase text-cobalt font-semibold mb-4">SNAG ANALYSIS</p>
              <div className="space-y-3">
                <div>
                  <span className="text-micro uppercase text-crimson font-semibold">BLIND SPOTS</span>
                  <p className="text-small text-foreground mt-1">Opportunity cost of current career trajectory...</p>
                </div>
                <div>
                  <span className="text-micro uppercase text-crimson font-semibold">FAILURE MODE #1</span>
                  <p className="text-small text-foreground mt-1">Runway runs out before product-market fit...</p>
                </div>
              </div>
              <button 
                onClick={() => scrollToSection("pricing")}
                className="text-small text-cobalt font-medium mt-4 inline-flex items-center gap-1 hover:underline"
              >
                See full analysis <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section-padding bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-h1 text-center mb-4">
            <span className="gradient-text">Simple Pricing</span>
          </h2>
          <p className="text-body-lg text-muted-foreground text-center mb-8">
            Start free. Scale when you're ready.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <span className={`text-[14px] font-medium transition-colors ${!isAnnual ? 'text-[#1A1A1A]' : 'text-[#666666]'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-[#0047AB]"
            />
            <span className={`text-[14px] font-medium transition-colors ${isAnnual ? 'text-[#1A1A1A]' : 'text-[#666666]'}`}>
              Annual
            </span>
            <span className="bg-[#059669] text-white text-[11px] font-medium px-2 py-1 rounded-xl ml-1">
              Save 25%
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-[#F8F8F8] rounded-2xl p-8 border border-[#E5E5E5]">
              <h3 className="text-[20px] font-semibold text-[#1A1A1A] mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-[48px] font-bold text-[#1A1A1A]">$0</span>
                <span className="text-[14px] text-[#666666] ml-1">forever</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {[
                  "3 analyses (lifetime)",
                  "Full pre-mortem output",
                  "Copy results"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-[15px] text-[#1A1A1A]">
                    <Check className="w-5 h-5 text-[#059669] flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button 
                variant="outline"
                className="w-full border-2 border-[#0047AB] text-[#0047AB] hover:bg-[#0047AB] hover:text-white font-semibold text-[14px]"
                onClick={handleAnalyze}
              >
                Get Started
              </Button>
              <p className="text-[13px] text-[#999999] text-center mt-3">No credit card required</p>
            </div>

            {/* Pro Plan - Highlighted */}
            <div className="bg-white rounded-2xl p-8 border-2 border-[#BE3455] relative shadow-lg shadow-[#BE3455]/15 scale-[1.02]">
              <span className="absolute -top-3 right-6 bg-[#BE3455] text-white text-[11px] font-semibold uppercase px-3 py-1.5 rounded-lg tracking-wide">
                MOST POPULAR
              </span>
              
              <h3 className="text-[20px] font-semibold text-[#1A1A1A] mb-2">Pro</h3>
              <div className="mb-6 transition-all duration-300">
                {isAnnual && (
                  <span className="text-[18px] text-[#999999] line-through mr-2">$9</span>
                )}
                <span className="text-[48px] font-bold text-[#1A1A1A]">
                  {isAnnual ? '$6.75' : '$9'}
                </span>
                <span className="text-[14px] text-[#666666] ml-1">
                  {isAnnual ? '/month, billed annually' : '/month'}
                </span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited analyses",
                  "Save & access history",
                  "Deep Snag guided wizard",
                  "Social sharing cards",
                  "PDF export",
                  "Priority processing",
                  "Email support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-[15px] text-[#1A1A1A]">
                    <Check className="w-5 h-5 text-[#059669] flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full bg-[#BE3455] hover:bg-[#A02D48] text-white font-semibold text-[14px]"
              >
                Upgrade to Pro
              </Button>
              <p className="text-[13px] text-[#999999] text-center mt-3">Cancel anytime</p>
            </div>

            {/* Team Plan */}
            <div className="bg-[#F8F8F8] rounded-2xl p-8 border border-[#E5E5E5]">
              <h3 className="text-[20px] font-semibold text-[#1A1A1A] mb-2">Team</h3>
              <div className="mb-6 transition-all duration-300">
                {isAnnual && (
                  <span className="text-[18px] text-[#999999] line-through mr-2">$29</span>
                )}
                <span className="text-[48px] font-bold text-[#1A1A1A]">
                  {isAnnual ? '$21.75' : '$29'}
                </span>
                <span className="text-[14px] text-[#666666] ml-1">
                  {isAnnual ? '/month, billed annually' : '/month'}
                </span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Pro",
                  "Up to 5 team members",
                  "Shared team workspace",
                  "Collaborative comments",
                  "Team analytics dashboard",
                  "Priority support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-[15px] text-[#1A1A1A]">
                    <Check className="w-5 h-5 text-[#059669] flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full bg-[#0047AB] hover:bg-[#003380] text-white font-semibold text-[14px]"
              >
                Start Team Trial
              </Button>
              <p className="text-[13px] text-[#999999] text-center mt-3">14-day free trial</p>
            </div>
          </div>

          {/* Enterprise Callout */}
          <div className="max-w-[600px] mx-auto mt-8 bg-[#F8F8F8] rounded-xl p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#0047AB]/10 flex items-center justify-center flex-shrink-0">
              <Building className="w-5 h-5 text-[#0047AB]" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] text-[#333333]">
                Need more than 5 seats? Looking for SSO, API access, or custom integrations?
              </p>
            </div>
            <button className="text-[14px] font-medium text-[#0047AB] hover:underline whitespace-nowrap flex items-center gap-1">
              Talk to us about Enterprise <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-h1 text-center mb-4">
            <span className="gradient-text">Questions about pricing?</span>
          </h2>
          <p className="text-body text-muted-foreground text-center mb-12">
            Everything you need to know about our plans
          </p>

          <div className="space-y-0">
            {[
              {
                q: "Can I switch plans anytime?",
                a: "Yes. Upgrade or downgrade anytime. Changes take effect on your next billing cycle."
              },
              {
                q: "What payment methods do you accept?",
                a: "All major credit cards, Google Pay, Apple Pay. Processed securely via Stripe."
              },
              {
                q: "Is there a refund policy?",
                a: "Yes. If you're not satisfied within the first 14 days of a paid plan, we'll refund you in full."
              },
              {
                q: "What happens when I hit my free limit?",
                a: "You'll be prompted to upgrade. Your existing analyses remain accessible."
              },
              {
                q: "Is Snag replacing my judgment?",
                a: "No. Snag surfaces what you might miss — blind spots, failure modes, warning signs. You still decide. Think of it as a second opinion that's seen a thousand plans fail."
              },
              {
                q: "How is this different from ChatGPT?",
                a: "Snag uses a tuned pre-mortem framework. Structured, consistent, optimized for surfacing what you'd miss."
              }
            ].map((faq, i) => (
              <div key={i} className="border-b border-divider">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left"
                >
                  <span className="text-body-lg font-semibold text-foreground pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <Minus className="w-5 h-5 text-cobalt flex-shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-cobalt flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <p className="text-body text-muted-foreground pb-5 pr-10">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="gradient-premium py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-xl text-center">
          <h2 className="text-h1 text-white mb-8">
            What's the plan you've been avoiding stress-testing?
          </h2>
          
          <div className="space-y-4">
            <textarea
              placeholder="Describe your plan..."
              rows={3}
              className="w-full bg-white rounded-lg px-4 py-4 text-body text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
              onChange={(e) => setPlanText(e.target.value)}
            />
            
            <Button 
              onClick={handleAnalyze}
              className="w-full bg-white text-cobalt hover:bg-gray-100 font-semibold py-4"
            >
              Analyze Free
            </Button>
            
            <p className="text-small text-white/80">No signup required</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <span className="text-xl font-bold text-white">Snag</span>
            
            <div className="flex items-center gap-6">
              <a href="/privacy" className="text-small text-[#666666] hover:text-white transition-colors">Privacy</a>
              <a href="/terms" className="text-small text-[#666666] hover:text-white transition-colors">Terms</a>
              <a href="/disclaimer" className="text-small text-[#666666] hover:text-white transition-colors">Disclaimer</a>
            </div>
          </div>
          
          <p className="text-small text-[#666666] text-center">
            © 2026 Roarr Consulting Group. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
