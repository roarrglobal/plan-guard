import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Email HTML templates
function buildEmailHtml(type: string, data: any): { subject: string; html: string } {
  const baseStyle = `
    <style>
      body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
      .header { padding: 24px 32px; border-bottom: 1px solid #eee; }
      .logo { font-size: 20px; font-weight: 700; color: #BE3455; }
      .content { padding: 32px; }
      .content h1 { font-size: 22px; color: #1A1A1A; margin: 0 0 16px; }
      .content p { font-size: 15px; color: #666666; line-height: 1.6; margin: 0 0 12px; }
      .meta { background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 20px 0; }
      .meta-item { font-size: 13px; color: #666; margin-bottom: 6px; }
      .meta-item strong { color: #1A1A1A; }
      .cta { display: inline-block; padding: 12px 28px; background: #BE3455; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 8px 4px; }
      .cta-outline { display: inline-block; padding: 12px 28px; background: #f0f0f0; color: #1A1A1A !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 8px 4px; }
      .cta-success { background: #10B981; }
      .cta-gray { background: #6B7280; }
      .footer { padding: 20px 32px; text-align: center; border-top: 1px solid #eee; }
      .footer a { font-size: 12px; color: #999; text-decoration: none; margin: 0 8px; }
      .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    </style>
  `;

  const footer = `
    <div class="footer">
      <a href="${data.app_url || 'https://snagme.app'}/settings/notifications">Preferences</a>
      <a href="${data.app_url || 'https://snagme.app'}/unsubscribe?token=${data.unsubscribe_token || ''}">Unsubscribe</a>
      <a href="${data.app_url || 'https://snagme.app'}">snagme.app</a>
    </div>
  `;

  switch (type) {
    case "outcome_reminder": {
      const subject = `Time to check in: "${(data.decision_title || "").slice(0, 50)}"`;
      const html = `<!DOCTYPE html><html><head>${baseStyle}</head><body>
        <div class="container">
          <div class="header"><div class="logo">SNAG</div></div>
          <div class="content">
            <h1>Time to check in</h1>
            <div class="meta">
              <div class="meta-item"><strong>Decision:</strong> ${data.decision_title}</div>
              <div class="meta-item"><strong>Made:</strong> ${data.decision_date} (${data.days_ago} days ago)</div>
              ${data.verdict ? `<div class="meta-item"><strong>Verdict:</strong> <span class="badge" style="background:#FEF3C7;color:#92400E;">${data.verdict}</span></div>` : ''}
            </div>
            <p>How did it turn out?</p>
            <div style="text-align:center;margin:24px 0;">
              ${data.quick_outcome_url ? `
              <a href="${data.quick_outcome_url}&result=right_call" class="cta cta-success">✅ Right Call</a>
              <a href="${data.quick_outcome_url}&result=mixed" class="cta cta-gray">🤷 Mixed</a>
              <a href="${data.quick_outcome_url}&result=wrong_call" class="cta">❌ Wrong Call</a>
              ` : ''}
            </div>
            <p style="text-align:center;"><a href="${data.outcome_url}" style="color:#BE3455;font-size:13px;">Or add more details →</a></p>
          </div>
          ${footer}
        </div>
      </body></html>`;
      return { subject, html };
    }

    case "outcome_overdue": {
      const subject = `Outcome overdue: "${(data.decision_title || "").slice(0, 50)}"`;
      const html = `<!DOCTYPE html><html><head>${baseStyle}</head><body>
        <div class="container">
          <div class="header"><div class="logo">SNAG</div></div>
          <div class="content">
            <h1>⏰ Outcome overdue</h1>
            <p>You scheduled a check-in for this decision, but haven't logged the outcome yet.</p>
            <div class="meta">
              <div class="meta-item"><strong>Decision:</strong> ${data.decision_title}</div>
              <div class="meta-item"><strong>Check-in was due:</strong> ${data.due_date}</div>
            </div>
            <p><strong>Close the loop to unlock patterns.</strong> Tracking outcomes is how Snag helps you spot blind spots and improve over time.</p>
            <div style="text-align:center;margin:24px 0;">
              ${data.quick_outcome_url ? `
              <a href="${data.quick_outcome_url}&result=right_call" class="cta cta-success">✅ Right Call</a>
              <a href="${data.quick_outcome_url}&result=mixed" class="cta cta-gray">🤷 Mixed</a>
              <a href="${data.quick_outcome_url}&result=wrong_call" class="cta">❌ Wrong Call</a>
              ` : ''}
            </div>
          </div>
          ${footer}
        </div>
      </body></html>`;
      return { subject, html };
    }

    case "weekly_digest": {
      const subject = `Your team's week in decisions`;
      const html = `<!DOCTYPE html><html><head>${baseStyle}</head><body>
        <div class="container">
          <div class="header"><div class="logo">SNAG</div></div>
          <div class="content">
            <h1>Weekly Digest: ${data.team_name}</h1>
            <div class="meta">
              <div class="meta-item"><strong>Decisions created:</strong> ${data.decisions_created || 0}</div>
              <div class="meta-item"><strong>Outcomes logged:</strong> ${data.outcomes_logged || 0}</div>
              <div class="meta-item"><strong>Pending check-ins:</strong> ${data.pending_outcomes || 0}</div>
              ${data.accuracy ? `<div class="meta-item"><strong>Team accuracy:</strong> ${data.accuracy}%</div>` : ''}
            </div>
            ${(data.decisions || []).length > 0 ? `
              <p style="font-weight:600;margin-top:20px;">Recent decisions:</p>
              <ul style="padding-left:20px;">
                ${(data.decisions || []).map((d: any) => `<li style="color:#666;font-size:14px;margin-bottom:6px;">${d.title} <span style="color:#999;">(${d.status})</span></li>`).join('')}
              </ul>
            ` : ''}
            <div style="text-align:center;margin:24px 0;">
              <a href="${data.dashboard_url}" class="cta">View Dashboard</a>
            </div>
          </div>
          ${footer}
        </div>
      </body></html>`;
      return { subject, html };
    }

    case "analysis_complete": {
      const subject = `Analysis ready: "${(data.decision_title || "").slice(0, 50)}"`;
      const html = `<!DOCTYPE html><html><head>${baseStyle}</head><body>
        <div class="container">
          <div class="header"><div class="logo">SNAG</div></div>
          <div class="content">
            <h1>Analysis Ready</h1>
            <div class="meta">
              <div class="meta-item"><strong>Decision:</strong> ${data.decision_title}</div>
              ${data.verdict ? `<div class="meta-item"><strong>Verdict:</strong> ${data.verdict}</div>` : ''}
            </div>
            ${(data.top_blind_spots || []).length > 0 ? `
              <p style="font-weight:600;">Top blind spots:</p>
              <ul style="padding-left:20px;">
                ${data.top_blind_spots.map((s: string) => `<li style="color:#666;font-size:14px;margin-bottom:4px;">${s}</li>`).join('')}
              </ul>
            ` : ''}
            <div style="text-align:center;margin:24px 0;">
              <a href="${data.analysis_url}" class="cta">View Full Analysis</a>
            </div>
          </div>
          ${footer}
        </div>
      </body></html>`;
      return { subject, html };
    }

    case "team_invite": {
      const subject = `You're invited to join ${data.team_name} on Snag`;
      const html = `<!DOCTYPE html><html><head>${baseStyle}</head><body>
        <div class="container">
          <div class="header"><div class="logo">SNAG</div></div>
          <div class="content">
            <h1>You're invited!</h1>
            <p><strong>${data.inviter_name}</strong> invited you to join <strong>${data.team_name}</strong> as a <strong>${data.role}</strong>.</p>
            <p>Snag helps teams make better decisions by identifying blind spots and failure modes before they happen.</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${data.invite_url}" class="cta">Accept Invitation</a>
            </div>
          </div>
          ${footer}
        </div>
      </body></html>`;
      return { subject, html };
    }

    case "welcome": {
      const subject = `Welcome to Snag`;
      const html = `<!DOCTYPE html><html><head>${baseStyle}</head><body>
        <div class="container">
          <div class="header"><div class="logo">SNAG</div></div>
          <div class="content">
            <h1>Welcome to Snag 👋</h1>
            <p>You've just joined the platform that helps you make better decisions by identifying what could go wrong — before it does.</p>
            <p><strong>Here's how to get started:</strong></p>
            <ol style="padding-left:20px;color:#666;font-size:14px;line-height:1.8;">
              <li>Describe a decision you're facing</li>
              <li>Get instant blind spots and failure modes</li>
              <li>Track outcomes and build your pattern library</li>
            </ol>
            <div style="text-align:center;margin:24px 0;">
              <a href="${data.app_url || 'https://snagme.app'}/analyze" class="cta">Run Your First Snag</a>
            </div>
          </div>
          ${footer}
        </div>
      </body></html>`;
      return { subject, html };
    }

    case "trial_ending": {
      const subject = `Your Snag trial ends in 3 days`;
      const html = `<!DOCTYPE html><html><head>${baseStyle}</head><body>
        <div class="container">
          <div class="header"><div class="logo">SNAG</div></div>
          <div class="content">
            <h1>Your trial ends in 3 days</h1>
            <p>You've been using Snag to make smarter decisions. Here's what you'll lose access to:</p>
            <ul style="padding-left:20px;color:#666;font-size:14px;line-height:1.8;">
              <li>Deep Snag analyses</li>
              <li>Pattern tracking and insights</li>
              <li>Document analysis</li>
            </ul>
            <div style="text-align:center;margin:24px 0;">
              <a href="${data.app_url || 'https://snagme.app'}/settings" class="cta">Upgrade Now</a>
            </div>
          </div>
          ${footer}
        </div>
      </body></html>`;
      return { subject, html };
    }

    case "trial_ended": {
      const subject = `Your Snag trial has ended`;
      const html = `<!DOCTYPE html><html><head>${baseStyle}</head><body>
        <div class="container">
          <div class="header"><div class="logo">SNAG</div></div>
          <div class="content">
            <h1>Your trial has ended</h1>
            <p>Your Snag trial has expired, but your data is safe. Upgrade anytime to pick up where you left off.</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${data.app_url || 'https://snagme.app'}/settings" class="cta">View Plans</a>
            </div>
          </div>
          ${footer}
        </div>
      </body></html>`;
      return { subject, html };
    }

    default:
      return { subject: "Notification from Snag", html: `<p>${JSON.stringify(data)}</p>` };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const EMAIL_FROM = Deno.env.get("EMAIL_FROM_ADDRESS") || "Snag <notifications@snagme.app>";

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { email_type, to_email, template_data, user_id, queue_id } = body;

    if (!email_type || !to_email) {
      return new Response(JSON.stringify({ error: "email_type and to_email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check email preferences if user_id provided
    if (user_id) {
      const { data: prefs } = await adminClient
        .from("email_preferences")
        .select("*")
        .eq("user_id", user_id)
        .maybeSingle();

      if (prefs?.unsubscribed_all) {
        console.log(`User ${user_id} has unsubscribed from all emails`);
        if (queue_id) {
          await adminClient.from("email_queue").update({ status: "sent", sent_at: new Date().toISOString(), error_message: "User unsubscribed" }).eq("id", queue_id);
        }
        return new Response(JSON.stringify({ sent: false, reason: "unsubscribed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check specific preferences
      if (prefs) {
        const prefMap: Record<string, string> = {
          outcome_reminder: "outcome_reminders",
          outcome_overdue: "outcome_reminders",
          weekly_digest: "weekly_digest",
          team_invite: "team_activity",
          analysis_complete: "team_activity",
        };
        const prefKey = prefMap[email_type];
        if (prefKey && prefs[prefKey] === false) {
          console.log(`User opted out of ${email_type}`);
          if (queue_id) {
            await adminClient.from("email_queue").update({ status: "sent", sent_at: new Date().toISOString(), error_message: "User opted out" }).eq("id", queue_id);
          }
          return new Response(JSON.stringify({ sent: false, reason: "opted_out" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    const { subject, html } = buildEmailHtml(email_type, template_data || {});

    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [to_email],
        subject,
        html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend error:", resendData);
      if (queue_id) {
        await adminClient.from("email_queue").update({
          status: "failed",
          error_message: JSON.stringify(resendData),
          retry_count: body.retry_count ? body.retry_count + 1 : 1,
        }).eq("id", queue_id);
      }
      return new Response(JSON.stringify({ error: "Failed to send email", details: resendData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update queue if applicable
    if (queue_id) {
      await adminClient.from("email_queue").update({
        status: "sent",
        sent_at: new Date().toISOString(),
      }).eq("id", queue_id);
    }

    console.log(`Email sent: ${email_type} to ${to_email} (Resend ID: ${resendData.id})`);

    return new Response(
      JSON.stringify({ sent: true, resend_id: resendData.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Send email error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
