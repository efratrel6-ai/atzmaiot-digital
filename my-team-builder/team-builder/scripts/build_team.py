"""Build a personal team page from config.json (+ optional photos).

Usage:
  python3 build_team.py CONFIG.json OUT_DIR [PHOTOS_DIR]

PHOTOS_DIR holds one image per member, named by member id (noa.jpg, tamar.png ...).
Members without a photo get a colored letter avatar.
Writes OUT_DIR/team.html (publish this), OUT_DIR/local.html (local preview),
OUT_DIR/check.js (run: node --check OUT_DIR/check.js) and OUT_DIR/capabilities.json.
"""
import base64, io, json, os, re, sys

here = os.path.dirname(os.path.abspath(__file__))
tpl = open(os.path.join(here, "..", "assets", "team-template.html"), encoding="utf-8").read()
cfg_path, out = sys.argv[1], sys.argv[2]
photos_dir = sys.argv[3] if len(sys.argv) > 3 else None
cfg = json.load(open(cfg_path, encoding="utf-8"))

owner = cfg["owner"].strip()
for m in cfg["team"]:
    assert re.fullmatch(r"[a-z][a-z0-9_]{1,20}", m["id"]), "member id must be short latin letters: " + m["id"]
    for k in ("name", "role", "about", "skills", "how"):
        assert k in m, f"member {m['id']} is missing {k}"
    m.setdefault("f", True)
if not any(m.get("lead") for m in cfg["team"]):
    cfg["team"][0]["lead"] = True

photos = {}
if photos_dir and os.path.isdir(photos_dir):
    from PIL import Image  # pip install pillow
    for m in cfg["team"]:
        for ext in (".jpg", ".jpeg", ".png", ".webp", ".heic", ".JPG", ".PNG"):
            p = os.path.join(photos_dir, m["id"] + ext)
            if os.path.exists(p):
                im = Image.open(p).convert("RGB")
                w, h = im.size; side = min(w, h)
                left = (w - side) // 2; top = int((h - side) * 0.25)  # faces sit a little above center
                im = im.crop((left, top, left + side, top + side)).resize((280, 280), Image.LANCZOS)
                b = io.BytesIO(); im.save(b, "JPEG", quality=80)
                photos[m["id"]] = "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode()
                break

cfg_json = json.dumps(cfg, ensure_ascii=False).replace("</", "<\\/")
page = tpl.replace("__PHOTOS__", json.dumps(photos)).replace("__CONFIG__", cfg_json).replace("{{OWNER}}", owner)
os.makedirs(out, exist_ok=True)
open(os.path.join(out, "team.html"), "w", encoding="utf-8").write(page)
open(os.path.join(out, "local.html"), "w", encoding="utf-8").write('<meta charset="utf-8">' + page)
open(os.path.join(out, "check.js"), "w", encoding="utf-8").write(re.findall(r"<script>(.*?)</script>", page, re.S)[0])
caps = {"sample": {"images": True}, "db": {}, "user": {}, "dictation": {}, "tts": {}}
if any(m.get("cal") for m in cfg["team"]):
    caps["mcp"] = {"servers": [{"server": "Google Calendar", "tools": ["list_events", "create_event"]}]}
json.dump(caps, open(os.path.join(out, "capabilities.json"), "w"), indent=1)
print(f"built {out}/team.html ({len(page)//1024} KB), photos: {len(photos)}/{len(cfg['team'])}, calendar: {'mcp' in caps}")
