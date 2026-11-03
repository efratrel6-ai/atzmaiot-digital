---
name: clean-code
description: Use when adding or changing any HTML, CSS, JS, link, button, image or section in the site, before the edit and again before committing.
---

# Clean code (clean table)

## Overview
Every NEW change leaves the table clean: no dead code, no leftovers, no copies. The look of the page never changes because of cleanup.

## New code checklist
- Semantic HTML (real `<a>`, `<button>`, headings in order), not clickable `<div>`s.
- Reuse existing classes and patterns (`keep-design`). No new CSS or JS unless she asked for new behavior. No inline `style` unless neighbouring markup already does it there.
- No duplicated blocks: if you copy a pattern, change every text in it; remove placeholders.
- Every `<img>` has meaningful Hebrew `alt` (empty `alt=""` only if purely decorative). Links have readable text, `rel="noopener"` with `target="_blank"`, and a real URL (no `#` or `javascript:`).
- Nothing unused added: no commented-out code, no spare ids/classes, no console logs, no TODOs.
- **Adds behavior (new link, button, section)? Add a check in `tests/`** following the existing tests (e.g. the link exists and responds, the section is visible). Content-only edits need no new test.

## Boy-scout rule
Touching a spot for her request? You may fix an obvious small leftover right there (missing `alt`, broken markup, duplicate id). Nothing beyond that area, never a big refactor, never anything that changes how the page looks: visual tests must stay green. Spotted something elsewhere? Mention it to Efrat in one line; do not fix it.

## Cheap checks
`grep -n -o -E '.{0,60}PATTERN.{0,60}' atzmaiot/index.html`; never read the whole file or print `data:image` lines. Before commit: `git diff --stat` stays small, `npm test` green.

## Red flags
| Thought | Reality |
| --- | --- |
| "Let me tidy this whole section" | Only the spot you touch. Mention the rest. |
| "No test, it's just a button" | New behavior gets a check in `tests/`. |
| "Add a tiny style for it" | Reuse a class or ask. |
| "Leave the old copy commented out" | Delete it. Git remembers. |
| "Skip alt, no time" | Always add it. |
