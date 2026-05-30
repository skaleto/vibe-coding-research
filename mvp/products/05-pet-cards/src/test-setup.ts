// vitest setup: workaround for Node 25's built-in `localStorage` global which
// lacks `clear()`. We replace it with a minimal in-memory polyfill that the
// storage module (`src/lib/storage.ts`) can round-trip through.

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

const polyfill = new MemoryStorage();

// Replace both `globalThis.localStorage` (Node 25's broken one) and
// `window.localStorage` (jsdom's). Use defineProperty so re-defining works
// regardless of the original descriptor.
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  writable: true,
  value: polyfill,
});

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    writable: true,
    value: polyfill,
  });
}
