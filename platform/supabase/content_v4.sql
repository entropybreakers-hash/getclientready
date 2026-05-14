-- ============================================================================
-- Get Client Ready — Content V4 (full body + exercise refresh)
-- Run AFTER content_v1.sql (and optionally content_v2.sql; V4 supersedes V2).
-- Idempotent: updates `modules.content` per slug and `exercises.prompt` per
-- (module_slug, "order"). Safe to re-run.
-- ============================================================================
--
-- What changed since V1 / V2 (source: get_client_ready_all_modules_V4.md):
--   * Every module's content body is significantly expanded — cultural
--     context, neuroscience framing, deeper sub-pattern lists, and a
--     first-person reflection from Bettina in Module 6.
--   * Module 1 exercises 1.1 / 1.2 / 1.3 — new V4 prompts with W/S/G
--     dimension tagging and richer reflection prompts.
--   * Module 2 exercise 2.3 — new "Grammar Trap Application" prompt.
--   * Module 3 exercises 3.1 / 3.2 / 3.3 — full V4 versions.
--   * Module 4 exercises 4.1 / 4.2 / 4.3 — full V4 versions.
--   * Module 5 exercises 5.1 / 5.2 / 5.3 — full V4 versions.
--   * Module 6 exercises 6.1 / 6.2 / 6.3 — full V4 versions.
-- ============================================================================

-- ════════════════════════════════════════════════════════════════════════════
-- MODULE 1: DIAGNOSE
-- ════════════════════════════════════════════════════════════════════════════

update public.modules set
  description = 'Identify your exact breakdown patterns across three dimensions — language, authority, and confidence.',
  content     = $body$
# Week 1: Diagnose

## Your starting point isn't your English level. It's your pattern.

Most coaching programs start by assessing your grammar, your vocabulary, your fluency. Get Client Ready does not.

We assume you can already speak English. The reason you froze in your last high-stakes meeting wasn't because you didn't know the words. It was because **something specific broke down** — and until you know exactly what, you'll keep practicing the wrong thing.

This week we find it.

---

## Why most English coaching fails advanced speakers

There's a moment that happens to almost every senior professional working in international English. You're presenting, negotiating, or pushing back. The conversation rises in stakes. And something — you can't quite name what — shifts.

You hear yourself getting smaller. Your sentences shorten. Your authority retreats. You're still speaking English. You're still technically correct. But the version of you in the room is not the version of you who exists in your native language. It's a slightly cautious, slightly compressed, slightly less confident version.

Most English coaching responds to this by working on your *fluency*. Drilling vocabulary. Reviewing grammar. The implicit theory: if you knew MORE English, you wouldn't shrink.

It's the wrong theory.

You don't shrink because you don't know enough English. You shrink because **three specific things are happening at once** — and most coaching addresses only one of them.

---

## The three dimensions of breakdown

In six years of coaching European professionals across psychology, engineering, marketing, and logistics, I've noticed every English-speaking breakdown falls into one of three dimensions. Most people break down in all three — but **one is always dominant**.

### 1. Language Traps — *where German-English transfer breaks*

Your native language is constantly translating itself into English in the background. Most of the time this works. Sometimes it produces sentences that are technically wrong, or technically right but unnatural — and you don't notice, because it sounds right to *you*.

There are three sub-types:

- **Word Traps** — false friends. *Become* and *bekommen*. *Handy* and *phone*. *Gift* and *poison*. *Chef* and *boss*. These slip through unnoticed and silently undermine your credibility.
- **Structure Traps** — German sentence patterns rendered word-for-word into English. *"I am working here since three years."* / *"Please finish this until Monday."* / *"You are coming, or?"*
- **Grammar Traps** — German grammar transferred. *"Some interesting informations."* / *"I have called him yesterday."* / *"If I would know..."* Countable/uncountable, tense logic, conditional structure.

Language Traps are the most "fixable" dimension. But left unaddressed, they create a constant low-level friction that costs you authority every time you speak. Research on German C1+ speakers consistently shows the SAME handful of errors persist into the highest levels — not because the speakers don't know better, but because the underlying instinct never got rewired.

### 2. Authority Patterns — *where your language shrinks your power*

You can be linguistically perfect and still sound like someone who doesn't belong in the room. The reason: certain phrasings carry less authority than others — and German speakers, by default, gravitate toward the lower-authority versions.

Common Authority Patterns:

- **Hedging** — *"Can you tell me when this is ready?"* instead of *"When can I expect this?"*
- **Soft commitment** — *"I find your proposal very interesting"* instead of *"This is exactly what we need."*
- **Permission-seeking** — *"We should maybe think about changing the strategy"* instead of *"I want to change the strategy."*

These are not grammar errors. They are **positioning** errors. They make you sound like a junior asking for buy-in when you are a senior making a decision.

What makes this dimension tricky: in German business culture, the "soft" form is often considered *respectful*. In English-speaking business culture, especially at senior levels, the same softening reads as *uncertain*. The translation is correct. The positioning is wrong.

### 3. Confidence Behaviors — *what your body does under pressure*

The third dimension is what shows up when the stakes rise. Even people with strong English and strong authority phrasing can break here. Five behaviors appear again and again:

- **Circumlocution** — talking around what you want to say because the direct word won't come
- **Freeze** — stopping mid-sentence, going silent, losing the thread
- **Compression** — saying half of what you would say in your native language, leaving the powerful part unsaid
- **Micro-errors** — small grammatical mistakes that you'd never make in writing, suddenly appearing under stress
- **Disjointedness** — sentences that don't quite connect, ideas that don't quite land

These aren't English problems. They are pressure problems that *express themselves through English*. They're also the dimension most coaching programs ignore entirely — and the reason classroom English performance rarely transfers to real meetings.

---

## What you'll discover this week

By Sunday, you'll have a personal pattern report covering all three dimensions. You'll know:

- Which **Language Traps** you fall into most
- Which **Authority Patterns** shrink your power
- Which **Confidence Behaviors** show up under pressure

You'll also know which dimension is *your* dominant one — and that's where the rest of the program focuses your effort.

Everyone freezes for a different reason. Now you find yours.

---

## Why Week 1 is harder than it looks

Most students expect Week 1 to feel like "easy week" — the assessment phase. The real coaching starts in Week 2, right?

