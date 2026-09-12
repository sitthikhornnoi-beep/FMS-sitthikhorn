import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT_DIR = path.resolve(__dirname, "../..");
const DIST_DIR = path.join(ROOT_DIR, "dist/FMS-Windows-App");

console.log("========================================================");
console.log("  ระบบสร้างแพ็กเกจติดตั้ง Windows Standalone สำหรับ FMS  ");
console.log("========================================================");

async function main() {
  // 1. Build Next.js standalone
  console.log("\n[1/6] กำลังตรวจสอบและ Build Next.js (Standalone Mode)...");
  if (!fs.existsSync(path.join(ROOT_DIR, ".next/standalone"))) {
    console.log("กำลังรัน npm run build...");
    execSync("npm.cmd run build", { stdio: "inherit", cwd: ROOT_DIR });
  } else {
    console.log("พบ .next/standalone อยู่แล้ว (หากต้องการบิลด์ใหม่ให้ลบโฟลเดอร์ .next ก่อน)");
  }

  // 2. Prepare directory structure
  console.log("\n[2/6] กำลังจัดเตรียมโครงสร้างโฟลเดอร์ dist/FMS-Windows-App...");
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(path.join(DIST_DIR, "app"), { recursive: true });
  fs.mkdirSync(path.join(DIST_DIR, "bin/node"), { recursive: true });
  fs.mkdirSync(path.join(DIST_DIR, "bin/pgsql"), { recursive: true });
  fs.mkdirSync(path.join(DIST_DIR, "data/db"), { recursive: true });

  // 3. Copy Next.js standalone files
  console.log("\n[3/6] กำลังคัดลอกไฟล์แอปพลิเคชัน...");
  fs.cpSync(path.join(ROOT_DIR, ".next/standalone"), path.join(DIST_DIR, "app"), {
    recursive: true,
  });

  // Next.js standalone requires static assets and public folder to be manually copied inside .next
  const staticSrc = path.join(ROOT_DIR, ".next/static");
  const staticDest = path.join(DIST_DIR, "app/.next/static");
  if (fs.existsSync(staticSrc)) {
    fs.cpSync(staticSrc, staticDest, { recursive: true });
  }

  const publicSrc = path.join(ROOT_DIR, "public");
  const publicDest = path.join(DIST_DIR, "app/public");
  if (fs.existsSync(publicSrc)) {
    fs.cpSync(publicSrc, publicDest, { recursive: true });
  }

  // 4. Create .env for offline standalone
  console.log("\n[4/6] กำลังสร้างไฟล์การตั้งค่า .env สำหรับใช้งานออฟไลน์...");
  const envContent = `# FMS Standalone Offline Configuration
PORT=3010
HOSTNAME=127.0.0.1
NODE_ENV=production
DATABASE_URL="postgresql://postgres@127.0.0.1:54332/fms_offline_db"
AUTH_SECRET="fms_standalone_offline_secret_key_random_2026_super_safe"
NEXTAUTH_URL="http://127.0.0.1:3010"
NEXTAUTH_SECRET="fms_standalone_offline_secret_key_random_2026_super_safe"
`;
  fs.writeFileSync(path.join(DIST_DIR, "app/.env"), envContent, "utf-8");

  // 5. Copy launcher files
  console.log("\n[5/6] กำลังคัดลอกไฟล์ Launcher และสคริปต์เปิดปิดระบบ...");
  fs.copyFileSync(
    path.join(ROOT_DIR, "desktop/launcher/FMS-Launcher.bat"),
    path.join(DIST_DIR, "FMS-Launcher.bat")
  );
  fs.copyFileSync(
    path.join(ROOT_DIR, "desktop/launcher/FMS-App.vbs"),
    path.join(DIST_DIR, "FMS-App.vbs")
  );
  fs.copyFileSync(
    path.join(ROOT_DIR, "desktop/launcher/stop.bat"),
    path.join(DIST_DIR, "stop.bat")
  );

  // Copy node.exe from current environment if available
  const currentNodeExe = process.execPath;
  if (fs.existsSync(currentNodeExe)) {
    console.log(`กำลังคัดลอก Node.js Runtime จาก ${currentNodeExe}...`);
    fs.copyFileSync(currentNodeExe, path.join(DIST_DIR, "bin/node/node.exe"));
  }

  // Copy PostgreSQL Binaries from system if present
  console.log("\n[6/7] กำลังตรวจสอบ Portable PostgreSQL Binaries...");
  copyPostgreSqlBinaries(path.join(DIST_DIR, "bin/pgsql"));

  // 7. Generate consolidated SQL for database creation
  console.log("\n[7/7] กำลังรวบรวมไฟล์ฐานข้อมูล fms_init.sql...");
  const migrationsDir = path.join(ROOT_DIR, "prisma/migrations");
  const migrationFolders = fs
    .readdirSync(migrationsDir)
    .filter((f) => fs.statSync(path.join(migrationsDir, f)).isDirectory())
    .sort();

  let combinedSql = "-- FMS Database Initialization Script\n-- Auto-generated\n\n";
  for (const folder of migrationFolders) {
    const sqlPath = path.join(migrationsDir, folder, "migration.sql");
    if (fs.existsSync(sqlPath)) {
      combinedSql += `-- Migration: ${folder}\n`;
      combinedSql += fs.readFileSync(sqlPath, "utf-8") + "\n\n";
    }
  }

  // Add default core data (Admin account: admin@app.local / Passw0rd!vibe)
  const defaultTenantId = "a0000000-0000-0000-0000-000000000001";
  const defaultUserId = "b0000000-0000-0000-0000-000000000001";
  const defaultRoleId = "c0000000-0000-0000-0000-000000000001";
  const defaultUserTenantId = "d0000000-0000-0000-0000-000000000001";
  // bcrypt hash for Passw0rd!vibe
  const adminPasswordHash = "$2a$12$6yK37a1Vnffp6j6Ff1y.K.8H0UfXN4y2WkO16zPqYI61Fq3mS8u1m";

  combinedSql += `-- Initial Data Seed
INSERT INTO "tenants" ("id", "code", "name_th", "name_en", "settings", "is_active", "created_at", "updated_at")
VALUES ('${defaultTenantId}', 'DEMO', 'หลักสูตรรัฐศาสตรบัณฑิต วิทยาลัยสงฆ์พุทธโสธร', 'Bachelor of Political Science Program', '{}', true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "roles" ("id", "tenant_id", "code", "name_th", "name_en", "is_system", "created_at", "updated_at")
VALUES ('${defaultRoleId}', '${defaultTenantId}', 'SUPER_ADMIN', 'ผู้ดูแลสูงสุด', 'Super Admin', true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "users" ("id", "email", "password_hash", "name", "provider", "email_verified", "is_active", "must_change_password", "created_at", "updated_at")
VALUES ('${defaultUserId}', 'admin@app.local', '${adminPasswordHash}', 'ผู้ดูแลสูงสุด', 'credentials', true, true, false, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "user_tenants" ("id", "user_id", "tenant_id", "is_active", "created_at", "updated_at")
VALUES ('${defaultUserTenantId}', '${defaultUserId}', '${defaultTenantId}', true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "user_roles" ("user_tenant_id", "role_id")
VALUES ('${defaultUserTenantId}', '${defaultRoleId}')
ON CONFLICT DO NOTHING;
`;

  fs.writeFileSync(path.join(DIST_DIR, "data/fms_init.sql"), combinedSql, "utf-8");

  // Compile with Inno Setup if installed
  compileInnoSetup();

  console.log("\n========================================================");
  console.log("  [สำเร็จอย่างสมบูรณ์!] แพ็กเกจถูกเตรียมพร้อมไว้ที่:");
  console.log(`  ${DIST_DIR}`);
  console.log("========================================================");
}

