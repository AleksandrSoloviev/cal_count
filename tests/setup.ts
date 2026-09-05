/**
 * Node 22+ exposes a `localStorage` getter that is undefined unless
 * `--localstorage-file` is set. That shadows jsdom's Storage. Install a
 * memory backend so persist tests can run.
 */
class MemoryStorage implements Storage {
  private readonly map = new Map<string, string>();

  get length(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }

  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }

  key(index: number): string | null {
    return [...this.map.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }

  setItem(key: string, value: string): void {
    this.map.set(String(key), String(value));
  }
}

const fromWindow = globalThis.window?.localStorage;
const usable =
  fromWindow && typeof fromWindow.clear === "function" ? fromWindow : new MemoryStorage();

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  enumerable: true,
  value: usable,
  writable: true,
});

if (globalThis.window) {
  Object.defineProperty(globalThis.window, "localStorage", {
    configurable: true,
    enumerable: true,
    value: usable,
    writable: true,
  });
}
