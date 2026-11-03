import { defineConfig, devices } from "@playwright/test";

const live = process.env.LIVE_URL; // למשל https://efrat-cohen.co.il (בדיקה שבועית מול האתר החי)

export default defineConfig({
  testDir: "tests",
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 30000,
  reporter: [["list"]],
  snapshotPathTemplate: "tests/baselines/{projectName}/{arg}{ext}",
  use: { baseURL: live || "http://127.0.0.1:4173" },
  webServer: live
    ? undefined
    : { command: "node scripts/serve.mjs", url: "http://127.0.0.1:4173/atzmaiot/", reuseExistingServer: false },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"], browserName: "chromium" } },
    { name: "desktop", use: { browserName: "chromium", viewport: { width: 1280, height: 800 } } },
  ],
});
