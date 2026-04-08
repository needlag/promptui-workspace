export function ensureId(value: string, label: string): string {
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`${label} requires a non-empty id.`);
  }

  return normalized;
}

