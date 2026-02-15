import { Link } from "react-router-dom";
import { Linkedin, Twitter } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "/product" },
    { label: "Pricing", href: "/pricing" },
    { label: "How It Works", href: "/product#how-it-works" },
  ],
  "For You": [
    { label: "Personal Use", href: "/solutions/personal" },
    { label: "Career Decisions", href: "/solutions/personal" },
    { label: "Life Choices", href: "/solutions/personal" },
  ],
  "For Teams": [
    { label: "Sales Teams", href: "/solutions/sales" },
    { label: "Finance Teams", href: "/solutions/finance" },
    { label: "Product Teams", href: "/solutions/product" },
    { label: "HR Teams", href: "/solutions/hr" },
    { label: "Marketing Teams", href: "/solutions/marketing" },
    { label: "Operations", href: "/solutions/operations" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/about" },
    { label: "Careers", href: "/about" },
    { label: "Contact", href: "/about" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/terms" },
    { label: "GDPR", href: "/privacy" },
    { label: "Security", href: "/privacy" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50">
            © 2026 Snag. A Roarr Consulting Group venture.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
