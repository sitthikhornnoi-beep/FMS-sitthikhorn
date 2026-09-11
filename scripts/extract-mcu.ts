import * as fs from "fs";

const html = fs.readFileSync("scripts/mcu-unit-8.html", "utf8");

// Simple regex to extract main content area
const mainMatch = html.match(/<main[\s\S]*?<\/main>/i) || html.match(/<article[\s\S]*?<\/article>/i);

if (mainMatch) {
  // Strip script/style
  const clean = mainMatch[0]
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");
  fs.writeFileSync("scripts/mcu-unit-8-main.html", clean, "utf8");
  console.log("Saved scripts/mcu-unit-8-main.html, length:", clean.length);
} else {
  console.log("No <main> tag found, saving entire body...");
  const bodyMatch = html.match(/<body[\s\S]*?<\/body>/i);
  if (bodyMatch) {
    fs.writeFileSync("scripts/mcu-unit-8-main.html", bodyMatch[0], "utf8");
  }
}
