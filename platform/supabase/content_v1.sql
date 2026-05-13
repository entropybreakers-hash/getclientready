-- ============================================================================
-- Get Client Ready — V1 launch content
-- Run AFTER schema.sql + seed.sql.
-- Idempotent: safe to re-run; module rows update in place, exercises upsert
-- on (module_id, "order").
-- ============================================================================

create unique index if not exists exercises_module_order_uidx
  on public.exercises (module_id, "order");

-- Drop the placeholder Module 1 exercise from seed.sql so the new
-- 1.1 / 1.2 / 1.3 set lands cleanly. Safe: no submissions reference it yet
-- (and even if they did, the on-conflict upsert below would update it).
delete from public.exercises e
  using public.modules m
  where e.module_id = m.id
    and m.slug = 'diagnose'
    and e."order" = 1
    and e.title = 'The freeze moment';

-- ════════════════════════════════════════════════════════════════════════════
-- MODULE 1: DIAGNOSE
-- ════════════════════════════════════════════════════════════════════════════

update public.modules set
  subtitle    = 'Identify your breakdown pattern across language, authority, and confidence.',
  description = 'Identify your exact breakdown patterns across three dimensions — language, authority, and confidence.',
  content     = $body$
# Week 1: Diagnose

## Your starting point isn't your English level. It's your pattern.

Most coaching programs start by assessing your grammar, your vocabulary, your fluency. Get Client Ready does not.

We assume you can already speak English. The reason you froze in your last high-stakes meeting was not because you don't know the words. It was because something specific got in the way.

This week we find it.

---

## The three dimensions of breakdown

In six years of coaching European professionals, I've noticed every English-speaking breakdown falls into one (or more) of three dimensions:

### 1. Language Traps — *where German-English transfer breaks*

Your native language is constantly translating itself into English in the background. Most of the time it works. Sometimes it doesn't — and the moment it breaks, your sentence lands differently than you intended.

There are three sub-types:

- **Word Traps** — false friends. *Become* and *bekommen*. *Handy* and *phone*. *Gift* and *poison*.
- **Structure Traps** — German sentence patterns rendered word-for-word into English. *"I am working in this company since three years."*
- **Grammar Traps** — German grammar transferred. *"Some interesting informations."* / *"These advices."*

### 2. Authority Patterns — *where your language shrinks your power*

You can be linguistically perfect and still sound like someone who doesn't belong in the room.

Common Authority Patterns:

- **Hedging** — *"Can you tell me when this is ready?"* instead of *"When can I expect this?"*
- **Soft commitment** — *"I find your proposal very interesting"* instead of *"This is exactly what we need."*
- **Permission-seeking** — *"We should maybe think about changing the strategy"* instead of *"We need to change the strategy."*

These are not grammar errors. They are *positioning* errors. They make you sound like a junior asking permission rather than a peer making decisions.

### 3. Confidence Behaviors — *what your body does under pressure*

The third dimension is what shows up when the stakes rise. Even people with strong English and clean authority can collapse here.

- **Circumlocution** — talking around what you want to say because the direct word won't come
- **Freeze** — stopping mid-sentence, going silent, losing the thread
- **Compression** — saying half of what you would say in your native language, leaving the point underdelivered
- **Micro-errors** — small grammatical mistakes that you'd never make in writing, suddenly appearing in speech
- **Disjointedness** — sentences that don't quite connect, ideas that don't quite land

These aren't English problems. They are pressure problems that *express themselves through English*.

---

## What you'll discover this week

By Sunday, you'll have a personal pattern report covering all three dimensions. You'll know:

- Which **Language Traps** you fall into most
- Which **Authority Patterns** shrink your power
- Which **Confidence Behaviors** show up under pressure

You'll also know which dimension is *your* dominant one — and that's where the rest of the program focuses.

Everyone freezes for a different reason. Now you find yours.

---

Let's begin.
$body$
where slug = 'diagnose';

