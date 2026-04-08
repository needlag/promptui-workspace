import type { StateAdapter } from "../types/public";

export function createStateAdapter<T extends Record<string, unknown>>(initial: T): StateAdapter<T> {
  let current = initial;
  const listeners = new Set<(next: T) => void>();

  return {
    get() {
      return current;
    },
    set(next) {
      current = next;
      listeners.forEach((listener) => listener(current));
    },
    patch(patch) {
      current = {
        ...current,
        ...patch
      };
      listeners.forEach((listener) => listener(current));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

