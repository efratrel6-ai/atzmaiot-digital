import { test, expect } from "@playwright/test";

// רץ רק מול האתר החי (בדיקה שבועית, LIVE_URL)
test.skip(!process.env.LIVE_URL, "בדיקה זו רצה רק מול האתר החי");

test("האתר החי עונה, וקישור התשלום והוואטסאפ חיים", async ({ page, request }) => {
  const resp = await page.goto("/atzmaiot/");
  expect(resp?.status(), "האתר החי לא עונה (העמוד atzmaiot/ לא נטען)").toBe(200);
  for (const [id, name] of [["#cta-buy", "הכפתור לתשלום"], ["#cta-whatsapp", "כפתור הוואטסאפ"]]) {
    const el = page.locator(id).first();
    const href = (await el.getAttribute("href")) || "";
    expect(href, `${name} לא מוביל לקישור תקין (${href})`).toMatch(/^https:\/\//);
    const r = await request.get(href, { timeout: 20000, maxRedirects: 5 }).catch(() => null);
    expect(r && (r.status() < 400 || [403, 429].includes(r.status())), `${name} לא נפתח (${href}, סטטוס ${r ? r.status() : "אין תגובה"})`).toBe(true);
  }
});