insert into public.exercises (module_id, title, prompt, type, "order") values
  ((select id from public.modules where slug = 'diagnose'),
   'Language Trap Audit',
   $p$# Translate these sentences — and notice what feels natural

Below are 13 sentences. Each one was written by a German-speaking professional who genuinely believed it was correct English.

1. Read each sentence.
2. Mark which sentences feel "off" or wrong to you — even slightly.
3. For each one you marked, write what you think the correct version is.
4. For sentences that DON'T feel wrong to you, leave them as they are.

Do NOT look anything up. The point isn't to be perfect. The point is to find where your instincts are sharp — and where they aren't.

Submit all 13, then I'll respond with the corrections and what each one reveals about your translation reflex.

---

1. "When can I become my passport back?"
2. "I am working in this company since three years."
3. "I will go home now, I am tired."
4. "Can you make a photo of us?"
5. "My handy is out of battery."
6. "Be careful, this mushroom is gift!"
7. "I have some interesting informations for you."
8. "Please finish the report until Monday."
9. "You are coming tonight, or?"
10. "What is the actual situation with the project?"
11. "Eventually I will come to the meeting."
12. "The police controlled my passport at the border."
13. "My chef is on vacation this week."$p$,
   'text', 1),
  ((select id from public.modules where slug = 'diagnose'),
   'Authority Pattern Audit',
   $p$# Rewrite your own sentences for power

Think back to the last 7 days at work. Pick three sentences you've actually said or written in English where, looking back, you softened your position — hedged, sought permission, made a soft commitment.

Examples of what you're looking for:

- "I was wondering if maybe we could consider..."
- "I find this approach quite interesting..."
- "It might be worth thinking about whether..."
- "Could I perhaps suggest..."

For each one, write:

1. **The sentence you actually said/wrote** — be honest, even if it makes you wince
2. **Why you softened it** — genuinely; what were you afraid of?
3. **A stronger rewrite** — your first instinct, no overthinking

Three sentences total. Don't perfect. Reveal.$p$,
   'text', 2),
  ((select id from public.modules where slug = 'diagnose'),
   'Confidence Behavior Reflection',
   $p$# Recall your last English breakdown

Close your eyes for a moment. Recall the last time you spoke English in a high-stakes context and something inside you shifted — froze, compressed, scattered.

It could be:

- A pushback from a client
- A senior questioning your proposal
- An unexpected question in a meeting
- A pitch where you ran out of words
- A negotiation that went somewhere you didn't expect

Now answer these honestly:

1. **The situation** — describe it in 2-3 sentences. What happened? What was at stake?
2. **The breakdown moment** — at what exact moment did you feel something shift? What were you trying to say?
3. **What did your body do?** Be specific:
   - Did you go silent? *(Freeze)*
   - Did you talk around what you wanted to say? *(Circumlocution)*
   - Did you say less than you would have in your native language? *(Compression)*
   - Did you make small grammar mistakes you normally don't make? *(Micro-errors)*
   - Did your sentences stop connecting properly? *(Disjointedness)*
   - Something else?
4. **The aftermath** — what did you wish you had said? Write it out, in English, the way you would have wanted to say it in the moment.

This is the foundation of everything we'll do for the next five weeks. Be honest. The more accurate this is, the more useful Week 1 will be.$p$,
   'text', 3)
on conflict (module_id, "order") do update set
  title  = excluded.title,
  prompt = excluded.prompt,
  type   = excluded.type;


-- ════════════════════════════════════════════════════════════════════════════
-- MODULE 2: ARM
-- ════════════════════════════════════════════════════════════════════════════

update public.modules set
  subtitle    = 'Repair your specific Language Traps. Stop wasting authority on small leaks.',
  description = 'Build your arsenal of corrected English structures — the foundation of authority. Targeted repair of your specific Language Traps, calibrated to your Week 1 diagnostic.',
  content     = $body$
# Week 2: Arm

## You can't perform with broken tools.

Last week we diagnosed your patterns. This week we begin the rebuild.

