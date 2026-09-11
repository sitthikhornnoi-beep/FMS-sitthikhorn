import * as fs from "fs";

async function main() {
  const url = "https://sothorn.mcu.ac.th/new/organization/unit.php?id=8";
  console.log(`Fetching from ${url}...`);
  const res = await fetch(url);
  const text = await res.text();
  fs.writeFileSync("scripts/mcu-unit-8.html", text, "utf8");
  console.log(`Saved scripts/mcu-unit-8.html, bytes: ${text.length}`);
}

main().catch(console.error);
