import { test, expect } from "@playwright/test";

// תמונות הבסיס נוצרות על לינוקס (כמו ב-GitHub). במק משווים רק אם ביקשו במפורש.
test.skip(process.platform !== "linux" && !process.env.FORCE_VISUAL, "בדיקה חזותית רצה רק על לינוקס (ב-GitHub)");

test("העמוד נראה כמו תמונת הבסיס", async ({ page }) => {
  // בלי משאבים חיצוניים (גופנים וכד'), כדי שהתמונה תהיה יציבה
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/atzmaiot/");
  await page.waitForLoadState("load");
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: "video{visibility:hidden!important}" });
  await page.waitForTimeout(500);
  await expect(page, "המראה של העמוד השתנה לעומת תמונת הבסיס. אם ביקשו שינוי עיצובי, יש לעדכן את תמונות הבסיס (ראי README)").toHaveScreenshot("home.png", {
    maxDiffPixelRatio: 0.03,
    animations: "disabled",
  });
});