Module 2 focuses on the *Language Traps* dimension — the linguistic foundation. Before we work on authority and pressure, we close the leaks at the word, structure, and grammar level.

This isn't grammar drilling. It's **targeted repair**, calibrated to YOUR specific traps from Week 1.

What you'll work on:

- **Word Trap corrections** — your specific false-friend replacements (*become → get*, *handy → phone*, etc.)
- **Structure Trap rewiring** — converting German sentence patterns into native English flow
- **Grammar Trap repair** — countable/uncountable, tense logic, articles, prepositions

By the end of Week 2, the foundation is solid. You stop wasting authority on small leaks.
$body$
where slug = 'arm';

insert into public.exercises (module_id, title, prompt, type, "order") values
  ((select id from public.modules where slug = 'arm'),
   'Word Trap Drill',
   $p$# Use each correction in a real business sentence

For each of the following German→English word traps, write a business sentence using the CORRECT version. Not a translation — a sentence you might actually send in an email or say in a meeting.

Example:

- Trap: *handy → phone*
- Your sentence: "I'll send you the deck — let me know once it's on your phone."

Your turn (write 1 business sentence per trap):

1. *become → get*
2. *handy → phone*
3. *gift → present* (note: *gift* in English = *poison*)
4. *actual → current*
5. *eventually → maybe / possibly*
6. *control → check*
7. *chef → boss*

Submit all 7.$p$,
   'text', 1),
  ((select id from public.modules where slug = 'arm'),
   'Structure Trap Rewriting',
   $p$# Rewrite German-style English into native English

Below are 6 sentences written in "German-style English". Rewrite each one so it sounds like native business English.

After each rewrite, write ONE sentence explaining what changed — not grammatically, but in terms of *flow* or *naturalness*.

1. "I am working with this client since two years."
2. "I will buy a coffee, do you want one?"
3. "Can you make me a screenshot of the dashboard?"
4. "Please send me your feedback until Friday."
5. "We had a good meeting yesterday, or?"
6. "I would have liked to had more time to prepare."$p$,
   'text', 2),
  ((select id from public.modules where slug = 'arm'),
   'Grammar Trap Application',
   $p$# Write a real email — with deliberate constraints

This week you've been working with specific Grammar Traps from your Week 1 diagnostic. Now apply them.

Write a **6-8 sentence email** to a senior international stakeholder updating them on a project. The email must include:

- A **present perfect** statement (*Since X / For X / We have...*)
- A **countable/uncountable** use (information, research, advice, feedback)
- An **"until / by"** deadline statement
- A modal verb of suggestion (*would*, *could*, *should*) — but used with **authority**, not deference

Submit the email. I'll respond with the specific corrections AND highlight where your authority showed up or slipped.$p$,
   'text', 3)
on conflict (module_id, "order") do update set
  title  = excluded.title,
  prompt = excluded.prompt,
  type   = excluded.type;


-- ════════════════════════════════════════════════════════════════════════════
-- MODULE 3: ARTICULATE
-- ════════════════════════════════════════════════════════════════════════════

update public.modules set
  subtitle    = 'Move from correct sentences to powerful ones. Strip the hedges.',
  description = 'Move from sentence-level correction to paragraph-level power. Rewrite weak statements into strong ones.',
  content     = $body$
# Week 3: Articulate

## Correct sentences are not the same as powerful sentences.

In Week 2, we fixed your tools. In Week 3, we change *what you build with them*.

This week the focus shifts to the second dimension: **Authority Patterns**. You'll take your now-correct sentences and learn to remove the hedges, soft commitments, and permission-seeking that quietly drain your power.

The pattern is consistent across hundreds of professionals I've worked with: brilliant people who say strong things in their native language, then translate them into English with three layers of softeners that make them sound like they're asking permission to have an opinion.

This week, we strip those layers.

You will not lose politeness. You will not become aggressive. You will simply stop apologizing for having a position.
$body$
where slug = 'articulate';

