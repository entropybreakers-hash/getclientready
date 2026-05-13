import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ForgotForm } from "./ForgotForm";

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
        <Logo href="/" className="text-lg md:text-xl" />
        <p className="mt-6 font-serif text-3xl md:text-4xl text-ink-light italic">
          Reset your password.
        </p>
        <p className="mt-3 text-sm text-ink-muted">
          We&apos;ll email you a magic link to reset it.
        </p>
      </div>

      <div className="bg-bg-card border border-white/5 rounded-sm p-7 md:p-9">
        <ForgotForm />
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-xs text-ink-muted hover:text-accent transition-colors"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
