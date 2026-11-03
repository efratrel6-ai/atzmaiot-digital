---
name: keep-design
description: Use when Efrat asks to change text, a price, a testimonial, an image, an FAQ answer, or to add a new section, button or video to the page, or when a diff touches CSS/layout.
---

# Change content without design drift

## Overview
The page is one hand-designed file (`atzmaiot/index.html`, CSS inlined). The design is finished and must not drift. Content changes touch content only; new things reuse what exists.

## Content change
1. Find the exact spot: `grep -n "<exact old text>" atzmaiot/index.html` (match must be unique; use `-o` with a short context, the lines are huge).
2. Replace only the words inside the existing tags. Keep tags, classes, attributes, emojis, line breaks and spacing as they were.
3. Hebrew text stays RTL; if mixing numbers/English, do not add direction tags unless the old text had them.
4. Check: `git diff --stat` shows one file, a few changed characters.

## New section / item
1. Find the most similar existing section (e.g. a new FAQ item: copy an existing one in `#faq`; a new review: copy one in `#reviews`; a new lesson: copy one in `#curriculum`).
2. Copy its markup exactly, change only the text/media. Reuse its classes (`reel`, `read`, `g1`/`g3`/`g4`, `t-l`, `t-m`, `lead`, `cap`, `quote`...). New unique `id` only if needed.
3. **No new CSS, no inline `style`, no new fonts or colors.** If the pattern truly does not exist, stop and ask Efrat whether she wants a new look; propose, do not build.
4. Place it where she wants; look at it on desktop and phone width.

## Images and video
Only add a file she provided. Keep its name ASCII; do not recompress or resize existing media. Prefer a separate file next to the page over inlining more into the 3 MB file; ask if unsure.

## Red flags
| Thought | Reality |
| --- | --- |
| "Looks nicer if I adjust the spacing/color" | She did not ask. Don't. |
| "Reformat/prettify the file" | Rewrites 3 MB, hides real changes. Never. |
| "Write a small CSS rule for the new part" | Reuse an existing class. Otherwise ask. |
| "Fix a typo I noticed" | Mention it to her; change only if she says yes. |
| "Update the year/price everywhere" | Change only the places she named; list others and ask. |