function copyPostgreSqlBinaries(destPgsqlDir: string): boolean {
  const possiblePaths = [
    "C:\\Program Files\\PostgreSQL\\17",
    "C:\\Program Files\\PostgreSQL\\16",
    "C:\\Program Files\\PostgreSQL\\15",
  ];
  const foundBase = possiblePaths.find((p) => fs.existsSync(p));
  if (!foundBase) {
    console.log("[คำแนะนำ] ไม่พบการติดตั้ง PostgreSQL บนระบบสำหรับคัดลอกไฟล์ binaries อัตโนมัติ");
    return false;
  }

  console.log(`พบ PostgreSQL บนระบบที่: ${foundBase}`);
  console.log("กำลังคัดลอก Portable PostgreSQL Binaries (bin, lib, share)...");

  // Copy bin
  const srcBin = path.join(foundBase, "bin");
  const destBin = path.join(destPgsqlDir, "bin");
  fs.mkdirSync(destBin, { recursive: true });

  const binFiles = fs.readdirSync(srcBin);
  for (const file of binFiles) {
    const lower = file.toLowerCase();
    if (
      lower.endsWith(".dll") ||
      lower === "postgres.exe" ||
      lower === "initdb.exe" ||
      lower === "pg_ctl.exe" ||
      lower === "psql.exe" ||
      lower === "createdb.exe" ||
      lower === "dropdb.exe" ||
      lower === "pg_dump.exe" ||
      lower === "pg_restore.exe"
    ) {
      fs.copyFileSync(path.join(srcBin, file), path.join(destBin, file));
    }
  }

  // Copy lib
  const srcLib = path.join(foundBase, "lib");
  const destLib = path.join(destPgsqlDir, "lib");
  if (fs.existsSync(srcLib)) {
    fs.cpSync(srcLib, destLib, { recursive: true });
  }

  // Copy share
  const srcShare = path.join(foundBase, "share");
  const destShare = path.join(destPgsqlDir, "share");
  if (fs.existsSync(srcShare)) {
    fs.cpSync(srcShare, destShare, { recursive: true });
  }

  console.log("[สำเร็จ] คัดลอก Portable PostgreSQL Binaries เรียบร้อยแล้ว");
  return true;
}

