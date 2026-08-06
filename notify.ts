// lib/notify.ts
// Sends the team an email when a high-scoring mentor lead comes in, via Resend.
// Server-only. Fire-and-forget: never let a notification failure break signup.
//
//   npm install resend
//
// Env:
//   RESEND_API_KEY            - from resend.com
//   NOTIFY_FROM               - verified sender, e.g. "MyAlongside <team@myalongside.com>"
//   NOTIFY_TO                 - comma-separated recipients for lead alerts
//   NOTIFY_SCORE_THRESHOLD    - minimum score to notify (default 75)
//   NEXT_PUBLIC_SITE_URL      - base URL for the dashboard link (optional)

import type { MentorLead } from "./leads";
import type { Qualification } from "./qualify";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

/**
 * Notify the team about a high-scoring mentor lead. Returns true if an email was
 * sent, false if skipped (below threshold / not configured) or failed. Callers
 * should not await-block signup on this.
 */
export async function notifyHighScoringLead(lead: MentorLead, q: Qualification): Promise<boolean> {
  const threshold = Number(process.env.NOTIFY_SCORE_THRESHOLD ?? 75);
  if (lead.score < threshold) return false;
  if (lead.status === "not_ready") return false; // don't alert on crisis-flagged applicants

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM;
  const to = (process.env.NOTIFY_TO ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!apiKey || !from || to.length === 0) return false; // not configured

  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const dashUrl = `${base}/marketing/leads?status=qualified`;

  const strengths = q.strengths.length ? `<ul>${q.strengths.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>` : "<em>—</em>";
  const concerns = q.concerns.length ? `<ul>${q.concerns.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>` : "<em>none noted</em>";

  const html = `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
    <p style="font-size:12px;letter-spacing:.5px;text-transform:uppercase;color:#0E7C7B;font-weight:700;margin:0">New mentor lead · score ${lead.score}/100</p>
    <h2 style="margin:4px 0 2px;font-size:20px">${escapeHtml(lead.name)}</h2>
    <p style="margin:0 0 14px"><a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a></p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:6px 0;color:#667;width:120px">Life event</td><td style="padding:6px 0">${escapeHtml(lead.lifeEvent)}</td></tr>
      <tr><td style="padding:6px 0;color:#667">Availability</td><td style="padding:6px 0">${escapeHtml(lead.availability || "not specified")}</td></tr>
      <tr><td style="padding:6px 0;color:#667;vertical-align:top">Their story</td><td style="padding:6px 0">${escapeHtml(lead.story)}</td></tr>
    </table>
    <p style="font-size:14px;margin:14px 0 4px"><b>AI assessment:</b> ${escapeHtml(q.notes)}</p>
    <p style="font-size:13px;margin:8px 0 2px;color:#15803d"><b>Strengths</b></p>${strengths}
    <p style="font-size:13px;margin:8px 0 2px;color:#b45309"><b>Watch-outs</b></p>${concerns}
    <p style="margin:20px 0"><a href="${dashUrl}" style="background:#0E7C7B;color:#fff;text-decoration:none;padding:11px 18px;border-radius:9px;font-weight:600;font-size:14px">Review in dashboard →</a></p>
    <p style="font-size:11px;color:#99a">Follow up promptly — momentum matters when someone offers to help.</p>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from,
        to,
        subject: `New mentor lead: ${lead.name} (${lead.score}/100 · ${lead.lifeEvent})`,
        html,
        reply_to: lead.email,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
