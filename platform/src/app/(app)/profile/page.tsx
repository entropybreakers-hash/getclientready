import { Badge } from "@/components/ui/Badge";
import { Markdown } from "@/components/ui/Markdown";
import { getCurrentProfile, getMyPatternReport } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const [profile, pattern] = await Promise.all([
    getCurrentProfile(),
    getMyPatternReport(),
  ]);
  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14 space-y-10">
      <header>
        <div className="eyebrow mb-2">Settings</div>
        <h1 className="font-serif text-4xl md:text-5xl font-medium leading-tight">
          Your account
        </h1>
      </header>

      {/* Account */}
      <section className="bg-bg-card border border-white/5 rounded-sm p-7 md:p-8">
        <h2 className="font-serif text-xl md:text-2xl font-medium mb-5">Account</h2>
        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-5 text-sm">
          <div>
            <dt className="eyebrow mb-1">Name</dt>
            <dd className="text-base text-ink-light">
              {profile.first_name} {profile.last_name}
            </dd>
          </div>
          <div>
            <dt className="eyebrow mb-1">Email</dt>
            <dd className="text-base text-ink-light">{profile.email}</dd>
          </div>
        </dl>
        <p className="mt-6 text-xs text-ink-muted">
          To change your name or email, message Bettina on WhatsApp.
        </p>
      </section>

      {/* Program */}
      <section className="bg-bg-card border border-white/5 rounded-sm p-7 md:p-8">
        <h2 className="font-serif text-xl md:text-2xl font-medium mb-5">Program</h2>
        <dl className="grid sm:grid-cols-3 gap-x-8 gap-y-5 text-sm">
          <div>
            <dt className="eyebrow mb-1">Tier</dt>
            <dd>
              <Badge variant="accent">
                {profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="eyebrow mb-1">Started</dt>
            <dd className="text-base text-ink-light">
              {formatDate(profile.started_at)}
            </dd>
          </div>
          <div>
            <dt className="eyebrow mb-1">Current week</dt>
            <dd className="text-base text-ink-light">
              {profile.current_week} of 6
            </dd>
          </div>
        </dl>
      </section>

      {/* Pattern report */}
      {pattern && (
        <section id="patterns" className="bg-bg-card border border-accent/20 rounded-sm p-7 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl md:text-2xl font-medium">
              Your pattern report
            </h2>
            <Badge variant="success">Generated</Badge>
          </div>
          <p className="text-xs text-ink-muted mb-5">
            {formatDate(pattern.generated_at)}
          </p>
          <Markdown>{pattern.content}</Markdown>
        </section>
      )}

      {/* Sign out */}
      <section>
        <form action="/auth/sign-out" method="POST">
          <button
            type="submit"
            className="text-xs tracking-[0.18em] uppercase text-ink-muted hover:text-warn transition-colors"
          >
            Sign out
          </button>
        </form>
      </section>
    </div>
  );
}
