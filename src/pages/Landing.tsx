import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, FileText, Brain, Shield, Check, Plus, Minus, ArrowRight, Building, ChevronDown, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import AnimatedScorecard from "@/components/landing/AnimatedScorecard";
import { useAuth } from "@/contexts/AuthContext";

export default function Landing() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
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
              {!authLoading && user ? (
                <button onClick={() => navigate("/dashboard")} className="text-small font-medium text-cobalt hover:text-cobalt/80 transition-colors">
                  Dashboard
                </button>
              ) : (
                <button onClick={() => navigate("/login")} className="text-small text-foreground hover:text-primary transition-colors">
                  Login
                </button>
              )}
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
              {!authLoading && user ? (
                <button onClick={() => { setMobileMenuOpen(false); navigate("/dashboard"); }} className="text-left text-body font-medium text-cobalt py-2">
                  Dashboard
                </button>
              ) : (
                <button onClick={() => { setMobileMenuOpen(false); navigate("/login"); }} className="text-left text-body text-foreground py-2">
                  Login
                </button>
              )}
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
            <span className="gradient-text">Pricing that scales with you</span>
          </h2>
          <p className="text-body-lg text-muted-foreground text-center mb-8">
            Start free. Grow with confidence.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <span className={`text-[14px] font-medium transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-cobalt"
            />
            <span className={`text-[14px] font-medium transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
            <span className="bg-emerald-600 text-white text-[11px] font-medium px-2 py-1 rounded-xl ml-1">
              Save 25%
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-muted rounded-2xl p-6 border border-border flex flex-col">
              <h3 className="text-[20px] font-semibold text-foreground mb-2">Free</h3>
              <div className="mb-4">
                <span className="text-[48px] font-bold text-foreground">$0</span>
                <span className="text-[14px] text-muted-foreground ml-1">forever</span>
              </div>
              
              <ul className="space-y-2.5 mb-4 flex-1">
                {[
                  "3 analyses (lifetime)",
                  "Basic pre-mortem output",
                  "Copy & share results"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-[14px] text-foreground">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="space-y-2 mb-5 pt-3 border-t border-border">
                {[
                  "No document uploads",
                  "No history saved"
                ].map((limit, i) => (
                  <p key={i} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                    <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-50" />
                    {limit}
                  </p>
                ))}
              </div>
              
              <Button 
                variant="outline"
                className="w-full border-2 border-cobalt text-cobalt hover:bg-cobalt hover:text-white font-semibold text-[14px]"
                onClick={handleAnalyze}
              >
                Get Started
              </Button>
              <p className="text-[12px] text-muted-foreground text-center mt-2">No credit card required</p>
            </div>

            {/* Pro Plan */}
            <div className="bg-card rounded-2xl p-6 border border-border flex flex-col">
              <h3 className="text-[20px] font-semibold text-foreground mb-2">Pro</h3>
              <div className="mb-1 transition-all duration-300">
                {isAnnual && (
                  <span className="text-[16px] text-muted-foreground line-through mr-2">$9</span>
                )}
                <span className="text-[48px] font-bold text-foreground">
                  {isAnnual ? '$6.75' : '$9'}
                </span>
                <span className="text-[14px] text-muted-foreground ml-1">/month</span>
              </div>
              {isAnnual && (
                <p className="text-[12px] text-muted-foreground mb-4">billed annually</p>
              )}
              {!isAnnual && <div className="mb-4" />}
              
              <ul className="space-y-2.5 mb-5 flex-1">
                {[
                  "100 analyses/month",
                  "15 document uploads/month",
                  "500 MB storage",
                  "PDF, DOCX, image analysis",
                  "Deep Snag wizard",
                  "Analysis history",
                  "Social sharing cards",
                  "PDF export",
                  "Email support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-[14px] text-foreground">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full bg-crimson hover:bg-crimson-hover text-white font-semibold text-[14px]"
              >
                Upgrade to Pro
              </Button>
              <p className="text-[12px] text-muted-foreground text-center mt-2">Cancel anytime</p>
            </div>

            {/* Team Plan - Highlighted */}
            <div className="bg-card rounded-2xl p-6 border-2 border-crimson relative shadow-lg shadow-crimson/15 flex flex-col">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-crimson text-white text-[10px] font-semibold uppercase px-3 py-1 rounded-lg tracking-wide whitespace-nowrap">
                MOST POPULAR
              </span>
              
              <h3 className="text-[20px] font-semibold text-foreground mb-2">Team</h3>
              <div className="mb-1 transition-all duration-300">
                {isAnnual && (
                  <span className="text-[16px] text-muted-foreground line-through mr-2">$49</span>
                )}
                <span className="text-[48px] font-bold text-foreground">
                  {isAnnual ? '$36.75' : '$49'}
                </span>
                <span className="text-[14px] text-muted-foreground ml-1">/month</span>
              </div>
              {isAnnual && (
                <p className="text-[12px] text-muted-foreground mb-1">billed annually</p>
              )}
              {!isAnnual && <div className="mb-1" />}
              <p className="text-[13px] text-muted-foreground mb-4">Up to 5 team members</p>
              
              <ul className="space-y-2.5 mb-5 flex-1">
                <li className="text-[14px] font-medium text-foreground mb-1">Everything in Pro, plus:</li>
                {[
                  "500 analyses/month (team pool)",
                  "75 document uploads/month",
                  "5 GB team storage",
                  "10 MB max file size",
                  "XLSX, PPTX analysis",
                  "Shared team workspace",
                  "Comments & @mentions",
                  "Team analytics dashboard",
                  "Admin controls",
                  "Priority support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-[14px] text-foreground">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full bg-cobalt hover:bg-cobalt/90 text-white font-semibold text-[14px]"
              >
                Start Team Trial
              </Button>
              <p className="text-[12px] text-muted-foreground text-center mt-2">14-day free trial</p>
            </div>

            {/* Business Plan */}
            <div className="bg-muted rounded-2xl p-6 border border-border flex flex-col">
              <h3 className="text-[20px] font-semibold text-foreground mb-2">Business</h3>
              <div className="mb-1 transition-all duration-300">
                {isAnnual && (
                  <span className="text-[16px] text-muted-foreground line-through mr-2">$149</span>
                )}
                <span className="text-[48px] font-bold text-foreground">
                  {isAnnual ? '$111.75' : '$149'}
                </span>
                <span className="text-[14px] text-muted-foreground ml-1">/month</span>
              </div>
              {isAnnual && (
                <p className="text-[12px] text-muted-foreground mb-1">billed annually</p>
              )}
              {!isAnnual && <div className="mb-1" />}
              <p className="text-[13px] text-muted-foreground mb-4">Up to 20 team members</p>
              
              <ul className="space-y-2.5 mb-5 flex-1">
                <li className="text-[14px] font-medium text-foreground mb-1">Everything in Team, plus:</li>
                {[
                  "2,000 analyses/month",
                  "300 document uploads/month",
                  "25 GB storage",
                  "25 MB max file size",
                  "Bulk document upload",
                  "Branded PDF reports",
                  "Audit log",
                  "API access (add-on)"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-[14px] text-foreground">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button 
                variant="outline"
                className="w-full border-2 border-cobalt text-cobalt hover:bg-cobalt hover:text-white font-semibold text-[14px]"
              >
                Contact Sales
              </Button>
              <p className="text-[12px] text-muted-foreground text-center mt-2">Custom onboarding included</p>
            </div>
          </div>

          {/* Enterprise Callout */}
          <div className="max-w-4xl mx-auto mt-8 bg-gradient-to-r from-muted to-muted/50 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-cobalt/10 flex items-center justify-center flex-shrink-0">
              <Building className="w-6 h-6 text-cobalt" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-[15px] text-foreground font-medium">
                Need unlimited analyses, SSO, custom integrations, or 20+ seats?
              </p>
            </div>
            <button className="text-[14px] font-semibold text-cobalt hover:underline whitespace-nowrap flex items-center gap-1">
              Talk to Enterprise Sales <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Compare Features Collapsible */}
          <Collapsible className="max-w-4xl mx-auto mt-8">
            <CollapsibleTrigger className="flex items-center justify-center gap-2 text-[14px] font-medium text-cobalt hover:underline mx-auto">
              Compare all features <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-semibold text-foreground">Feature</th>
                      <th className="text-center py-3 px-2 font-semibold text-foreground">Free</th>
                      <th className="text-center py-3 px-2 font-semibold text-foreground">Pro</th>
                      <th className="text-center py-3 px-2 font-semibold text-crimson">Team</th>
                      <th className="text-center py-3 px-2 font-semibold text-foreground">Business</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "Analyses/month", free: "3 lifetime", pro: "100", team: "500", business: "2,000" },
                      { feature: "Document uploads", free: "—", pro: "15/mo", team: "75/mo", business: "300/mo" },
                      { feature: "Storage", free: "—", pro: "500 MB", team: "5 GB", business: "25 GB" },
                      { feature: "Max file size", free: "—", pro: "5 MB", team: "10 MB", business: "25 MB" },
                      { feature: "Team members", free: "1", pro: "1", team: "5", business: "20" },
                      { feature: "Analysis history", free: "—", pro: "✓", team: "✓", business: "✓" },
                      { feature: "Deep Snag wizard", free: "—", pro: "✓", team: "✓", business: "✓" },
                      { feature: "PDF, DOCX, Images", free: "—", pro: "✓", team: "✓", business: "✓" },
                      { feature: "XLSX, PPTX", free: "—", pro: "—", team: "✓", business: "✓" },
                      { feature: "Team workspace", free: "—", pro: "—", team: "✓", business: "✓" },
                      { feature: "Comments & mentions", free: "—", pro: "—", team: "✓", business: "✓" },
                      { feature: "Branded reports", free: "—", pro: "—", team: "—", business: "✓" },
                      { feature: "Audit log", free: "—", pro: "—", team: "—", business: "✓" },
                      { feature: "API access", free: "—", pro: "—", team: "—", business: "Add-on" },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2.5 px-2 text-foreground">{row.feature}</td>
                        <td className="py-2.5 px-2 text-center text-muted-foreground">{row.free}</td>
                        <td className="py-2.5 px-2 text-center text-foreground">{row.pro}</td>
                        <td className="py-2.5 px-2 text-center text-foreground font-medium">{row.team}</td>
                        <td className="py-2.5 px-2 text-center text-foreground">{row.business}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Usage Limits Note */}
          <p className="text-[12px] text-muted-foreground text-center mt-6 max-w-2xl mx-auto">
            All plans include fair usage limits. Need more? Top-up packs available or upgrade anytime.{" "}
            <button className="text-cobalt hover:underline">See full limits →</button>
          </p>
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
                q: "What counts as an analysis?",
                a: "Each time you submit a plan for stress-testing, that's one analysis. Viewing past analyses doesn't count."
              },
              {
                q: "What happens if I hit my limit?",
                a: "You'll be prompted to wait until next month, buy a top-up pack ($5 for 25 analyses), or upgrade your plan."
              },
              {
                q: "Can I add more team members?",
                a: "Team includes 5 members. Business includes 20. Need more? Contact us for Enterprise pricing."
              },
              {
                q: "What file types can I upload?",
                a: "Pro: PDF, DOCX, TXT, JPG, PNG. Team adds XLSX, PPTX. Enterprise supports custom formats."
              },
              {
                q: "Is there a file size limit?",
                a: "Pro: 5MB, 10K words. Team: 10MB, 25K words. Business: 25MB, 50K words. Enterprise: Custom."
              },
              {
                q: "Do unused analyses roll over?",
                a: "No. Monthly limits reset on your billing date. Use them or lose them — this keeps our costs predictable."
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
