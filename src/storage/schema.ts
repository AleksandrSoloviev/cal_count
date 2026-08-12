import type { Entry, Food, Goals } from "../domain/types";
import { SCHEMA_VERSION } from "./keys";

export interface StorageDocument {
  version: number;
  goals: Goals | null;
  foods: Food[];
  entries: Entry[];
}

export const emptyDocument = (foods: Food[]): StorageDocument => ({
  version: SCHEMA_VERSION,
  goals: null,
  foods,
  entries: [],
});
