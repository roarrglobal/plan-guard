export interface HelpArticle {
  id: string;
  title: string;
  content: string; // markdown-like content rendered as JSX
}

export interface HelpSection {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string; // lucide icon name
  articles: HelpArticle[];
}

export const helpSections: HelpSection[] = [
  {
    id: "getting-started",
    number: 1,
    title: "Getting Started",
    description: "New to Snag? Start here",
    icon: "Rocket",
    articles: [
      {
        id: "what-is-snag",
        title: "What is Snag?",
        content: `Snag is a decision intelligence platform that helps you make better decisions by revealing what could go wrong before it goes wrong.

Think of it as having a McKinsey consultant in your pocket — one that remembers every decision you've made and learns from the outcomes.

### The SNAG Framework™

| Letter | Meaning | What It Does |
|--------|---------|--------------|
| **S** | Surface the Hidden | Reveals blind spots and assumptions you didn't know you had |
| **N** | Name the Failures | Maps exactly how this decision could fail |
| **A** | Alert Early | Identifies warning signals to watch in 30/60/90 days |
| **G** | Gate the Exit | Defines clear criteria for when to abandon or pivot |

Plus **The Unasked Question** — the uncomfortable truth you should be asking — and a clear **Bottom Line** verdict with confidence level.`,
      },
      {
        id: "creating-account",
        title: "Creating Your Account",
        content: `### Individual Account

1. Go to snagme.app/signup
2. Click **"For Myself"**
3. Enter your name, email, and password
4. Click **Create Account**
5. Check your email for a verification message

You'll start with a **15-day free trial** with full access to all Pro features.

### Team Account

1. Go to snagme.app/signup
2. Click **"For My Team"**
3. Enter your name, work email, and password
4. Enter your team or company name
5. Click **Create Team Account**

You'll be the **Team Owner** with full admin access. Your team gets a **15-day free trial** with all Business features.

### Joining an Existing Team

If someone invited you:
1. Check your email for the invitation
2. Click **Accept Invitation**
3. Create your account (or log in if you already have one)
4. You'll be added to the team automatically`,
      },
      {
        id: "first-decision",
        title: "Your First Decision",
        content: `### Quick Start (2 minutes)

1. **From your dashboard**, click **New Decision** or **Deep Snag**
2. **Describe your decision** — include a clear title and context with specifics
3. **Set the parameters** — category (Career, Finance, Product, etc.) and stakes (Low to Critical)
4. **Click Analyze** and wait 30-60 seconds
5. **Review your analysis:**
   - Summary overview
   - Blind spots (what you're not seeing)
   - Failure modes (how it could go wrong)
   - Warning signals (what to watch for)
   - Kill criteria (when to walk away)
   - The Unasked Question
   - Bottom Line verdict
6. **Set an outcome check date** — this is how you'll learn and improve over time`,
      },
      {
        id: "dashboard",
        title: "Understanding Your Dashboard",
        content: `### Individual Dashboard

| Section | What It Shows |
|---------|---------------|
| **Quick Snag** | Fast decision check (30 seconds) |
| **Recent Decisions** | Your latest decisions and their status |
| **Pending Outcomes** | Decisions ready for outcome check |
| **Journal** | Your decision journal entries |
| **Patterns** | Your decision-making insights (after 5+ outcomes) |

### Team Dashboard

| Section | What It Shows |
|---------|---------------|
| **Quick Snag** | Fast team decision check |
| **Team Decisions** | Recent decisions across the team |
| **Pending Outcomes** | Team decisions ready for review |
| **Usage** | Deep Snags used this month |
| **Activity** | Recent team activity |`,
      },
      {
        id: "navigation",
        title: "Navigation Guide",
        content: `### Individual Sidebar

| Menu Item | What It Does |
|-----------|--------------|
| Dashboard | Your home base |
| New Decision | Start a Deep Snag analysis |
| My Decisions | All your past decisions |
| Journal | Daily decision journal |
| Habits | Decision-making habits tracker |
| Settings | Account preferences |

### Team Sidebar

| Menu Item | What It Does |
|-----------|--------------|
| Dashboard | Team home base |
| Quick Snag | Fast 30-second analysis |
| Decisions | All team decisions |
| New Decision | Start a new team decision |
| Templates | Department-specific templates |
| Analytics | Team performance insights |
| Members | Manage team members |
| Admin | Team administration (Owner/Admin only) |
| Audit Log | Activity history (Owner/Admin only) |
| Settings | Team preferences |`,
      },
    ],
  },
  {
    id: "deep-snag",
    number: 2,
    title: "Deep Snag Analysis",
    description: "Full pre-mortem analysis",
    icon: "Search",
    articles: [
      {
        id: "what-is-deep-snag",
        title: "What is Deep Snag?",
        content: `Deep Snag is our comprehensive pre-mortem analysis. It takes 2-5 minutes and gives you:

- **Full blind spot analysis** — What you're not seeing
- **Failure mode mapping** — How this could go wrong
- **Warning signals** — What to watch for at 30/60/90 days
- **Kill criteria** — When to abandon this path
- **The Unasked Question** — The uncomfortable truth
- **Clear verdict** — Proceed, caution, investigate, or reconsider

### When to Use Deep Snag

✅ **Use for:** Major career decisions, significant purchases ($10K+), strategic business decisions, hiring, product launches, vendor selections, partnerships, investments.

❌ **Don't use for:** Daily operational decisions (use Quick Snag), decisions already made, or hypothetical scenarios with no real stakes.`,
      },
      {
        id: "effective-descriptions",
        title: "Writing Effective Descriptions",
        content: `The quality of your analysis depends on the quality of your input.

### Good Example

**Title:** Should we pursue the Acme Corp enterprise deal?

**Description:** Acme Corp is a Fortune 500 company interested in our enterprise plan. Deal size: $500K ARR. Timeline: close by end of Q2. Competition: also evaluating Competitor X. Our champion: VP of Operations, but haven't met CTO. Concerns: custom integrations we don't have.

### Why It Works
- Specific dollar amount
- Clear timeline
- Known competition
- Identified stakeholders
- Stated concerns

### Tips for Better Descriptions

1. **Include numbers** — Budget, timeline, headcount, revenue impact
2. **Name stakeholders** — Who's involved? Who decides?
3. **State your concerns** — What's already worrying you?
4. **Add context** — What led to this decision?
5. **Be honest** — Include the uncomfortable parts`,
      },
      {
        id: "understanding-analysis",
        title: "Understanding Your Analysis",
        content: `### Summary
A 2-3 sentence overview of the key risks and opportunities. Read this first to orient yourself.

### Blind Spots
Things you're not seeing or assumptions you're making without realizing it.

- **Individual Analysis:** 3 blind spots
- **Team Analysis:** 5 blind spots with categories (Strategic, Operational, Financial, Political)

### Failure Modes
Specific ways this decision could go wrong.

- **Individual Analysis:** 3 failure modes
- **Team Analysis:** 5 failure modes with likelihood, detectability, and mitigation suggestions

### Warning Signals
Early indicators that things are going wrong, organized by timeframe:
- **30 days** — Immediate signals
- **60 days** — Mid-term indicators
- **90 days** — Longer-term patterns

### Kill Criteria
Clear, objective criteria for when to abandon this path. If X happens, stop.

### The Unasked Question
The one question you should be asking but probably aren't. Often the most valuable part.

### Verdict

| Verdict | Meaning | Action |
|---------|---------|--------|
| 🟢 **Proceed** | Risks are manageable | Move forward |
| 🟡 **Caution** | Notable risks exist | Proceed but watch closely |
| 🔵 **Investigate** | Too many unknowns | Gather more info first |
| 🔴 **Reconsider** | Risks outweigh benefits | Don't proceed as planned |`,
      },
      {
        id: "after-analysis",
        title: "After Your Analysis",
        content: `### Set an Outcome Check Date
This is crucial for learning:
1. Click **Track Outcome**
2. Select when you'll know if this worked (30, 60, 90 days, or custom)
3. You'll receive an email reminder when it's time

### Share with Stakeholders (Teams)
- Export as PDF for presentations
- Set visibility to share with team
- Add to decision thread for collaboration

### Take Action
The analysis is only valuable if you act on it:
- Address the highest-risk blind spots
- Put mitigation plans in place for likely failure modes
- Set up monitoring for warning signals`,
      },
    ],
  },
  {
    id: "quick-snag",
    number: 3,
    title: "Quick Snag",
    description: "30-second decision checks",
    icon: "Zap",
    articles: [
      {
        id: "what-is-quick-snag",
        title: "What is Quick Snag?",
        content: `Quick Snag is a 30-second decision check for faster, lower-stakes decisions. You get:

- **Top 3 risks**
- **Key recommendation**
- **3 immediate actions**

### When to Use

✅ **Perfect for:** Daily operational decisions, quick sanity checks, time-sensitive choices, "Should I send this email?" moments.

❌ **Not ideal for:** Major strategic decisions (use Deep Snag), decisions requiring stakeholder analysis, complex multi-factor decisions.`,
      },
      {
        id: "using-quick-snag",
        title: "How to Use Quick Snag",
        content: `### From Dashboard
1. Find the Quick Snag input box
2. Type your decision in plain language
3. Press Enter or click Analyze
4. Get your result in under 10 seconds

### Keyboard Shortcut
- Press **⌘K** (Mac) or **Ctrl+K** (Windows)
- Type your decision
- Press Enter

### Examples
- "Should I reply-all to this email thread?"
- "Should we extend the deadline by one week?"
- "Should I take this meeting or decline?"
- "Should we push the feature to production today?"

### Expanding to Deep Snag
If Quick Snag reveals something concerning:
1. Click **Expand to Deep Snag**
2. Add more context if needed
3. Run the full analysis`,
      },
    ],
  },
  {
    id: "outcome-tracking",
    number: 4,
    title: "Outcome Tracking (TRACE)",
    description: "Track results and learn from decisions",
    icon: "Target",
    articles: [
      {
        id: "what-is-trace",
        title: "What is TRACE?",
        content: `TRACE is our outcome tracking methodology:

| Letter | Meaning |
|--------|---------|
| **T** | Truth — What actually happened? |
| **R** | Root Cause — Why did it happen? |
| **A** | Assumptions — Which were right/wrong? |
| **C** | Corrections — What would you do differently? |
| **E** | Evidence — What did you learn? |

### Why Track Outcomes?

Most people make decisions and never look back. They repeat the same mistakes because they never learn what actually works.

- After **5 outcomes**: See your accuracy rate
- After **10 outcomes**: Discover your blind spot patterns
- After **20 outcomes**: Get personalized recommendations`,
      },
      {
        id: "setting-outcome-dates",
        title: "Setting Outcome Dates",
        content: `After completing an analysis:

1. Find the **Track Outcome** section
2. Choose when you'll know the result:
   - 30 days
   - 60 days
   - 90 days
   - Custom date
3. Save

You'll receive an email reminder when it's time to check in.`,
      },
      {
        id: "logging-outcomes",
        title: "Logging Outcomes",
        content: `### From Email (One-Tap)
1. Open the reminder email
2. Click one button:
   - ✅ **Right Call** — Decision worked out
   - ➖ **Mixed** — Partially worked
   - ❌ **Wrong Call** — Didn't work out
3. Done! (Or click through to add more detail)

### From the App
1. Open the decision
2. Click **Log Outcome**
3. Select result: Right Call / Mixed / Wrong Call
4. Rate satisfaction (1-5)
5. Add lesson learned (optional but valuable)
6. Submit`,
      },
      {
        id: "reviewing-patterns",
        title: "Reviewing Your Patterns",
        content: `After logging 5+ outcomes, go to **Dashboard → Patterns** (Individual) or **Analytics → Patterns** (Teams).

You'll see:
- Overall accuracy rate
- Accuracy by category
- Most common blind spots you miss
- Decision types where you excel
- Areas for improvement`,
      },
    ],
  },
  {
    id: "templates",
    number: 5,
    title: "Templates (Teams)",
    description: "Department-specific frameworks",
    icon: "LayoutTemplate",
    articles: [
      {
        id: "what-are-templates",
        title: "What are Templates?",
        content: `Templates are pre-configured decision frameworks for specific business situations. They include relevant context fields, domain-specific blind spots, industry-standard criteria, and customized output structure.

### Using Templates
1. Go to **New Decision**
2. Click **Select Template** dropdown
3. Choose the relevant template
4. Fill in the template-specific fields
5. Run analysis — it will be customized for that decision type`,
      },
      {
        id: "available-templates",
        title: "Available Templates",
        content: `### Sales: Deal Pursuit
Qualify or pursue a sales opportunity. Catches champion dependency, budget assumptions, competitive blind spots, timeline reality.

### Finance: Budget Approval
Approve budget requests or major expenditures. Catches hidden costs, optimistic projections, opportunity cost, vendor lock-in, sunk cost bias.

### Product: Feature Prioritization
Decide whether to build a feature. Catches adoption assumptions, engineering complexity underestimation, competitive timing, maintenance burden.

### HR: Hiring Decision
Decide whether to extend an offer. Catches halo effect, reference check gaps, culture fit assumptions, urgency bias.

### Marketing: Campaign Launch
Plan a major campaign or launch. Catches attribution assumptions, audience targeting gaps, creative fatigue, measurement limitations.

### Operations: Process Automation
Decide to automate a process. Catches exception handling gaps, training requirements, integration complexity, true cost calculation.

### Strategy: M&A Evaluation
Evaluate an acquisition or merger. Catches synergy fantasy, culture collision, key person dependency, hidden liabilities.`,
      },
      {
        id: "custom-templates",
        title: "Custom Templates (Business Tier)",
        content: `Create your own templates:

1. Go to **Templates**
2. Click **Create Template**
3. Configure:
   - Template name and description
   - Custom input fields
   - Department category
   - Blind spots library
   - Failure modes library
4. Save

Your custom templates will appear in the template dropdown for all team members.`,
      },
    ],
  },
  {
    id: "team-management",
    number: 6,
    title: "Team Management",
    description: "Invites, roles, and collaboration",
    icon: "Users",
    articles: [
      {
        id: "team-roles",
        title: "Team Roles",
        content: `| Role | Can Do |
|------|--------|
| **Owner** | Everything. Billing, delete team, transfer ownership |
| **Admin** | Invite/remove members, change roles (except Owner), team settings, view all decisions |
| **Member** | Create decisions, run analyses, see team-visible decisions |
| **Viewer** | Read-only access to team-visible decisions |`,
      },
      {
        id: "inviting-members",
        title: "Inviting Team Members",
        content: `1. Go to **Members** (or **Admin**)
2. Click **Invite Members**
3. Enter email address(es) — separate multiple with commas
4. Select role
5. Add personal message (optional)
6. Click **Send Invite**

Invitees receive an email with a link to join. Invitations expire after 7 days.`,
      },
      {
        id: "managing-members",
        title: "Managing Members",
        content: `### Change Role
1. Go to **Members**
2. Find the member
3. Click their role dropdown
4. Select new role and confirm

### Remove Member
1. Go to **Members**
2. Find the member
3. Click **Remove** and confirm

Note: You cannot remove yourself or (if not Owner) the Owner.

### Decision Visibility

| Visibility | Who Can See |
|------------|-------------|
| **Private** | Only you |
| **Team** | All team members |
| **Leadership** | Admins and Owners only |`,
      },
    ],
  },
  {
    id: "billing",
    number: 7,
    title: "Account & Billing",
    description: "Pricing, upgrades, and invoices",
    icon: "CreditCard",
    articles: [
      {
        id: "plans",
        title: "Plans Overview",
        content: `### Individual Plans

| Plan | Price | Includes |
|------|-------|----------|
| **Free** | $0/month | 1 Deep Snag/month, 3 Quick Snags/month, basic features |
| **Pro** | $12/month | 50 Deep Snags/month, unlimited Quick Snags, full features |

### Team Plans

| Plan | Price | Includes |
|------|-------|----------|
| **Team** | $59/month | 5 members, 200 Deep Snags/month |
| **Business** | $199/month | 20 members, 1,000 Deep Snags/month, audit log, custom templates |
| **Enterprise** | Custom | Unlimited members, SSO, dedicated support |`,
      },
      {
        id: "free-trial",
        title: "Free Trial",
        content: `All new accounts start with a **15-day free trial**:
- Full access to all features
- No credit card required
- No automatic charge

After 15 days, choose a paid plan or continue with the free tier (limited features).`,
      },
      {
        id: "upgrading",
        title: "Upgrading & Changing Plans",
        content: `### Upgrading
1. Go to **Settings → Billing**
2. Click **Upgrade**
3. Select plan and enter payment details
4. Changes take effect immediately (pro-rated)

### Downgrading
Takes effect at end of billing period. You keep current features until then.

### Canceling
1. Go to **Settings → Billing**
2. Click **Cancel Subscription**
3. Access continues until end of billing period
4. Your data is preserved — resubscribe anytime`,
      },
      {
        id: "refunds",
        title: "Refunds & Payment",
        content: `**30-day money-back guarantee** on first payment.

To request a refund, email billing@snagme.app with your account email. Processed within 5-7 business days.

### Accepted Payment Methods
- Credit cards (Visa, Mastercard, Amex)
- Debit cards
- For Enterprise: Invoice/PO

### Invoices
Go to **Settings → Billing → Billing History** to download invoices. They're also emailed after each payment.`,
      },
    ],
  },
  {
    id: "journal",
    number: 8,
    title: "Journal",
    description: "Daily decision journaling",
    icon: "BookOpen",
    articles: [
      {
        id: "decision-journal",
        title: "Decision Journal",
        content: `The Decision Journal helps you build the daily habit of structured thinking. It's available on Individual plans.

### Journal Types

| Type | Best For |
|------|----------|
| **Free Write** | Open reflection — just write |
| **Gratitude** | What are you grateful for today? |
| **Manifestation** | Goal setting and visualization |
| **Morning Pages** | Stream of consciousness to clear your mind |
| **Evening Review** | What went well? What would you change? |
| **Reflection** | Guided prompts on a specific topic |

### Creating Entries
1. Go to **Journal**
2. Click **New Entry**
3. Select journal type
4. Write your entry
5. Save (entries are private by default)

### Tips
- Set a daily reminder
- Start with just 2 minutes
- Use Morning Pages to start your day
- Use Evening Review to close your day
- Track your streak`,
      },
    ],
  },
  {
    id: "habits",
    number: 9,
    title: "Habits",
    description: "Build consistent decision practices",
    icon: "Flame",
    articles: [
      {
        id: "decision-habits",
        title: "Decision Habits",
        content: `Habits help you build consistent decision-making practices.

### Pre-built Habits
- Morning reflection
- Decision journaling
- Gratitude practice
- Weekly review
- Outcome check-ins

### Tracking
1. Go to **Habits**
2. Check off completed habits each day
3. Watch your streaks grow
4. Review your progress`,
      },
    ],
  },
  {
    id: "settings",
    number: 10,
    title: "Settings & Preferences",
    description: "Profile, notifications, and data",
    icon: "Settings",
    articles: [
      {
        id: "profile-settings",
        title: "Profile Settings",
        content: `Update your name, change email, update password, and manage your profile photo from **Settings → Profile**.`,
      },
      {
        id: "notifications",
        title: "Notification Preferences",
        content: `Toggle on/off from **Settings → Notifications**:
- Outcome reminders
- Analysis complete alerts
- Weekly digest (Teams)
- Trial reminders
- Product updates

All emails come from hello@snagme.app. To unsubscribe, click "Unsubscribe" in any email or toggle off in Settings.`,
      },
      {
        id: "data-export",
        title: "Data Export & Deletion",
        content: `### Export Your Data
Go to **Settings → Data → Export All Data**. You'll receive a download link via email.

### Deleting Your Account
1. Go to **Settings → Account**
2. Click **Delete Account**
3. Confirm with password
4. All data permanently deleted within 30 days

Note: If you're a Team Owner, transfer ownership first.`,
      },
    ],
  },
  {
    id: "faq",
    number: 11,
    title: "FAQ",
    description: "Common questions answered",
    icon: "HelpCircle",
    articles: [
      {
        id: "faq-general",
        title: "General Questions",
        content: `**What is a pre-mortem?**
A pre-mortem imagines a decision has failed and works backward to identify why. Research shows this improves prediction accuracy by 30%. Snag automates this process.

**How is this different from ChatGPT?**
ChatGPT forgets every conversation. Snag remembers every decision you make, tracks outcomes, and learns your patterns over time. After 10 decisions, Snag knows your blind spots better than you do.

**Is my data secure?**
Yes. All data is encrypted at rest and in transit. We never sell your data. Your decisions never train our AI models.

**Do you have a mobile app?**
Snag works great on mobile browsers. A native app is on our roadmap.`,
      },
      {
        id: "faq-analysis",
        title: "Analysis Questions",
        content: `**How long does a Deep Snag take?**
2-5 minutes from input to complete analysis.

**How long does a Quick Snag take?**
Under 10 seconds.

**What if the analysis is wrong?**
The analysis is a thinking aid, not a crystal ball. It surfaces risks you might miss, but you make the final decision. Track outcomes to calibrate accuracy.

**Can I edit an analysis?**
The AI-generated analysis is read-only, but you can add notes and annotations.`,
      },
      {
        id: "faq-billing",
        title: "Billing Questions",
        content: `**Is there a free plan?**
Yes. Individual Free includes 1 Deep Snag and 3 Quick Snags per month.

**Do you offer discounts?**
Nonprofits: 50% off. Startups (under $1M raised): 25% off first year. Email billing@snagme.app.

**What happens if I exceed my limit?**
We'll notify you before you hit the limit. You can upgrade or wait until next month. We never cut you off mid-analysis.

**Can I get a refund?**
Yes. 30-day money-back guarantee on first payment, no questions asked.`,
      },
      {
        id: "faq-teams",
        title: "Teams & Privacy Questions",
        content: `**Can I be on multiple teams?**
Yes. You can be a member of multiple teams and switch between them.

**Can I have both Personal and Team accounts?**
Yes. Many users have a personal Pro account and are also part of a Team workspace. Decisions stay separate unless you share them.

**Who can see my decisions?**
Only you — unless you set visibility to "Team" or "Leadership."

**Is my data used to train AI?**
No. Your decisions never train our AI models.

**Can I delete my data?**
Yes. Delete your account in Settings, and all data is permanently removed within 30 days.

**Do you comply with GDPR?**
Yes. See our GDPR page for details.`,
      },
    ],
  },
  {
    id: "troubleshooting",
    number: 12,
    title: "Troubleshooting",
    description: "Fix common issues",
    icon: "Wrench",
    articles: [
      {
        id: "common-issues",
        title: "Common Issues",
        content: `### "Analysis is taking too long"
- Normal time is 30-60 seconds for Deep Snag
- If over 2 minutes, refresh the page and try again
- Check your internet connection

### "I'm not receiving emails"
- Check spam/junk folder
- Add hello@snagme.app to contacts
- Check Settings → Notifications are enabled
- Try a different email address

### "I can't log in"
- Try password reset
- Check you're using the correct email
- Clear browser cache and cookies
- Try incognito/private window

### "My team invite isn't working"
- Check the invitation hasn't expired (7 days)
- Ask for a new invitation
- Check spam folder

### "I can't see team decisions"
- Check your role has access
- Check decision visibility setting
- Ask the creator to share`,
      },
      {
        id: "getting-help",
        title: "Getting Help",
        content: `**Email:** support@snagme.app

**Response time:** Within 24 hours

**When contacting support, include:**
- Your account email
- Screenshot if applicable
- Steps to reproduce the issue`,
      },
    ],
  },
];

// Flatten all articles for search
export function searchHelp(query: string): { section: HelpSection; article: HelpArticle }[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: { section: HelpSection; article: HelpArticle }[] = [];
  
  for (const section of helpSections) {
    for (const article of section.articles) {
      if (
        article.title.toLowerCase().includes(q) ||
        article.content.toLowerCase().includes(q)
      ) {
        results.push({ section, article });
      }
    }
  }
  return results;
}
