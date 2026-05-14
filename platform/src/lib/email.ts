// Server-only transactional email via Resend.
// Never imported by client components (uses RESEND_API_KEY).
//
// Soft-fail by design: if the API key is missing, send() logs and
// returns a non-fatal result. We never want a missing env var to
// break a Save Feedback button.

import "server-only";

import { Resend } from "resend";
import { EMAIL_FROM, PLATFORM_URL, RESEND_API_KEY } from "./env";

interface SendResult {
  ok: boolean;
  error?: string;
  skipped?: boolean;
}

function getResend(): Resend | null {
  if (!RESEND_API_KEY) return null;
  return new Resend(RESEND_API_KEY);
}

// ─── Brand-coherent HTML wrapper ────────────────────────────────────────────
// Inline CSS only — email clients ignore <style> blocks reliably only inline.

function wrap(
  bodyHtml: string,
  options: { previewText: string },
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Get Client Ready</title>
</head>
<body style="margin:0;padding:0;background:#0F0F0F;font-family:'Inter','Helvetica Neue',Arial,sans-serif;color:#FAFAF7;">
  <!-- Preview text (hidden, shown in inbox preview) -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#0F0F0F;opacity:0;">
    ${options.previewText}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="540" cellpadding="0" cellspacing="0" style="background:#1A1A1A;border:1px solid rgba(250,250,247,0.06);border-radius:4px;padding:48px 40px;max-width:540px;">
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:#FAFAF7;">
                GET <em style="color:#C9A876;font-style:italic;font-weight:500;">CLIENT</em> READY
              </div>
            </td>
          </tr>
          ${bodyHtml}
        </table>
        <p style="margin:24px auto 0;font-size:11px;color:#5C5C5C;letter-spacing:0.1em;max-width:540px;text-align:center;">
          &copy; 2026 Entropy Breakers · Get Client Ready
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#C9A876;color:#0F0F0F;font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;text-decoration:none;padding:14px 32px;border-radius:3px;">${label}</a>`;
}

// ─── feedback_ready ─────────────────────────────────────────────────────────

interface FeedbackReadyInput {
  to: string;
  studentFirstName: string;
  exerciseTitle: string;
  weekNumber: number;
  submissionId: string;
}

export async function sendFeedbackReadyEmail(
  input: FeedbackReadyInput,
): Promise<SendResult> {
  const resend = getResend();
  if (!resend) return { ok: false, skipped: true };

  const url = `${PLATFORM_URL}/submissions/${input.submissionId}`;
  const subject = `Your feedback is ready — Week ${input.weekNumber}, ${input.exerciseTitle}`;

  const body = `
    <tr><td style="padding-bottom:24px;">
      <h1 style="margin:0;font-family:'Cormorant Garamond',Georgia,serif;font-size:32px;font-weight:500;font-style:italic;color:#FAFAF7;text-align:center;line-height:1.2;">
        Your feedback is ready.
      </h1>
    </td></tr>
    <tr><td style="padding-bottom:32px;">
      <p style="margin:0;font-size:15px;line-height:1.7;color:rgba(250,250,247,0.85);text-align:center;">
        ${input.studentFirstName}, I just sent you feedback on <em style="color:#C9A876;">${input.exerciseTitle}</em> from Week ${input.weekNumber}.
        <br><br>
        Read it while it's fresh — the next exercise builds directly on what's in this one.
      </p>
    </td></tr>
    <tr><td align="center" style="padding-bottom:32px;">
      ${ctaButton(url, "Read feedback")}
    </td></tr>
    <tr><td style="padding-top:24px;border-top:1px solid rgba(250,250,247,0.05);">
      <p style="margin:0;font-size:12px;line-height:1.6;color:#9C9C9C;text-align:center;">
        — Bettina
      </p>
    </td></tr>
  `;

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: input.to,
      subject,
      html: wrap(body, { previewText: `Feedback on ${input.exerciseTitle} is in your dashboard.` }),
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
}

// ─── welcome ────────────────────────────────────────────────────────────────

interface WelcomeInput {
  to: string;
  studentFirstName: string;
  tempPassword?: string | null;
}

export async function sendWelcomeEmail(
  input: WelcomeInput,
): Promise<SendResult> {
  const resend = getResend();
  if (!resend) return { ok: false, skipped: true };

  const subject = "Welcome to Get Client Ready";
  const body = `
    <tr><td style="padding-bottom:24px;">
      <h1 style="margin:0;font-family:'Cormorant Garamond',Georgia,serif;font-size:32px;font-weight:500;font-style:italic;color:#FAFAF7;text-align:center;line-height:1.2;">
        Welcome aboard, ${input.studentFirstName}.
      </h1>
    </td></tr>
    <tr><td style="padding-bottom:24px;">
      <p style="margin:0;font-size:15px;line-height:1.7;color:rgba(250,250,247,0.85);text-align:center;">
        Your platform is live. Six weeks of personalised diagnostics, exercises and feedback — all in your browser, anytime.
      </p>
    </td></tr>
    <tr><td style="padding-bottom:24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;border:1px solid rgba(250,250,247,0.08);border-radius:4px;">
        <tr><td style="padding:18px 24px;">
          <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#9C9C9C;margin-bottom:6px;">Login</div>
          <div style="font-size:14px;color:#FAFAF7;"><a href="${PLATFORM_URL}/login" style="color:#C9A876;text-decoration:none;">${PLATFORM_URL}/login</a></div>
        </td></tr>
        <tr><td style="padding:0 24px 18px;">
          <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#9C9C9C;margin-bottom:6px;">Email</div>
          <div style="font-size:14px;color:#FAFAF7;">${input.to}</div>
        </td></tr>
        ${
          input.tempPassword
            ? `<tr><td style="padding:0 24px 18px;">
                 <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#9C9C9C;margin-bottom:6px;">Temporary password</div>
                 <div style="font-size:14px;color:#FAFAF7;font-family:'Courier New',monospace;">${input.tempPassword}</div>
                 <div style="font-size:12px;color:#9C9C9C;margin-top:6px;">Change it after your first login (Profile → Account).</div>
               </td></tr>`
            : ""
        }
      </table>
    </td></tr>
    <tr><td align="center" style="padding-bottom:32px;">
      ${ctaButton(`${PLATFORM_URL}/login`, "Open the platform")}
    </td></tr>
    <tr><td style="padding-top:24px;border-top:1px solid rgba(250,250,247,0.05);">
      <p style="margin:0;font-size:12px;line-height:1.6;color:#9C9C9C;text-align:center;">
        Any questions, just reply to this email.<br>— Bettina
      </p>
    </td></tr>
  `;

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: input.to,
      subject,
      html: wrap(body, { previewText: "Six weeks. Personalised. Starts now." }),
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
}
