import type { Dictionary } from "@/shared/lib/i18n/translate";
import { MESSAGES as core } from "./messages/core";
import { MESSAGES as identity } from "@/features/identity/messages";
import { MESSAGES as sample } from "@/features/sample/messages";
import { MESSAGES as news } from "@/features/news/messages";
import { MESSAGES as personnel } from "@/features/personnel/messages";
import { MESSAGES as booking } from "@/features/booking/messages";
import { messages as curriculum } from "@/features/curriculum/messages";
import { MESSAGES as documents } from "@/features/documents/messages";

/** พจนานุกรม UI ทั้งระบบ — feature ใหม่เพิ่มบรรทัด import ที่นี่ · key ต้องไม่ซ้ำข้าม feature */
export const UI_MESSAGES: Dictionary = { ...core, ...identity, ...sample, ...news, ...personnel, ...booking, ...curriculum, ...documents };


