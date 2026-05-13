import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { LANDING_URL, USE_MOCK } from "@/lib/env";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
        <Logo href="/" className="text-lg md:text-xl" />
        <p className="mt-6 font-serif text-3xl md:text-4xl text-ink-light italic">
          Welcome back.
        </p>
      </div>

      <div className="bg-bg-card border border-white/5 rounded-sm p-7 md:p-9">
        {USE_MOCK ? (
          <div className="mb-6 p-3 rounded-sm border border-accent/30 bg-accent/5 text-xs text-ink-muted leading-relaxed">
            <strong className="text-accent font-medium">Preview mode</strong>
            <br />
            No Supabase wired yet. Click <em className="text-accent">Sign in</em>{" "}
            to enter the demo dashboard.
          </div>
        ) : null}

        <LoginForm />

        <div className="mt-6 text-center">
          <Link
            href="/forgot-password"
            className="text-xs text-ink-muted hover:text-accent transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-ink-muted">
        No account yet?{" "}
        <a
          href={LANDING_URL}
          className="text-accent hover:underline"
          target="_blank"
          rel="noopener"
        >
          Get started with a free discovery call →
        </a>
      </p>
    </div>
  );
}
