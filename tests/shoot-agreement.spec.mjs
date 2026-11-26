import { test, expect } from "@playwright/test";

test("טופס יום הצילום: מחיר, הנחה לחוזרות וחתימה", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const resp = await page.goto("/atzmaiot/shoot-agreement.html");
  expect(resp?.status(), "דף טופס יום הצילום לא נטען").toBe(200);

  await expect(page.locator("#total")).toHaveText("6,500 ₪");
  await page.locator("#ret").check();
  await expect(page.locator("#total"), "ההנחה ללקוחה חוזרת לא חושבה נכון").toHaveText("5,850 ₪");
  // נסיעות: 2 ₪ לק"מ, ההנחה רק על מחיר הצילום
  await page.locator("#km").fill("50");
  await expect(page.locator("#total"), "הנסיעות או ההנחה חושבו לא נכון").toHaveText("5,950 ₪");
  await page.locator("#ret").uncheck();
  await expect(page.locator("#total")).toHaveText("6,600 ₪");
  await page.locator("#km").fill("0");
  await expect(page.locator("#total")).toHaveText("6,500 ₪");

  // בלי שם וחתימה לא נותנים לשמור
  await page.locator("#save").click();
  await expect(page.locator("#err")).not.toHaveText("");

  await page.locator("#name").fill("בדיקה");
  // סעיף חובה: להתחייב לשלוח את הקובץ לאפרת
  await page.locator("#save").click();
  await expect(page.locator("#err"), "אפשר לשמור בלי לאשר את סעיף שליחת הקובץ").toContainText("לשלוח");
  await page.locator("#sendok").check();
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

test("טופס יום הצילום: אין בו פרטים אישיים של אף אחד", async () => {
  const { readFileSync } = await import("node:fs");
  const html = readFileSync("atzmaiot/shoot-agreement.html", "utf8");
  expect(html, "נמצא מספר שנראה כמו תעודת זהות בעמוד ציבורי").not.toMatch(/\b\d{9}\b/);
});

test("טופס יום הצילום: הסעיף על שתי מצולמות מופיע רק כשיש מצולמת נוספת", async ({ page }) => {
  await page.goto("/atzmaiot/shoot-agreement.html");
  await expect(page.locator("#shared")).toBeHidden();
  await page.locator("summary").click();
  await page.locator("#name2").fill("בדיקה");
  await expect(page.locator("#shared")).toBeVisible();
});

test("טופס יום הצילום: חישוב נסיעות אוטומטי מכתובת (הלוך וחזור × 2 ₪)", async ({ page }) => {
  await page.route("**/nominatim.openstreetmap.org/**", (r) =>
    r.fulfill({ json: [{ lon: "34.81", lat: "31.89", address: { city: "רחובות" } }] }));
  await page.route("**/router.project-osrm.org/**", (r) =>
    r.fulfill({ json: { routes: [{ distance: 70000 }] } }));
  await page.goto("/atzmaiot/shoot-agreement.html");
  await page.locator("#place").fill("רחובות");
  await page.locator("#calc").click();
  await expect(page.locator("#km"), "הק״מ לא חושב אוטומטית").toHaveValue("140");
  await expect(page.locator("#total")).toHaveText("6,780 ₪");
});

test("טופס יום הצילום: בירושלים אין תוספת נסיעות", async ({ page }) => {
  await page.route("**/nominatim.openstreetmap.org/**", (r) =>
    r.fulfill({ json: [{ lon: "35.21", lat: "31.77", address: { city: "ירושלים" } }] }));
  await page.goto("/atzmaiot/shoot-agreement.html");
  await page.locator("#km").fill("30");
  await page.locator("#place").fill("ירושלים");
  await page.locator("#calc").click();
  await expect(page.locator("#total")).toHaveText("6,500 ₪");
});

test("טופס יום הצילום: אם החישוב האוטומטי נכשל אפשר לכתוב ק״מ ידנית", async ({ page }) => {
  await page.route("**/nominatim.openstreetmap.org/**", (r) => r.abort());
  await page.goto("/atzmaiot/shoot-agreement.html");
  await page.locator("#place").fill("מקום כלשהו");
  await page.locator("#calc").click();
  await expect(page.locator("#calcMsg")).toContainText("ידנית");
  await page.locator("#km").fill("10");
  await expect(page.locator("#total")).toHaveText("6,520 ₪");
});

test("טופס יום הצילום: אחרי השמירה קופץ חלון שליחה לאפרת עם וואטסאפ וג׳ימייל", async ({ page }) => {
  await page.addInitScript(() => { window.print = () => {}; });
  await page.goto("/atzmaiot/shoot-agreement.html");
  await page.locator("#name").fill("בדיקה");
  await page.locator("#sendok").check();
  await page.locator("#box").scrollIntoViewIfNeeded();
  const box = await page.locator("#box").boundingBox();
  await page.mouse.move(box.x + 20, box.y + 40);
  await page.mouse.down();
  await page.mouse.move(box.x + 100, box.y + 70, { steps: 4 });
  await page.mouse.up();
  await page.locator("#save").click();
  await expect(page.locator("#sendDlg"), "חלון השליחה לא נפתח").toBeVisible();
  await expect(page.locator('#sendDlg a[href^="https://wa.me/972523115049"]')).toBeVisible();
  await expect(page.locator('#sendDlg a[href^="mailto:Efratrel6@gmail.com"]')).toBeVisible();
  await page.locator("#closeDlg").click();
  await expect(page.locator("#sendDlg")).toBeHidden();
});