insert into public.exercises (module_id, title, prompt, type, "order") values
  ((select id from public.modules where slug = 'articulate'),
   'The Hedging Audit',
   $p$# Find your own hedges. Count them. Then strip them.

Find **three real emails or messages** you've sent in the last week (in English). For each one, identify every hedge word or phrase. Hedges include:

- "I was wondering..."
- "Maybe we could..."
- "I find it quite interesting..."
- "Perhaps it might be worth..."
- "Could I possibly..."
- "I'm not sure but..."
- "It seems that..."
- "I think..."
- (continue your own list)

Count them. Then rewrite each email with **ZERO hedges**. Don't worry if it feels too direct — that's the point.

Submit:

1. Original email
2. Hedge count
3. Rewritten email — for all three.$p$,
   'text', 1),
  ((select id from public.modules where slug = 'articulate'),
   'From Soft to Decided',
   $p$# Rewrite soft commitments into clear positions

Here are 5 "soft commitment" statements. Rewrite each so it expresses the same intent but with a clear, decided stance.

For each: **Original → Your rewrite**

1. "I find this proposal very interesting and worth considering."
2. "It might be a good idea to look at the timeline again."
3. "I was thinking that perhaps we could try a different approach."
4. "I'm not entirely against the strategy, I just wonder if..."
5. "We should maybe think about whether the budget allows this."

The challenge: keep it professional, but make it clear that **YOU have a position**.$p$,
   'text', 2),
  ((select id from public.modules where slug = 'articulate'),
   'Your Own Power Statements',
   $p$# Pick three real things you need to say at work — and write both versions

Pick the **three most important things** you need to communicate in the next two weeks at work. Could be a decision you need to defend, a position you need to take, a recommendation you need to make.

For each, write the statement **TWICE**:

- **Version A** — How you would normally write it (be honest about your hedging defaults)
- **Version B** — The same statement, stripped of all hedges, expressing only your actual position

Then choose: which one will you actually send? Why?$p$,
   'text', 3)
on conflict (module_id, "order") do update set
  title  = excluded.title,
  prompt = excluded.prompt,
  type   = excluded.type;


-- ════════════════════════════════════════════════════════════════════════════
-- MODULE 4: PRESSURE-TEST
-- ════════════════════════════════════════════════════════════════════════════

update public.modules set
  subtitle    = 'Live AI scenarios. The room pushes back. You hold ground.',
  description = 'Live scenario simulations. The platform plays the client, the board, the difficult negotiator — you respond in real time.',
  content     = $body$
# Week 4: Pressure-Test

## Fluency in calm moments means nothing if you freeze when it matters.

Weeks 2 and 3 built your linguistic and authority foundation in low-stakes conditions. Week 4 is where we add pressure and see what holds.

This week the platform plays the role of clients, board members, senior decision-makers, and difficult counterparts. You respond. Then we examine, response by response:

- Did your **Confidence Behaviors** trigger? (Freeze, Compression, Circumlocution, etc.)
- Did your **authority** hold, or did you slip back into hedging?
- Did your **Language Traps** from Week 1 reappear under pressure?

This is the dimension most coaching programs ignore. We make it the centerpiece.

Expect this week to feel uncomfortable. That's the point. **Discomfort here is your training data.**
$body$
where slug = 'pressure-test';

