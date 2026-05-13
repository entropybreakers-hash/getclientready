-- ============================================================================
-- Seed the 6 weekly modules. Run after schema.sql.
-- Bettina edits `content` later — the strings here are placeholders matching
-- the landing page copy.
-- ============================================================================

insert into public.modules (week_number, slug, title, subtitle, description, content, "order") values
  (1, 'diagnose', 'Diagnose',
   'Find the exact pattern that''s costing you authority.',
   'The platform runs your diagnostic. You complete real scenarios and the AI identifies your exact breakdown pattern — where your English loses power, and why. Everyone freezes for a different reason. You find yours on day one.',
   '# Week 1 — Diagnose\n\nThis week you discover *the* pattern that''s costing you authority. By Friday you''ll know which of the four core patterns (Translation Lag, Structure Gap, Identity Shift, Freeze Pattern) you fall into — and which exact moment to look for it in next week.\n\n## How this week works\n\n1. Read the short module below.\n2. Complete two diagnostic exercises (one written, one short audio).\n3. Bettina writes your personal pattern report by end of week.\n\n## What we''re listening for\n\n_(Bettina to fill in.)_',
   1),
  (2, 'arm', 'Arm',
   'Twelve high-performance frameworks that hold under pressure.',
   '12 sentence frameworks drilled through interactive exercises calibrated to your diagnostic results — so you are not practicing what you already know. You are building what you need.',
   '# Week 2 — Arm\n\n_(Bettina to fill in.)_',
   2),
  (3, 'articulate', 'Articulate',
   'Rewrite the answers that didn''t land the first time.',
   'The platform presents your own previous responses and shows you where you shortened, hedged or lost the thread. The AI helps you rewrite them — completely, powerfully — until nothing gets left on the table.',
   '# Week 3 — Articulate\n\n_(Bettina to fill in.)_',
   3),
  (4, 'pressure-test', 'Pressure-Test',
   'Live AI simulations. The room pushes back. You hold ground.',
   'Live scenario simulations. The AI plays the client, the board member, the difficult negotiator. It pushes back. It asks the unexpected. You respond in real time — and receive instant feedback on every answer.',
   '# Week 4 — Pressure-Test\n\n_(Bettina to fill in.)_',
   4),
  (5, 'command', 'Command',
   'Steer, redirect, disagree — and close without hesitation.',
   'Proactive drills: how to steer, redirect, disagree with authority and close without hesitation. The AI tracks your response patterns week-on-week and shows you the measurable shift in your confidence scores.',
   '# Week 5 — Command\n\n_(Bettina to fill in.)_',
   5),
  (6, 'own-it', 'Own It',
   'Your personal playbook — generated from your own data.',
   'The platform generates your personal communication playbook from six weeks of your own performance data — your patterns, your breakthroughs, your high-performance frameworks. Built by the AI. Built from you. Yours permanently.',
   '# Week 6 — Own It\n\n_(Bettina to fill in.)_',
   6)
on conflict (week_number) do nothing;

-- Optional: one starter exercise per module, so the UI has something to render.
insert into public.exercises (module_id, title, prompt, type, "order")
select m.id, 'The freeze moment',
       'Write about the most recent time your English failed you in a high-stakes moment. What did you want to say? What came out? Aim for 300+ words — specifics matter more than polish.',
       'text', 1
from public.modules m where m.week_number = 1
  and not exists (select 1 from public.exercises e where e.module_id = m.id);
