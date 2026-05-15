"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { USE_MOCK } from "@/lib/env";

export function ResetForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  // null = still checking, true = recovery session present, false = no session
  const [linkValid, setLinkValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (USE_MOCK) {
      setLinkValid(true);
      return;
    }
    let active = true;
    (async () => {
      const { getBrowserClient } = await import("@/lib/supabase/client");
      const { data } = await getBrowserClient().auth.getUser();
      if (active) setLinkValid(Boolean(data.user));
    })();
    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 350));
        setDone(true);
        return;
      }
      const { getBrowserClient } = await import("@/lib/supabase/client");
      const { error: err } = await getBrowserClient().auth.updateUser({
        password,
      });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setDone(true);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (linkValid === false) {
    return (
      <div className="text-center py-4">
        <p className="text-base text-ink-light">
          This link is invalid or has expired.
        </p>
        <p className="mt-3 text-sm text-ink-muted">
          Request a fresh one on the{" "}
          <a href="/forgot-password" className="text-accent">
            password reset page
          </a>
          .
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <p className="text-base text-ink-light">Password updated.</p>
        <p className="mt-2 text-sm text-ink-muted">
          Taking you to your dashboard…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>
      <div>
        <Label htmlFor="confirm">Confirm new password</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="text-sm text-warn bg-warn/10 border border-warn/30 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading || linkValid === null}
        className="w-full"
      >
        {loading ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