Wrong. Week 1 is often the hardest week of the program, because it requires you to LOOK at patterns you've spent years not looking at. The Authority Patterns are easy to see in others. They're painful to see in yourself. The Confidence Behaviors are exactly the parts of your professional self you've worked hardest to hide.

This is normal. Stay with it. Everything we build in the next five weeks depends on the honesty of Week 1.

---

Let's begin.
$body$
where slug = 'diagnose';

-- ─── Module 1 / Ex 1.1 — Language Trap Diagnostic ──────────────────────────
update public.exercises set
  prompt = $p$Below are 15 sentences from real business situations. Each was written or spoken by a German-speaking professional who believed it was correct English. Your task:

For each sentence:
1. Mark it as CORRECT or INCORRECT based on your instinct (don't look anything up)
2. If incorrect, write what you think the correct version is
3. Note which dimension you think it falls into:
   - **W** = Word Trap (false friend)
   - **S** = Structure Trap (German→English mirror)
   - **G** = Grammar Trap (tense, article, preposition, countability)

This is a diagnostic, not a test. The point isn't to get them all right. The point is to find WHERE your instincts and correct English diverge — that's where your unique pattern lives.

Submit all 15. I'll respond with the corrections, your accuracy by category, and your dominant trap pattern.

---

**Word Traps (mostly business false friends)**

1. "Can you send me the actual quarterly numbers?"

2. "My chef has approved the strategy."

3. "Eventually we can extend the contract."

4. "Please become my approval before the launch."

5. "What is your meaning on the new proposal?"

---

**Structure Traps (German sentence patterns translated word-for-word)**

6. "I am leading this division since three years."

7. "We need the deck until Wednesday for the board meeting."

8. "Could you make a screenshot of the conversion funnel?"

9. "We had a productive call, or?"

10. "I want to discuss with you about the budget allocation."

---

**Grammar Traps (tense, article, preposition, countability)**

11. "Do you have any informations from the legal team?"

12. "I have spoken to the client yesterday about the renewal."

13. "She is responsible from the German market expansion."

14. "We received many feedbacks after the product launch."

15. "If I would know the timeline, I would share it with the team."

---

Submit all 15. After your submission, I'll send you:
- A point-by-point correction
- Your accuracy score in each category (W / S / G)
- Your DOMINANT trap dimension (the one we'll focus on most in Week 2)
- Three specific micro-patterns to watch for in Weeks 3-6$p$
where module_id = (select id from public.modules where slug = 'diagnose')
  and "order" = 1;

-- ─── Module 1 / Ex 1.2 — Authority Pattern Audit ───────────────────────────
update public.exercises set
  prompt = $p$Think back to the last 7 days at work. Pick three sentences you've actually said or written in English — sentences where, looking back, you can sense you softened them, hedged them, or asked permission instead of taking position.

Examples of what you're looking for:

- "I was wondering if maybe we could consider..."
- "I find this approach quite interesting..."
- "It might be worth thinking about whether..."
- "Could I perhaps suggest..."

For each one, write:

1. **The sentence you actually said/wrote** (be honest, even if it makes you wince)
2. **Why you softened it** (genuinely — what were you afraid of?)
3. **A stronger rewrite** (your first instinct, no overthinking)

Three sentences total. Don't perfect. Reveal.$p$
where module_id = (select id from public.modules where slug = 'diagnose')
  and "order" = 2;

-- ─── Module 1 / Ex 1.3 — Confidence Behavior Reflection ────────────────────
update public.exercises set
  prompt = $p$Close your eyes for a moment. Recall the last time you spoke English in a high-stakes context and felt yourself break down — even slightly.

Maybe it was:
- A pushback from a client
- A senior questioning your proposal
- An unexpected question in a meeting
- A pitch where you ran out of words
- A negotiation that went somewhere you didn't expect

Now answer these questions honestly:

1. **The situation** — describe it in 2-3 sentences. What happened? What was at stake?

2. **The breakdown moment** — at what exact moment did you feel something shift? What were you about to say (or stop saying)?

3. **What did your body do?** Be specific:
   - Did you go silent? (Freeze)
   - Did you talk around what you wanted to say? (Circumlocution)
   - Did you say less than you would have in your native language? (Compression)
   - Did you make small grammar mistakes you normally don't make? (Micro-errors)
   - Did your sentences stop connecting properly? (Disjointedness)
   - Something else?

4. **The aftermath** — what did you wish you had said? Write it out, in English, the way you wish you'd delivered it.

This is the foundation of everything we'll do for the next five weeks. Be honest. The more accurate you are now, the more precise your training will be.$p$
where module_id = (select id from public.modules where slug = 'diagnose')
  and "order" = 3;

-- ════════════════════════════════════════════════════════════════════════════
-- MODULE 2: ARM
-- ════════════════════════════════════════════════════════════════════════════

update public.modules set
  description = 'Build your arsenal of corrected English structures, targeted to YOUR specific Language Traps from Week 1.',
  content     = $body$
# Week 2: Arm

## You can't perform with broken tools.

Last week we found your patterns. This week we begin the rebuild — and the rebuild starts with language itself.

Most coaching programs put this dimension last. They treat linguistic accuracy as the unsexy foundation everyone wants to skip past on the way to "real authority work." We do the opposite.

Here's why: every Language Trap you fall into costs you something. Not a lot. Often almost nothing visible. But a small leak, every time, across every meeting, every email, every call. Compounded over a quarter, that's hundreds of small moments where the listener flinched — without quite knowing why — and adjusted their perception of you downward.

You can have brilliant ideas and powerful authority phrasing and still be undermined by saying *"I will go home now"* when you mean *"I want to go home now."* The native speaker doesn't correct you. They don't even notice consciously. They register: *this person speaks slightly broken English.* And a slightly broken English speaker is, in their mind, a slightly less senior figure.

This week, we close those leaks.

---

## Why these patterns persist (even at C1+)

There's something important to understand about why these errors don't disappear, even when you've been using English for years.

Your brain treats your native language as the default operating system. English runs as an application on top of it. Under low cognitive load — calm conversation, prepared sentences, written work you can revise — the application runs cleanly. Under high cognitive load — pressure, fatigue, multitasking, emotional stakes — the application drops resources, and the underlying German operating system bleeds through.

This is why Word Traps and Structure Traps reappear at exactly the moments when you most need them not to: in meetings, negotiations, presentations. The patterns aren't unfixable. They simply need to be drilled deeply enough that the English version becomes automatic — not a conscious correction, but an instinct.

That's what this week trains.

---

## What we're rebuilding

This week's work focuses entirely on YOUR specific traps from the Week 1 diagnostic. We are not drilling every English grammar rule. We are drilling the specific ones that broke for you.

### Word Trap repair

If your Week 1 audit showed Word Trap dominance, this week you'll work through your specific false-friend substitutions. The drill is simple but relentless: replace the German-instinct word with the English-correct word, in business context, until the substitution becomes automatic.

The most common business false friends for DACH speakers — and the ones we'll likely drill — include:

- **become / bekommen** → use *get* or *receive*
- **chef / Chef** → use *boss / manager / CEO*
- **eventually / eventuell** → use *maybe / possibly*
- **actual / aktuell** → use *current*
- **control / kontrollieren** → use *check / review*
- **concept / Konzept** → use *proposal / document / plan*
- **meaning / Meinung** → use *opinion / view*
- **handy / Handy** → use *phone / mobile*
- **bald / bald** → use *soon*

The key insight: **you can't think your way out of Word Traps in real time.** Under pressure, the German-instinct word fires faster than your conscious correction. We are training the new instinct, not the new awareness.

### Structure Trap rewiring

If your Week 1 audit showed Structure Trap dominance, this week is about rewriting sentence patterns. German has its own logic — verb placement, time expressions, modal verbs that don't map cleanly to English equivalents. Native English uses different patterns for the same meaning.

The most common Structure Traps:

- **"Since + duration" with present tense** → English requires present perfect continuous. *"I am working here since three years"* → *"I have been working here for three years."*
- **"Until" used as a deadline** → English uses *by* for deadlines. *"Send it until Monday"* means in English *"keep working on it through Monday"*, not *"have it done by Monday."*
- **"Make" used for tasks and creations** → English distinguishes *make* (create something) from *do* (perform an action) from *take* (capture). *"Make a photo"* → *"Take a photo."* *"Make my homework"* → *"Do my homework."*
- **"Or?" as tag question** → English uses inverted auxiliary tags. *"We agreed, or?"* → *"We agreed, didn't we?"*
- **"Discuss about / depend from / interested on"** → English business verbs have specific prepositions that don't match German.

This is harder than Word Trap repair, because you're not swapping one word for another — you're swapping one *mental architecture* for another. We work with specific German→English structural patterns and drill them until the English version comes first.

### Grammar Trap repair

If your Week 1 audit showed Grammar Trap dominance, the work is in tense logic, countable/uncountable, articles, and prepositions. These are the hardest to fix because they're rule-based, not pattern-based — but also the most "graded" in business contexts. Native speakers notice *"an information"* or *"researches show"* more sharply than they notice a Structure Trap.

The high-priority Grammar Traps for advanced DACH speakers:

- **Uncountable business nouns**: information, research, advice, feedback, knowledge, news, equipment, software, furniture, luggage. These are NEVER plural. *"Many informations"* → *"A lot of information."*
- **Present Perfect vs Simple Past**: any specific time reference (yesterday, last week, in 2019) requires Simple Past, never Present Perfect. *"I have called him yesterday"* → *"I called him yesterday."*
- **Conditional structure**: Type II conditional uses past simple in the if-clause, NOT "would". *"If I would know..."* → *"If I knew..."*
- **Subject-verb agreement with uncountables**: *"The information are correct"* → *"The information is correct."*

---

## How this week works

The platform spends less time on theory this week and more on drills. You will do many small exercises rather than three large ones. The repetition is the point.

By Sunday, your dominant trap dimension is significantly repaired. Not perfect — perfection isn't the goal — but solid enough that we can move to the next layer of work without the foundation cracking under pressure.

This is the unsexy week. Trust the process.

---

## What you're NOT doing this week

I want to name what this week is NOT, because the temptation to expand the scope is real.

You are not learning new vocabulary. You are not preparing for IELTS. You are not memorizing irregular verb lists. You are not studying English grammar in general.

You are doing one thing only: identifying YOUR specific traps and drilling YOUR specific replacements until they become reflexive.

If you find yourself opening a grammar textbook this week, close it. The work is in the drills, not in the theory. Theory is what you already have. Theory is what hasn't been enough.
$body$
where slug = 'arm';

-- ─── Module 2 / Ex 2.1 — Word Trap Drill (8 pairs) ─────────────────────────
update public.exercises set
  prompt = $p$For each of the following German→English word traps, write ONE business sentence using the CORRECT English word. The sentence should be one you might actually say at work this week.

Example:
- Trap: handy → phone
- Your sentence: "I'll send you the deck — let me know once it's on your phone."

Your turn:

1. become → get / receive
2. handy → phone
3. chef → boss
4. eventually → maybe / possibly
5. actual → current
6. control → check / review
7. concept → proposal / plan
8. meaning → opinion / view

Submit all 8. I'll respond with feedback on which substitutions are landing naturally and which still feel forced.$p$
where module_id = (select id from public.modules where slug = 'arm')
  and "order" = 1;

-- ─── Module 2 / Ex 2.2 — Structure Trap Rewriting (6 sentences) ────────────
update public.exercises set
  prompt = $p$Below are 6 sentences written in "German-style English". Rewrite each so it sounds like native business English.

After each rewrite, write ONE sentence explaining what changed — not grammatically, but in terms of **impression**. (E.g.: "The original sounds tentative. The rewrite sounds decided.")

1. "I am working with this client since two years."
2. "I will buy a coffee, do you want one?"
3. "Can you make me a screenshot of the dashboard?"
4. "Please send me your feedback until Friday."
5. "We had a good meeting yesterday, or?"
6. "I would like to discuss with you about the new strategy."

The deeper goal: notice how the German-style version subtly reduces your authority, even when grammatically close.$p$
where module_id = (select id from public.modules where slug = 'arm')
  and "order" = 2;

-- ─── Module 2 / Ex 2.3 — Grammar Trap Application ──────────────────────────
update public.exercises set
  prompt = $p$Write a 6-8 sentence email to a senior international stakeholder updating them on a project. The email must use at least three of the following structures correctly:

- **A present perfect statement** (Since X / For X / We have...) — NOT with specific time
- **A countable/uncountable use** (information, research, advice, feedback) in correct singular form
- **A "by" deadline statement** (not "until")
- **A Type II conditional** ("If I knew" — NOT "If I would know")

Submit the email. I'll respond with the specific corrections AND highlight where your authority strengthened or weakened in the rewrite.$p$
where module_id = (select id from public.modules where slug = 'arm')
  and "order" = 3;

-- ════════════════════════════════════════════════════════════════════════════
-- MODULE 3: ARTICULATE
-- ════════════════════════════════════════════════════════════════════════════

update public.modules set
  description = 'Move from sentence-level correction to paragraph-level power. Rewrite your weak statements into strong ones.',
  content     = $body$
# Week 3: Articulate

## Correct sentences are not the same as powerful sentences.

In Week 2, we fixed your tools. In Week 3, we change *what you build with them*.

This week's focus shifts to the second dimension of your diagnostic: **Authority Patterns**. You'll take your own real statements — from emails, meetings, calls — and learn to rewrite them so they carry the weight of someone who belongs in the room.

The pattern is consistent across hundreds of professionals I've worked with: brilliant people who, when they switch into English, become slightly smaller versions of themselves. They hedge. They ask permission. They wrap their actual point in three layers of softening.

This week, we strip those layers.

---

## What softening actually costs you

Let me show you the same intent expressed three ways:

> *"I was wondering if maybe we could perhaps consider revisiting the timeline."*

> *"Could we look at the timeline again?"*

> *"We need to revisit the timeline."*

All three are technically correct. All three are grammatically fine. But they position the speaker very differently:

- The first sounds like someone seeking permission to even ask
- The second sounds like a colleague raising a question
- The third sounds like a decision-maker stating a fact

You are paid — implicitly or explicitly — for which of these positions you occupy in your stakeholders' minds. And here's the trap: in German, business culture often values the first form as *respectful*. In English-speaking business culture, especially at senior levels, the same softening reads as *uncertain*. The translation is technically correct. The positioning is wrong.

---

## A note on cultural translation

The reason this dimension is so difficult to see in yourself is that you're not making a *language* mistake — you're making a *cultural translation* mistake.

DACH business culture has deep roots in respect-orientation. Hierarchy is honored linguistically: the way you address someone signals their position, your position, the formality of the moment. *Sie* vs *du* is just the surface. The deeper structure is that softening, hedging, and indirect requests are interpreted as *politeness*, not weakness. A direct request can read as rude.

Anglo-American business culture — especially at senior levels — operates differently. Hedging at the top doesn't read as polite. It reads as *unsure*. Senior executives speak in declaratives, not questions. They state, they decide, they direct. The English they use isn't more aggressive — it's more *positioned*.

When you translate German politeness into English politeness, the politeness comes through. But so does the positioning. And the positioning makes you sound junior in a room where you're not.

The fix isn't to become rude. It's to learn the *equivalent* of German respect in English business culture — which often looks like brevity, directness, and warmth at the end (not the beginning) of a sentence.

---

## The "earned softness" principle

This week is not about becoming aggressive or abrupt. We are not training you to drop politeness. We are training you to **earn your softness**.

Here's the distinction:

- **Default softness** — hedging because you're afraid of taking position. *"I was wondering if maybe..."*
- **Earned softness** — softening AFTER establishing position, when it serves the relationship. *"I want to revisit the timeline. I know this is short notice — can we talk this afternoon?"*

The first creates the impression you're not sure you're allowed to ask. The second creates the impression you've made a decision and are managing it well. Both end with politeness. Only one carries authority.

Notice where the softness lives in the "earned" version: at the *end*, not the *beginning*. The position comes first. The warmth follows. This is one of the most important micro-patterns to learn — and the single change that most quickly shifts how you sound in English.

---

## The three authority traps we work on

Across your Week 1 audit, you identified your dominant Authority Pattern. This week's drills focus there:

### Hedging
Wrapping a clear statement or question in qualifiers that signal uncertainty.

- *"Can you tell me when this is ready?"* → *"When can I expect this?"*
- *"I think this might possibly work."* → *"This will work."*
- *"It seems like we might need a different approach."* → *"We need a different approach."*

### Soft commitment
Expressing interest or partial agreement when you actually mean strong endorsement or disagreement.

- *"I find your proposal very interesting"* → *"This is exactly what we need."*
- *"There are some good points here."* → *"I agree on these three points. I disagree on this one."*
- *"I see what you're trying to do."* → *"I understand the intent. The execution needs work."*

### Permission-seeking
Asking whether you may take a position you've already decided to take.

- *"We should maybe think about changing the strategy"* → *"I want to change the strategy."*
- *"Would it be okay if I shared a different perspective?"* → *"Here's a different perspective."*
- *"Could I perhaps ask why we chose this direction?"* → *"Help me understand why we chose this direction."*

---

## When softness IS power

There's an exception to everything I've said. Sometimes softness is the most powerful move in the room — but only when used deliberately.

Senior leaders use softness:
- To signal they don't need to push (the position is obvious)
- To give the other person room to come to a conclusion themselves
- To preserve the relationship after a hard decision
- To create suspense before delivering the actual point

The key: senior leaders use softness as a *choice*, not a *default*. They can switch into directness instantly when needed. The reverse — being unable to be soft when it would serve — is rare. The common problem is the reverse: people who are soft because they don't know how to be direct.

This week, we build the direct register. Once you have it, soft becomes a tool. Until you have it, soft is a wall.

---

## What this week feels like

By Sunday, you will have rewritten your own real-world sentences enough times that the strong version becomes your default — and the soft version, when you use it, will be a *choice*, not a habit.

Some of you will find this week uncomfortable. You'll write the direct version and recoil — it feels rude. Your hand will hover over "send" on an email and you'll soften it back. This is the work. The discomfort isn't a sign you're doing it wrong. The discomfort IS the work.

You will not lose politeness. You will simply stop apologizing for having a position.
$body$
where slug = 'articulate';

-- ─── Module 3 / Ex 3.1 — The Hedging Audit ─────────────────────────────────
update public.exercises set
  prompt = $p$Find three real emails or messages you've sent in the last week (in English). For each one, identify EVERY hedge word or phrase:

- "I was wondering..."
- "Maybe we could..."
- "I find it quite interesting..."
- "Perhaps it might be worth..."
- "Could I possibly..."
- "I'm not sure but..."
- "It seems that..."
- "I think..."
- (continue your own list)

Count them. Then rewrite each email with **zero hedges**. Don't worry if it feels too direct — that's the point.

Submit:
1. Original email
2. Hedge count
3. Rewritten email

The goal isn't to use the rewritten version exactly. The goal is to feel the contrast in your own writing.$p$
where module_id = (select id from public.modules where slug = 'articulate')
  and "order" = 1;

-- ─── Module 3 / Ex 3.2 — From Soft to Decided ──────────────────────────────
update public.exercises set
  prompt = $p$Here are 5 "soft commitment" statements. Rewrite each so it expresses the same intent with **clear commitment**.

1. "I find this proposal very interesting and worth considering."
2. "It might be a good idea to look at the timeline again."
3. "I was thinking that perhaps we could try a different approach."
4. "I'm not entirely against the strategy, I just wonder if..."
5. "We should maybe think about whether the budget allows this."

The challenge: keep it professional, but make it clear that YOU have a position.

Bonus: rewrite one of them in "earned softness" form — strong position first, softening at the end.$p$
where module_id = (select id from public.modules where slug = 'articulate')
  and "order" = 2;

-- ─── Module 3 / Ex 3.3 — Your Own Power Statements ─────────────────────────
update public.exercises set
  prompt = $p$Pick the three most important things you need to communicate in the next two weeks at work. Could be: a position on a project, a boundary with a client, a recommendation to leadership, a pushback on a deadline.

For each, write the statement TWICE:

**Version A** — How you would normally write it (be honest about your hedging defaults)

**Version B** — The same statement, stripped of all hedges, expressing only your actual position

Then choose: which one will you actually send? Why?

This isn't an academic exercise. We are training the muscle that decides *when* to soften and *when* to take position — and we are training it on your real life.$p$
where module_id = (select id from public.modules where slug = 'articulate')
  and "order" = 3;

-- ════════════════════════════════════════════════════════════════════════════
-- MODULE 4: PRESSURE-TEST
-- ════════════════════════════════════════════════════════════════════════════

update public.modules set
  description = 'Live scenario simulations. The platform plays the client, the board, the difficult negotiator — you respond in real time.',
  content     = $body$
# Week 4: Pressure-Test

## Fluency in calm moments means nothing if you freeze when it matters.

Weeks 2 and 3 built your linguistic and authority foundation in low-stakes conditions. Week 4 deliberately introduces stakes.

This week the platform plays the role of clients, board members, senior decision-makers, and difficult negotiators. They push back. They ask unexpected questions. They challenge your position. You respond — in real time, in English — and receive feedback on three things:

- **Did your Confidence Behaviors trigger?** (Freeze, Compression, Circumlocution, Micro-errors, Disjointedness)
- **Did your authority hold, or did you slip back into hedging?**
- **Did your Language Traps from Week 1 reappear under pressure?**

This is the dimension most coaching programs ignore. We make it the centerpiece.

---

## What stress actually does to your English

There's a real, physical reason your English degrades under pressure — and understanding it helps you stop treating the breakdown as a personal failure.

When you perceive a high-stakes moment, your nervous system shifts into a stress response. Cortisol rises. Working memory — the brain function that holds 4-7 items in active processing at any time — shrinks. Attention narrows. Resources route toward survival functions, away from cognitive complexity.

Your English lives in cognitive complexity. It requires:
- Active working memory to hold the sentence in progress
- Inhibition of native-language patterns
- Real-time grammar processing
- Lexical retrieval (finding the right word fast)
- Phonological monitoring (how am I sounding?)
- Pragmatic judgment (is this appropriate?)

When working memory shrinks, several of these processes drop simultaneously. The result is exactly what you experience: word-finding slows, German-instinct sentences slip through, and your sense of "control" over the conversation evaporates.

This is normal. This is biological. This is also why classroom English training rarely transfers to real performance — you trained the system in conditions that don't match the conditions you actually perform in.

This week, we recreate those conditions.

---

## Why pressure undoes your training

When you read these scenarios calmly, you'll feel confident. You've done the work. You know the corrections. You know the power phrasings.

Then the scenario will start, and within 10-15 seconds, something will shift. Your shoulders may rise slightly. Your throat may tighten. The English you had 30 seconds ago will feel one step further away.

This is the cortisol response. It's not weakness. It's biology.

The good news: the system can be trained. With repeated, controlled exposure to performance-pressure-with-recovery, your nervous system stops interpreting these moments as survival threats. The cortisol response shortens. Working memory holds longer. The English stays available.

This is the same training principle athletes use. You don't get calmer by avoiding pressure. You get calmer by training inside it.

---

## The three pressure types

We test you across three different types of pressure, because each one breaks different speakers:

### 1. **Pushback pressure**
A counterpart resists what you're saying. They challenge your numbers, your timeline, your proposal. The pressure: *defend without becoming defensive*.

The trap: when pushed back, German speakers often respond by *over-explaining*. They add caveats, qualifications, additional reasons. This signals lack of conviction in the original position. The native English move is to *hold the position and let it stand* — adding more only when specifically asked.

### 2. **Unexpected pressure**
A question lands that you didn't prepare for. The pressure: *think and speak at the same time, without buying yourself fake time with filler words*.

The trap: under unexpected questions, German speakers often fill silence with phrases like *"That's a very good question, let me think..."* or *"In my opinion, I would say that..."* These eat time but signal hesitation. The native move is to use a thinking pause — actual silence — for 2-3 seconds, then deliver a structured response.

### 3. **Disagreement pressure**
Someone with more authority than you is wrong, and the only person in the room who can say so is you. The pressure: *disagree clearly without damaging the relationship or your standing*.

The trap: German speakers often disagree with senior figures by burying the disagreement under so many softeners that the disagreement gets lost. The senior hears "interesting perspective" instead of "I think this is wrong." The native move is *clear disagreement + clear reason + invitation to discuss further*. Three parts, each one clean.

---

## Recovery: the most important skill of this week

Every speaker — even native, even at the highest level — has moments of breakdown. The difference between someone who *seems* confident in English and someone who actually is, isn't that the confident one doesn't break down. It's that they recover faster.

Two recovery techniques to learn this week:

### The 2-second pause
When you feel yourself starting to lose the thread, don't fill the space with words. Stop. Two seconds of silence is barely noticed by listeners — but those two seconds give your working memory time to catch up. Filler words ("um", "actually", "you know") signal struggle. Silence signals control.

### The bridge phrase
When you've lost the sentence entirely, don't try to recover the original. Use a bridge phrase to restart:

- "Let me put that differently."
- "The point I want to make is this:"
- "Let me back up for a moment."

These signal *intentionality* — you're not lost, you're refining. The original native English speakers use these constantly. They sound thoughtful, not flustered.

---

## What we're actually training

We're not training you to perform like a native English speaker under pressure. That's an impossible goal in 4 weeks, and probably not the right one regardless.

We're training you to **stay yourself** under pressure. To not shrink. To not freeze. To not compress. To still sound like the senior, capable person you already are in your own language.

The English part is the medium. The performance under pressure — that's the actual skill.
$body$
where slug = 'pressure-test';

-- ─── Module 4 / Ex 4.1 — The Pushback Scenario ─────────────────────────────
update public.exercises set
  prompt = $p$**SCENARIO:**

You are presenting a project timeline to a senior international client. You estimate 8 weeks. The client responds:

> *"Eight weeks? That's not going to work for us. We need it in five. I've worked with vendors who delivered similar in four — surely you can find a way."*

You believe 5 weeks is unrealistic. You're not willing to compromise quality. But this is an important client.

Write your response. Aim for 4-6 sentences. You may push back, negotiate, or propose alternatives — but **do not hedge or apologize.** Hold the position. Don't over-explain.

After submitting, I will respond with:
- Where your Confidence Behaviors showed up (if any)
- Where your authority held or slipped
- Whether you over-explained or held the position
- A native-speaker model response for comparison$p$
where module_id = (select id from public.modules where slug = 'pressure-test')
  and "order" = 1;

-- ─── Module 4 / Ex 4.2 — The Unexpected Question ───────────────────────────
update public.exercises set
  prompt = $p$**SCENARIO:**

You are in a quarterly review meeting with your leadership team. You've just finished presenting Q3 numbers. Unexpectedly, the CEO asks:

> *"If you had to cut one initiative from the roadmap to free up budget for the new market expansion, which one would you cut and why?"*

You haven't prepared for this. You have 10 seconds to think.

Write your response — exactly as you would speak it. Be honest about hesitations, pauses ("um"), restarts. Try using a 2-second pause instead of filler words. Notice what changes.

After submitting, I'll show you where the response leaks authority — and how to handle the *pause itself* with command.$p$
where module_id = (select id from public.modules where slug = 'pressure-test')
  and "order" = 2;

-- ─── Module 4 / Ex 4.3 — The Difficult Disagreement ────────────────────────
update public.exercises set
  prompt = $p$**SCENARIO:**

You strongly disagree with a strategic decision your manager has just announced in a meeting with five other people. You believe the decision will damage long-term outcomes. You don't want to undermine your manager publicly — but staying silent feels wrong.

Write what you would say, in that moment, in English. The challenge: disagree clearly, without diminishing your manager's authority, **in front of the team**.

Structure to aim for:
1. Clear disagreement (no hedging)
2. One concrete reason
3. Invitation to discuss further

Submit your response. I will respond with a framework for "respectful disagreement at senior levels" that you can apply in real situations going forward.$p$
where module_id = (select id from public.modules where slug = 'pressure-test')
  and "order" = 3;

-- ════════════════════════════════════════════════════════════════════════════
-- MODULE 5: COMMAND
-- ════════════════════════════════════════════════════════════════════════════

update public.modules set
  description = 'From reactive to proactive. Learn to steer, redirect, disagree — and close — without hesitation.',
  content     = $body$
# Week 5: Command

## Reacting well is not the same as leading.

In Week 4, you trained your responses. This week, we change the direction entirely: you stop being the one who responds, and start being the one who **directs** the conversation.

Command isn't about dominance. It's the quiet authority of someone who shapes the meeting rather than reacting to it. Who can steer a conversation away from a dead end. Who can redirect a difficult question without dodging it. Who can disagree with senior people without diminishing them — or themselves.

This week's drills are deliberately proactive. You don't wait for the prompt. You lead it.

---

## The shift most speakers never make

Almost every English coaching program — and almost every speaker who's worked hard on their English — operates in **reactive mode**. They're trained to handle the questions they receive, the pushback they encounter, the topics that arise.

This is good, and necessary. But it has a ceiling.

The speakers who actually run rooms — who close deals, who shape strategy, who lead the conversation in international contexts — operate in **proactive mode**. They:

- Set the frame of the meeting before anyone else does
- Steer away from unhelpful directions before they take hold
- Disagree early, clearly, while there's still time to influence the outcome
- Close conversations with explicit next steps, not vague nice-to-meet-yous
- Pause silently — and the silence becomes a tool

You can have perfect grammar and powerful authority phrasing and still be in reactive mode. The shift to proactive is a separate skill — and most German-speaking professionals never make it, because the cultural default in German business is to respond rather than direct.

This week, we train the shift.

---

## How DACH leaders sound vs Anglo leaders

Listen to a senior DACH executive speaking in their native language. They are precise. They are thorough. They establish context first, then conclusion. Sentences are often long, hierarchical, building toward the point.

Listen to a senior Anglo executive at the same level. They lead with conclusion. Context follows only as needed. Sentences are shorter, more direct, often punctuated with strategic pauses. The point is at the top, not the bottom.

This is not about which culture is "better." It's about what carries authority in *which room*. When you bring DACH-style speech into an Anglo executive meeting, your accuracy and depth can read as *taking too long to get to the point*. The same content, restructured, lands differently.

This week's training is partly cultural translation: not changing what you mean, but changing *where in the sentence your meaning sits*. Conclusion first. Reasoning supports. Brief.

---

## The three command moves

Three specific moves anchor proactive command. We drill each one this week:

### 1. **The Redirect**
The conversation is going somewhere unhelpful. You move it elsewhere — *without making the move obvious*. This is the most subtle command skill, and the one senior leaders use most often.

There's a vocabulary of redirect openers:

- "Before we go further on that, can I bring us back to..."
- "That's worth a separate conversation. For now, the question is..."
- "Let me park that and come back to it. The decision in front of us is..."
- "I want to make sure we land on X before we move to Y."

Notice the pattern: you *acknowledge* without engaging, then redirect. You don't dismiss. You also don't follow.

### 2. **The Disagreement at Authority**
Someone more senior than you is wrong. You disagree — clearly, without diminishing them, in a way that invites further conversation rather than shutting it down. This is the highest-stakes English a non-native speaker can deliver.

The structure that works:

1. **Acknowledge what you understand**: "I see what we're optimizing for here."
2. **State the disagreement clearly**: "I see it differently."
3. **Give one concrete reason**: "Because [X]."
4. **Invite continued thinking**: "Can we talk through it?"

Four parts. None of them hedged. The hedging instinct will try to insert softness — *"I'm not sure but"*, *"I might be wrong but"*. Resist. The structure itself is respectful. The structure doesn't need softeners.

### 3. **The Strong Close**
You end the conversation in a way that creates clarity, commitment, or both. You do not end with *"Well, I think that's everything, unless anyone..."*

The closing toolkit:

- **Commitment close**: "So we're agreed: [X] by [date]. Anything I'm missing?"
- **Decision close**: "Based on this, my recommendation is [X]. Are we proceeding?"
- **Open-loop close**: "Two things I'm holding open: [A] and [B]. I'll come back to you Friday with both."
- **Energy close**: "Good. I have what I need. Talk Thursday."

The common element: clarity at the end. Senior speakers do not end on uncertainty. They end on direction.

---

## The silence move

There's a fourth command move that doesn't fit the three above, but is more powerful than all of them combined.

It's silence.

Senior speakers pause. They pause before answering. They pause inside answers. They pause to let a point land. They pause to let someone else speak. They pause to think.

German speakers, in English, often experience silence as a vacuum that must be filled. Silence feels uncomfortable. The instinct is to keep talking — to fill, to add, to soften. This is the single biggest tell of a non-native speaker operating under stress.

Native senior speakers use silence as command. Two to four seconds of strategic silence:
- Forces the other person to speak first
- Signals you are not rushing
- Makes whatever you say next more weighted
- Demonstrates control of the room

This week, practice this: when you finish a sentence, *stop*. Do not add. Do not soften. Do not check that they heard. Just stop. Watch what happens.

---

## What this week is building toward

By Sunday, you've practiced each of these moves enough that the next time the moment arrives in your real life, the English version is *available* — even if you don't always choose to use it.

Most people don't go from Week 5 to commanding every room they enter. The point is that the *option* now exists. Where you used to react automatically, you can now choose. Where you used to soften by default, you can now hold position. Where you used to fill silence, you can now use it.

That choice — that range — is what we mean by command.
$body$
where slug = 'command';

-- ─── Module 5 / Ex 5.1 — The Redirect ──────────────────────────────────────
update public.exercises set
  prompt = $p$The conversation is going somewhere you don't want it to go. Maybe a client is fixating on a minor concern. Maybe a meeting is veering off track. Maybe a question is leading you somewhere strategically unwise.

You need to redirect — without making it obvious that you're redirecting.

Below are 3 scenarios. For each, write the EXACT sentence you would use to redirect:

1. A client in a kickoff meeting has spent 15 minutes on the visual design — but you haven't yet aligned on scope, which is the more urgent topic.

2. A team member in a project review keeps bringing up a past failure that's no longer relevant — but is taking time away from the actual decisions on the table.

3. A senior stakeholder is asking about a technical detail you don't have the answer to right now — but you also don't want to look unprepared.

Submit your three redirects. I'll respond with native variations and the small phrasing shifts that make redirects feel natural rather than dismissive.$p$
where module_id = (select id from public.modules where slug = 'command')
  and "order" = 1;

-- ─── Module 5 / Ex 5.2 — Disagreement at Authority ─────────────────────────
update public.exercises set
  prompt = $p$You have 5 minutes alone with a senior executive — your manager's manager — before a major decision is made. You believe the proposed direction is wrong. They have 5 minutes to listen to you.

Write the opening 30 seconds of what you would say. (About 4-6 sentences.)

Use the 4-part structure:
1. Acknowledge what you understand they're optimizing for
2. State the disagreement clearly (no hedge)
3. Give one concrete reason
4. Invite continued conversation

Submit. I'll respond with a tiered framework for how senior professionals navigate this exact scenario, plus where your structure held or slipped.$p$
where module_id = (select id from public.modules where slug = 'command')
  and "order" = 2;

-- ─── Module 5 / Ex 5.3 — The Strong Close ──────────────────────────────────
update public.exercises set
  prompt = $p$Most professionals lose their authority in the closing moments. They end meetings with weak phrases — *"Well, I think that's everything for today, unless anyone..."*

This exercise has one task. For each of the following situations, write the EXACT sentence you would use to close — with strength.

1. Closing a client call after a successful pitch (you want them to feel committed)
2. Ending a tough internal negotiation where you got most of what you wanted
3. Wrapping up a one-on-one with a direct report who needs to leave with clear ownership
4. Closing a board presentation where you've made a strong recommendation

Four sentences total. Each one should leave the other person with a clear next step or feeling.

Bonus: rewrite ONE of them using strategic silence — what you would say, then a deliberate pause. Describe what the pause does.$p$
where module_id = (select id from public.modules where slug = 'command')
  and "order" = 3;

-- ════════════════════════════════════════════════════════════════════════════
-- MODULE 6: OWN IT
-- ════════════════════════════════════════════════════════════════════════════

update public.modules set
  description = 'Integration. Your personal communication playbook, generated from six weeks of your own performance data.',
  content     = $body$
# Week 6: Own It

## You don't graduate from this program. You take it with you.

Six weeks ago, you had patterns you couldn't see. This week, you turn what you've learned into a system you can use for the rest of your career.

The platform has been collecting data the entire time:

- Every Language Trap you stopped falling into
- Every Authority Pattern you rewrote
- Every Confidence Behavior you learned to interrupt
- Every Power Statement you wrote
- Every pressure scenario you survived
- Every redirect, disagreement, and close you practiced

This week, all of it becomes your **Personal Communication Playbook** — a custom document, generated from your own data, that captures your specific signature, your specific frameworks, and your specific power phrases.

It's not a course handout. It's your operating manual.

---

## What integration actually means

The trap most coaching programs fall into at this point is *celebration*. They wrap up. They give certificates. They send the student off with warm wishes and assume the work continues invisibly.

It usually doesn't. Without explicit integration, six weeks of growth fades within three months. You'll revert. Not to where you started — but partway back. The new patterns will become harder to access under pressure, and the old patterns will reassert themselves quietly.

Integration is the work of preventing that reversion. This week is designed for exactly that.

We do three things:

1. **You consciously map what changed.** Not vaguely — specifically. Which sentences you stopped writing. Which moves you started using. What your English now does that it didn't do six weeks ago.

2. **You externalize what's now internal.** You build a playbook — a written artifact — that holds the specific frameworks, phrases, and patterns that worked for YOU. You will not remember them all permanently. The playbook does.

3. **You schedule your next 90 days.** Not for "continued learning" in the abstract. For specific, scheduled moments where you will apply what you've built — and a review rhythm to keep the playbook alive.

---

## The 4-month reality

Here's what the research and my own observation across hundreds of students shows about post-program months 4-6.

**Month 1 after the program**: high. You're aware, the patterns are fresh, you're catching yourself in real-time. You feel different. You write differently. People notice.

**Month 2-3**: stabilization. The new patterns feel less effortful. You stop catching yourself consciously — they're just running. This is the goal state. But it's also where complacency starts.

**Month 4-5**: silent slippage begins. Without active reference back to the playbook, micro-patterns drift back. You might not notice. But your spouse, your manager, or a colleague might.

**Month 6+**: significant reversion if there's no maintenance practice. The deeper patterns hold (language traps, basic authority structure), but the more subtle moves — earned softness, strategic silence, redirect command — fade.

The fix is simple and almost no one does it: **a monthly review of your playbook**. Twenty minutes. You read it. You notice what's drifted. You re-anchor.

That's it. Twenty minutes a month — and the six weeks you invested compounds for years instead of fading in months.

---

## Why the playbook is yours, not mine

Every coach has a library of frameworks, models, phrases. Most coaching programs end by giving the student access to that library, hoping they'll use it.

We do the opposite. Your playbook contains YOUR phrases. The ones you wrote, refined, used. They are in your voice. They are calibrated to your specific work, your specific challenges, your specific authority patterns.

This is why the playbook works when generic course handouts don't. You don't have to translate it into your own context — it already lives in your context.

---

## A note from me

Six weeks ago, when we first met on our discovery call, I asked you what you wanted from this program. Most of you said some version of: "I want to feel more confident in English."

I noticed I never promised you that. What I promised was: you'd know exactly what your patterns are, and you'd have the tools to interrupt them.

Confidence is the byproduct, not the goal. Confidence comes from competence — from knowing, specifically, what you're working with. Most professionals carry generalized anxiety about their English. *"Maybe it's not good enough."* The anxiety is generalized because the problem is generalized. They don't know what to fix.

You do now.

When you walk into your next high-stakes meeting, you won't carry vague "maybe I'm not good enough." You'll carry specific knowledge: "I tend to hedge in Authority Pattern X. I tend to freeze under Pressure Type Y. Here are the moves I've trained for both."

Specific knowledge replaces generalized anxiety. That's the work. That's what you take with you.

— Bettina

---

## The work continues — but you know what you're working with

You will not finish this week with everything solved. You'll finish it knowing exactly what you're still working on, what you've already shifted, and what tools you have to keep moving.

That clarity — knowing precisely where you are in your English performance journey, and having the artifacts to support the next chapter — is what we mean by "Own It."

Welcome to the rest of your career.
$body$
where slug = 'own-it';

-- ─── Module 6 / Ex 6.1 — The Six-Week Reflection ───────────────────────────
update public.exercises set
  prompt = $p$Look back at Week 1. Read your original submissions to the Language Trap Audit, the Authority Pattern Audit, and the Confidence Behavior Reflection.

Now answer:

1. What's different about how you write English NOW compared to Week 1?

2. Which one dimension (Language / Authority / Confidence) shifted the most for you?

3. Which one is still the most challenging? Why?

4. Recall a specific moment in the last six weeks — at work, in conversation, in writing — where you noticed yourself doing something differently because of this program. Describe it.

This reflection becomes the opening section of your Personal Playbook.$p$
where module_id = (select id from public.modules where slug = 'own-it')
  and "order" = 1;

-- ─── Module 6 / Ex 6.2 — Your Signature Frameworks ─────────────────────────
update public.exercises set
  prompt = $p$Throughout the past 5 weeks, you've written hundreds of sentences. Some of them clicked into place. They felt powerful, accurate, native. You'll have noticed.

Select your 10 best sentences — the ones that captured the version of yourself you want to be in English. They can come from any week, any exercise.

Submit all 10, with one line per sentence explaining the context or situation it would be used in.

These become your signature framework library. You'll have them for every meeting, every email, every high-stakes moment going forward.$p$
where module_id = (select id from public.modules where slug = 'own-it')
  and "order" = 2;

-- ─── Module 6 / Ex 6.3 — Your Next Three Months ────────────────────────────
update public.exercises set
  prompt = $p$The platform is most powerful when you don't need it anymore — when the patterns it taught you become automatic. To get there, you need a deliberate next 90 days.

Write your 90-day plan:

1. **Three specific situations** in the next 90 days where you want to apply what you've learned (a presentation, a negotiation, a difficult conversation, etc.).

2. **For each situation:** which dimension are you targeting? Language? Authority? Confidence?

3. **One sentence per situation** describing the version of yourself you want to be IN that moment.

4. **What review rhythm will you keep?** (Will you revisit the playbook weekly? Monthly? Before major events?)

Recommended: a 20-minute monthly review of your playbook. Schedule it now, in your calendar, for the same day each month. Six months out.

Submit the plan. I will reply with a personalized review schedule, and you keep the playbook permanently in your account.$p$
where module_id = (select id from public.modules where slug = 'own-it')
  and "order" = 3;

-- ============================================================================
-- DONE. V4 content fully applied. Verify with:
--   select slug, length(content) from public.modules order by slug;
--   select m.slug, e."order", left(e.prompt, 60) from public.exercises e
--     join public.modules m on m.id = e.module_id
--     order by m.slug, e."order";
-- ============================================================================
