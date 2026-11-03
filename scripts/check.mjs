// בדיקות סטטיות ללא תלויות: קישורים מקומיים, CNAME, הפניה מ-index.html.
// קישורים חיצוניים נבדקים באזהרה בלבד (לא מפילים את הפריסה).
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);

const read = (p) => readFileSync(join(root, p), "utf8");

// 1. CNAME
if (!existsSync(join(root, "CNAME"))) fail("הקובץ CNAME חסר. בלעדיו הכתובת efrat-cohen.co.il תפסיק לעבוד.");
else if (read("CNAME").trim() !== "efrat-cohen.co.il")
  fail(`תוכן הקובץ CNAME השתנה ("${read("CNAME").trim()}"). חייב להיות efrat-cohen.co.il`);

// 2. index.html מפנה ל-atzmaiot/
if (!existsSync(join(root, "index.html"))) fail("הקובץ index.html בתיקייה הראשית חסר.");
else if (!/url=atzmaiot\/|location\.replace\(\s*["']atzmaiot\//.test(read("index.html")))
  fail("index.html בתיקייה הראשית כבר לא מפנה לתיקייה atzmaiot/.");

for (const f of ["favicon.ico", "atzmaiot/index.html"])
  if (!existsSync(join(root, f))) fail(`הקובץ ${f} חסר.`);

// 3. קישורים מקומיים בכל קובצי ה-HTML
const strip = (h) => h.replace(/<!--[\s\S]*?-->/g, "");
const external = new Set();
for (const page of ["index.html", "atzmaiot/index.html"]) {
  if (!existsSync(join(root, page))) continue;
  const html = strip(read(page));
  const re = /\b(?:href|src|poster)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(html))) {
    const raw = m[1].trim();
    if (!raw || raw.startsWith("#") || /^(data:|mailto:|tel:|javascript:|blob:)/.test(raw)) continue;
    if (/^(https?:)?\/\//.test(raw)) { external.add(raw.startsWith("//") ? "https:" + raw : raw); continue; }
    const clean = raw.split(/[?#]/)[0];
    if (!clean) continue;
    const target = clean.startsWith("/") ? join(root, clean) : resolve(root, dirname(page), clean);
    const ok = existsSync(target) && (statSync(target).isFile() || existsSync(join(target, "index.html")));
    if (!ok) fail(`בעמוד ${page} יש קישור לקובץ שלא קיים: "${raw}"`);
  }
}

// 3ב. תקציב משקל (אזהרה בלבד)
const mb = (n) => (n / 1048576).toFixed(1);
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(join(d, e.name)) : [[join(d, e.name), statSync(join(d, e.name)).size]]);
const files = walk(join(root, "atzmaiot"));
const total = files.reduce((a, [, s]) => a + s, 0);
const htmlSize = statSync(join(root, "atzmaiot/index.html")).size;
if (htmlSize > 6 * 1048576) warnings.push(`קובץ העמוד atzmaiot/index.html כבד (${mb(htmlSize)}MB, התקציב 6MB). זה יאט את הטעינה.`);
if (total > 40 * 1048576) warnings.push(`התיקייה atzmaiot כבדה (${mb(total)}MB, התקציב 40MB).`);
for (const [f, s] of files) if (s > 12 * 1048576) warnings.push(`קובץ גדול מאוד (${mb(s)}MB): ${f.replace(root + "/", "")}`);

// 4. קישורים חיצוניים: אזהרה בלבד
const skip = /^https:\/\/fonts\.(googleapis|gstatic)\.com\/?$/;
await Promise.all([...external].filter((u) => !skip.test(u)).map(async (u) => {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 10000);
    let r = await fetch(u, { method: "HEAD", redirect: "follow", signal: ctl.signal });
    if (r.status >= 400) r = await fetch(u, { method: "GET", redirect: "follow", signal: ctl.signal });
    clearTimeout(t);
    // 403/429 מגיעים לרוב מחסימת בוטים (אינסטגרם, וואטסאפ) ולכן לא מדווחים
    if (r.status >= 400 && ![403, 429, 999].includes(r.status)) warnings.push(`קישור חיצוני החזיר ${r.status}: ${u}`);
  } catch (e) {
    warnings.push(`לא הצלחתי להגיע לקישור חיצוני (${e.name}): ${u}`);
  }
}));

for (const w of warnings) console.warn(`אזהרה (לא מונעת פריסה): ${w}`);
if (errors.length) {
  console.error("\nהבדיקות נכשלו. האתר החי לא ישתנה עד שיתוקן:");
  for (const e of errors) console.error(` - ${e}`);
  process.exit(1);
}
console.log(`הבדיקות הסטטיות עברו (${external.size} קישורים חיצוניים נבדקו, ${warnings.length} אזהרות).`);