insert into public.exercises (module_id, title, prompt, type, "order") values
  ((select id from public.modules where slug = 'pressure-test'),
   'The Pushback Scenario',
   $p$# Hold a position against client pressure

**SCENARIO:**

You are presenting a project timeline to a senior international client. You estimate 8 weeks. The client responds:

> *"Eight weeks? That's not going to work for us. We need it in five. I've worked with vendors who deliver this kind of thing in three."*

You believe 5 weeks is unrealistic. You're not willing to compromise quality. But this is an important client and you want to keep the relationship strong.

Write your response. Aim for **4-6 sentences**. You may push back, negotiate, or propose alternatives — but you must hold a clear position.

After submitting, I'll respond with:

- Where your Confidence Behaviors showed up (if any)
- Where your authority held or slipped
- A native-speaker model response for comparison$p$,
   'text', 1),
  ((select id from public.modules where slug = 'pressure-test'),
   'The Unexpected Question',
   $p$# Answer cold, on the spot

**SCENARIO:**

You are in a quarterly review meeting with your leadership team. You've just finished presenting your team's roadmap when the CFO turns to you and says:

> *"If you had to cut one initiative from the roadmap to free up budget for the new market expansion, which one would you cut, and why?"*

You haven't prepared for this. You have 10 seconds to think.

Write your response — **exactly as you would speak it**. Be honest about hesitations, pauses ("umm"), restarts. Don't polish it. Let the response capture the real-time mental load.

After submitting, I'll show you where the response leaks authority — and how to handle the pause itself without losing power.$p$,
   'text', 2),
  ((select id from public.modules where slug = 'pressure-test'),
   'The Difficult Disagreement',
   $p$# Disagree clearly — without becoming combative

**SCENARIO:**

You strongly disagree with a strategic decision your manager has just announced in a meeting with the team. You're confident your analysis is correct. The decision will cost the company time and money if it goes through.

Write what you would say, in that moment, in English. The challenge: **disagree clearly, without undermining your manager and without being passive about your concern.**

Submit your response. I'll respond with a framework for "respectful disagreement at senior levels" calibrated to your style.$p$,
   'text', 3)
on conflict (module_id, "order") do update set
  title  = excluded.title,
  prompt = excluded.prompt,
  type   = excluded.type;


-- ════════════════════════════════════════════════════════════════════════════
-- MODULE 5: COMMAND
-- ════════════════════════════════════════════════════════════════════════════

update public.modules set
  subtitle    = 'From reactive to proactive. Lead the conversation.',
  description = 'From reactive to proactive. Learn to steer, redirect, disagree — and close — without hesitation.',
  content     = $body$
# Week 5: Command

## Reacting well is not the same as leading.

In Week 4, you trained your responses. This week, we change the direction entirely: you stop responding and start **leading**.

Command isn't about dominance. It's about the quiet authority of someone who shapes the meeting, who redirects when the conversation drifts, who closes loops cleanly without anyone noticing they were the one doing it.

This week's drills are deliberately proactive. **You don't wait for the prompt. You lead it.**
$body$
where slug = 'command';

insert into public.exercises (module_id, title, prompt, type, "order") values
  ((select id from public.modules where slug = 'command'),
   'The Redirect',
   $p$# Steer a conversation back on track — without making it obvious

The conversation is going somewhere you don't want it to go. Maybe a client is fixating on a side topic. Maybe a team member keeps re-litigating a past decision. Maybe a senior is heading toward a question you can't yet answer.

You need to redirect — without making it obvious that you're redirecting.

Below are 3 scenarios. For each, write the **exact sentence** you would use to redirect:

1. A client in a kickoff meeting has spent 15 minutes on the visual design — but you haven't yet covered the technical scope.
2. A team member in a project review keeps bringing up a past failure that's no longer relevant.
3. A senior stakeholder is asking about a technical detail you don't have the answer to right now.

Submit your three redirects.$p$,
   'text', 1),
  ((select id from public.modules where slug = 'command'),
   'Disagreement at Authority',
   $p$# Open a disagreement with a senior leader — without going around your manager

You have 5 minutes alone with a senior executive — your manager's manager — before a major decision is finalized. You disagree with the proposed direction. Your manager is supportive of the current plan and you don't want to undermine them.

Write the **opening 30 seconds** of what you would say (about 4-6 sentences).

Constraints:

- You must **clearly state** that you disagree
- You must give **one concrete reason**
- You must **not diminish** their authority or appear to be working around your direct manager
- You must **invite continued conversation** — don't close them off

Submit the opening. I'll respond with a tiered framework for how senior professionals navigate this kind of moment.$p$,
   'text', 2),
  ((select id from public.modules where slug = 'command'),
   'The Strong Close',
   $p$# Close cleanly. Every time.

Most professionals lose their authority in the closing moments. They end meetings with weak phrases — *"so yeah", "I guess we'll see", "let me know if..."* — that undo the work of the previous hour.

This exercise has one task. For each of the following situations, write the **EXACT sentence** you would use to close:

1. Closing a client call after a successful pitch (you want them to feel committed)
2. Ending a tough internal negotiation where you got most of what you wanted
3. Wrapping up a one-on-one with a direct report who needs to leave with clear ownership
4. Closing a board presentation where you've made a strong recommendation

Four sentences total. Each one should leave the other person with a **clear next step** or a feeling of decisive closure.$p$,
   'text', 3)
