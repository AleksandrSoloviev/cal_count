import { todayStr } from "../domain/dates";
import { SCHEMA_VERSION } from "./keys";
import type { StorageDocument } from "./schema";

export const dumpFilename = (now = new Date()): string => `cal_count-${todayStr(now)}.json`;

export const serializeDump = (doc: StorageDocument): string =>
  `${JSON.stringify({ ...doc, version: SCHEMA_VERSION }, null, 2)}\n`;
