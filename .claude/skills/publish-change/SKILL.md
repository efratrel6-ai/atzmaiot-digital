---
name: publish-change
description: Use when Efrat asks for any change to the site (text, price, link, image, new section, fix) or says "תעלי את זה", "עדכני את האתר", before touching any file.
---

# Publish a change safely

## Overview
Every change goes through one loop, so the live site is never broken. Pushing to `main` deploys only if the automatic checks pass. You do all steps; Efrat only describes what she wants and approves.

## Status lines (one per stage, simple Hebrew, warm, never more)
| Stage | Tell Efrat (adapt) |
| --- | --- |
| Understand | "הבנתי, מתחיל לעבוד על זה." |
| Change | "עושה את השינוי עכשיו, רק במקום שביקשת." |
| Checks | "האתר עובר בדיקות, זה לוקח כדקה-שתיים." (or "עכשיו אני בודק שהכפתור לתשלום עדיין עובד") |
| Publish | "מעלה לאתר, עוד רגע זה באוויר." |
| Verified live | "זה באוויר! בדקתי ועכשיו בעמוד מופיע ..." |
Delays or failures: use `explain-simply`; always end with what happens next and that she needs to do nothing (unless true).

## The loop
1. **Understand.** Restate the request in one simple Hebrew sentence. Unclear or touches more than she said? Ask one question. Design-looking requests: read `keep-design`.
2. **Sync.** `git status` clean? `git pull --ff-only`. Not clean and not yours: stop and ask.
3. **Minimal edit.** Exact-string edit of only the requested spot. Then `git diff --stat` and `git diff` (use `--word-diff` for the 3 MB file): the diff must contain only the requested change. Anything else: undo it.
4. **Test locally if possible.** If `package.json` exists: `npm ci` (first time) then `npm test` and `npm run check`. If it does not exist yet, open `atzmaiot/index.html` in a browser (or a quick local static server) and look at the changed area, desktop and phone width.
4b. **Visual snapshots.** If the test suite has screenshot baselines and a snapshot test fails: update the baselines (the project's update-snapshots command) ONLY when Efrat asked for a visual change, and only after looking at the new screenshots to confirm they show exactly what she asked. For a text/link/content-only request, a snapshot failure means unintended drift: undo the cause, never update.
5. **Show Efrat** (simple Hebrew): "שיניתי X ל-Y. שום דבר אחר לא השתנה." Wait for her OK unless she already said exactly what and to publish.
6. **Commit** with a clear Hebrew message, one change per commit: `git commit -m "עדכון מחיר הקורס ל-..."`.
7. **Push to main:** `git push origin main`. Rejected? `git pull --rebase` then re-run tests. Never `--force`.
8. **Watch the run:** `gh run list --limit 1`, then `gh run watch <id> --exit-status`. No `gh` or not logged in? Never ask her to install or log in to anything. Poll the public API (no login needed): `curl -s "https://api.github.com/repos/efratrel6-ai/atzmaiot-digital/actions/runs?per_page=1"` and read `status` / `conclusion` (wait until `completed` and `success`; sleep 20s between polls). For a failure, read the run's `html_url` page or the jobs API for the cause.
9. **Verify live** (after the deploy finishes; Pages can lag 1-2 minutes): `curl -sI https://efrat-cohen.co.il/atzmaiot/` returns 200, and `curl -s` the page contains the new text (or open it in a browser and look). Check the registration button link still works.
10. **Report** in simple Hebrew: what changed, that it is live, link to the page.

## If the checks fail
Read the log: `gh run view <id> --log-failed`. Name the cause. Fix the real cause in a new commit and push once. If you cannot fix it fast: `git revert <sha>`, push, and tell Efrat the site stayed as it was and why.

## Red flags
| Thought | Reality |
| --- | --- |
| "The test is flaky, skip it / add `[skip ci]`" | Never. A red check means the site would break. Fix or revert. |
| "Snapshot test fails, just update the baseline" | Only for a visual change she asked for. Otherwise it caught drift. |
| "Re-run the failed run to see" | Read the log first. Re-running hides the cause. |
| "Force push, it's faster" | Never. Use `git revert`. |
| "I'll tidy the formatting while here" | That is design drift and a 3 MB diff. Don't. |
| "Ask her to run `npm test`" | She never runs commands. You do. |
| "Push now, verify later" | Not done until the live page is checked. |
| "Deploy workflow is missing, edit `.github`" | Not yours. Tell her the publishing helper is not ready and stop. |
