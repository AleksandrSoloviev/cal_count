import { DEFAULT_FOODS } from "../domain/defaults";
import type { StorageDocument } from "./schema";
import { emptyDocument } from "./schema";
import { SCHEMA_VERSION, STORAGE_KEY } from "./keys";

const isBrowser = (): boolean => typeof localStorage !== "undefined";

export const loadDocument = (): StorageDocument => {
  if (!isBrowser()) return emptyDocument([...DEFAULT_FOODS]);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyDocument([...DEFAULT_FOODS]);
    const parsed = JSON.parse(raw) as StorageDocument;
    if (!parsed || typeof parsed !== "object") return emptyDocument([...DEFAULT_FOODS]);
    return migrate(parsed);
  } catch {
    return emptyDocument([...DEFAULT_FOODS]);
  }
};

export const saveDocument = (doc: StorageDocument): void => {
  if (!isBrowser()) return;
  const payload: StorageDocument = { ...doc, version: SCHEMA_VERSION };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const migrate = (doc: StorageDocument): StorageDocument => {
  const version = typeof doc.version === "number" ? doc.version : 0;
  let next: StorageDocument = {
    version,
    goals: doc.goals ?? null,
    foods: Array.isArray(doc.foods) && doc.foods.length > 0 ? doc.foods : [...DEFAULT_FOODS],
    entries: Array.isArray(doc.entries) ? doc.entries : [],
  };
  if (version < SCHEMA_VERSION) {
    next = { ...next, version: SCHEMA_VERSION };
  }
  return next;
};
