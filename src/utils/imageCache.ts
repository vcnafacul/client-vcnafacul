const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

interface CacheEntry {
  blobUrl: string;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export function getCachedImage(assetId: string): string | null {
  const entry = cache.get(assetId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    URL.revokeObjectURL(entry.blobUrl);
    cache.delete(assetId);
    return null;
  }
  return entry.blobUrl;
}

export function setCachedImage(assetId: string, blob: Blob): string {
  const existing = cache.get(assetId);
  if (existing) {
    URL.revokeObjectURL(existing.blobUrl);
  }
  const blobUrl = URL.createObjectURL(blob);
  cache.set(assetId, { blobUrl, expiresAt: Date.now() + SEVEN_DAYS_MS });
  return blobUrl;
}
