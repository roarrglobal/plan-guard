import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Menu, X, Check, Plus, Minus, ArrowRight, Building, ChevronDown,
  BookOpen, Target, Search, BarChart3, Flame, Briefcase,
  Sun, Zap, Calendar, TrendingUp, Users, Rocket, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsageLimitsModal from "@/components/landing/UsageLimitsModal";
import LiveStatsCounter from "@/components/landing/LiveStatsCounter";
import { useAuth } from "@/contexts/AuthContext";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
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
              {["features", "how-it-works", "pricing"].map((section, i) => (
                <motion.button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="text-sm text-foreground hover:text-primary transition-colors"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  whileHover={{ y: -2 }}
                >
                  {section === "how-it-works" ? "How it Works" : section.charAt(0).toUpperCase() + section.slice(1)}
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
              <button onClick={() => scrollToSection("features")} className="text-left py-2">Features</button>
              <button onClick={() => scrollToSection("how-it-works")} className="text-left py-2">How it Works</button>
              <button onClick={() => scrollToSection("pricing")} className="text-left py-2">Pricing</button>
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

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="gradient-text">Think better. Decide better. Learn from everything.</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Snag is your decision journal — capture daily thoughts, stress-test big choices before you commit, extract wisdom from every outcome.
          </motion.p>

          {/* Value proposition pills */}
          <motion.div 
            className="flex flex-wrap justify-center gap-3 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {[
              { icon: "📓", label: "Daily Journaling" },
              { icon: "🎯", label: "Pre-Mortem Analysis" },
              { icon: "🔍", label: "Post-Mortem Learning" },
              { icon: "📊", label: "Visual Frameworks" }
            ].map((pill, i) => (
              <motion.span 
                key={i} 
                className="inline-flex items-center gap-2 bg-muted text-foreground text-sm px-4 py-2 rounded-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <span>{pill.icon}</span>
                <span>{pill.label}</span>
              </motion.span>
            ))}
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handleGetStarted} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-6 text-base font-semibold">
                Start Your Journal — Free
              </Button>
            </motion.div>
            <motion.button 
              onClick={() => scrollToSection("how-it-works")} 
              className="text-primary font-medium hover:underline"
              whileHover={{ x: 5 }}
            >
              See how it works ↓
            </motion.button>
          </motion.div>

          <motion.p 
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            Join 10,000+ people thinking more clearly
          </motion.p>
        </div>
      </section>

      {/* Live Stats Counter Section */}
      <LiveStatsCounter />

      {/* What is Snag? Section */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="gradient-text">One place for all your thinking</span>
            </h2>
          </AnimatedSection>

          <StaggeredGrid className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: BookOpen,
                color: "text-primary",
                bgColor: "bg-primary/10",
                title: "Capture",
                description: "Journal daily. Track moods. Build habits. Log decisions as they happen. Your thoughts, organized."
              },
              {
                icon: Target,
                color: "text-secondary",
                bgColor: "bg-secondary/10",
                title: "Analyze",
                description: "Stress-test decisions before you commit. Extract lessons after outcomes. Use proven frameworks."
              },
              {
                icon: TrendingUp,
                color: "text-success",
                bgColor: "bg-success/10",
                title: "Learn",
                description: "Track what actually happened. See your patterns. Build personal decision intelligence over time."
              }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                className="text-center"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className={`w-16 h-16 ${item.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <item.icon className={`w-8 h-8 ${item.color}`} />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </StaggeredGrid>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Powerful alone. Unstoppable together.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to think better
            </p>
          </AnimatedSection>

          <StaggeredGrid className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: BookOpen,
                color: "bg-primary",
                title: "Daily Journal",
                subtitle: "Your private thinking space",
                features: ["Free writing & prompts", "Gratitude practice", "Manifestation & goals", "Mood tracking", "Morning & evening rituals"],
                badge: "Build the habit",
                badgeColor: "bg-primary/10 text-primary"
              },
              {
                icon: Flame,
                color: "bg-warning",
                title: "Habit Tracker",
                subtitle: "Streaks that stick",
                features: ["Daily habit tracking", "Streak counting", "Visual progress", "Reminders", "Habit-to-journal connection"],
                badge: "Stay consistent",
                badgeColor: "bg-warning/10 text-warning"
              },
              {
                icon: Target,
                color: "bg-secondary",
                title: "Pre-Mortem Analysis",
                subtitle: "Find flaws before reality does",
                features: ["Blind spot detection", "Failure mode mapping", "Warning signals", "Kill criteria", "The unasked question"],
                badge: "Prevent regret",
                badgeColor: "bg-secondary/10 text-secondary"
              },
              {
                icon: Search,
                color: "bg-[hsl(271,81%,56%)]",
                title: "Post-Mortem Analysis",
                subtitle: "Learn from everything",
                features: ["Root cause analysis (5 Whys)", "Success & failure factors", "Lessons extracted", "Action items", "The uncomfortable truth"],
                badge: "Build wisdom",
                badgeColor: "bg-[hsl(271,81%,56%)]/10 text-[hsl(271,81%,56%)]"
              },
              {
                icon: BarChart3,
                color: "bg-success",
                title: "Visual Frameworks",
                subtitle: "See your thinking",
                features: ["Risk matrices", "Fishbone diagrams", "Decision trees", "Five Whys ladders", "Export as PNG/PDF"],
                badge: "Share insights",
                badgeColor: "bg-success/10 text-success"
              },
              {
                icon: Briefcase,
                color: "bg-primary",
                title: "Business Frameworks",
                subtitle: "Consulting-grade tools",
                features: ["Porter's Five Forces", "SWOT Analysis", "MEDDPICC (Sales)", "BANT (Sales)", "Decision matrices"],
                badge: "Professional grade",
                badgeColor: "bg-primary/10 text-primary"
              }
            ].map((card, i) => (
              <motion.div 
                key={i} 
                className="bg-card border border-border rounded-2xl p-7 hover:shadow-lg transition-shadow relative"
                variants={scaleIn}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <span className={`absolute top-4 right-4 text-xs font-medium px-3 py-1 rounded-full ${card.badgeColor}`}>
                  {card.badge}
                </span>
                <motion.div 
                  className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4`}
                  whileHover={{ rotate: 10 }}
                >
                  <card.icon className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-1">{card.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{card.subtitle}</p>
                <ul className="space-y-2">
                  {card.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-success flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </StaggeredGrid>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-20 bg-muted">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="gradient-text">How Snag works</span>
            </h2>
          </AnimatedSection>

          <div className="max-w-4xl mx-auto">
            <StaggeredGrid className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { time: "Start your day", icon: Sun, color: "bg-warning", title: "Capture intentions", text: "Journal your thoughts. Set your mood. Review your habits. Capture any decisions on your mind." },
                { time: "As decisions arise", icon: Zap, color: "bg-primary", title: "Log & reflect", text: "Quick-capture decisions in seconds. Get instant AI reflection. Tag stakes and deadlines." },
                { time: "When stakes are high", icon: Target, color: "bg-secondary", title: "Run a Deep Snag", text: "Full pre-mortem analysis. Surface blind spots, failure modes, warning signals. Know what could go wrong before you commit." },
                { time: "When things conclude", icon: Search, color: "bg-[hsl(271,81%,56%)]", title: "Run a Post-Mortem", text: "Analyze what happened. Find root causes. Extract lessons. Generate visual frameworks to capture and share insights." },
                { time: "Every week", icon: Calendar, color: "bg-primary", title: "Review & reflect", text: "See your patterns. Check pending outcomes. Understand your decision-making style." },
                { time: "Month after month", icon: TrendingUp, color: "bg-success", title: "Build intelligence", text: "Your personal decision database grows. Snag learns your patterns. Outcomes teach you what actually works." }
              ].map((step, i) => (
                <motion.div 
                  key={i} 
                  className="bg-card rounded-xl p-6 border border-border"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{step.time}</span>
                  <motion.div 
                    className={`w-10 h-10 ${step.color} rounded-lg flex items-center justify-center my-3`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <step.icon className="w-5 h-5 text-white" />
                  </motion.div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </motion.div>
              ))}
            </StaggeredGrid>
          </div>
        </div>
      </section>

      {/* The Difference Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">The difference</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              AI chatbots forget. Snag remembers — and learns.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold">Aspect</th>
                  <th className="text-center py-4 px-4 font-semibold bg-muted">ChatGPT / Claude</th>
                  <th className="text-center py-4 px-4 font-semibold border-l-4 border-primary">Snag</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { aspect: "Memory", chatgpt: "Stores facts about you", snag: "Stores every decision with full context" },
                  { aspect: "Follow-up", chatgpt: "You must ask", snag: "Prompts you in 30/60/90 days" },
                  { aspect: "Outcomes", chatgpt: "Doesn't know what happened", snag: "Tracks what actually occurred" },
                  { aspect: "Patterns", chatgpt: "Manual (you ask)", snag: "Automatic monthly reports" },
                  { aspect: "Visual outputs", chatgpt: "Limited", snag: "Professional frameworks, exportable" },
                  { aspect: "Business tools", chatgpt: "Explain if asked", snag: "Pre-built guided templates" },
                  { aspect: "Accountability", chatgpt: "None", snag: "Streaks, habits, reminders" }
                ].map((row, i) => (
                  <motion.tr 
                    key={i} 
                    className="border-b border-border/50"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td className="py-3 px-4 font-medium">{row.aspect}</td>
                    <td className="py-3 px-4 text-center text-muted-foreground bg-muted">{row.chatgpt}</td>
                    <td className="py-3 px-4 text-center border-l-4 border-primary">{row.snag}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </AnimatedSection>

          <AnimatedSection delay={0.4} className="max-w-3xl mx-auto mt-8">
            <motion.div 
              className="bg-primary/5 border-l-4 border-primary rounded-lg p-5"
              whileHover={{ x: 5 }}
            >
              <p className="text-foreground">
                After 6 months with Snag, you have a personal decision intelligence system built on YOUR history, YOUR patterns, YOUR outcomes. That's not something you can export to ChatGPT.
              </p>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="gradient-text">Built for thinkers, makers, and leaders</span>
            </h2>
          </AnimatedSection>

          <StaggeredGrid className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Users,
                title: "Career Decisions",
                examples: ["Should I take this job offer?", "Is it time to ask for a raise?", "Should I change industries?"],
                quote: "I snagged my job change. Avoided a disaster.",
                attribution: "— Product Manager, Tech"
              },
              {
                icon: Rocket,
                title: "Startup Decisions",
                examples: ["Should I raise this round?", "Is this the right co-founder?", "Should we pivot?"],
                quote: "Every board meeting starts with a Deep Snag.",
                attribution: "— Founder, Series A startup"
              },
              {
                icon: Users,
                title: "Team Decisions",
                examples: ["Should we ship this feature?", "Is this hire the right call?", "Should we expand to this market?"],
                quote: "Our post-mortems are actually useful now.",
                attribution: "— VP Engineering"
              },
              {
                icon: Home,
                title: "Personal Decisions",
                examples: ["Should I relocate for this opportunity?", "Is this the right time to buy?", "Should I go back to school?"],
                quote: "I journal every morning. Snag knows me better than I know myself.",
                attribution: "— Consultant"
              }
            ].map((card, i) => (
              <motion.div 
                key={i} 
                className="bg-card border border-border rounded-2xl p-7"
                variants={scaleIn}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div 
                    className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <card.icon className="w-5 h-5 text-primary" />
                  </motion.div>
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                </div>
                <ul className="space-y-2 mb-4">
                  {card.examples.map((ex, j) => (
                    <li key={j} className="text-muted-foreground text-sm">"{ex}"</li>
                  ))}
                </ul>
                <div className="border-t border-border pt-4">
                  <p className="text-sm italic text-foreground">"{card.quote}"</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.attribution}</p>
                </div>
              </motion.div>
            ))}
          </StaggeredGrid>
        </div>
      </section>

      {/* Sample Output Preview */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="gradient-text">What you get</span>
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <Tabs defaultValue="premortem" className="max-w-5xl mx-auto">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="premortem">Pre-Mortem</TabsTrigger>
                <TabsTrigger value="postmortem">Post-Mortem</TabsTrigger>
              </TabsList>

              <TabsContent value="premortem">
                <motion.div 
                  className="grid md:grid-cols-2 gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="bg-muted rounded-xl p-6">
                    <p className="text-xs uppercase font-semibold text-muted-foreground mb-4">THE DECISION</p>
                    <p className="text-foreground">
                      I'm considering leaving my PM role to join an early-stage AI startup as co-founder. 8% equity, no salary for 6 months.
                    </p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-6">
                    <p className="text-xs uppercase font-semibold text-primary mb-4">DEEP SNAG ANALYSIS</p>
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs uppercase font-semibold text-secondary">BLIND SPOTS</span>
                        <p className="text-sm text-muted-foreground mt-1">You're assuming 8% is fair without seeing the cap table...</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase font-semibold text-secondary">FAILURE MODE #1</span>
                        <p className="text-sm text-muted-foreground mt-1">Co-founder conflict at month 9 when...</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase font-semibold text-warning">WARNING SIGNAL</span>
                        <p className="text-sm text-muted-foreground mt-1">If founders are vague about equity split...</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase font-semibold text-destructive">KILL CRITERIA</span>
                        <p className="text-sm text-muted-foreground mt-1">If salary doesn't materialize by month 6...</p>
                      </div>
                    </div>
                    <motion.button 
                      className="text-sm text-primary font-medium mt-4 inline-flex items-center gap-1 hover:underline"
                      whileHover={{ x: 5 }}
                    >
                      Generate visual framework <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="postmortem">
                <motion.div 
                  className="grid md:grid-cols-2 gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="bg-muted rounded-xl p-6">
                    <p className="text-xs uppercase font-semibold text-muted-foreground mb-4">WHAT HAPPENED</p>
                    <p className="text-foreground">
                      We launched the feature 2 weeks late. It got good user feedback but we missed the quarterly goal. Team was exhausted.
                    </p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-6">
                    <p className="text-xs uppercase font-semibold text-[hsl(271,81%,56%)] mb-4">POST-MORTEM ANALYSIS</p>
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs uppercase font-semibold text-warning">OUTCOME</span>
                        <p className="text-sm text-muted-foreground mt-1">Partial success (7/10)</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase font-semibold text-[hsl(271,81%,56%)]">ROOT CAUSE</span>
                        <p className="text-sm text-muted-foreground mt-1">Scope creep in week 3 without deadline adjustment...</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase font-semibold text-success">WHAT WORKED</span>
                        <p className="text-sm text-muted-foreground mt-1">Cross-team collaboration, testing process...</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase font-semibold text-destructive">WHAT DIDN'T</span>
                        <p className="text-sm text-muted-foreground mt-1">Deadline negotiation, scope management...</p>
                      </div>
                    </div>
                    <motion.button 
                      className="text-sm text-primary font-medium mt-4 inline-flex items-center gap-1 hover:underline"
                      whileHover={{ x: 5 }}
                    >
                      Generate visual framework <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </AnimatedSection>
        </div>
      </section>

      {/* Visual Frameworks Showcase */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Professional frameworks. Instant export.</span>
            </h2>
            <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
              Export as PNG or PDF. Share with your team. Include in presentations.
            </p>
          </AnimatedSection>

          <StaggeredGrid className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
            {[
              { name: "Risk Matrix", label: "Pre-Mortem" },
              { name: "Decision Tree", label: "Pre-Mortem" },
              { name: "Fishbone Diagram", label: "Post-Mortem" },
              { name: "Five Whys Ladder", label: "Post-Mortem" },
              { name: "Porter's Five Forces", label: "Business" },
              { name: "MEDDPICC Scorecard", label: "Sales" }
            ].map((fw, i) => (
              <motion.div 
                key={i} 
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow group cursor-pointer relative"
                variants={scaleIn}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <span className="absolute top-3 right-3 text-[10px] font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {fw.label}
                </span>
                <motion.div 
                  className="h-16 flex items-center justify-center mb-3"
                  whileHover={{ rotate: 5 }}
                >
                  <BarChart3 className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                </motion.div>
                <p className="text-sm font-medium">{fw.name}</p>
              </motion.div>
            ))}
          </StaggeredGrid>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={handleGetStarted} variant="default">
              Try it free →
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Simple pricing. Powerful features.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free. Upgrade when Snag becomes essential.
            </p>
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

          <StaggeredGrid className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {/* Free Plan */}
            <motion.div 
              className="bg-muted rounded-2xl p-6 border border-border flex flex-col"
              variants={fadeInUp}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <div className="mb-4">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-sm text-muted-foreground ml-1">forever</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Get started with daily journaling and try every feature once.</p>
              
              <div className="space-y-4 mb-6 flex-1">
                <div>
                  <p className="text-xs font-semibold text-primary uppercase mb-2">CAPTURE</p>
                  <ul className="space-y-1.5">
                    {["3 journal entries per day", "3 decision captures per day", "Mood tracking", "3 habits"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-success flex-shrink-0" />{f}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-secondary uppercase mb-2">ANALYZE</p>
                  <ul className="space-y-1.5">
                    {["1 Deep Snag (Pre-Mortem) — try it", "1 Post-Mortem — try it", "2 Business frameworks — try it"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-success flex-shrink-0" />{f}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">LIMITS</p>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li>30-day history</li>
                    <li>No visual exports</li>
                    <li>No document uploads</li>
                  </ul>
                </div>
              </div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={handleGetStarted}>
                  Start Free
                </Button>
              </motion.div>
              <p className="text-xs text-muted-foreground text-center mt-2">No credit card required</p>
            </motion.div>

            {/* Pro Plan */}
            <motion.div 
              className="bg-card rounded-2xl p-6 border-2 border-secondary relative shadow-lg flex flex-col"
              variants={fadeInUp}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <motion.span 
                className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs font-semibold uppercase px-3 py-1 rounded-full"
                animate={{ y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                MOST POPULAR
              </motion.span>
              
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <div className="mb-1">
                {isAnnual && <span className="text-base text-muted-foreground line-through mr-2">$12</span>}
                <span className="text-5xl font-bold">{isAnnual ? '$9' : '$12'}</span>
                <span className="text-sm text-muted-foreground ml-1">/month</span>
              </div>
              {isAnnual && <p className="text-xs text-muted-foreground mb-4">billed annually</p>}
              {!isAnnual && <div className="mb-4" />}
              <p className="text-sm text-muted-foreground mb-4">For individuals who want to think better every day.</p>
              
              <div className="space-y-4 mb-6 flex-1">
                <div>
                  <p className="text-xs font-semibold text-primary uppercase mb-2">CAPTURE</p>
                  <ul className="space-y-1.5">
                    {["Unlimited journal entries", "Unlimited decision captures", "Full mood & habit tracking", "10 habits", "Manifestation & gratitude"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-success flex-shrink-0" />{f}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-secondary uppercase mb-2">ANALYZE</p>
                  <ul className="space-y-1.5">
                    {["50 Deep Snags per month", "25 Post-Mortems per month", "Unlimited business frameworks", "10 document uploads per month"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-success flex-shrink-0" />{f}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-success uppercase mb-2">LEARN</p>
                  <ul className="space-y-1.5">
                    {["Unlimited visual exports", "Outcome tracking", "Monthly pattern reports", "Personal insights", "Forever history"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-success flex-shrink-0" />{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  Start Pro
                </Button>
              </motion.div>
              <p className="text-xs text-muted-foreground text-center mt-2">2-day free trial, then ${isAnnual ? '9' : '12'}/month</p>
            </motion.div>

            {/* Team Plan */}
            <motion.div 
              className="bg-muted rounded-2xl p-6 border border-border flex flex-col"
              variants={fadeInUp}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl font-semibold mb-2">Team</h3>
              <div className="mb-1">
                {isAnnual && <span className="text-base text-muted-foreground line-through mr-2">$59</span>}
                <span className="text-5xl font-bold">{isAnnual ? '$44' : '$59'}</span>
                <span className="text-sm text-muted-foreground ml-1">/month</span>
              </div>
              {isAnnual && <p className="text-xs text-muted-foreground mb-1">billed annually</p>}
              {!isAnnual && <div className="mb-1" />}
              <p className="text-sm text-muted-foreground mb-4">Up to 5 members</p>
              <p className="text-sm text-muted-foreground mb-4">For teams that want to think together.</p>
              
              <div className="space-y-4 mb-6 flex-1">
                <div>
                  <p className="text-xs font-semibold text-primary uppercase mb-2">EVERYTHING IN PRO, PLUS:</p>
                  <ul className="space-y-1.5">
                    {["200 Deep Snags per month (team pool)", "100 Post-Mortems per month (team pool)", "50 document uploads per month", "5 GB team storage"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-success flex-shrink-0" />{f}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[hsl(271,81%,56%)] uppercase mb-2">COLLABORATION</p>
                  <ul className="space-y-1.5">
                    {["Shared team workspace", "Team retrospectives", "Collaborative frameworks", "Comment & @mention", "Team analytics dashboard"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-success flex-shrink-0" />{f}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">ADMIN</p>
                  <ul className="space-y-1.5">
                    {["Member management", "Team patterns", "Priority support"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-success flex-shrink-0" />{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Start Team Trial
                </Button>
              </motion.div>
              <p className="text-xs text-muted-foreground text-center mt-2">2-day trial, then ${isAnnual ? '44' : '59'}/month</p>
            </motion.div>

            {/* Business Plan */}
            <motion.div 
              className="bg-muted rounded-2xl p-6 border border-border flex flex-col"
              variants={fadeInUp}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl font-semibold mb-2">Business</h3>
              <div className="mb-1">
                {isAnnual && <span className="text-base text-muted-foreground line-through mr-2">$199</span>}
                <span className="text-5xl font-bold">{isAnnual ? '$149' : '$199'}</span>
                <span className="text-sm text-muted-foreground ml-1">/month</span>
              </div>
              {isAnnual && <p className="text-xs text-muted-foreground mb-1">billed annually</p>}
              {!isAnnual && <div className="mb-1" />}
              <p className="text-sm text-muted-foreground mb-4">Up to 20 members</p>
              <p className="text-sm text-muted-foreground mb-4">For organizations serious about decision quality.</p>
              
              <div className="space-y-4 mb-6 flex-1">
                <div>
                  <p className="text-xs font-semibold text-primary uppercase mb-2">EVERYTHING IN TEAM, PLUS:</p>
                  <ul className="space-y-1.5">
                    {["1,000 Deep Snags per month", "500 Post-Mortems per month", "200 document uploads per month", "25 GB storage"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-success flex-shrink-0" />{f}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground uppercase mb-2">ENTERPRISE FEATURES</p>
                  <ul className="space-y-1.5">
                    {["Branded PDF exports", "Custom visual templates", "Audit log", "API access (add-on)", "SSO (SAML)", "Dedicated onboarding"].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-success flex-shrink-0" />{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Contact Sales
                </Button>
              </motion.div>
            </motion.div>
          </StaggeredGrid>

          {/* Enterprise Callout */}
          <AnimatedSection delay={0.3} className="max-w-4xl mx-auto mt-8">
            <motion.div 
              className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4"
              whileHover={{ scale: 1.01 }}
            >
              <motion.div 
                className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Building className="w-6 h-6 text-primary" />
              </motion.div>
              <div className="flex-1 text-center sm:text-left">
                <p className="font-medium">
                  Need unlimited seats, custom integrations, or dedicated support?
                </p>
              </div>
              <motion.button 
                className="text-sm font-semibold text-primary hover:underline whitespace-nowrap flex items-center gap-1"
                whileHover={{ x: 5 }}
              >
                Talk to Enterprise Sales <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </AnimatedSection>

          {/* Compare Features Collapsible */}
          <Collapsible className="max-w-4xl mx-auto mt-8">
            <CollapsibleTrigger className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline mx-auto">
              Compare all features <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-6">
              <motion.div 
                className="overflow-x-auto"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-semibold">Feature</th>
                      <th className="text-center py-3 px-2 font-semibold">Free</th>
                      <th className="text-center py-3 px-2 font-semibold text-secondary">Pro</th>
                      <th className="text-center py-3 px-2 font-semibold">Team</th>
                      <th className="text-center py-3 px-2 font-semibold">Business</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "Daily journal entries", free: "3/day", pro: "∞", team: "∞", business: "∞" },
                      { feature: "Decision captures", free: "3/day", pro: "∞", team: "∞", business: "∞" },
                      { feature: "Habits", free: "3", pro: "10", team: "∞", business: "∞" },
                      { feature: "Deep Snags", free: "1 total", pro: "50/mo", team: "200/mo", business: "1,000/mo" },
                      { feature: "Post-Mortems", free: "1 total", pro: "25/mo", team: "100/mo", business: "500/mo" },
                      { feature: "Business frameworks", free: "2 total", pro: "∞", team: "∞", business: "∞" },
                      { feature: "Visual exports", free: "—", pro: "✓", team: "✓", business: "✓" },
                      { feature: "Document uploads", free: "—", pro: "10/mo", team: "50/mo", business: "200/mo" },
                      { feature: "History", free: "30 days", pro: "Forever", team: "Forever", business: "Forever" },
                      { feature: "Team workspace", free: "—", pro: "—", team: "✓", business: "✓" },
                      { feature: "Team analytics", free: "—", pro: "—", team: "✓", business: "✓" },
                      { feature: "Branded exports", free: "—", pro: "—", team: "—", business: "✓" },
                      { feature: "SSO (SAML)", free: "—", pro: "—", team: "—", business: "✓" },
                      { feature: "API access", free: "—", pro: "—", team: "—", business: "Add-on" }
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2.5 px-2">{row.feature}</td>
                        <td className="py-2.5 px-2 text-center text-muted-foreground">{row.free}</td>
                        <td className="py-2.5 px-2 text-center font-medium">{row.pro}</td>
                        <td className="py-2.5 px-2 text-center">{row.team}</td>
                        <td className="py-2.5 px-2 text-center">{row.business}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </CollapsibleContent>
          </Collapsible>

          <p className="text-xs text-muted-foreground text-center mt-6 max-w-2xl mx-auto">
            All plans include fair usage limits. Need more? Top-up packs available or upgrade anytime.{" "}
            <button onClick={() => setLimitsModalOpen(true)} className="text-primary hover:underline">
              See full limits →
            </button>
          </p>
        </div>
      </section>

      <UsageLimitsModal open={limitsModalOpen} onOpenChange={setLimitsModalOpen} />

      {/* FAQ Section */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container mx-auto px-4 max-w-3xl">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="gradient-text">Frequently asked questions</span>
            </h2>
          </AnimatedSection>

          <div className="space-y-0">
            {[
              { q: "What makes Snag different from other journaling apps?", a: "Most journaling apps are just text storage. Snag connects your daily thoughts to decision analysis. Journal an intention, then stress-test it. Reflect on an outcome, then extract lessons. Your journal becomes actionable." },
              { q: "What's a Deep Snag (Pre-Mortem)?", a: "A pre-mortem is the opposite of a post-mortem. Instead of analyzing what went wrong after, you imagine failure before you commit and work backward to find the causes. Deep Snag runs this analysis in under 2 minutes — surfacing blind spots, failure modes, warning signals, and the question you should be asking." },
              { q: "What's a Post-Mortem?", a: "A structured analysis of something that already happened — a project, decision, or experience. Snag helps you find root causes (5 Whys), identify what worked and didn't, extract lessons, and generate visual frameworks to capture and share your insights." },
              { q: "Can I analyze my journal entries?", a: "Yes. Any journal entry can be turned into a Pre-Mortem or Post-Mortem with one tap. Writing about a goal? Stress-test it. Reflecting on a project? Extract the lessons. Your journaling becomes fuel for deeper thinking." },
              { q: "What are the business frameworks?", a: "Pre-built templates for professional analysis: Porter's Five Forces, SWOT, PESTLE for strategy. MEDDPICC, BANT, SPIN for sales. Decision matrices, priority grids, and more. Guided inputs, AI enhancement, visual outputs." },
              { q: "Why not just use ChatGPT for this?", a: "ChatGPT can run a pre-mortem prompt. But it forgets everything after each session. It won't ping you in 90 days to check outcomes. It can't tell you that 73% of your career decisions succeed while only 48% of your business decisions do. Snag builds a personal decision intelligence layer that compounds over time." },
              { q: "How does outcome tracking work?", a: "When you log a decision, you set an outcome check date (30/60/90 days). Snag prompts you to record what happened. Over time, you see patterns — which types of decisions you get right, which you don't, and why." },
              { q: "What visual frameworks can I export?", a: "Risk matrices, decision trees, fishbone diagrams, Five Whys ladders, Porter's pentagon, MEDDPICC scorecards, and more. Export as PNG or PDF. Include in presentations. Share with your team." },
              { q: "How does the free trial work?", a: "2 days of full Pro access, capped at 5 Deep Snags and 3 Post-Mortems. After the trial, you fall back to the Free tier. Your data is preserved — upgrade anytime to unlock it." },
              { q: "Can I use Snag with my team?", a: "Yes. Team plan ($59/month) includes shared workspace, collaborative frameworks, team retrospectives, and analytics. Business plan ($199/month) adds branded exports, audit logs, and SSO." },
              { q: "Is my data private?", a: "Yes. Your journals, decisions, and analyses are private to you (or your team, if shared). We don't sell data. We don't train AI on your content. Delete anytime." }
            ].map((faq, i) => (
              <motion.div 
                key={i} 
                className="border-b border-border"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
              >
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between py-5 text-left">
                  <span className="text-base font-semibold pr-4">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    {openFaq === i ? <Minus className="w-5 h-5 text-primary flex-shrink-0" /> : <Plus className="w-5 h-5 text-primary flex-shrink-0" />}
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="text-muted-foreground pb-5 pr-10">{faq.a}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="gradient-premium py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-xl text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Your best thinking starts today.
          </motion.h2>
          <motion.p 
            className="text-white/80 text-lg mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Free forever. Upgrade when you're ready.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handleGetStarted} className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-base font-semibold">
                Start Free — No card required
              </Button>
            </motion.div>
            <motion.button 
              onClick={() => scrollToSection("pricing")} 
              className="text-white border border-white/50 px-6 py-3 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
              whileHover={{ scale: 1.03 }}
            >
              See pricing →
            </motion.button>
          </motion.div>

          <motion.p 
            className="text-white/60 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            Join 10,000+ people thinking more clearly
          </motion.p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(0,0%,10%)] py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <span className="text-xl font-bold text-white">Snag</span>
              <p className="text-[hsl(0,0%,40%)] text-sm mt-2">Think better. Decide better.</p>
            </div>
            <div>
              <p className="text-[hsl(0,0%,60%)] text-xs uppercase font-medium mb-3">Product</p>
              <ul className="space-y-2">
                {["Features", "Pricing", "Changelog", "Roadmap"].map((link, i) => (
                  <li key={i}><a href="#" className="text-[hsl(0,0%,40%)] hover:text-white text-sm transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[hsl(0,0%,60%)] text-xs uppercase font-medium mb-3">Resources</p>
              <ul className="space-y-2">
                {["Help Center", "Blog", "API Docs", "Status"].map((link, i) => (
                  <li key={i}><a href="#" className="text-[hsl(0,0%,40%)] hover:text-white text-sm transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[hsl(0,0%,60%)] text-xs uppercase font-medium mb-3">Company</p>
              <ul className="space-y-2">
                <li><a href="#" className="text-[hsl(0,0%,40%)] hover:text-white text-sm transition-colors">About</a></li>
                <li><a href="#" className="text-[hsl(0,0%,40%)] hover:text-white text-sm transition-colors">Contact</a></li>
                <li><a href="/privacy" className="text-[hsl(0,0%,40%)] hover:text-white text-sm transition-colors">Privacy</a></li>
                <li><a href="/terms" className="text-[hsl(0,0%,40%)] hover:text-white text-sm transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <p className="text-[hsl(0,0%,40%)] text-sm text-center border-t border-[hsl(0,0%,20%)] pt-8">
            © 2026 Roarr Consulting Group. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
