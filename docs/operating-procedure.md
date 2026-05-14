# Get Client Ready — Operating Procedure

> A working reference for Bettina. The day-to-day of running the platform.

---

## Quick links

| | URL |
|---|---|
| Landing page | https://getclientready.entropybreakers.com |
| Student platform | https://app.entropybreakers.com |
| Supabase Dashboard | https://supabase.com/dashboard/project/zqjvwddbfedtnsqpjomk |
| Vercel project | https://vercel.com/baranyibettina-5070s-projects/getclientready |
| Anthropic Console | https://console.anthropic.com |
| Stripe Dashboard | https://dashboard.stripe.com |
| GitHub repo | https://github.com/entropybreakers-hash/getclientready |

---

## 1. New paying student — onboarding (10 minutes)

Run this checklist top-to-bottom every time you onboard someone.

### a. Confirm payment
- Stripe Dashboard → Payments → check the new payment landed
- Note: their **email**, **name**, and **tier purchased** (Sprint / Shift / Reframe)

### b. Create the auth user
1. Supabase Dashboard → **Authentication → Users → Add user → Create new user**
2. Email: the student's email from Stripe
3. Auto-generate a strong temporary password (or use a password manager)
4. Check **"Auto Confirm User"** (skip the email-confirmation step)
5. **Save the temp password** somewhere safe — you'll send it to the student manually

The `handle_new_user` trigger automatically creates a `profiles` row for them with default values (Sprint tier, current_week=1).

### c. Set their profile
Go to `/admin/students/<their-user-id>` (find them via the `/admin` student list).

Update:
- **First name** + **Last name** (Supabase SQL Editor, or wait for next "Edit profile" UI iteration)
- **Tier**: change from default `sprint` to whichever they bought
- **Status**: `active`
- **Current week**: 1 (default — leave alone)

If you need to set name/tier via SQL right now:
```sql
update public.profiles
set first_name = 'Vorname', last_name = 'Nachname', tier = 'shift'
where email = 'student@example.com';
```

### d. Send welcome message
On `/admin/students/<their-user-id>`, click **"Send welcome message →"**:
- Enter their WhatsApp number (country code + digits only)
- Enter the temp password you saved
- Click **"Open in WhatsApp →"** — pre-filled message with login URL + their email + password
- Send the WhatsApp

The message contains the link to `https://app.entropybreakers.com/login` and their credentials.

---

## 2. Daily routine (~30–60 minutes per active cohort)

### Morning check
1. Open `/admin` — the "Feedback queue" card shows pending submissions
2. Click **"Open queue →"** for the full list

### For each pending submission
1. Open the row → split-screen editor opens
2. Click **"✨ AI draft"** (top-right of the editor) — Claude generates a draft in your voice
3. Read the draft, edit ruthlessly (you're the human signal)
4. Adjust pattern tags if needed (use the controlled vocabulary chips, or add custom)
5. Click **"Send feedback"** → status flips to `feedback_ready` automatically
6. The `on_feedback_inserted` trigger handles status. Student sees it on their dashboard on next load.

**If you've already given feedback on every Week N exercise**: `current_week` auto-advances to Week N+1. No manual click needed.

---

## 3. Week 1 deliverable — Pattern Report

When a student finishes all three Week 1 exercises and you've fed them back:

1. `/admin/students/<id>/pattern-report?type=diagnostic_week1`
2. Click **"✨ AI draft"** — Claude reads their 3 Week 1 submissions + your feedback and drafts the 5-section pattern report
3. Edit, save
4. The student sees it on their `/profile` page

The pattern report is what locks in the personalisation for the rest of the program.

---

## 4. Week 6 deliverable — Playbook

When a student reaches Week 6 and finishes all exercises:

### Generate the markdown
1. `/admin/students/<id>/playbook`
2. Scroll past the PDF upload form
3. Click **"✨ Generate playbook"** — Claude reads all 6 weeks of their work + feedback + Week 1 pattern report, drafts the full 7-section playbook (takes 30–60s)
4. Edit ruthlessly in the markdown editor

### Convert to PDF
1. Click **"Copy markdown"** in the AI draft section
2. Open Pages / Word / Google Docs / Notion (whatever you prefer for nice typography)
3. Paste, format (apply your fonts/colours, optionally add the Get Client Ready logo at the top)
4. **Export as PDF**

### Upload + deliver
1. Back in the platform, scroll up to the upload form
2. Drag-drop the PDF
3. Click **"Save playbook"**
4. Student sees the download link on `/playbook` immediately

---

## 5. Mid-program: changing a student's week manually

Auto-advance kicks in when ALL exercises in their current week have feedback_ready. If you need to override:

1. `/admin/students/<id>` → Progress card → tap the week chip (1–6) → click **Save**

Or skip a week if a student wants to fast-forward.

---

## 6. Useful SQL queries

All in Supabase Dashboard → SQL Editor.

### Pending submissions across all students
```sql
select s.id, p.first_name, p.last_name, e.title, s.submitted_at
from submissions s
join profiles p on p.user_id = s.user_id
join exercises e on e.id = s.exercise_id
where s.status = 'pending_review'
order by s.submitted_at asc;
```

### Quiz pattern analytics (landing page diagnostic)
```sql
select * from quiz_pattern_summary;
```

### Active students by week
```sql
select current_week, count(*) as students
from profiles
where status = 'active' and is_admin = false
group by current_week
order by current_week;
```

### A student's full submission history
```sql
select e.week_number, e."order", e.title, s.status, s.submitted_at
from submissions s
join exercises e on e.id = s.exercise_id
where s.user_id = '<student-user-id>'
order by e.week_number, e."order";
```

---

## 7. When something breaks

### Student says "I can't log in"
1. Supabase → Auth → Users → find them
2. If user exists: send a password reset (your branded template kicks in)
3. If they need a manual reset: edit user → Reset password → send new temp via WhatsApp

### "AI draft" button errors
Most likely: `ANTHROPIC_API_KEY` env var is unset or invalid.
- Vercel → Settings → Environment Variables → check it's there
- Anthropic Console → check the key is active and has credit

### Page won't load (500 error)
1. Vercel → Logs → check the error
2. If it's a Supabase query error, screenshot the log and message me

---

## 8. Cost monitoring

| Service | When to check | How |
|---|---|---|
| Anthropic | Weekly | Console → Usage. ~$0.05–0.50 per AI draft. |
| Supabase | Monthly | Dashboard → Settings → Billing. Free tier ≤ 50k MAU + 500MB. |
| Vercel | Monthly | Dashboard → Usage. Hobby is free for low traffic. |
| Stripe | Per payment | 1.4% + €0.25 per EU card transaction. |

---

## 9. Things that are NOT yet automated (manual heads-up)

| What | Current state | Future |
|---|---|---|
| Email when feedback arrives | Student gets nothing automatic | Phase: Resend integration |
| Email when student submits | You get nothing automatic | Phase: Resend integration |
| Stripe → auto-create user | Manual (you create in Supabase Auth) | Phase: Stripe webhook |
| Audio transcription | Audio plays back; you listen | Phase: Whisper API |
| Playbook PDF generation | You convert markdown → PDF manually | Phase: in-platform PDF |

---

## 10. Sanity tests before launch / after major changes

- [ ] Quiz on landing → end → check Supabase `quiz_results` got a row
- [ ] Create a test user → sign in → submit something → admin sees it in queue
- [ ] AI draft works on feedback editor
- [ ] AI draft works on pattern report
- [ ] AI draft works on playbook
- [ ] Reset password email arrives with your brand
- [ ] Mobile responsive at 375px viewport
