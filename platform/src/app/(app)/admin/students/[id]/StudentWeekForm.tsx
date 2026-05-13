"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { updateStudentAction } from "@/lib/actions";
import type { Profile } from "@/lib/types";

interface Props {
  userId: string;
  currentWeek: number;
  status: Profile["status"];
}

export function StudentWeekForm({ userId, currentWeek, status }: Props) {
  const router = useRouter();
  const [week, setWeek] = useState(currentWeek);
  const [newStatus, setNewStatus] = useState<Profile["status"]>(status);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateStudentAction({
        userId,
        currentWeek: week,
        status: newStatus,
      });
      if (!res.ok) {
        setError(res.error ?? "Update failed");
        return;
      }
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    });
  }

  const dirty = week !== currentWeek || newStatus !== status;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-[0.65rem] tracking-[0.22em] uppercase text-ink-muted mb-1.5">
          Week
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5, 6].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWeek(w)}
              className={
                w === week
                  ? "w-9 h-9 rounded-sm bg-accent text-bg-dark font-semibold"
                  : "w-9 h-9 rounded-sm border border-white/10 text-ink-muted hover:border-accent hover:text-accent transition-colors"
              }
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[0.65rem] tracking-[0.22em] uppercase text-ink-muted mb-1.5">
          Status
        </label>
        <select
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value as Profile["status"])}
          className="h-9 px-3 bg-bg-card border border-white/10 text-ink-light rounded-sm text-sm focus:border-accent focus:outline-none"
        >
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      <Button
        type="button"
        size="sm"
        onClick={save}
        disabled={!dirty || isPending}
      >
        {isPending ? "Saving…" : "Save"}
      </Button>

      {error && <span className="text-sm text-warn">{error}</span>}
      {saved && <span className="text-sm text-success">Saved ✓</span>}
    </div>
  );
}
