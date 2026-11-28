import { test, expect } from "@playwright/test";

test("טופס יום הצילום: מחיר, הנחה לחוזרות וחתימה", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const resp = await page.goto("/atzmaiot/shoot-agreement.html");
  expect(resp?.status(), "דף טופס יום הצילום לא נטען").toBe(200);

  await expect(page.locator("#total")).toHaveText("6,500 ₪");
  await page.locator("#ret").check();
  await expect(page.locator("#total"), "ההנחה ללקוחה חוזרת לא חושבה נכון").toHaveText("5,850 ₪");
  // נסיעות: 2.3 ₪ לק"מ, ההנחה רק על מחיר הצילום
  await page.locator("#km").fill("50");
  await expect(page.locator("#total"), "הנסיעות או ההנחה חושבו לא נכון").toHaveText("5,965 ₪");
  await page.locator("#ret").uncheck();
  await expect(page.locator("#total")).toHaveText("6,615 ₪");
  await page.locator("#km").fill("0");
  await expect(page.locator("#total")).toHaveText("6,500 ₪");

  // בלי שם וחתימה לא נותנים לשמור
  await page.locator("#save").click();
  await expect(page.locator("#err")).not.toHaveText("");

  await page.locator("#name").fill("בדיקה");
  await page.locator("#pubno").check();
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

test("טופס יום הצילום: חישוב נסיעות אוטומטי מכתובת (הלוך וחזור × 2.3 ₪)", async ({ page }) => {
  await page.route("**/nominatim.openstreetmap.org/**", (r) =>
    r.fulfill({ json: [{ lon: "34.81", lat: "31.89", address: { city: "רחובות" } }] }));
  await page.route("**/router.project-osrm.org/**", (r) =>
    r.fulfill({ json: { routes: [{ distance: 70000 }] } }));
  await page.goto("/atzmaiot/shoot-agreement.html");
  await page.locator("#place").fill("רחובות");
  await page.locator("#calc").click();
  await expect(page.locator("#km"), "הק״מ לא חושב אוטומטית").toHaveValue("140");
  await expect(page.locator("#total")).toHaveText("6,822 ₪");
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
  await expect(page.locator("#total")).toHaveText("6,523 ₪");
});

test("טופס יום הצילום: אחרי השמירה קופץ חלון שיתוף הקובץ לאפרת", async ({ page }) => {
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
  await page.locator("#pubno").check();
  await page.locator("#save").click();
  await expect(page.locator("#sendDlg"), "חלון השליחה לא נפתח").toBeVisible({ timeout: 25000 });
  await expect(page.locator("#dlBtn"), "אין כפתור הורדה כשאי אפשר לשתף").toBeVisible();
  await expect(page.locator('#sendDlg a[href^="https://wa.me/"]'), "אייקון וואטסאפ אמור להיות מוסר").toHaveCount(0);
  await expect(page.locator('#sendDlg a[href^="mailto:"]'), "אייקון המייל אמור להיות מוסר").toHaveCount(0);
  await page.locator("#closeDlg").click();
  await expect(page.locator("#sendDlg")).toBeHidden();
});

test("טופס יום הצילום: בגוש עציון אין תוספת נסיעות", async ({ page }) => {
  await page.route("**/nominatim.openstreetmap.org/**", (r) =>
    r.fulfill({ json: [{ lon: "35.13", lat: "31.65", address: { town: "אפרת" } }] }));
  await page.goto("/atzmaiot/shoot-agreement.html");
  await page.locator("#km").fill("30");
  await page.locator("#place").fill("אפרת");
  await page.locator("#calc").click();
  await expect(page.locator("#total")).toHaveText("6,500 ₪");
});

test("טופס יום הצילום: חובה לבחור מאשר/ת או לא מאשר/ת פרסום ברשתות", async ({ page }) => {
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
  await expect(page.locator("#err"), "אפשר לשמור בלי לבחור לגבי פרסום ברשתות").toContainText("פרסום");
  await expect(page.locator("#sendDlg")).toBeHidden();
  await page.locator("#pubmid").check();
  await page.locator("#save").click();
  await expect(page.locator("#sendDlg"), "האפשרות מאשרת לאחר אישור על כל תוכן לא התקבלה").toBeVisible({ timeout: 25000 });
});

test("טופס יום הצילום: נוצר קובץ PDF אמיתי שאפשר להוריד ולשתף", async ({ page }) => {
  test.setTimeout(60000);
  await page.addInitScript(() => { window.print = () => { window.__printed = true; }; });
  await page.goto("/atzmaiot/shoot-agreement.html");
  await page.locator("#name").fill("בדיקה");
  await page.locator("#pubno").check();
  await page.locator("#sendok").check();
  await page.locator("#box").scrollIntoViewIfNeeded();
  const box = await page.locator("#box").boundingBox();
  await page.mouse.move(box.x + 20, box.y + 40);
  await page.mouse.down();
  await page.mouse.move(box.x + 100, box.y + 70, { steps: 4 });
  await page.mouse.up();
  await page.locator("#save").click();
  await expect(page.locator("#sendDlg")).toBeVisible({ timeout: 25000 });
  await expect(page.locator("#dlBtn"), "לא נוצר קישור להורדת הקובץ").toHaveAttribute("href", /^blob:/);
  const head = await page.evaluate(async () => {
    const r = await fetch(document.getElementById("dlBtn").href);
    const b = new Uint8Array(await r.arrayBuffer());
    return { magic: String.fromCharCode(...b.slice(0, 4)), size: b.length, printed: !!window.__printed };
  });
  expect(head.magic, "הקובץ שנוצר אינו PDF").toBe("%PDF");
  expect(head.printed, "נפל לחלון ההדפסה במקום ליצור PDF").toBe(false);
  expect(head.size).toBeGreaterThan(20000);
});
