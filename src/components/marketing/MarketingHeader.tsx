import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown, Users, User, Building2, DollarSign, Package, Heart, Megaphone, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import snagLogo from "@/assets/snag-logo-full.png";
import { cn } from "@/lib/utils";

const solutionsItems = [
  { label: "For Professionals", href: "/solutions/personal", icon: User, dividerAfter: true },
  { label: "Sales Teams", href: "/solutions/sales", icon: DollarSign },
  { label: "Finance Teams", href: "/solutions/finance", icon: Building2 },
  { label: "Product Teams", href: "/solutions/product", icon: Package },
  { label: "HR Teams", href: "/solutions/hr", icon: Heart },
  { label: "Marketing Teams", href: "/solutions/marketing", icon: Megaphone },
  { label: "Operations Teams", href: "/solutions/operations", icon: Settings },
];

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [getStartedOpen, setGetStartedOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/90 backdrop-blur-lg shadow-sm border-b border-border" : "bg-white/70 backdrop-blur-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={snagLogo} alt="Snag - Spot the flaw first" className="h-12 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/product" className="text-sm font-medium text-foreground hover:text-cobalt transition-colors">
              Product
            </Link>

            {/* Solutions Dropdown */}
            <div className="relative" onMouseEnter={() => setSolutionsOpen(true)} onMouseLeave={() => setSolutionsOpen(false)}>
              <button className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-cobalt transition-colors">
                Solutions <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {solutionsOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                  <div className="bg-white rounded-xl shadow-lg border border-border py-2 min-w-[220px]">
                    {solutionsItems.map((item) => (
                      <div key={item.href}>
                        <Link
                          to={item.href}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1A1A1A] hover:bg-muted transition-colors"
                          onClick={() => setSolutionsOpen(false)}
                        >
                          <item.icon className="w-4 h-4 text-muted-foreground" />
                          {item.label}
                        </Link>
                        {item.dividerAfter && <div className="border-t border-border my-1 mx-4" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link to="/pricing" className="text-sm font-medium text-foreground hover:text-cobalt transition-colors">
              Pricing
            </Link>
            <Link to="/about" className="text-sm font-medium text-foreground hover:text-cobalt transition-colors">
              About
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-foreground hover:text-cobalt transition-colors">
              Log in
            </Link>

            {/* Get Started Dropdown */}
            <div className="relative" onMouseEnter={() => setGetStartedOpen(true)} onMouseLeave={() => setGetStartedOpen(false)}>
              <Button className="bg-cobalt hover:bg-cobalt-hover text-white">
                Get Started <ChevronDown className="w-3.5 h-3.5 ml-1" />
              </Button>
              {getStartedOpen && (
                <div className="absolute top-full right-0 pt-2">
                  <div className="bg-white rounded-xl shadow-lg border border-border py-2 min-w-[200px]">
                    <Link
                      to="/signup?type=individual"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1A1A1A] hover:bg-muted transition-colors"
                      onClick={() => setGetStartedOpen(false)}
                    >
                      <User className="w-4 h-4 text-crimson" />
                      For Personal Use
                    </Link>
                    <Link
                      to="/signup?type=team"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1A1A1A] hover:bg-muted transition-colors"
                      onClick={() => setGetStartedOpen(false)}
                    >
                      <Users className="w-4 h-4 text-cobalt" />
                      For Teams
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburger */}
          <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Panel */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-border shadow-lg">
          <div className="px-4 py-6 space-y-4">
            <Link to="/product" className="block text-base font-medium text-[#1A1A1A] py-2" onClick={() => setMobileOpen(false)}>
              Product
            </Link>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Solutions</p>
              {solutionsItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center gap-3 py-2 text-sm text-[#1A1A1A]"
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                  {item.label}
                </Link>
              ))}
            </div>
            <Link to="/pricing" className="block text-base font-medium text-[#1A1A1A] py-2" onClick={() => setMobileOpen(false)}>
              Pricing
            </Link>
            <Link to="/about" className="block text-base font-medium text-[#1A1A1A] py-2" onClick={() => setMobileOpen(false)}>
              About
            </Link>
            <div className="border-t border-border pt-4 space-y-3">
              <Link to="/login" className="block text-base font-medium text-[#1A1A1A] py-2" onClick={() => setMobileOpen(false)}>
                Log in
              </Link>
              <Link to="/signup?type=individual" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-crimson hover:bg-crimson-hover text-white mb-2">
                  Start Free — Personal
                </Button>
              </Link>
              <Link to="/signup?type=team" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-cobalt hover:bg-cobalt-hover text-white">
                  Start Free — Teams
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
