-- ============================================================================
-- Get Client Ready — Content V2 (sentence-list updates)
-- Run AFTER content_v1.sql.
-- Idempotent: updates exercise prompts by (module_slug, order) — re-runnable
-- safely.
-- ============================================================================
--
-- Changes from V4 brief (2026-05-14):
--
-- Module 1 Ex 1.1 — restructured from 13 generic sentences to 15
--   business-context sentences split into Word / Structure / Grammar trap
--   categories (5 each).
-- Module 2 Ex 2.1 — Word Trap Drill expanded from 7 to 8 word pairs; added
--   "concept" and "meaning" as new traps; reordered.
-- Module 2 Ex 2.2 — Structure Trap Rewriting: sentence 6 replaced
--   ("I would have liked to had more time…" → "I would like to discuss
--    with you about the new strategy.")
-- Module 4 Ex 4.1 — pushback client quote updated to "delivered similar in
--   four — surely you can find a way." for sharper realism.
-- ============================================================================

-- ─── Module 1 / Ex 1.1 — Language Trap Audit (now 15 sentences) ────────────
update public.exercises set
  prompt = $p$# Translate these sentences — and notice what feels natural

Below are 15 sentences. Each one was written by a German-speaking professional who genuinely believed it was correct English.

1. Read each sentence.
2. Mark which sentences feel "off" or wrong to you — even slightly.
3. For each one you marked, write what you think the correct version is.
4. For sentences that DON'T feel wrong to you, leave them as they are.

Do NOT look anything up. The point isn't to be perfect. The point is to find where your instincts are sharp — and where they aren't.

Submit all 15, then I'll respond with the corrections and what each one reveals about your translation reflex.

---

**Word Traps:**

1. "Can you send me the actual quarterly numbers?"
2. "My chef has approved the strategy."
3. "Eventually we can extend the contract."
4. "Please become my approval before the launch."
5. "What is your meaning on the new proposal?"

**Structure Traps:**

6. "I am leading this division since three years."
7. "We need the deck until Wednesday for the board meeting."
8. "Could you make a screenshot of the conversion funnel?"
9. "We had a productive call, or?"
10. "I want to discuss with you about the budget allocation."

**Grammar Traps:**

11. "Do you have any informations from the legal team?"
12. "I have spoken to the client yesterday about the renewal."
13. "She is responsible from the German market expansion."
14. "We received many feedbacks after the product launch."
15. "If I would know the timeline, I would share it with the team."$p$
where module_id = (select id from public.modules where slug = 'diagnose')
  and "order" = 1;

-- ─── Module 2 / Ex 2.1 — Word Trap Drill (now 8 pairs) ─────────────────────
update public.exercises set
  prompt = $p$# Use each correction in a real business sentence

For each of the following German→English word traps, write a business sentence using the CORRECT version. Not a translation — a sentence you might actually send in an email or say in a meeting.

Example:

- Trap: *handy → phone*
- Your sentence: "I'll send you the deck — let me know once it's on your phone."

Your turn (write 1 business sentence per trap):

1. *become → get / receive*
2. *handy → phone*
3. *chef → boss*
4. *eventually → maybe / possibly*
5. *actual → current*
6. *control → check / review*
7. *concept → proposal / plan*
8. *meaning → opinion / view*

Submit all 8.$p$
where module_id = (select id from public.modules where slug = 'arm')
  and "order" = 1;

-- ─── Module 2 / Ex 2.2 — Structure Trap Rewriting (sentence 6 replaced) ────
update public.exercises set
  prompt = $p$# Rewrite German-style English into native English

Below are 6 sentences written in "German-style English". Rewrite each one so it sounds like native business English.

After each rewrite, write ONE sentence explaining what changed — not grammatically, but in terms of *flow* or *naturalness*.

1. "I am working with this client since two years."
2. "I will buy a coffee, do you want one?"
3. "Can you make me a screenshot of the dashboard?"
4. "Please send me your feedback until Friday."
5. "We had a good meeting yesterday, or?"
6. "I would like to discuss with you about the new strategy."$p$
where module_id = (select id from public.modules where slug = 'arm')
  and "order" = 2;

-- ─── Module 4 / Ex 4.1 — Pushback Scenario (client quote updated) ──────────
update public.exercises set
  prompt = $p$# Hold a position against client pressure

**SCENARIO:**

You are presenting a project timeline to a senior international client. You estimate 8 weeks. The client responds:

> *"Eight weeks? That's not going to work for us. We need it in five. I've worked with vendors who delivered similar in four — surely you can find a way."*

You believe 5 weeks is unrealistic. You're not willing to compromise quality. But this is an important client and you want to keep the relationship strong.

Write your response. Aim for **4-6 sentences**. You may push back, negotiate, or propose alternatives — but you must hold a clear position.

After submitting, I'll respond with:

- Where your Confidence Behaviors showed up (if any)
- Where your authority held or slipped
- A native-speaker model response for comparison$p$
where module_id = (select id from public.modules where slug = 'pressure-test')
  and "order" = 1;