on conflict (module_id, "order") do update set
  title  = excluded.title,
  prompt = excluded.prompt,
  type   = excluded.type;


-- ════════════════════════════════════════════════════════════════════════════
-- MODULE 6: OWN IT
-- ════════════════════════════════════════════════════════════════════════════

update public.modules set
  subtitle    = 'Integration. Your personal playbook — built from your own data.',
  description = 'Integration. Your personal communication playbook, generated from six weeks of your own performance data.',
  content     = $body$
# Week 6: Own It

## You don't graduate from this program. You take it with you.

Six weeks ago, you had patterns you couldn't see. This week, you turn what you've learned into something portable.

The platform has been collecting data the entire time:

- Every **Language Trap** you stopped falling into
- Every **Authority Pattern** you rewrote
- Every **Confidence Behavior** you learned to interrupt
- Every **Power Statement** you wrote
- Every pressure scenario you survived

This week, all of it becomes your **Personal Communication Playbook** — a custom document, generated from your own work.

It's not a course handout. It's your **operating manual**.

Carry it. Use it. Update it. The work continues — but now you know exactly what you're working on.
$body$
where slug = 'own-it';

insert into public.exercises (module_id, title, prompt, type, "order") values
  ((select id from public.modules where slug = 'own-it'),
   'The Six-Week Reflection',
   $p$# Look back. Mark the shift.

Look back at Week 1. Read your original submissions to the Language Trap Audit, the Authority Pattern Audit, and the Confidence Behavior Reflection.

Now answer:

1. What's different about how you write English **NOW** compared to Week 1?
2. Which one dimension (**Language / Authority / Confidence**) shifted the most for you?
3. Which one is still the most challenging? Why?
4. Recall a specific moment in the last six weeks — at work, in conversation, in writing — when you noticed yourself doing something *new*. Describe it.

This reflection becomes the opening section of your Personal Playbook.$p$,
   'text', 1),
  ((select id from public.modules where slug = 'own-it'),
   'Your Signature Frameworks',
   $p$# Pick your best 10 sentences

Throughout the past 5 weeks, you've written hundreds of sentences. Some of them clicked into place — sentences where you sounded exactly the way you wanted to sound.

Select your **10 best sentences** — the ones that captured the version of yourself you want to be in English from now on.

Submit all 10, with **one line per sentence** explaining the context or situation it would be useful in.

These become your **signature framework library**. You'll have them for every meeting, every email, every pitch from now on.$p$,
   'text', 2),
  ((select id from public.modules where slug = 'own-it'),
   'Your Next Three Months',
   $p$# Plan the 90 days after the program

The platform is most powerful when you don't need it anymore — when the patterns it taught you live inside you. This week we plan that transition.

Write your 90-day plan:

1. **Three specific situations** in the next 90 days where you want to apply what you've learned. (Real meetings, real negotiations, real conversations.)
2. For each situation: **which dimension** are you targeting? Language? Authority? Confidence?
3. **One sentence per situation** describing the version of yourself you want to be IN that moment.
4. **What review rhythm will you keep?** (Will you revisit the playbook weekly? Monthly? Before specific kinds of meetings?)

Submit the plan. Bettina will reply with a personalized review schedule, and you keep the playbook for life.$p$,
   'text', 3)
on conflict (module_id, "order") do update set
  title  = excluded.title,
  prompt = excluded.prompt,
  type   = excluded.type;
