import { test, expect } from "@playwright/test";

// תמונות הבסיס נוצרות על לינוקס ב-GitHub (CI). מקומית רצים רק עם FORCE_VISUAL=1.
test.skip(!process.env.CI && !process.env.FORCE_VISUAL, "בדיקה חזותית רצה רק ב-CI (או עם FORCE_VISUAL=1)");

const MSG = "המראה של העמוד השתנה לעומת תמונת הבסיס. אם ביקשו שינוי עיצובי, יש לעדכן את תמונות הבסיס (ראי README)";
const shot = { maxDiffPixelRatio: 0.01, animations: "disabled" };

async function open(page) {
  // בלי משאבים חיצוניים (גופנים וכד'), כדי שהתמונה תהיה יציבה
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/atzmaiot/");
  await page.waitForLoadState("load");
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: "video{visibility:hidden!important}" });
  await page.waitForTimeout(500);
}

test("העמוד נראה כמו תמונת הבסיס", async ({ page }) => {
  await open(page);
  await expect(page, MSG).toHaveScreenshot("home.png", shot);
});

test("כל העמוד (fullPage) נראה כמו תמונת הבסיס", async ({ page }) => {
  await open(page);
  await expect(page, MSG).toHaveScreenshot("full.png", { ...shot, fullPage: true });
});

// העמוד בנוי כגלילה של "ריל" אחרי ריל. מצלמים כל ריל בנפרד כדי לתפוס שינוי מתחת לקפל.
test("כל חלקי העמוד (ריל אחרי ריל) נראים כמו תמונות הבסיס", async ({ page }) => {
  await open(page);
  const reels = page.locator("section.reel");
  const n = await reels.count();
  expect(n, "לא נמצאו חלקי עמוד (section.reel)").toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    const r = reels.nth(i);
    await r.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await expect(r, `${MSG} (חלק ${i + 1})`).toHaveScreenshot(`reel-${String(i + 1).padStart(2, "0")}.png`, shot);
  }
});
