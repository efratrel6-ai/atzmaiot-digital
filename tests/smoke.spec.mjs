import { test, expect } from "@playwright/test";

test("עמוד הקורס נטען בלי שגיאות", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(`שגיאת JavaScript: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const url = m.location().url || "";
    // משאבים חיצוניים (גופנים וכד') לא אמורים להפיל פריסה
    if (url && new URL(url).origin !== new URL(page.url()).origin) return;
    errors.push(`שגיאה בקונסולה: ${m.text()}`);
  });
  const resp = await page.goto("/atzmaiot/");
  expect(resp?.status(), "העמוד atzmaiot/ לא נטען").toBe(200);
  await page.waitForLoadState("load");
  expect(errors, `נמצאו שגיאות בעמוד:\n${errors.join("\n")}`).toEqual([]);
});

test("כותרת בעברית", async ({ page }) => {
  await page.goto("/atzmaiot/");
  const title = await page.title();
  expect(title, "הכותרת של העמוד (title) חסרה או לא בעברית").toMatch(/[֐-׿]/);
});

test("כפתור הרכישה קיים ומוביל לעמוד תשלום תקין", async ({ page }) => {
  await page.goto("/atzmaiot/");
  const buy = page.locator("#cta-buy");
  expect(await buy.count(), "הכפתור לתשלום לא נמצא בעמוד").toBe(1);
  await buy.scrollIntoViewIfNeeded();
  await expect(buy, "הכפתור לתשלום קיים אבל לא נראה על המסך").toBeVisible();
  const href = (await buy.getAttribute("href")) || "";
  expect(href, `הקישור של כפתור התשלום אינו קישור https תקין (כרגע: "${href}")`).toMatch(/^https:\/\/[^\s/]+\.[^\s/]+\/\S*$/);
});

test("הצהרת הנגישות קיימת ויש אליה קישור מדף הקורס", async ({ page }) => {
  await page.goto("/atzmaiot/");
  const link = page.locator('a[href="accessibility.html"]');
  expect(await link.count(), "הקישור להצהרת הנגישות חסר בדף הקורס").toBeGreaterThan(0);
  const resp = await page.goto("/atzmaiot/accessibility.html");
  expect(resp?.status(), "דף הצהרת הנגישות לא נטען").toBe(200);
  await expect(page.locator("h1"), "כותרת הדף הצהרת נגישות חסרה").toHaveText("הצהרת נגישות");
  await expect(page.locator('a[href^="mailto:"]'), "חסרה כתובת מייל לפניות נגישות").toHaveCount(1);
  await expect(page.locator('a[href^="https://wa.me/"]'), "חסר קישור וואטסאפ לפניות נגישות").toHaveCount(1);
});
