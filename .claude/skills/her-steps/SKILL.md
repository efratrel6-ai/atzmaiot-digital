---
name: her-steps
description: Use when something can ONLY be done by Efrat herself (a setting on GitHub, the domain registrar or Schooler, a login, a payment, approving something), before asking her to do it.
---

# Steps only she can do

## Overview
Make it a very, very simple guided page. She does clicks; you do everything else and check it afterwards. Never ask her to run a command.

## Page (Artifact tool if available, else the same content as a short numbered chat message)
Publish one HTML page: Hebrew, RTL, big readable text, works on a phone. Structure:
1. **Title** and **one line: why** this is needed.
2. **At most 3 cards**, each with **at most 6 short steps**. One action per step, numbered. Exact button and menu names in **bold**, as they appear on screen.
3. A **copy button** next to every value she must paste (a link, a name, a code).
4. **Last line:** "כשסיימת, כתבי לי: עשיתי".

**Template:** copy `example.html` (same folder) and change only the content; keep its style, color tokens and copy-button script.

No secrets on the page (page link is shareable): she types passwords herself on the real site, you never ask her to send them to you. Keep the repo free of it too.

## After she says "עשיתי"
Verify it yourself (public API or `curl`, e.g. the site responds, the setting shows, the run is green) and tell her in one line: "בדקתי, זה עובד" or one simple next step. Never ask her to re-check it. Waiting or problems: `explain-simply`.

## Red flags
| Thought | Reality |
| --- | --- |
| "Just tell her to run this command" | Never. Give clicks, or do it yourself. |
| "10 steps in one card" | Max 3 cards, 6 steps each. Split it. |
| "Describe the button roughly" | Exact name in bold. |
| "She'll tell me if it worked" | You verify it, then tell her. |
| "Ask her to paste the password/token to me" | Never. She enters it only on the real site. |
