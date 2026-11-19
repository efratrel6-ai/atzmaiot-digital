"""Split a long business document into sections for a team member's private knowledge.

Usage: python3 split_doc.py DOC(.docx|.pdf|.txt|.md) OUT_PREFIX
Writes OUT_PREFIX1.json, OUT_PREFIX2.json ... each {"sections":[{"p","t","b"}]} under ~110 KB,
ready to store with ArtifactData set (collection "data/users/me", doc_id "mb1", "mb2" ...).
.docx splits on Heading 1/2; other formats split on short title-like lines, else every ~1500 chars.
"""
import json, re, subprocess, sys

path, prefix = sys.argv[1], sys.argv[2]
secs = []
if path.lower().endswith(".docx"):
    import docx  # pip install python-docx
    from docx.text.paragraph import Paragraph
    d = docx.Document(path); part = ""; cur = {"p": "", "t": "פתיחה", "b": []}
    for el in d.element.body.iterchildren():
        tag = el.tag.split("}")[1]
        if tag == "p":
            p = Paragraph(el, d); t = p.text.strip(); st = p.style.name if p.style is not None else ""
            if not t: continue
            if st == "Heading 1": part = t; continue
            if st == "Heading 2": secs.append(cur); cur = {"p": part, "t": t, "b": []}; continue
            cur["b"].append(t)
        elif tag == "tbl":
            for r in el.iter():
                if r.tag.endswith("}tr"):
                    cells = ["".join(x.text or "" for x in c.iter() if x.tag.endswith("}t")).strip() for c in r if c.tag.endswith("}tc")]
                    cur["b"].append(" | ".join(cells))
    secs.append(cur)
    secs = [{"p": s["p"], "t": s["t"], "b": "\n".join(s["b"])} for s in secs if s["b"]]
else:
    if path.lower().endswith(".pdf"):
        text = subprocess.run(["pdftotext", path, "-"], capture_output=True, text=True).stdout
        text = re.sub("[‎‏‪-‮]", "", text)
    else:
        text = open(path, encoding="utf-8").read()
    lines = [l.strip() for l in text.splitlines() if l.strip() and not re.fullmatch(r"(עמוד|page)\s*\d+", l.strip(), re.I)]
    from collections import Counter
    rep = {l for l, n in Counter(lines).items() if n >= 5}  # running page headers
    lines = [l for l in lines if l not in rep]
    cur = {"p": "", "t": "פתיחה", "b": []}
    for l in lines:
        title_like = len(l) < 45 and not l.endswith((".", ",", ":")) and len(" ".join(cur["b"])) > 600
        if title_like or len(" ".join(cur["b"])) > 2500:
            secs.append(cur); cur = {"p": "", "t": l if title_like else cur["t"] + " (המשך)", "b": [] if title_like else [l]}
        else:
            cur["b"].append(l)
    secs.append(cur)
    secs = [{"p": "", "t": s["t"], "b": "\n".join(s["b"])} for s in secs if s["b"]]

chunks = [[]]; size = 0
for s in secs:
    n = len(json.dumps(s, ensure_ascii=False).encode())
    if size + n > 110000 and chunks[-1]: chunks.append([]); size = 0
    chunks[-1].append(s); size += n
for i, c in enumerate(chunks, 1):
    json.dump({"sections": c}, open(f"{prefix}{i}.json", "w", encoding="utf-8"), ensure_ascii=False)
print(f"{len(secs)} sections -> {len(chunks)} file(s): " + ", ".join(f"{prefix}{i}.json" for i in range(1, len(chunks) + 1)))
