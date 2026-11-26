import { test, expect } from "@playwright/test";

test("טופס יום הצילום: מחיר, הנחה לחוזרות וחתימה", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const resp = await page.goto("/atzmaiot/shoot-agreement.html");
  expect(resp?.status(), "דף טופס יום הצילום לא נטען").toBe(200);

  await expect(page.locator("#total")).toHaveText("6,500 ₪");
  await page.locator("#ret").check();
  await expect(page.locator("#total"), "ההנחה ללקוחה חוזרת לא חושבה נכון").toHaveText("5,850 ₪");
  await page.locator("#ret").uncheck();
  await expect(page.locator("#total")).toHaveText("6,500 ₪");

  // בלי שם וחתימה לא נותנים לשמור
  await page.locator("#save").click();
  await expect(page.locator("#err")).not.toHaveText("");

  await page.locator("#name").fill("בדיקה");
  await page.locator("#box").scrollIntoViewIfNeeded();
  const box = await page.locator("#box").boundingBox();
  await page.mouse.move(box.x + 20, box.y + 40);
  await page.mouse.down();
  await page.mouse.move(box.x + 120, box.y + 80, { steps: 5 });
  await page.mouse.up();
  expect(await page.locator("#sig path").count(), "החתימה לא נקלטה").toBe(1);
  expect(errors).toEqual([]);
});

test("טופס יום הצילום לא מופיע בחיפוש ולא מקושר מדף הקורס", async ({ page }) => {
  await page.goto("/atzmaiot/shoot-agreement.html");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await page.goto("/atzmaiot/");
  expect(await page.locator('a[href*="shoot-agreement"]').count()).toBe(0);
});
