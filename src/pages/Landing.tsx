import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Menu, X, Plus, Minus, ArrowRight, Eye, AlertTriangle, 
  Bell, StopCircle, HelpCircle, BookOpen, Search, BarChart3,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import UsageLimitsModal from "@/components/landing/UsageLimitsModal";
import { useAuth } from "@/contexts/AuthContext";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

// Animated section wrapper
function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Staggered grid wrapper
function StaggeredGrid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [limitsModalOpen, setLimitsModalOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["blindspots", "failure1", "warning", "kill", "unasked"]);

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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const faqItems = [
    {
      q: "What's a Deep Snag?",
      a: "A pre-mortem analysis. You describe your plan, Snag surfaces what could go wrong — blind spots, failure modes, warning signals, kill criteria, and the question you should be asking but aren't."
    },
    {
      q: "How long does it take?",
      a: "Under 2 minutes. Most analyses complete in 30-60 seconds."
    },
    {
      q: "Is this just ChatGPT with a wrapper?",
      a: "Snag uses AI, but it's not a chatbot. It's a structured decision system that remembers your history, tracks outcomes, and learns your patterns over time."
    },
    {
      q: "Can I use it for personal decisions?",
      a: "Yes. Career moves, relocations, major purchases, relationships — any decision with stakes."
    },
    {
      q: "What if my plan is solid?",
      a: "Snag will tell you. But it will still surface non-obvious risks worth considering."
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
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-2xl font-bold text-primary">Snag</span>
            </motion.div>

            <div className="hidden md:flex items-center gap-6">
              {["example", "pricing", "faq"].map((section, i) => (
                <motion.button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="text-sm text-foreground hover:text-primary transition-colors"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  whileHover={{ y: -2 }}
                >
                  {section === "example" ? "See Example" : section.charAt(0).toUpperCase() + section.slice(1)}
                </motion.button>
              ))}
              {!authLoading && user ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <Button onClick={() => navigate("/dashboard")} variant="default" size="sm">
                    Dashboard
                  </Button>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <Button onClick={() => navigate("/login")} variant="outline" size="sm">
                    Login
                  </Button>
                </motion.div>
              )}
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-t border-border py-4"
          >
            <div className="container mx-auto px-4 flex flex-col gap-4">
              <button onClick={() => scrollToSection("example")} className="text-left py-2">See Example</button>
              <button onClick={() => scrollToSection("pricing")} className="text-left py-2">Pricing</button>
              <button onClick={() => scrollToSection("faq")} className="text-left py-2">FAQ</button>
              {!authLoading && user ? (
                <button onClick={() => { setMobileMenuOpen(false); navigate("/dashboard"); }} className="text-left font-medium text-primary py-2">
                  Dashboard
                </button>
              ) : (
                <button onClick={() => { setMobileMenuOpen(false); navigate("/login"); }} className="text-left py-2">
                  Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* PART 1: Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="gradient-text">Find the flaw before reality does.</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg text-muted-foreground mb-8 max-w-[580px] mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Snag stress-tests any decision in 2 minutes. Get the blind spots, failure modes, and warning signals you'd never think of — or that would take hours to surface on your own.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handleGetStarted} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-6 text-base font-semibold">
                Stress-Test Your Plan — Free
              </Button>
            </motion.div>
            <motion.button 
              onClick={() => scrollToSection("example")} 
              className="text-primary font-medium hover:underline"
              whileHover={{ x: 5 }}
            >
              See an example ↓
            </motion.button>
          </motion.div>

          <motion.p 
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            12,000+ decisions stress-tested
          </motion.p>
        </div>
      </section>

      {/* PART 2: The Problem Section */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center max-w-[640px] mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
              <span className="gradient-text">Every bad decision has a flaw. You just didn't look for it.</span>
            </h2>
            
            <div className="text-lg text-foreground leading-relaxed space-y-6 text-left">
              <p>
                You know what a pre-mortem is. Instead of asking "how will this succeed?" — you ask "it's one year from now, this failed completely, why?"
              </p>
              <p>
                Studies show pre-mortems improve decision accuracy by up to 30%.
              </p>
              <p>
                But almost nobody does them. Because they're awkward. They take too long. And arguing against yourself is psychologically hard.
              </p>
              <p className="font-semibold text-primary">
                Snag does it for you. In 2 minutes.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* PART 3: What You Get Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">
              <span className="gradient-text">What you get in under 2 minutes</span>
            </h2>
          </AnimatedSection>

          <div className="flex overflow-x-auto md:grid md:grid-cols-5 gap-4 max-w-6xl mx-auto pb-4 md:pb-0 -mx-4 px-4 md:mx-auto">
            {[
              {
                icon: Eye,
                color: "text-primary",
                title: "Blind Spots",
                description: "What you're assuming without examining. What information you're missing. What perspective you haven't considered."
              },
              {
                icon: AlertTriangle,
                color: "text-destructive",
                title: "Failure Modes",
                description: "The specific ways this could fail — with mechanisms, not just 'bad luck.' Likelihood and impact for each."
              },
              {
                icon: Bell,
                color: "text-warning",
                title: "Warning Signals",
                description: "Observable signs in the first 30-90 days that indicate drift toward failure. Leading indicators, not lagging."
              },
              {
                icon: StopCircle,
                color: "text-[hsl(271,81%,56%)]",
                title: "Kill Criteria",
                description: "Specific conditions under which you should abandon the plan. Prevents sunk cost fallacy."
              },
              {
                icon: HelpCircle,
                color: "text-secondary",
                title: "The Unasked Question",
                description: "The one question you should be asking but aren't. Usually uncomfortable. Often assumption-challenging."
              }
            ].map((card, i) => (
              <motion.div 
                key={i} 
                className="bg-card border border-border rounded-xl p-6 min-w-[220px] flex-shrink-0 md:flex-shrink"
                variants={scaleIn}
                whileHover={{ y: -5 }}
              >
                <card.icon className={`w-8 h-8 ${card.color} mb-4`} />
                <h3 className="font-semibold mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PART 4: Live Example Section */}
      <section id="example" className="py-16 md:py-20 bg-muted">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">
              <span className="gradient-text">Example: Should I leave my job for a startup?</span>
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Left Column - Input */}
            <AnimatedSection delay={0.1}>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">THE DECISION</p>
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="text-foreground leading-relaxed">
                  "I'm considering leaving my PM role to join an early-stage AI startup as co-founder. 8% equity, no salary for 6 months. I have savings and believe in the product."
                </p>
              </div>
            </AnimatedSection>

            {/* Right Column - Output */}
            <AnimatedSection delay={0.2}>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">SNAG ANALYSIS</p>
              <div className="space-y-3">
                {/* Blind Spots */}
                <Collapsible open={expandedSections.includes("blindspots")}>
                  <CollapsibleTrigger 
                    onClick={() => toggleSection("blindspots")}
                    className="w-full flex items-center justify-between bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 bg-primary rounded-full" />
                      <span className="font-semibold text-sm">BLIND SPOTS</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes("blindspots") ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="bg-card border border-t-0 border-border rounded-b-xl px-4 pb-4 -mt-2">
                    <p className="text-sm text-muted-foreground pt-2">
                      You're assuming 8% is fair without seeing the full cap table or understanding dilution through future rounds. You're also assuming 6 months of runway is enough — most startups take 18-24 months to reach sustainable revenue.
                    </p>
                  </CollapsibleContent>
                </Collapsible>

                {/* Failure Mode */}
                <Collapsible open={expandedSections.includes("failure1")}>
                  <CollapsibleTrigger 
                    onClick={() => toggleSection("failure1")}
                    className="w-full flex items-center justify-between bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 bg-destructive rounded-full" />
                      <span className="font-semibold text-sm">FAILURE MODE #1</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes("failure1") ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="bg-card border border-t-0 border-border rounded-b-xl px-4 pb-4 -mt-2">
                    <p className="text-sm text-muted-foreground pt-2">
                      Co-founder conflict by month 9. Mechanism: Different expectations about workload, equity, and decision-making surface under stress. Likelihood: High. Impact: Company dies or you leave with nothing.
                    </p>
                  </CollapsibleContent>
                </Collapsible>

                {/* Warning Signal */}
                <Collapsible open={expandedSections.includes("warning")}>
                  <CollapsibleTrigger 
                    onClick={() => toggleSection("warning")}
                    className="w-full flex items-center justify-between bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 bg-warning rounded-full" />
                      <span className="font-semibold text-sm">WARNING SIGNAL</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes("warning") ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="bg-card border border-t-0 border-border rounded-b-xl px-4 pb-4 -mt-2">
                    <p className="text-sm text-muted-foreground pt-2">
                      If the other founders are vague about the cap table, option pool, or previous commitments — that's a red flag in the first week.
                    </p>
                  </CollapsibleContent>
                </Collapsible>

                {/* Kill Criteria */}
                <Collapsible open={expandedSections.includes("kill")}>
                  <CollapsibleTrigger 
                    onClick={() => toggleSection("kill")}
                    className="w-full flex items-center justify-between bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 bg-muted-foreground rounded-full" />
                      <span className="font-semibold text-sm">KILL CRITERIA</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes("kill") ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="bg-card border border-t-0 border-border rounded-b-xl px-4 pb-4 -mt-2">
                    <p className="text-sm text-muted-foreground pt-2">
                      If salary doesn't materialize by month 6 as promised, or if you've burned through 50% of savings without clear revenue path — stop and reassess.
                    </p>
                  </CollapsibleContent>
                </Collapsible>

                {/* The Unasked Question */}
                <Collapsible open={expandedSections.includes("unasked")}>
                  <CollapsibleTrigger 
                    onClick={() => toggleSection("unasked")}
                    className="w-full flex items-center justify-between bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 bg-secondary rounded-full" />
                      <span className="font-semibold text-sm">THE UNASKED QUESTION</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes("unasked") ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="bg-card border border-t-0 border-border rounded-b-xl px-4 pb-4 -mt-2">
                    <p className="text-sm text-muted-foreground pt-2">
                      Why is your contribution worth only 8%? If you're giving up salary and taking equal risk, why aren't you asking for 15-20%?
                    </p>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </AnimatedSection>
          </div>

          {/* Bottom CTA */}
          <AnimatedSection delay={0.3} className="text-center mt-12">
            <p className="text-muted-foreground mb-6">
              That took 47 seconds to generate. What decision are you avoiding stress-testing?
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handleGetStarted} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-6 text-base font-semibold">
                Stress-Test Your Plan — Free
              </Button>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* PART 5: Use Cases Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">
              <span className="gradient-text">Decisions worth stress-testing</span>
            </h2>
          </AnimatedSection>

          <StaggeredGrid className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                category: "Career",
                questions: [
                  "Should I take this job offer?",
                  "Is it time to ask for a raise?",
                  "Should I go back to school?"
                ]
              },
              {
                category: "Business",
                questions: [
                  "Should we launch this feature?",
                  "Is this the right hire?",
                  "Should we raise funding?"
                ]
              },
              {
                category: "Personal",
                questions: [
                  "Should I relocate?",
                  "Is this the right time to buy?",
                  "Should I end this partnership?"
                ]
              }
            ].map((group, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">{group.category}</p>
                <ul className="space-y-3">
                  {group.questions.map((q, j) => (
                    <li key={j} className="text-foreground">"{q}"</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </StaggeredGrid>
        </div>
      </section>

      {/* PART 6: Supporting Features Section */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              <span className="gradient-text">Snag gets smarter as you use it</span>
            </h2>
            <p className="text-muted-foreground">
              Pre-mortem is the core. These features make it compound.
            </p>
          </AnimatedSection>

          <StaggeredGrid className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: BookOpen,
                title: "Capture decisions daily",
                description: "Quick-log decisions as they happen. Build context for when stakes get high enough to run a full Snag."
              },
              {
                icon: Search,
                title: "Learn from outcomes",
                description: "When decisions play out, Snag helps you extract lessons. What worked. What didn't. Why. So you don't repeat mistakes."
              },
              {
                icon: BarChart3,
                title: "Close the loop",
                description: "Snag prompts you to check outcomes in 30/60/90 days. Over time, you see patterns — which decisions you get right, which you don't."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                className="bg-card border border-border rounded-xl p-5"
                variants={scaleIn}
              >
                <feature.icon className="w-6 h-6 text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-2 text-sm">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </StaggeredGrid>
        </div>
      </section>

      {/* PART 7: Differentiation Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <AnimatedSection className="max-w-3xl mx-auto">
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-7">
              <h3 className="font-semibold mb-4 text-lg">Why not just prompt ChatGPT?</h3>
              <p className="text-foreground leading-relaxed">
                ChatGPT can run a pre-mortem if you prompt it well. But it forgets everything after each session. It won't ping you in 90 days to check what happened. It can't tell you that your career decisions succeed 73% of the time while your business decisions succeed 48%. 
              </p>
              <p className="text-foreground leading-relaxed mt-4 font-medium">
                Snag builds personal decision intelligence that compounds over time. That's not something you can export to ChatGPT.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* PART 8: Pricing Section */}
      <section id="pricing" className="py-16 md:py-20 bg-muted">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              <span className="gradient-text">Start free. Upgrade when Snag becomes essential.</span>
            </h2>
          </AnimatedSection>

          {/* Billing Toggle */}
          <AnimatedSection delay={0.1} className="flex items-center justify-center gap-3 mb-10">
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} className="data-[state=checked]:bg-primary" />
            <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
            <motion.span 
              className="bg-success text-success-foreground text-xs font-medium px-2 py-1 rounded-full ml-1"
              animate={{ scale: isAnnual ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              Save 25%
            </motion.span>
          </AnimatedSection>

          <StaggeredGrid className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free Tier */}
            <motion.div 
              className="bg-card border border-border rounded-2xl p-6"
              variants={scaleIn}
            >
              <h3 className="text-lg font-bold mb-1">Free</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-muted-foreground"> forever</span>
              </div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>3 decision captures per day</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>1 Deep Snag (try it)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>30-day history</span>
                </li>
              </ul>
              <Button onClick={handleGetStarted} variant="outline" className="w-full">
                Start Free
              </Button>
            </motion.div>

            {/* Pro Tier - Highlighted */}
            <motion.div 
              className="bg-card border-2 border-primary rounded-2xl p-6 relative"
              variants={scaleIn}
            >
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                MOST POPULAR
              </span>
              <h3 className="text-lg font-bold mb-1">Pro</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">${isAnnual ? '9' : '12'}</span>
                <span className="text-muted-foreground">/month</span>
                {isAnnual && <span className="text-xs text-muted-foreground block">billed yearly</span>}
              </div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>Unlimited decision captures</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span className="font-medium">50 Deep Snags per month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>25 Post-Mortems per month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>Unlimited Quick Retros</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>Outcome tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>Pattern reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>Forever history</span>
                </li>
              </ul>
              <Button onClick={handleGetStarted} className="w-full bg-secondary hover:bg-secondary/90">
                Start Pro Trial
              </Button>
            </motion.div>

            {/* Team Tier */}
            <motion.div 
              className="bg-card border border-border rounded-2xl p-6"
              variants={scaleIn}
            >
              <h3 className="text-lg font-bold mb-1">Team</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">${isAnnual ? '44' : '59'}</span>
                <span className="text-muted-foreground">/month</span>
                <span className="text-xs text-muted-foreground block">up to 5 people</span>
              </div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span className="font-medium">200 Deep Snags (shared)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>Team workspace</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✓</span>
                  <span>Shared analyses</span>
                </li>
              </ul>
              <Button onClick={handleGetStarted} variant="outline" className="w-full">
                Start Team Trial
              </Button>
            </motion.div>
          </StaggeredGrid>

          <AnimatedSection delay={0.3} className="text-center mt-8">
            <button 
              onClick={() => setLimitsModalOpen(true)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Need more? Enterprise plans available.
            </button>
          </AnimatedSection>
        </div>
      </section>

      {/* PART 9: FAQ Section */}
      <section id="faq" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">
              <span className="gradient-text">Questions</span>
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.1} className="max-w-2xl mx-auto space-y-3">
            {faqItems.map((item, i) => (
              <Collapsible key={i} open={openFaq === i}>
                <CollapsibleTrigger
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors text-left"
                >
                  <span className="font-medium pr-4">{item.q}</span>
                  {openFaq === i ? <Minus className="w-4 h-4 flex-shrink-0" /> : <Plus className="w-4 h-4 flex-shrink-0" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 pt-2">
                  <p className="text-muted-foreground">{item.a}</p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* PART 10: Final CTA Section */}
      <section className="py-16 md:py-20 gradient-premium">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              What decision are you about to make that you'll regret in a year?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Find the flaw before reality does.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={handleGetStarted} 
                className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-base font-semibold"
              >
                Stress-Test Your Plan — Free
              </Button>
            </motion.div>
            <p className="text-white/60 text-sm mt-6">
              No credit card required. 2 minutes to your first analysis.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">Snag</span>
              <span className="text-sm text-muted-foreground">© 2026</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <button onClick={() => navigate("/privacy")} className="hover:text-foreground transition-colors">Privacy</button>
              <button onClick={() => navigate("/terms")} className="hover:text-foreground transition-colors">Terms</button>
              <button onClick={() => navigate("/disclaimer")} className="hover:text-foreground transition-colors">Disclaimer</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UsageLimitsModal open={limitsModalOpen} onOpenChange={setLimitsModalOpen} />
    </div>
  );
}
