---
name: team-builder
description: Builds a personal AI "team" page in Hebrew for a small-business owner. Each member has a photo, a role and skills; the page has a private chat with each member, a team group chat, a task board with reminders, and a "what to push now" strategy meeting. Starts with a friendly one-question-at-a-time interview. Use when someone asks for "צוות אישי", "צוות עובדים של AI", "דשבורד צוות", or wants AI employees they can chat with.
---

# Team Builder: a personal AI team page

You build a private claude.ai Artifact page: "הצוות שלי". It works like a WhatsApp-style team:
- Tap a member for a private chat. Members answer in character, using the member's role, skills and the owner's business knowledge.
- A team group chat. The manager answers first and routes; 1-3 relevant members add their part.
- A task board (cards/table, a color per member, due dates, reminders that can go to Google Calendar).
- A strategy meeting: "💡 מה כדאי לי לקדם עכשיו?", with recommendations in product, marketing, strategy and sales. Each recommendation has an "add to board" button.
- Attachments (images, PDF, Word, text), voice messages (desktop only), and an optional Google Calendar connection.

The design is fixed in the template: Hebrew RTL, cream dotted paper, sage rings, plum accent. Don't redesign it unless asked.

## Talking to the owner

- **Hebrew only, simple and warm. No technical words.** Say "הדף", "הכפתור", "האזור הפרטי שלך". Never say "artifact", "database", "JSON" or "deploy".
- **One question at a time**, with 2-3 options.
- While working, send one short line, for example "עכשיו אני מכין את התמונות של הצוות".
- **Never invent facts about her business.** Never use a real person's photo that she found online. If she offers one, say kindly why not and suggest an AI-generated portrait or a letter avatar.

## Steps

1. **Interview.** Follow `references/interview.md` exactly: one question at a time, then a summary, then wait for "כן".
2. **Write `config.json`** (schema below). Start from `references/default-team.json`: copy the roles she chose, then set the names, `f` (feminine), `lead` and `cal`. Adapt `about`, `skills` and `how` to her business.
   - `how` is the member's brain. Write it in second person: who you are, how you work, rules (no invented prices or numbers), and the condensed knowledge from any skill she connected.
   - Keep `{{OWNER}}` where the owner's name goes. The build replaces it.
3. **Photos (optional).** Save them as `photos/<memberId>.jpg`. The build crops each to a square near the top-center and makes a 280px JPEG. Members without a photo get a letter avatar in their color.
4. **Build.**
   ```
   python3 scripts/build_team.py config.json build photos
   node --check build/check.js
   ```
5. **Optional check.** Run `cd build && python3 -m http.server 8765 &`, then `IDS='["<id1>","<id2>"]' node ../scripts/mock_test.js`. It fakes the viewer with frozen data, the way the iPhone app behaves. Each member should show `busy:false` and a reply. Stop the server afterwards.
6. **Publish** with the Artifact tool:
   - `file_path` = `build/team.html`
   - `icon` = `"people"`
   - `capabilities` = the contents of `build/capabilities.json`. The build adds Google Calendar only if a member has `cal:true`.
   - A one-line Hebrew `description`.
   - On later changes, republish to the same `url`.
7. **Seed private knowledge** (only if she gave documents). Use the `ArtifactData` tool with the artifact `url`, collection `data/users/me`:
   - doc `kb` = `{"all":{"text":"<business file ≤4000 chars>"}, "<memberId>":{"text":"<that member's guide>"}}`.
   - For a long marketing document, run `python3 scripts/split_doc.py DOC mb_`, then set docs `mb1`, `mb2`, ... from the produced files (a `batch` write). The member in `roles.marketing` gets about 7k characters of the best-matching sections per message.
   - This data is private to her. It must never be written into the page or any shared file.
8. **Hand over** with the "אחרי הבנייה" part of the interview file.

## config.json schema

```json
{
  "owner": "מיכל",
  "biz": "2-4 public-safe sentences about the business, third person",
  "team": [
    {"id":"manager","name":"מאיה","f":true,"role":"מנהלת הצוות · תכנון שבועי","lead":true,"cal":true,
     "color":"#7a2e4a","voice":"buttery",
     "about":"what I do for you, first person, one sentence",
     "skills":["chip 1","chip 2","chip 3"],
     "how":"persona + rules + condensed skill knowledge; may use {{OWNER}}"}
  ],
  "roles": {"marketing":"marketing","sales":"sales","strategy":"manager","product":"strategy"},
  "stack": ["manager","marketing","sales","finance"],
  "alwaysSections": []
}
```

- **`id`** is short latin letters, unique. Exactly one member has `lead:true`; without one, the first member is the lead.
- **`voice`** is one of `buttery`, `airy`, `glassy`, `rounded`. **`color`** must be readable with white text.
- **`roles`** maps the fixed features to members: which member reads the long marketing document (`marketing`), and who owns each area of the strategy meeting. A missing role falls back to the lead.
- **`alwaysSections`** lists section titles from the long document that must always go along, such as a voice and tone section.

`references/example-config.json` is a complete small example.

## How the page works (for later changes)

- **Source.** `assets/team-template.html` has the placeholders `__CONFIG__`, `__PHOTOS__` and `{{OWNER}}`. Edit the template, then rebuild.
- **AI answers** come from the `sample` capability. They use the default tier in chats; the strategy meeting and the lead's board review use `complex`.
- **Prompt order:** persona, then the `EXCEL` block (advise like the best: one recommendation, a first step, what to measure; never a yes-person), then `kb.all`, then `kb[id]`, then the open tasks.
  - Answers may end with `[משימות]` lines (`owner | title`), which become "להוסיף ללוח" buttons.
  - Calendar members may add `[יומן]` lines (`start | end | title`), which become "להכניס ליומן" buttons.
  - Nothing is written anywhere without her tap.
- **Private storage** (per viewer, private even from the artifact owner) lives under `data/users/<uid>/`:

  | Doc | Holds |
  |---|---|
  | `chat-<id>`, `chat-group` | chats |
  | `kb` | business file and member guides |
  | `mb1..` | long document sections |
  | `brief` | last strategy meeting |
  | `debug` | troubleshooting log |

  The shared collection `tasks` is the board.

## Hard-won lessons (keep them in any edit)

1. **iOS returns frozen snapshot data.** Always clone (`JSON.parse(JSON.stringify(...))`) before mutating chats, tasks or the brief. Otherwise the send arrow silently does nothing.
2. **Streamed answers can stop without resolving in the iPhone app.** There is a watchdog that finishes after 12 seconds of no new text and aborts the call, a 2-minute timeout, a ■ stop button, and a "🔄 לקבל תשובה" button for a message left unanswered.
3. **A db doc path has an even number of segments.** For example, `data/users/<uid>/chat-marketing` is valid, but `.../chats/marketing` is not.
4. **Dictation and speech return null in the iPhone app.** The page shows a keyboard-mic tip there instead.
5. **When she reports "נתקע",** ask her to try once and write "ניסיתי". Then read the private doc `debug` (`ArtifactData get`, `data/users/me`, `debug`) and fix the real cause. Don't guess.
6. **The owner of a shared page cannot read a viewer's private data,** and Claude reads it as the user it runs for. So each friend builds and seeds her **own** copy.
