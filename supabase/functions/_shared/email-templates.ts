/**
 * Branded email templates for Snag
 * All templates use consistent styling with the Snag brand
 */

const APP_URL = "https://snagme.app";

// ─── Base template ───────────────────────────────────────────────

export function baseTemplate(content: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Snag</title>
  ${preheader ? `<span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>` : ""}
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="padding:24px 32px;border-bottom:1px solid #eee;">
          <span style="font-size:20px;font-weight:700;color:#BE3455;letter-spacing:0.5px;">SNAG</span>
        </td></tr>
        <!-- Content -->
        <tr><td style="padding:32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid #eee;text-align:center;">
          <p style="margin:0 0 8px;font-size:12px;color:#999;">Spot the flaw first.</p>
          <p style="margin:0 0 8px;font-size:12px;color:#999;">&copy; 2026 Snag. A Roarr Consulting Group venture.</p>
          <p style="margin:0;font-size:12px;">
            <a href="${APP_URL}/privacy" style="color:#999;text-decoration:none;">Privacy</a>
            <span style="color:#ccc;"> · </span>
            <a href="${APP_URL}/terms" style="color:#999;text-decoration:none;">Terms</a>
            <span style="color:#ccc;"> · </span>
            <a href="${APP_URL}/settings/notifications" style="color:#999;text-decoration:none;">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Component helpers ───────────────────────────────────────────

export function button(
  text: string,
  url: string,
  color: "cobalt" | "crimson" = "cobalt"
): string {
  const bg = color === "cobalt" ? "#0047AB" : "#BE3455";
  return `<div style="text-align:center;margin:24px 0;">
    <a href="${url}" style="display:inline-block;padding:14px 32px;background:${bg};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">${text}</a>
  </div>`;
}

export function heading(text: string): string {
  return `<h1 style="font-size:22px;color:#1A1A1A;margin:0 0 16px;font-weight:700;">${text}</h1>`;
}

export function paragraph(text: string): string {
  return `<p style="font-size:15px;color:#666;line-height:1.6;margin:0 0 12px;">${text}</p>`;
}

export function divider(): string {
  return `<hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>`;
}

export function metaBox(items: string): string {
  return `<div style="background:#f9f9f9;padding:16px;border-radius:8px;margin:20px 0;">${items}</div>`;
}

export function metaItem(label: string, value: string): string {
  return `<div style="font-size:13px;color:#666;margin-bottom:6px;"><strong style="color:#1A1A1A;">${label}:</strong> ${value}</div>`;
}

export function smallText(text: string): string {
  return `<p style="font-size:13px;color:#999;margin:0 0 8px;">${text}</p>`;
}

// ─── Specific email templates ────────────────────────────────────

export function welcomeEmail(name: string, isTeam: boolean): { subject: string; html: string } {
  const dashboardUrl = isTeam ? `${APP_URL}/team/dashboard` : `${APP_URL}/dashboard`;
  const subject = "Welcome to Snag!";
  const html = baseTemplate(`
    ${heading(`Welcome to Snag, ${name}!`)}
    ${paragraph("You're all set to start making better decisions.")}
    ${paragraph("Your 15-day trial includes full access to all features. No credit card required.")}
    ${button("Go to Dashboard", dashboardUrl)}
    ${divider()}
    <p style="font-size:14px;font-weight:600;color:#1A1A1A;margin:0 0 8px;">Quick Start:</p>
    <ol style="padding-left:20px;color:#666;font-size:14px;line-height:1.8;margin:0 0 16px;">
      <li>Run your first Deep Snag analysis</li>
      <li>${isTeam ? "Invite your team members" : "Set up your decision journal"}</li>
      <li>Track your first outcome</li>
    </ol>
    ${paragraph("Questions? Just reply to this email.")}
  `, "Welcome to Snag – Start making better decisions");
  return { subject, html };
}

export function teamInviteEmail(
  teamName: string,
  inviterName: string,
  role: string,
  inviteUrl: string
): { subject: string; html: string } {
  const subject = `You're invited to join ${teamName} on Snag`;
  const html = baseTemplate(`
    ${heading(`You're invited to join ${teamName}`)}
    ${paragraph(`<strong>${inviterName}</strong> has invited you to join their team on Snag as a <strong>${role}</strong>.`)}
    ${paragraph("Snag is a decision intelligence platform that helps teams make better decisions with AI-powered pre-mortem analysis.")}
    ${button("Accept Invitation", inviteUrl)}
    ${paragraph("This invitation expires in 7 days.")}
    ${divider()}
    ${smallText("If you weren't expecting this invitation, you can ignore this email.")}
  `, `${inviterName} invited you to join ${teamName} on Snag`);
  return { subject, html };
}

export function passwordResetEmail(resetUrl: string): { subject: string; html: string } {
  const subject = "Reset your Snag password";
  const html = baseTemplate(`
    ${heading("Reset your password")}
    ${paragraph("We received a request to reset your password. Click the button below to create a new password.")}
    ${button("Reset Password", resetUrl)}
    ${paragraph("This link expires in 1 hour.")}
    ${divider()}
    ${smallText("If you didn't request this, you can safely ignore this email. Your password won't change.")}
  `, "Reset your Snag password");
  return { subject, html };
}

export function analysisCompleteEmail(
  decisionTitle: string,
  verdict: string,
  decisionUrl: string
): { subject: string; html: string } {
  const verdictColors: Record<string, string> = {
    "Proceed with Confidence": "#10B981",
    "Proceed with Caution": "#F59E0B",
    "Investigate Further": "#3B82F6",
    "Reconsider": "#EF4444",
  };
  const vColor = verdictColors[verdict] || "#6B7280";

  const subject = `Analysis ready: "${decisionTitle.slice(0, 50)}"`;
  const html = baseTemplate(`
    ${heading("Your analysis is ready")}
    ${metaBox(`
      ${metaItem("Decision", decisionTitle)}
      <div style="font-size:13px;color:#666;margin-bottom:6px;">
        <strong style="color:#1A1A1A;">Verdict:</strong>
        <span style="display:inline-block;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:600;background:${vColor}20;color:${vColor};">${verdict}</span>
      </div>
    `)}
    ${button("View Full Analysis", decisionUrl)}
  `, `Analysis ready: ${decisionTitle}`);
  return { subject, html };
}

export function outcomeReminderEmail(
  decisionTitle: string,
  decisionDate: string,
  verdict: string,
  decisionUrl: string,
  quickOutcomeUrl?: string
): { subject: string; html: string } {
  const subject = `Time to check in: "${decisionTitle.slice(0, 50)}"`;

  const quickButtons = quickOutcomeUrl
    ? `<div style="text-align:center;margin:24px 0;">
        <a href="${quickOutcomeUrl}&result=right_call" style="display:inline-block;padding:12px 20px;background:#10B981;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:13px;margin:4px;">✓ Right Call</a>
        <a href="${quickOutcomeUrl}&result=mixed" style="display:inline-block;padding:12px 20px;background:#6B7280;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:13px;margin:4px;">~ Mixed</a>
        <a href="${quickOutcomeUrl}&result=wrong_call" style="display:inline-block;padding:12px 20px;background:#BE3455;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:13px;margin:4px;">✗ Wrong Call</a>
      </div>`
    : "";

  const html = baseTemplate(`
    ${heading("Time to check in")}
    ${paragraph("It's been a while since you made this decision. How did it turn out?")}
    ${metaBox(`
      ${metaItem("Decision", decisionTitle)}
      ${metaItem("Made on", `${decisionDate} · Verdict: ${verdict}`)}
    `)}
    ${quickButtons}
    <p style="text-align:center;"><a href="${decisionUrl}" style="color:#BE3455;font-size:13px;">Add more details →</a></p>
  `, `Time to check in: ${decisionTitle}`);
  return { subject, html };
}

export function outcomeOverdueEmail(
  decisionTitle: string,
  dueDate: string,
  quickOutcomeUrl?: string
): { subject: string; html: string } {
  const subject = `Outcome overdue: "${decisionTitle.slice(0, 50)}"`;

  const quickButtons = quickOutcomeUrl
    ? `<div style="text-align:center;margin:24px 0;">
        <a href="${quickOutcomeUrl}&result=right_call" style="display:inline-block;padding:12px 20px;background:#10B981;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:13px;margin:4px;">✓ Right Call</a>
        <a href="${quickOutcomeUrl}&result=mixed" style="display:inline-block;padding:12px 20px;background:#6B7280;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:13px;margin:4px;">~ Mixed</a>
        <a href="${quickOutcomeUrl}&result=wrong_call" style="display:inline-block;padding:12px 20px;background:#BE3455;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:13px;margin:4px;">✗ Wrong Call</a>
      </div>`
    : "";

  const html = baseTemplate(`
    ${heading("⏰ Outcome overdue")}
    ${paragraph("You scheduled a check-in for this decision, but haven't logged the outcome yet.")}
    ${metaBox(`
      ${metaItem("Decision", decisionTitle)}
      ${metaItem("Check-in was due", dueDate)}
    `)}
    ${paragraph("<strong>Close the loop to unlock patterns.</strong> Tracking outcomes is how Snag helps you spot blind spots and improve over time.")}
    ${quickButtons}
  `, `Outcome overdue: ${decisionTitle}`);
  return { subject, html };
}

export function trialEndingEmail(
  name: string,
  daysLeft: number
): { subject: string; html: string } {
  const subject = `Your Snag trial ends in ${daysLeft} days`;
  const html = baseTemplate(`
    ${heading(`${name}, your trial ends in ${daysLeft} days`)}
    ${paragraph("We hope you've been finding Snag valuable. Here's what happens next:")}
    <ul style="padding-left:20px;color:#666;font-size:14px;line-height:1.8;margin:0 0 16px;">
      <li>Your data stays safe – we never delete your decisions</li>
      <li>You can continue with our free tier</li>
      <li>Or subscribe to keep full access</li>
    </ul>
    ${button("View Plans", `${APP_URL}/pricing`)}
    ${paragraph("Questions? Just reply to this email.")}
  `, `Your Snag trial ends in ${daysLeft} days`);
  return { subject, html };
}

export function trialEndedEmail(): { subject: string; html: string } {
  const subject = "Your Snag trial has ended";
  const html = baseTemplate(`
    ${heading("Your trial has ended")}
    ${paragraph("Your Snag trial has expired, but your data is safe. Upgrade anytime to pick up where you left off.")}
    ${button("View Plans", `${APP_URL}/pricing`)}
  `, "Your Snag trial has ended");
  return { subject, html };
}

export function weeklyDigestEmail(
  teamName: string,
  stats: {
    decisionsCreated: number;
    analysesRun: number;
    outcomesLogged: number;
    pendingOutcomes: number;
  },
  dashboardUrl: string
): { subject: string; html: string } {
  const subject = `${teamName}'s week in decisions`;
  const html = baseTemplate(`
    ${heading(`${teamName}'s week in decisions`)}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      <tr>
        <td style="text-align:center;padding:12px;">
          <div style="font-size:28px;font-weight:700;color:#1A1A1A;">${stats.decisionsCreated}</div>
          <div style="font-size:12px;color:#999;">Decisions</div>
        </td>
        <td style="text-align:center;padding:12px;">
          <div style="font-size:28px;font-weight:700;color:#1A1A1A;">${stats.analysesRun}</div>
          <div style="font-size:12px;color:#999;">Analyses</div>
        </td>
        <td style="text-align:center;padding:12px;">
          <div style="font-size:28px;font-weight:700;color:#1A1A1A;">${stats.outcomesLogged}</div>
          <div style="font-size:12px;color:#999;">Outcomes</div>
        </td>
      </tr>
    </table>
    ${stats.pendingOutcomes > 0 ? `
      <div style="background:#FEF3C7;padding:12px 16px;border-radius:8px;margin:16px 0;">
        <p style="margin:0;font-size:14px;color:#92400E;font-weight:600;">${stats.pendingOutcomes} outcomes are ready for check-in</p>
      </div>
    ` : ""}
    ${button("View Dashboard", dashboardUrl)}
  `, `${teamName}'s weekly decision summary`);
  return { subject, html };
}
