import { chromium } from "@playwright/test";
import * as path from "path";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log("Navigating to http://localhost:3010...");
  await page.goto("http://localhost:3010", { waitUntil: "networkidle" });
  
  // Wait 1.5 seconds for conveyor animation to advance
  await page.waitForTimeout(1500);

  const screenshotPath1 = path.resolve(process.cwd(), "public/uploads/simulation/moving-conveyor-t1.png");
  await page.screenshot({ path: screenshotPath1 });
  console.log("Captured t1:", screenshotPath1);

  // Wait another 3 seconds for capsules to glide further along track
  await page.waitForTimeout(3000);
  const screenshotPath2 = path.resolve(process.cwd(), "public/uploads/simulation/moving-conveyor-t2.png");
  await page.screenshot({ path: screenshotPath2 });
  console.log("Captured t2:", screenshotPath2);

  await browser.close();
  console.log("Done capturing moving conveyor screenshots!");
}

main().catch(console.error);
