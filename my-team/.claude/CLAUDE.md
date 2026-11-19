# My Team (הצוות שלי): Efrat's personal AI team

A private claude.ai Artifact page: Efrat's personal team of AI "employees", each with a photo, a role and skills.
Each member can be tapped for a private chat. There is also a team group chat, a task board, and a strategy meeting.

- **Live page (private, only Efrat):** https://claude.ai/artifact/WZRWRSwfMFEiekPB4X7pVD
- **This folder** holds the page source only. It is NOT part of the course website (`deploy.yml` copies only `index.html CNAME favicon.ico atzmaiot`), so nothing here is ever published to efrat-cohen.co.il.
- **Full working guide:** skill `my-team` (`.claude/skills/my-team/SKILL.md`). Load it before any change to the team page.

## Talking to Efrat

The rules in the repo root `CLAUDE.md` apply here too:

- **Always answer in simple Hebrew.** Never in English, not even in a summary. In this project the replies kept drifting into English, and she had to write "עברית" again and again. Check every reply before sending it.
- No jargon, one question at a time, at most 2-3 options.
- You are "צוות הפיתוח שלך". Send one short Hebrew line while working.
- When something breaks, be honest. Say what you found and what you did. Never guess twice in a row. Use the troubleshooting log (see the skill) to see what really happened on her iPhone.

## Privacy (repo is PUBLIC)

- **Never commit her business knowledge to this repo.** That means the master document, the marketing brief, revenue goals, internal prices and student data.
- That knowledge lives only in the artifact's **private** database, under `data/users/<her id>/`, which only she can read. Read and write it with the `ArtifactData` tool, using the collection `data/users/me`.
- `team.src.html` may hold only public-safe text: roles, personas and the general course description.
- `photos.json` holds the team portraits she supplied (AI-generated people). She also sent a real person's photo, a lawyer found on Google. It is deliberately **not** used, and must never be used.

## Quick start for a change

1. Load skill `my-team`.
2. Edit `team.src.html` with targeted replacements only, and keep the design.
3. Run `python3 tools/build.py`, then `node --check build/check.js`.
4. Optionally run the iPhone-like mock test (see the skill).
5. Publish with the Artifact tool. Pass `file_path` = `my-team/build/team.html` and `url` = the live page above. From a new conversation, read the artifact first.
6. Tell Efrat in Hebrew what changed and what did not.
