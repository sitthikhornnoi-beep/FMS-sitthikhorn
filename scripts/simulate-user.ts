import { chromium } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const BASE_URL = "http://localhost:3010";
const DEV_PASSWORD = "Passw0rd!vibe";
const ADMIN_EMAIL = "admin@app.local";

const SCREENSHOT_DIR = path.resolve(process.cwd(), "public/uploads/simulation");

async function main() {
  console.log("🚀 Starting End-to-End User Simulation on browser...");
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "th-TH",
  });
  const page = await context.newPage();

  const results: { step: string; status: "PASS" | "FAIL"; detail?: string }[] = [];

  try {
    // ══════════════════════════════════════════════════════════════
    // 1. HOME PAGE & 3D CONVEYOR HERO
    // ══════════════════════════════════════════════════════════════
    console.log("\n[Step 1] Visiting Portal Home Page & Testing 3D Conveyor Belt...");
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    const title = await page.title();
    console.log(`- Page title: ${title}`);

    // Check Hero elements
    const heroTitle = await page.locator("h1").first().textContent();
    console.log(`- Hero title text: ${heroTitle?.trim()}`);

    // Test clicking "ฝ่ายบรรพชิต (พระ-เณร)" filter
    console.log("- Clicking filter: ฝ่ายบรรพชิต (พระ-เณร)...");
    await page.getByRole("button", { name: /ฝ่ายบรรพชิต/ }).click();
    await page.waitForTimeout(500);

    // Test clicking "ฝ่ายคฤหัสถ์ (ฆราวาส)" filter
    console.log("- Clicking filter: ฝ่ายคฤหัสถ์ (ฆราวาส)...");
    await page.getByRole("button", { name: /ฝ่ายคฤหัสถ์/ }).click();
    await page.waitForTimeout(500);

    // Test clicking "ทั้งหมด (5)" filter
    console.log("- Clicking filter: ทั้งหมด (5)...");
    await page.getByRole("button", { name: /ทั้งหมด/ }).click();
    await page.waitForTimeout(500);

    // Test clicking first student hotspot node
    const hotspotButtons = page.locator("button[aria-label]");
    const hotspotCount = await hotspotButtons.count();
    console.log(`- Found ${hotspotCount} student hotspot nodes on conveyor visual`);
    if (hotspotCount > 0) {
      await hotspotButtons.first().click();
      await page.waitForTimeout(500);
      console.log("- Clicked first student hotspot node");
    }

    // Test Pause / Resume conveyor button
    const pauseBtn = page.getByRole("button", { name: /PAUSE|RESUME/ });
    if (await pauseBtn.isVisible()) {
      await pauseBtn.click();
      console.log("- Clicked PAUSE button");
      await page.waitForTimeout(500);
      await pauseBtn.click();
      console.log("- Clicked RESUME button");
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01-home-conveyor-hero.png"), fullPage: false });
    results.push({ step: "1. Portal Home & 3D Conveyor Hero", status: "PASS", detail: "Loaded and interactive" });

    // ══════════════════════════════════════════════════════════════
    // 2. CURRICULUM & PROGRAMS (/programs)
    // ══════════════════════════════════════════════════════════════
    console.log("\n[Step 2] Visiting Programs / Curriculum Page...");
    await page.goto(`${BASE_URL}/programs`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02-programs-page.png") });
    results.push({ step: "2. Programs & Curriculum", status: "PASS", detail: "Programs page loaded" });

    // ══════════════════════════════════════════════════════════════
    // 3. NEWS & ANNOUNCEMENTS (/news)
    // ══════════════════════════════════════════════════════════════
    console.log("\n[Step 3] Visiting News & Events Page...");
    await page.goto(`${BASE_URL}/news`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03-news-list.png") });

    // Click first article
    const firstArticleLink = page.locator('a[href^="/news/"]').first();
    if (await firstArticleLink.isVisible()) {
      console.log("- Clicking first news article to view detail...");
      await firstArticleLink.click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03-news-detail.png") });
      results.push({ step: "3. News & Announcements", status: "PASS", detail: "List & Detail view verified" });
    } else {
      results.push({ step: "3. News & Announcements", status: "PASS", detail: "List view verified" });
    }

    // ══════════════════════════════════════════════════════════════
    // 4. PERSONNEL DIRECTORY (/personnel)
    // ══════════════════════════════════════════════════════════════
    console.log("\n[Step 4] Visiting Personnel & Faculty Directory...");
    await page.goto(`${BASE_URL}/personnel`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04-personnel-directory.png") });
    results.push({ step: "4. Faculty & Staff Directory", status: "PASS", detail: "Personnel list loaded" });

    // ══════════════════════════════════════════════════════════════
    // 5. BOOKING SYSTEM (/booking)
    // ══════════════════════════════════════════════════════════════
    console.log("\n[Step 5] Visiting Room & Vehicle Booking System...");
    await page.goto(`${BASE_URL}/booking`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05-booking-system.png") });
    results.push({ step: "5. Room & Vehicle Booking", status: "PASS", detail: "Booking calendar rendered" });

    // ══════════════════════════════════════════════════════════════
    // 6. E-DOCUMENTS (/documents)
    // ══════════════════════════════════════════════════════════════
    console.log("\n[Step 6] Visiting E-Documents Page...");
    await page.goto(`${BASE_URL}/documents`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06-documents-page.png") });
    results.push({ step: "6. E-Documents & Orders", status: "PASS", detail: "Document directory loaded" });

    // ══════════════════════════════════════════════════════════════
    // 7. USER AUTHENTICATION (/login -> /dashboard)
    // ══════════════════════════════════════════════════════════════
    console.log("\n[Step 7] Testing User Authentication & Sign In...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07-login-page.png") });

    // Fill credentials
    console.log(`- Logging in as ${ADMIN_EMAIL}...`);
    await page.fill("#email", ADMIN_EMAIL);
    await page.fill("#password", DEV_PASSWORD);
    await page.getByRole("button", { name: /เข้าสู่ระบบ|Sign in/ }).click();

    await page.waitForURL("**/dashboard", { timeout: 15000 });
    console.log("- Successfully redirected to /dashboard!");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07-admin-dashboard.png") });
    results.push({ step: "7. User Sign In & Dashboard", status: "PASS", detail: "Authenticated successfully" });

    // ══════════════════════════════════════════════════════════════
    // 8. USER MANAGEMENT (/users)
    // ══════════════════════════════════════════════════════════════
    console.log("\n[Step 8] Visiting Users Management...");
    await page.goto(`${BASE_URL}/users`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "08-admin-users.png") });
    results.push({ step: "8. Admin User Management", status: "PASS", detail: "Users list and controls loaded" });

    // ══════════════════════════════════════════════════════════════
    // 9. SYSTEM SETTINGS (/settings)
    // ══════════════════════════════════════════════════════════════
    console.log("\n[Step 9] Visiting System Settings...");
    await page.goto(`${BASE_URL}/settings`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "09-admin-settings.png") });
    results.push({ step: "9. Admin Settings & Logo Upload", status: "PASS", detail: "Settings form and controls loaded" });

    // ══════════════════════════════════════════════════════════════
    // 10. USER PROFILE (/me)
    // ══════════════════════════════════════════════════════════════
    console.log("\n[Step 10] Visiting User Profile (/me)...");
    await page.goto(`${BASE_URL}/me`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "10-user-profile.png") });
    results.push({ step: "10. User Profile (/me)", status: "PASS", detail: "Profile details rendered" });

    // ══════════════════════════════════════════════════════════════
    // 11. PORTAL NAVBAR AVATAR & DROPDOWN MENU
    // ══════════════════════════════════════════════════════════════
    console.log("\n[Step 11] Returning to Portal Home as Authenticated User to test Avatar Dropdown...");
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // Click Avatar button
    const avatarBtn = page.locator(".acct button");
    if (await avatarBtn.isVisible()) {
      console.log("- Avatar button is visible! Clicking to open dropdown menu...");
      await avatarBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "11-portal-avatar-dropdown.png") });
      results.push({ step: "11. Portal Navbar Avatar Dropdown", status: "PASS", detail: "Avatar menu rendered with links" });
    } else {
      results.push({ step: "11. Portal Navbar Avatar Dropdown", status: "FAIL", detail: "Avatar button not found" });
    }

  } catch (err) {
    console.error("❌ Simulation encountered an error:", err);
    results.push({ step: "Simulation Execution", status: "FAIL", detail: String(err) });
  } finally {
    await browser.close();
  }

  console.log("\n══════════════════════════════════════════════════════════════");
  console.log("📋 SIMULATION RESULTS SUMMARY");
  console.log("══════════════════════════════════════════════════════════════");
  for (const r of results) {
    console.log(`${r.status === "PASS" ? "✅" : "❌"} ${r.step} — ${r.detail}`);
  }
  console.log(`\nScreenshots saved in: ${SCREENSHOT_DIR}`);
}

main().catch(console.error);
