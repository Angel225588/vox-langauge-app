# Vox V0 Landing Page

A standalone, single-file, mobile-first landing page to capture language-practice speakers for the V0 "Conversation Test." Self-contained `index.html` — no build step, no dependencies. Deploys anywhere static.

## Purpose
One job: turn "I want to get fluent" into a **WhatsApp tap** so the founder can hand-match pairs.
Single CTA. Zero friction (`wa.me`, no form, no download). See doc page 8 "Go-to-Market".

## Before going live — set the WhatsApp number
Open `index.html`, find the CONFIG block at the bottom (in `<script>`), and replace:

```js
const WHATSAPP_NUMBER = "1XXXXXXXXXX";   // international format, digits only, no + or spaces
```

Example: a UK number `+44 7911 123456` becomes `"447911123456"`.
Optionally tweak `PREFILLED_MESSAGE`.

## Run locally
Just open the file, or serve it:
```bash
cd landing && python3 -m http.server 8080   # http://localhost:8080
```

## Deploy (pick one, all free)
- **Vercel** — `vercel` in this folder, or drag-and-drop on vercel.com
- **Netlify** — drag the `landing/` folder onto app.netlify.com
- **GitHub Pages** — push and enable Pages on the folder

## Design
Uses the Vox brand tokens from `constants/designSystem.ts` (Electric Blue #0036FF → #00A3FF,
teal #06D6A0, deep-space #0A0E1A, glassmorphism, DM Sans + Source Sans 3). Isolated from the
Expo app by design — see the CMS/architecture decision ("shared platform, isolated instance").

## Success metric
Not signups. The real signal is downstream: the **Double Opt-In Rate** from the matched
sessions (target ≥ 50%) — tracked in the "Vox V0 - Conversation Test Tracker" Google Sheet.
