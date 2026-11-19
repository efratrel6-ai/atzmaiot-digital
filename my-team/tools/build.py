"""Build team.html (the published page) from team.src.html + photos.json.
Run from the my-team folder:  python3 tools/build.py
Then syntax-check:            node --check build/check.js
"""
import json, os, re
here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(here, "team.src.html"), encoding="utf-8").read()
photos = open(os.path.join(here, "photos.json"), encoding="utf-8").read()
out = os.path.join(here, "build"); os.makedirs(out, exist_ok=True)
page = src.replace("__PHOTOS__", photos)
open(os.path.join(out, "team.html"), "w", encoding="utf-8").write(page)
# local preview copy (the publish skeleton adds the charset; a local file needs it)
open(os.path.join(out, "local.html"), "w", encoding="utf-8").write('<meta charset="utf-8">' + page)
open(os.path.join(out, "check.js"), "w", encoding="utf-8").write(re.findall(r"<script>(.*?)</script>", src, re.S)[0].replace("__PHOTOS__", "{}"))
print("built", os.path.join(out, "team.html"), len(page), "bytes")
