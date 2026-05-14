"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { sendWelcomeEmailAction } from "@/lib/actions";

interface Props {
  userId: string;
  studentFirstName: string;
  studentEmail: string;
  studentWhatsapp?: string | null;
  platformUrl: string;
}

export function WelcomeMessageDialog({
  userId,
  studentFirstName,
  studentEmail,
  studentWhatsapp,
  platformUrl,
}: Props) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(studentWhatsapp ?? "");
  const [tempPassword, setTempPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [emailing, startEmailing] = useTransition();
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  function onSendEmail() {
    setEmailError(null);
    setEmailSent(false);
    startEmailing(async () => {
      const res = await sendWelcomeEmailAction({
        userId,
        tempPassword: tempPassword || undefined,
      });
      if (!res.ok) {
        setEmailError(res.error ?? "Send failed.");
        return;
      }
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    });
  }

  const message = `Hi ${studentFirstName} — welcome to Get Client Ready.

Your platform is live. You'll work through six weeks of personalised diagnostics, exercises, and feedback — all in your browser, anytime.

Login: ${platformUrl}/login
Email: ${studentEmail}${tempPassword ? `\nTemporary password: ${tempPassword}` : ""}

Please change your password after the first login (Profile → Account).

Any questions, just message me back here.

— Bettina`;

  const digitsOnly = phone.replace(/[^0-9]/g, "");
  const waUrl = digitsOnly
    ? `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`
    : null;

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Send welcome message →
      </Button>
    );
  }

  return (
    <div className="bg-bg-card border border-accent/30 rounded-sm p-6 md:p-7 space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h3 className="eyebrow">Welcome message</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-ink-muted hover:text-ink-light"
        >
          Close
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Their WhatsApp (with country code)</Label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+436641234567"
          />
        </div>
        <div>
          <Label>Temporary password (optional)</Label>
          <Input
            type="text"
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            placeholder="the one you set in Supabase Auth"
          />
        </div>
      </div>

      <div>
        <div className="text-[0.65rem] tracking-[0.22em] uppercase text-ink-muted mb-2">
          Preview
        </div>
        <pre className="whitespace-pre-wrap bg-bg-dark border border-white/10 rounded-sm p-4 text-sm text-ink-light/90 font-mono leading-relaxed">
          {message}
        </pre>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center justify-center h-9 px-4 bg-accent text-bg-dark text-[0.65rem] font-semibold uppercase tracking-[0.18em] rounded-sm hover:bg-accent-deep transition-colors"
          >
            Open in WhatsApp →
          </a>
        ) : (
          <Button type="button" disabled size="sm">
            Add phone number to open WhatsApp
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copyMessage}
        >
          {copied ? "Copied ✓" : "Copy message"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSendEmail}
          disabled={emailing}
        >
          {emailing ? "Sending…" : emailSent ? "Sent ✓" : "Send by email"}
        </Button>
      </div>

      {emailError && (
        <p className="text-sm text-warn bg-warn/10 border border-warn/30 rounded-sm px-3 py-2">
          {emailError}
        </p>
      )}

      <p className="text-xs text-ink-muted">
        Tip: WhatsApp is for the heads-up. For the temp password, send it separately
        (SMS, in-person, or use the email button — Resend delivers from your own domain).
      </p>
    </div>
  );
}