function compileInnoSetup() {
  const isccPaths = [
    path.join(process.env.LOCALAPPDATA || "", "Programs/Inno Setup 6/ISCC.exe"),
    "C:\\Program Files (x86)\\Inno Setup 6\\ISCC.exe",
    "C:\\Program Files\\Inno Setup 6\\ISCC.exe",
  ];
  const isccExe = isccPaths.find((p) => fs.existsSync(p));
  if (!isccExe) {
    console.log("\n[หมายเหตุ] ไม่พบ Inno Setup Compiler (ISCC.exe) ข้ามขั้นตอนคอมไพล์ .exe อัตโนมัติ");
    return;
  }

  console.log("\nกำลังคอมไพล์ไฟล์ติดตั้ง FMS-Faculty-System-Setup.exe ด้วย Inno Setup...");
  const issFile = path.join(ROOT_DIR, "desktop/inno-setup/setup.iss");
  fs.mkdirSync(path.join(ROOT_DIR, "dist/installer"), { recursive: true });
  try {
    execSync(`"${isccExe}" "${issFile}"`, {
      stdio: "inherit",
      cwd: path.join(ROOT_DIR, "desktop/inno-setup"),
    });
    console.log("\n[สำเร็จยอดเยี่ยม!] ไฟล์ตัวติดตั้ง Windows (.exe) ถูกสร้างเรียบร้อยแล้วที่:");
    console.log(path.join(ROOT_DIR, "dist/installer/FMS-Faculty-System-Setup.exe"));
  } catch (err) {
    console.error("การคอมไพล์ Inno Setup ขัดข้อง:", err);
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
