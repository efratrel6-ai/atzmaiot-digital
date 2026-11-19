---
name: my-team
description: Use when Efrat asks anything about her personal AI team page ("הצוות שלי", a team member by name such as תמר, נועה, ליה, יואל, ירון, יעל, תמיר, הילה, דנה, שירן, the team group, the task board "לוח המשימות", "ישיבת צוות", reminders, voice messages, attachments), wants to add a member or connect a skill or document to one, or reports that sending is stuck.
---

# My Team: working guide

## What it is

A private claude.ai Artifact page: https://claude.ai/artifact/WZRWRSwfMFEiekPB4X7pVD. Source is `my-team/team.src.html`, and the portraits are in `my-team/photos.json`.

Build with `python3 tools/build.py`. This writes `build/team.html`, which is the file you publish, plus `build/local.html` and `build/check.js`.

The page is Hebrew RTL, with a cream dotted background, sage rings and a plum accent, matching the look of her original screenshots. Keep this design.

**Declared capabilities.** Pass these explicitly only if you change them, otherwise omit them so they carry forward:

```
{"sample":{"images":true},"db":{},"user":{},"dictation":{},"tts":{},
 "mcp":{"servers":[{"server":"Google Calendar","tools":["list_events","create_event"]}]}}
```

## The team

| id | Name | Role | Color | Voice | Extra knowledge / skills |
|---|---|---|---|---|---|
| tamar | תמר (lead, featured card) | מנהלת הצוות · תכנון שבועי | #7a2e4a | buttery | Google Calendar (reads the week, suggests slots, "להכניס ליומן" button). Runs "בקרה של תמר" and the strategy meeting. |
| noa | נועה | שיווק וקריאייטיב | #d6457a | airy | Israeli social content skill + Israeli paid ads skill (both condensed into her `how`). Private kb `noa` (marketing guide from the master document). Full marketing brief `mb1`/`mb2` via section lookup. |
| lia | ליה | שירות לקוחות ומכירות | #2a9d8f | glassy | Sales: follow-ups, objections, "sale is an invitation". |
| yoel | יואל | טכנולוגיה | #3b6fd8 | rounded | Simple tech help. Site problems go to "צוות הפיתוח". |
| yaron | ירון | כספים ותמחור | #5e8c4a | rounded | No binding tax advice; refers to an accountant. |
| yael | יעל | ניהול זמן | #e09f1f | airy | Google Calendar, like Tamar. |
| tamir | תמיר | אסטרטגיה ופיתוח עסקי | #6b4fbb | rounded | Revenue goal, product ladder, product development. |
| hila | הילה | התייעלות ואוטומציות | #0f8fb3 | glassy | ManyChat, AI tools, templates. |
| dana | דנה | שיתופי פעולה ו-UGC | #e0632f | airy | Brand outreach, media kit. |
| shiran | שירן | משאבי אנוש · טיסות | #a0527a | glassy | HR for freelancers + Israeli flight finder skill. She builds Google Flights, Skyscanner and KAYAK links and never invents a price. **Temporary avatar (letter ש)**: swap it in when Efrat sends a photo. |

