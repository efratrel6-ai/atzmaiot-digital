---
name: site-health
description: Use when Efrat says the site looks broken, slow, a button or payment link does not work, something looks wrong on the phone, the site is down, or for a periodic health check.
---

# Site health

## Overview
Check the real live site the way a customer sees it, explain in plain Hebrew, and fix or roll back safely. Read-only until you know the cause.

## Checks (run all, in this order)
1. **Live and up:** `curl -sI https://efrat-cohen.co.il/atzmaiot/ | head -1` is 200; the root `https://efrat-cohen.co.il/` redirects to it. Also `https://www.` form if it is used.
2. **Latest publish:** `gh run list --limit 5`. Red or stuck run = real finding.
3. **Tests:** `git pull --ff-only`, then `npm test` and `npm run check` if `package.json` exists.
4. **Links:** extract all `href="http` links from `atzmaiot/index.html` and `curl -sIL` each. Must-work: registration/payment (`my.schooler.biz`), `wa.me/972523115049`, Instagram. Only check them; never click "buy" or submit forms.
5. **Phone view:** open the page at 390px width in a browser (Playwright if present), scroll the sections, look for overflow, cut text, missing images, broken video, wrong RTL direction.
6. **Compare:** if it worked before, `git log --oneline -10`; the last change before the problem is the suspect.

## Decide
| Finding | Action |
| --- | --- |
| Last change broke it | `git revert <sha>`, then `publish-change` steps 7-10 |
| Payment link dead | Tell Efrat now, first. Do not guess a new link; ask her for the correct one |
| Hosting/domain/DNS/certificate issue | Not in the repo. Explain simply, give her one concrete next step |
| Cannot reproduce | Say so, ask what phone/browser she used, one question |
| All fine | Say it is fine and what you checked |

## Report (simple Hebrew)
"בדקתי: האתר עולה, הכפתור עובד, בטלפון נראה תקין" or "מצאתי בעיה: ... תיקנתי / החזרתי את העדכון האחרון". No technical words. Never paste logs at her.

## Red flags
| Thought | Reality |
| --- | --- |
| "Fix it quickly without telling her" | Always tell her what you found and did. |
| "Edit the page to work around it" | Revert instead; no design edits during a health check. |
| "Test the payment by paying" | Never. Only check the link responds. |
| "Delete the failing test" | Never. |
