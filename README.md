# Get Client Ready — Landing Page

Static landing page for **Get Client Ready** by Bettina Baranyi / Entropy Breakers.
Domain: `getclientready.entropybreakers.com`.

## Stack

- HTML5 (semantic)
- Tailwind CSS via CDN (`https://cdn.tailwindcss.com`)
- Vanilla JS (reveal-on-scroll, FAQ accordion, mobile menu, smooth scroll)
- No build step — deploy any directory-serving host (GitHub Pages, Vercel static, Netlify, FTP).

## File structure

```
/
├── index.html         # Main landing page
├── impressum.html     # Legal — placeholders Bettina must fill before going live
├── datenschutz.html   # GDPR / DSGVO privacy page
├── CNAME              # Custom domain pin for GitHub Pages
├── assets/
│   ├── bettina-hero.png    # Hero portrait (also used in About section as fallback)
│   ├── bettina-final.png   # Background photo of the Final CTA section
│   └── favicon.svg
└── README.md
```

## What changed vs. the previous version

This version is a surgical rebuild of the previous Framer-style page. All copy preserved unless noted.

1. **Beige palette** — every orange (#E87030 etc.) replaced with warm beige (`#C9A876`). Buttons, eyebrows, italic accents, stat numbers, week labels, badges.
2. **Integrity rewrites** — no fabricated client counts or testimonials.
   - Stats row: `100+ CLIENTS COACHED` → `SINCE 2019`, `DACH EXECUTIVES` → `DESIGNED FOR DACH`.
   - "Difference" card: `100+ hours` → `6+ years of real-world coaching expertise`.
   - About Bettina bullets fully rewritten.
   - Testimonials section (A.K. / L.M. / S.B.) **completely removed** — placeholders were fake and stay out until real DACH cohort results exist.
3. **New section** — `From The Founder` (founder's note) between The Platform and Investment.
4. **FAQ** replaced with 6 new questions from the brief (school vs system, AI explanation, level prerequisite, time commitment, company billing, refund policy).
5. **Pricing CTAs** point to Bettina's Google Calendar: `https://calendar.app.google/EvfpzhSXvaz6Pi4G9`.
6. **Tipography** swapped from Playfair Display / DM Sans to Cormorant Garamond / Inter as specified.
7. **Legal pages** added: `impressum.html`, `datenschutz.html` (DSGVO-compliant template).

## Open placeholders Bettina must fill before going live

- `impressum.html` — exact address, Bezirkshauptmannschaft, Bundesland-Wirtschaftskammer.
- `datenschutz.html` — same address.
- Footer LinkedIn / Instagram URLs (currently `#`).
- `assets/bettina-about.jpg` — currently the About section reuses the hero photo. Drop a square (~600×600) `bettina-about.jpg` (or `.png`) and update `<img src>` on the About section to swap.

## Local preview

```bash
# any static server works
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deployment

The repository deploys to `getclientready.entropybreakers.com` via the existing setup (see `CNAME`). After a merge to `main`, the site updates automatically.

If you want to test before pushing live, either:
- Open a staging URL (e.g. a Vercel preview from this branch), or
- Push to a feature branch and view via the GitHub Pages preview workflow.

## Notes for editors

- All copy lives in `index.html` directly — no CMS, no templating. Edit the file and re-deploy.
- Beige palette is centralised in two places: the `tailwind.config` block and the `:root` CSS variables at the top of `<style>`. Change `#C9A876` there to swap brand colour everywhere.