There are also two non-member board owners: `efrat` (#8a6a50) and `shared` (#5f6b73).

**Adding a member.**
1. Add an entry to `TEAM`. It needs `id`, `name`, `f` (feminine true/false), `role`, `about`, `skills` (chip texts) and `how` (the persona and the condensed skill knowledge).
2. Crop the photo to a square of about 280px JPEG, and add it to `photos.json` under the same id.
3. Add the color to `OCOL` and the voice to `VOICE`.
4. Add the member to Tamar's routing list in her `how`.

**Connecting a skill.** The page cannot call Claude Code skills. To connect one, load the skill, then condense the parts relevant to Efrat (Hebrew, practical, with the rules about not inventing things) into the member's `how`. Use a template literal when the text has quotes.

## Features

- **Private chat per member, and a group chat.** In the group, Tamar answers first and routes, then 1-3 relevant members answer. It uses `sample.json` and returns `{replies:[{id,text}],tasks:[...]}`.
- Every persona gets the following, in this order: `EXCEL` (the "advise like the best, recommend + first step + what to measure, not a yes-person" block), then `KB.all` (the business file), then `KB[id]`, then `tasksContext`. The answer may end with a `[משימות]` block, which becomes "להוסיף ללוח" cards.
- **Calendar (Tamar and Yael).** These two get the next 8 days of the calendar. The answer may end with `[יומן]` lines in the form `start | end | title`. These become cards, and **nothing is written to the calendar without her tap**.
- **Attachments.** Images go to Claude (`images:true`). txt/csv/md/json are read as text. PDF is read with pdf.js 3.11.174 and docx with mammoth 1.6.0, lazily loaded from jsDelivr. Files are capped at 30k characters and time out after 45 seconds. Sending while a file is being read waits until reading finishes.
- **Voice.** There is a dictation mic button and a speaker button ("🔊 להשמיע") on replies. A voice message makes the replies auto-play, with a different voice per member. **Neither works in the iPhone app** (both resolve null there), so the page instead shows a tip to use the keyboard mic.
- **Task board** (`#board`): a shared db collection `tasks`, with docs `{owner,title,status,due,note,remind,remindCal,src,created,updated}`.
  - Statuses: todo / doing / stuck / rework / done.
  - Tiles: open, not started, in progress, stuck, needs more work, late, reminders due, done this week.
  - Filter chips for each member, in the member's color.
  - A cards/table toggle, remembered in localStorage.
  - Due date can be edited inline. A reminder can go "להוסיף ביומן" (creates a calendar event with a popup at that time) or "רק בלוח".
  - "בקרה של תמר" gives an AI review of the board.
- **Strategy meeting** ("💡 מה כדאי לי לקדם עכשיו?"). It runs one `sample.json` call on the `complex` tier, using the business file, the marketing guide, brief sections, the board and the calendar. It returns a summary, a weekly focus, and 2-3 items for each of dev (Tamir), mkt (Noa), str (Tamar) and sales (Lia), each with an "add to board" button. The result is saved to the private doc `brief`.

## Data model (artifact db)

Everything personal is under `data/users/<uid>/`. Each viewer's tree is private, even from the owner.

| Path | Holds |
|---|---|
| `chat-<memberId>` / `chat-group` | `{messages:[{r:"me"\|"them",who,t,at,a?,v?,ev?,tk?}],updated}`, last 80 messages |
| `kb` | `{all:{text}, noa:{text}}`. `all` is the business file (revenue goal, launch numbers, prices to confirm). `noa` is the marketing guide. |
| `mb1`, `mb2` | `{sections:[{p,t,b}]}`: the full marketing brief Efrat wrote for Noa, 93 sections including 40 content units. Noa gets ~7k chars of the best-matching sections per message (`mbPick`), always plus "איך נשמע טקסט של אפרת" and "עריכה שמקרבת לקול שלה". |
| `brief` | The last strategy meeting. |
| `debug` | The troubleshooting log (see below). |

The shared collection `tasks` is the board.

- **Paths:** a doc path has an even number of segments. `data/users/<uid>/chats/x` is invalid, which was an early bug.
- **Writing as Claude:** use `ArtifactData` with collection `data/users/me` and doc_id `kb`/`mb1`/..., and pass `if_version` when the doc already exists.
- **Source documents** are Efrat's uploads: "המוח החיצוני של העסק" (master PDF, 54 pages) and "Efrat_Cohen_Marketing_Brief.docx". They are **not in the repo, on purpose**, because the repo is public. If she sends an updated version, rebuild the kb/mb docs from it.

## Lessons learned (read before debugging "השליחה תקועה")

1. **Snapshot data is frozen on iOS.** On iOS, `snapshot.data()` returns read-only objects. Pushing onto `messages` threw "Attempted to assign to readonly property", so the send arrow silently did nothing. **Always clone** with `JSON.parse(JSON.stringify(...))` before you mutate: chats, `BRIEF`, `TASKS`. The local Chrome mock did not show this until the mock froze its data.
2. **Streamed answers can stop without resolving in the iPhone app.** A watchdog finishes the answer after 12 seconds without new text, and aborts the call so the next message is not queued behind it. There is a 2-minute hard timeout, and a ■ stop button while busy.
3. **A message without an answer shows "🔄 לקבל תשובה"** (`send(true)` retries without re-adding the message).
4. **The `complex` tier is too slow for chat.** Use the default tier in chats. Keep `complex` only for the meeting and Tamar's review.
5. **Long prompts slow Noa down.** Keep `mbPick` at about 7k for private chat and 7k for the group.
6. **The troubleshooting log.** `dlog()` writes events (boot, send_click, call_start, first_text, call_resolved/rejected, stalled_finish, send_error, page errors) to the private doc `debug`, together with the user agent. When she says something is stuck, ask her to try once and write "ניסיתי". Then read the doc with `ArtifactData` `get` (`data/users/me`, `debug`). Don't guess.
7. The local file preview needs `<meta charset="utf-8">` (`build/local.html` has it), and `[hidden]` needs explicit `display:none!important` rules for classes that set `display`.

## Testing locally

1. `python3 tools/build.py`
2. `cd build && python3 -m http.server 8765 &`
3. `node ../tools/mock-test.js [dir-with-db-json-files]`

The mock fakes `window.claude` with a frozen-data db (like iOS) and a fake `sample`. The optional directory comes from `ArtifactData list ... out_dir`. Edit the steps at the bottom of the mock to test what you changed. Kill the server afterwards.

## Open items (as of 19.11.2026)

- **Monday.com skill.** Recommended for Tamar + Hila only. We are still waiting for Efrat's answer (1: Tamar and Hila, 2: everyone). Note that it is advice only, because no Monday connector is connected.
- **Shiran's photo.** Not received yet.
- **Other members' slices of the documents.** Offered, not yet asked for. For example: pricing/products for Yaron, objections and course FAQ for Lia.
- **Reminders in the calendar.** Not yet confirmed working on her device.
- Uriah (a commenter on the page) can see the board, but needs edit access to change it. Efrat sets that from the page's Share menu.
