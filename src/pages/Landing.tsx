import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Menu, X, Plus, Minus, ArrowRight, Eye, AlertTriangle, 
  Bell, StopCircle, HelpCircle, BookOpen, Search, BarChart3,
  ChevronDown, Check, Target, FileText, Lightbulb, Users, Building2,
  Shield, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import UsageLimitsModal from "@/components/landing/UsageLimitsModal";
import { LandingAnalysisDemo } from "@/components/landing/LandingAnalysisDemo";
import { EnhancedLiveStats } from "@/components/landing/EnhancedLiveStats";
import { LLMComparisonSection } from "@/components/landing/LLMComparisonSection";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { SnagLogo } from "@/components/SnagLogo";

export default function Landing() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [limitsModalOpen, setLimitsModalOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const faqItems = [
    {
      q: "What's a Deep Snag?",
      a: "A pre-mortem analysis. You describe your decision, Snag surfaces what could go wrong — blind spots, failure modes, warning signals, kill criteria, and the question you should be asking but aren't. Takes under 2 minutes."
    },
    {
      q: "Can I try it before signing up?",
      a: "Yes. Your first Deep Snag is completely free — no signup required. Just type your decision and hit analyze."
    },
    {
      q: "What's the difference between Deep Snag and Post-Mortem?",
      a: "Deep Snag (pre-mortem) happens BEFORE you decide — it stress-tests your plan. Post-Mortem happens AFTER — it analyzes what happened and extracts lessons."
    },
    {
      q: "What are the business frameworks?",
      a: "Pre-built templates for professional analysis: Porter's Five Forces, SWOT, MEDDPICC, BANT, and more. Guided inputs, AI enhancement, visual outputs."
    },
    {
      q: "What if I need more than my plan allows?",
      a: "Buy add-ons anytime. $5 gets you 10 more Deep Snags or Post-Mortems. Add-ons never expire and don't require changing your plan."
    },
    {
      q: "Is my data private?",
      a: "Yes. Your journals, decisions, and analyses are private. We don't sell data or train AI on your content."
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <SnagLogo size="md" />

            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection("features")} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection("pricing")} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Pricing
              </button>
              <button onClick={() => scrollToSection("faq")} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                FAQ
              </button>
              {!authLoading && user ? (
                <Button onClick={() => navigate("/dashboard")} variant="default" size="sm">
                  Dashboard
                </Button>
              ) : (
                <Button onClick={() => navigate("/login")} variant="outline" size="sm">
                  Login
                </Button>
              )}
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background border-t border-border py-4"
            >
              <div className="container mx-auto px-4 flex flex-col gap-4">
                <button onClick={() => scrollToSection("features")} className="text-left py-2 font-medium">Features</button>
                <button onClick={() => scrollToSection("pricing")} className="text-left py-2 font-medium">Pricing</button>
                <button onClick={() => scrollToSection("faq")} className="text-left py-2 font-medium">FAQ</button>
                {!authLoading && user ? (
                  <button onClick={() => { setMobileMenuOpen(false); navigate("/dashboard"); }} className="text-left font-semibold text-primary py-2">
                    Dashboard
                  </button>
                ) : (
                  <button onClick={() => { setMobileMenuOpen(false); navigate("/login"); }} className="text-left py-2 font-medium">
                    Login
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* PART 1: Hero with Live Demo */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left Column - Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-4xl lg:text-h1 font-bold mb-4 leading-tight text-foreground">
                Find the flaw before reality does.
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                Stress-test any decision in 2 minutes. Try it now — free.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Check className="w-4 h-4 text-success" /> No signup required</span>
                <span className="flex items-center gap-1"><Check className="w-4 h-4 text-success" /> Instant analysis</span>
                <span className="flex items-center gap-1"><Check className="w-4 h-4 text-success" /> 100% private</span>
              </div>
            </motion.div>

            {/* Right Column - Interactive Demo */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <LandingAnalysisDemo />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <EnhancedLiveStats />

      {/* PART 2: What You Get */}
      <section className="py-12 md:py-16 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-h2 font-semibold text-foreground">
              In under 2 minutes, you'll know:
            </h2>
          </motion.div>

          <div className="flex overflow-x-auto md:grid md:grid-cols-5 gap-4 max-w-5xl mx-auto pb-4 md:pb-0 -mx-4 px-4 md:mx-auto">
            {[
              { icon: Eye, color: "text-primary", title: "Blind Spots", desc: "What you're assuming" },
              { icon: AlertTriangle, color: "text-destructive", title: "Failure Modes", desc: "How this could fail" },
              { icon: Bell, color: "text-warning", title: "Warning Signals", desc: "Early signs of trouble" },
              { icon: StopCircle, color: "text-muted-foreground", title: "Kill Criteria", desc: "When to walk away" },
              { icon: HelpCircle, color: "text-primary", title: "Unasked Question", desc: "The one you avoid" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-xl p-5 min-w-[160px] text-center flex-shrink-0 shadow-card"
              >
                <item.icon className={`w-8 h-8 ${item.color} mx-auto mb-3`} />
                <h3 className="font-semibold text-sm mb-1 text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PART 3: Features Section */}
      <section id="features" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-h2 font-bold mb-2 text-foreground">
              One platform for better decisions
            </h2>
            <p className="text-muted-foreground">Pre-mortem analysis is just the start.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              {
                icon: Target,
                title: "DEEP SNAG",
                subtitle: "Pre-Mortem Analysis",
                desc: "Stress-test decisions before you commit.",
                bullets: ["Blind spot detection", "Failure mode mapping", "Warning signals", "Kill criteria"],
                primary: true
              },
              {
                icon: Search,
                title: "POST-MORTEM",
                subtitle: "Learn From Outcomes",
                desc: "Analyze what happened. Extract lessons.",
                bullets: ["Root cause analysis", "Success/failure factors", "5 Whys framework", "Action items"]
              },
              {
                icon: BookOpen,
                title: "DECISION JOURNAL",
                subtitle: "Capture Daily",
                desc: "Log decisions & thoughts as they happen.",
                bullets: ["Quick capture", "Mood tracking", "Gratitude & manifestation", "Morning/evening rituals"]
              },
              {
                icon: BarChart3,
                title: "VISUAL FRAMEWORKS",
                subtitle: "See Your Thinking",
                desc: "Generate shareable visual analysis.",
                bullets: ["Risk matrices", "Fishbone diagrams", "Decision trees", "Export PNG/PDF"],
                pro: true
              },
              {
                icon: Building2,
                title: "BUSINESS FRAMEWORKS",
                subtitle: "Consulting-Grade Tools",
                desc: "Strategy & sales frameworks built-in.",
                bullets: ["Porter's Five Forces", "SWOT Analysis", "MEDDPICC / BANT", "Decision matrices"],
                pro: true
              },
              {
                icon: Lightbulb,
                title: "PATTERNS & INSIGHTS",
                subtitle: "Personal Intelligence",
                desc: "See your decision patterns over time.",
                bullets: ["Outcome tracking", "Success rate by type", "Monthly reports", "AI-powered insights"],
                pro: true
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-card border rounded-2xl p-6 relative ${
                  feature.primary ? "border-2 border-primary" : "border-border"
                }`}
              >
                {feature.primary && (
                  <span className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                    PRIMARY FEATURE
                  </span>
                )}
                {feature.pro && (
                  <span className="absolute -top-3 right-4 bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full">
                    PRO
                  </span>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <feature.icon className="w-5 h-5 text-primary" />
                  <span className="text-xs font-semibold text-muted-foreground">{feature.title}</span>
                </div>
                <h3 className="font-semibold mb-2 text-foreground">{feature.subtitle}</h3>
                <p className="text-sm text-muted-foreground mb-4">{feature.desc}</p>
                <ul className="space-y-1.5">
                  {feature.bullets.map((b, j) => (
                    <li key={j} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full" />
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PART 4: How It Works */}
      <section className="py-12 md:py-16 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-h2 font-bold text-foreground">
              How it works
            </h2>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 max-w-3xl mx-auto">
            {[
              { num: 1, title: "Describe your plan", desc: "Type your decision" },
              { num: 2, title: "Snag analyzes", desc: "AI surfaces blind spots" },
              { num: 3, title: "Decide smarter", desc: "Act with clarity" }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mb-3">
                  {step.num}
                </div>
                <h3 className="font-semibold mb-1 text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PART 5: Social Proof */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-h2 font-bold text-foreground">
              Trusted by thinkers
            </h2>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
            {[
              { value: "12,000+", label: "Decisions analyzed" },
              { value: "89%", label: "Found blind spots missed" },
              { value: "< 2 min", label: "Average analysis" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { quote: "I Snagged my startup decision. Found three blind spots I'd completely missed.", author: "Product Manager, Google" },
              { quote: "We run a Deep Snag before every product launch now.", author: "Founder, Series A Startup" },
              { quote: "The Unasked Question feature alone is worth it.", author: "Strategy Consultant" }
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-muted rounded-xl p-5"
              >
                <p className="text-sm mb-3 italic text-foreground">"{t.quote}"</p>
                <p className="text-xs text-muted-foreground">— {t.author}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LLM Comparison Section */}
      <LLMComparisonSection />

      {/* PART 6: Pricing */}
      <section id="pricing" className="py-16 md:py-20 bg-muted">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl md:text-h2 font-bold mb-2 text-foreground">
              Simple pricing. Powerful features.
            </h2>
            <p className="text-muted-foreground">Start free. Add what you need.</p>
          </motion.div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Annual</span>
            <span className="bg-success text-success-foreground text-xs font-medium px-2 py-1 rounded-full">Save 25%</span>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-10">
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <h3 className="font-bold text-lg mb-1 text-foreground">Free</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-foreground">$0</span>
                <span className="text-muted-foreground text-sm"> forever</span>
              </div>
              <div className="space-y-3 text-sm mb-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Capture</p>
                <p className="text-foreground">✓ 3 journals/day</p>
                <p className="text-foreground">✓ 3 captures/day</p>
                <p className="text-foreground">✓ 3 habits</p>
                <p className="text-xs font-semibold text-muted-foreground uppercase pt-2">Analyze</p>
                <p className="text-foreground">✓ 1 Deep Snag (try it)</p>
                <p className="text-foreground">✓ 1 Post-Mortem (try it)</p>
                <p className="text-foreground">✓ 2 frameworks (try them)</p>
                <p className="text-xs font-semibold text-muted-foreground uppercase pt-2">Limits</p>
                <p className="text-muted-foreground">✗ 30-day history</p>
                <p className="text-muted-foreground">✗ No exports</p>
              </div>
              <Button onClick={handleGetStarted} variant="secondary" className="w-full">Start Free</Button>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card border-2 border-primary rounded-2xl p-5 relative shadow-lg"
            >
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">★ POPULAR</span>
              <h3 className="font-bold text-lg mb-1 text-foreground">Pro</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-foreground">${isAnnual ? '9' : '12'}</span>
                <span className="text-muted-foreground text-sm">/month</span>
                {isAnnual && <span className="text-xs text-muted-foreground block">billed yearly</span>}
              </div>
              <div className="space-y-2 text-sm mb-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Capture</p>
                <p className="text-foreground">✓ Unlimited journals</p>
                <p className="text-foreground">✓ Unlimited captures</p>
                <p className="text-foreground">✓ 10 habits</p>
                <p className="text-xs font-semibold text-muted-foreground uppercase pt-2">Analyze</p>
                <p className="font-medium text-foreground">✓ 50 Deep Snags/mo</p>
                <p className="text-foreground">✓ 25 Post-Mortems/mo</p>
                <p className="text-foreground">✓ Unlimited frameworks</p>
                <p className="text-foreground">✓ 10 doc uploads/mo</p>
                <p className="text-xs font-semibold text-muted-foreground uppercase pt-2">Learn</p>
                <p className="text-foreground">✓ Visual exports</p>
                <p className="text-foreground">✓ Outcome tracking</p>
                <p className="text-foreground">✓ Pattern reports</p>
                <p className="text-foreground">✓ Forever history</p>
              </div>
              <Button onClick={handleGetStarted} className="w-full">Start Trial</Button>
            </motion.div>

            {/* Team */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <h3 className="font-bold text-lg mb-1 text-foreground">Team</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-foreground">${isAnnual ? '44' : '59'}</span>
                <span className="text-muted-foreground text-sm">/month</span>
                <span className="text-xs text-muted-foreground block">up to 5 people</span>
              </div>
              <div className="space-y-2 text-sm mb-6">
                <p className="font-medium text-primary">Everything in Pro, plus:</p>
                <p className="text-xs font-semibold text-muted-foreground uppercase pt-1">Team</p>
                <p className="text-foreground">✓ Shared workspace</p>
                <p className="font-medium text-foreground">✓ 200 Deep Snags/mo</p>
                <p className="text-foreground">✓ 100 Post-Mortems/mo</p>
                <p className="text-foreground">✓ 50 doc uploads/mo</p>
                <p className="text-foreground">✓ Team retros</p>
                <p className="text-foreground">✓ Team analytics</p>
                <p className="text-xs font-semibold text-muted-foreground uppercase pt-2">Admin</p>
                <p className="text-foreground">✓ Member management</p>
                <p className="text-foreground">✓ Priority support</p>
              </div>
              <Button onClick={handleGetStarted} variant="secondary" className="w-full">Start Trial</Button>
            </motion.div>

            {/* Business */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <h3 className="font-bold text-lg mb-1 text-foreground">Business</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-foreground">${isAnnual ? '149' : '199'}</span>
                <span className="text-muted-foreground text-sm">/month</span>
                <span className="text-xs text-muted-foreground block">up to 20 people</span>
              </div>
              <div className="space-y-2 text-sm mb-6">
                <p className="font-medium text-primary">Everything in Team, plus:</p>
                <p className="text-xs font-semibold text-muted-foreground uppercase pt-1">Scale</p>
                <p className="font-medium text-foreground">✓ 1,000 Deep Snags/mo</p>
                <p className="text-foreground">✓ 500 Post-Mortems/mo</p>
                <p className="text-foreground">✓ 200 doc uploads/mo</p>
                <p className="text-xs font-semibold text-muted-foreground uppercase pt-2">Enterprise</p>
                <p className="text-foreground">✓ Branded exports</p>
                <p className="text-foreground">✓ Audit log</p>
                <p className="text-foreground">✓ SSO (SAML)</p>
                <p className="text-foreground">✓ API access</p>
                <p className="text-foreground">✓ Dedicated support</p>
              </div>
              <Button onClick={() => window.location.href = 'mailto:sales@snag.app'} variant="secondary" className="w-full">Contact Sales</Button>
            </motion.div>
          </div>

          {/* Add-ons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto mb-8"
          >
            <h3 className="text-lg font-semibold text-center mb-4 text-foreground">Need more? Add what you need.</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: "+10 Deep Snags", price: "$5" },
                { name: "+10 Post-Mortems", price: "$5" },
                { name: "+10 Doc Uploads", price: "$3" }
              ].map((addon, i) => (
                <div key={i} className="bg-card border border-dashed border-primary rounded-lg p-4 text-center">
                  <p className="font-medium text-sm mb-1 text-foreground">{addon.name}</p>
                  <p className="text-lg font-bold text-primary">{addon.price}</p>
                  <p className="text-xs text-muted-foreground">one-time</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">Add-ons are one-time purchases. Use anytime. Never expire.</p>
          </motion.div>

          {/* Usage Control Callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary/5 border-l-4 border-primary rounded-lg p-5 max-w-3xl mx-auto mb-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Full control over your usage</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• See real-time usage in your dashboard</li>
              <li>• Get alerts at 80% and 90% of limits</li>
              <li>• Buy add-ons anytime without changing plan</li>
              <li>• Unused add-ons never expire</li>
            </ul>
          </motion.div>

          {/* Compare Features Toggle */}
          <div className="text-center">
            <button 
              onClick={() => setShowComparison(!showComparison)}
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1 mx-auto"
            >
              Compare all features <ChevronDown className={`w-4 h-4 transition-transform ${showComparison ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Feature Comparison Table */}
          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 overflow-x-auto"
              >
                <table className="w-full max-w-4xl mx-auto text-sm bg-card rounded-xl border border-border">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium text-foreground">Feature</th>
                      <th className="p-3 font-medium text-foreground">Free</th>
                      <th className="p-3 font-medium text-primary">Pro</th>
                      <th className="p-3 font-medium text-foreground">Team</th>
                      <th className="p-3 font-medium text-foreground">Business</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    <tr className="bg-muted/50"><td colSpan={5} className="p-2 font-semibold text-foreground">CAPTURE</td></tr>
                    <tr className="border-b border-border"><td className="p-2 text-foreground">Journal entries</td><td className="p-2 text-center text-foreground">3/day</td><td className="p-2 text-center text-foreground">∞</td><td className="p-2 text-center text-foreground">∞</td><td className="p-2 text-center text-foreground">∞</td></tr>
                    <tr className="border-b border-border"><td className="p-2 text-foreground">Decision captures</td><td className="p-2 text-center text-foreground">3/day</td><td className="p-2 text-center text-foreground">∞</td><td className="p-2 text-center text-foreground">∞</td><td className="p-2 text-center text-foreground">∞</td></tr>
                    <tr className="border-b border-border"><td className="p-2 text-foreground">Habits</td><td className="p-2 text-center text-foreground">3</td><td className="p-2 text-center text-foreground">10</td><td className="p-2 text-center text-foreground">∞</td><td className="p-2 text-center text-foreground">∞</td></tr>
                    <tr className="bg-muted/50"><td colSpan={5} className="p-2 font-semibold text-foreground">ANALYZE</td></tr>
                    <tr className="border-b border-border"><td className="p-2 text-foreground">Deep Snags</td><td className="p-2 text-center text-foreground">1 total</td><td className="p-2 text-center text-foreground">50/mo</td><td className="p-2 text-center text-foreground">200/mo</td><td className="p-2 text-center text-foreground">1,000/mo</td></tr>
                    <tr className="border-b border-border"><td className="p-2 text-foreground">Post-Mortems</td><td className="p-2 text-center text-foreground">1 total</td><td className="p-2 text-center text-foreground">25/mo</td><td className="p-2 text-center text-foreground">100/mo</td><td className="p-2 text-center text-foreground">500/mo</td></tr>
                    <tr className="border-b border-border"><td className="p-2 text-foreground">Business frameworks</td><td className="p-2 text-center text-foreground">2 total</td><td className="p-2 text-center text-foreground">∞</td><td className="p-2 text-center text-foreground">∞</td><td className="p-2 text-center text-foreground">∞</td></tr>
                    <tr className="border-b border-border"><td className="p-2 text-foreground">Document uploads</td><td className="p-2 text-center text-foreground">—</td><td className="p-2 text-center text-foreground">10/mo</td><td className="p-2 text-center text-foreground">50/mo</td><td className="p-2 text-center text-foreground">200/mo</td></tr>
                    <tr className="bg-muted/50"><td colSpan={5} className="p-2 font-semibold text-foreground">LEARN</td></tr>
                    <tr className="border-b border-border"><td className="p-2 text-foreground">Visual exports</td><td className="p-2 text-center text-foreground">—</td><td className="p-2 text-center text-foreground">✓</td><td className="p-2 text-center text-foreground">✓</td><td className="p-2 text-center text-foreground">✓</td></tr>
                    <tr className="border-b border-border"><td className="p-2 text-foreground">Outcome tracking</td><td className="p-2 text-center text-foreground">—</td><td className="p-2 text-center text-foreground">✓</td><td className="p-2 text-center text-foreground">✓</td><td className="p-2 text-center text-foreground">✓</td></tr>
                    <tr className="border-b border-border"><td className="p-2 text-foreground">History retention</td><td className="p-2 text-center text-foreground">30 days</td><td className="p-2 text-center text-foreground">Forever</td><td className="p-2 text-center text-foreground">Forever</td><td className="p-2 text-center text-foreground">Forever</td></tr>
                    <tr className="bg-muted/50"><td colSpan={5} className="p-2 font-semibold text-foreground">TEAM</td></tr>
                    <tr className="border-b border-border"><td className="p-2 text-foreground">Shared workspace</td><td className="p-2 text-center text-foreground">—</td><td className="p-2 text-center text-foreground">—</td><td className="p-2 text-center text-foreground">✓</td><td className="p-2 text-center text-foreground">✓</td></tr>
                    <tr className="border-b border-border"><td className="p-2 text-foreground">Team analytics</td><td className="p-2 text-center text-foreground">—</td><td className="p-2 text-center text-foreground">—</td><td className="p-2 text-center text-foreground">✓</td><td className="p-2 text-center text-foreground">✓</td></tr>
                    <tr className="bg-muted/50"><td colSpan={5} className="p-2 font-semibold text-foreground">ADMIN</td></tr>
                    <tr className="border-b border-border"><td className="p-2 text-foreground">Priority support</td><td className="p-2 text-center text-foreground">—</td><td className="p-2 text-center text-foreground">—</td><td className="p-2 text-center text-foreground">✓</td><td className="p-2 text-center text-foreground">✓</td></tr>
                    <tr className="border-b border-border"><td className="p-2 text-foreground">SSO (SAML)</td><td className="p-2 text-center text-foreground">—</td><td className="p-2 text-center text-foreground">—</td><td className="p-2 text-center text-foreground">—</td><td className="p-2 text-center text-foreground">✓</td></tr>
                    <tr><td className="p-2 text-foreground">API access</td><td className="p-2 text-center text-foreground">—</td><td className="p-2 text-center text-foreground">—</td><td className="p-2 text-center text-foreground">—</td><td className="p-2 text-center text-foreground">✓</td></tr>
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* PART 7: FAQ */}
      <section id="faq" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-h2 font-bold text-foreground">
              Questions
            </h2>
          </motion.div>

          <div className="max-w-2xl mx-auto space-y-3">
            {faqItems.map((item, i) => (
              <Collapsible key={i} open={openFaq === i}>
                <CollapsibleTrigger
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors text-left"
                >
                  <span className="font-medium pr-4 text-foreground">{item.q}</span>
                  {openFaq === i ? <Minus className="w-4 h-4 flex-shrink-0" /> : <Plus className="w-4 h-4 flex-shrink-0" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 pt-2">
                  <p className="text-muted-foreground text-sm">{item.a}</p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </section>

      {/* PART 8: Final CTA */}
      <section className="py-16 md:py-20 bg-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-h2 font-bold text-background mb-4">
              What decision are you avoiding stress-testing?
            </h2>
            <p className="text-background/80 text-lg mb-8">
              Your first analysis is free. No signup required.
            </p>
            <Button 
              onClick={() => scrollToSection("hero")}
              className="bg-background text-foreground hover:bg-background/90 px-8 py-6 text-base font-semibold"
            >
              Stress-Test Your Decision — Free
            </Button>
            <p className="text-background/60 text-sm mt-4">Takes less than 2 minutes</p>
          </motion.div>
        </div>
      </section>

      {/* PART 9: Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <SnagLogo size="md" className="mb-2 brightness-0 invert" />
              <p className="text-sm text-background/70 mb-2">Find the flaw before reality does.</p>
              <p className="text-xs text-background/50">© 2026 Roarr Consulting Group</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><button onClick={() => scrollToSection("features")} className="hover:text-background">Features</button></li>
                <li><button onClick={() => scrollToSection("pricing")} className="hover:text-background">Pricing</button></li>
                <li><a href="#" className="hover:text-background">Changelog</a></li>
                <li><a href="#" className="hover:text-background">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><a href="#" className="hover:text-background">Help Center</a></li>
                <li><a href="#" className="hover:text-background">Blog</a></li>
                <li><a href="#" className="hover:text-background">API Docs</a></li>
                <li><a href="#" className="hover:text-background">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><a href="#" className="hover:text-background">About</a></li>
                <li><a href="#" className="hover:text-background">Contact</a></li>
                <li><a href="/privacy" className="hover:text-background">Privacy</a></li>
                <li><a href="/terms" className="hover:text-background">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      <UsageLimitsModal open={limitsModalOpen} onOpenChange={setLimitsModalOpen} />
    </div>
  );
}
