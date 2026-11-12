import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("עברית מימין לשמאל ותגיות שיתוף (meta/og) קיימות", async ({ page }) => {
  await page.goto("/atzmaiot/");
  const html = page.locator("html");
  expect(await html.getAttribute("lang"), 'התכונה lang="he" חסרה בתגית html').toBe("he");
  expect(await html.getAttribute("dir"), 'התכונה dir="rtl" חסרה בתגית html, העמוד לא יוצג מימין לשמאל').toBe("rtl");
  const metas = {
    'meta[name="description"]': "תיאור העמוד (description)",
    'meta[name="viewport"]': "תגית viewport (תצוגה במובייל)",
    'meta[property="og:title"]': "כותרת השיתוף (og:title)",
    'meta[property="og:description"]': "תיאור השיתוף (og:description)",
    'meta[property="og:image"]': "תמונת השיתוף (og:image)",
  };
  for (const [sel, name] of Object.entries(metas)) {
    const v = await page.locator(sel).first().getAttribute("content");
    expect(v && v.trim().length > 0, `חסר או ריק: ${name}`).toBe(true);
  }
});

test("כל התמונות נטענות", async ({ page }) => {
  await page.goto("/atzmaiot/");
  await page.waitForLoadState("load");
  const broken = await page.evaluate(async () => {
    const imgs = [...document.images];
    await Promise.all(imgs.map((i) => (i.loading === "lazy" ? (i.loading = "eager") : 0, i.decode().catch(() => {}))));
    return imgs.filter((i) => i.src && !i.naturalWidth).map((i) => i.currentSrc || i.src).map((s) => s.slice(0, 120));
  });
  expect(broken, `יש תמונות שלא נטענו:\n${broken.join("\n")}`).toEqual([]);
});

test("אין גלילה אופקית במובייל", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "נבדק רק במובייל");
  await page.goto("/atzmaiot/");
  await page.waitForLoadState("load");
  const w = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, view: window.innerWidth }));
  expect(w.doc, `העמוד רחב מהמסך במובייל (${w.doc}px במקום ${w.view}px), יש גלילה לצדדים`).toBeLessThanOrEqual(w.view);
});

test("כל קישורי העוגן (#) מובילים לאלמנט קיים", async ({ page }) => {
  await page.goto("/atzmaiot/");
  const missing = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const id = a.getAttribute("href").slice(1);
      if (id && !document.getElementById(id)) out.push("#" + id);
    });
    return [...new Set(out)];
  });
  expect(missing, `יש קישורים פנימיים ליעד שלא קיים בעמוד: ${missing.join(", ")}`).toEqual([]);
});

test("נגישות בסיסית: אין הפרות קריטיות", async ({ page }) => {
  await page.goto("/atzmaiot/");
  await page.waitForLoadState("load");
  const { violations } = await new AxeBuilder({ page }).analyze();
  const serious = violations.filter((v) => v.impact === "serious" || v.impact === "moderate" || v.impact === "minor");
  for (const v of serious) console.warn(`אזהרת נגישות (${v.impact}): ${v.help} [${v.id}]`);
  const critical = violations.filter((v) => v.impact === "critical");
  expect(
    critical.map((v) => `${v.help} (${v.id}), ${v.nodes.length} אלמנטים`),
    "נמצאו בעיות נגישות קריטיות:",
  ).toEqual([]);
});

test("העמוד נטען מהר: התמונות בקבצים נפרדים ולא בתוך העמוד", async ({ request }) => {
  const res = await request.get("/atzmaiot/");
  const kb = (await res.body()).length / 1024;
  expect(kb, `קובץ העמוד כבד (${Math.round(kb)}KB). תמונות חדשות צריכות להיות קובץ נפרד בתיקייה img, לא בתוך העמוד`).toBeLessThan(600);
  const img = await request.get("/atzmaiot/img/welcome.jpg");
  expect(img.ok(), "תמונת הפתיחה img/welcome.jpg לא נטענת").toBeTruthy();
});
