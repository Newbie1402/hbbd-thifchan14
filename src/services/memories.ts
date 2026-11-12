import type { MemoriesResponse, MemoryPhoto } from '@/types/memories';

const apiBase = import.meta.env.VITE_MEMORIES_API_BASE_URL?.replace(/\/$/, '');
let cached: { expiresAt: number; data: MemoriesResponse } | null = null;

export function memoriesApiConfigured() { return Boolean(apiBase); }

export async function fetchMemories(force = false): Promise<MemoriesResponse> {
  if (!apiBase) throw new Error('MinIO memories API is not configured.');
  if (!force && cached && Date.now() < cached.expiresAt) return cached.data;
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(`${apiBase}/public/memories`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error || `Memories request failed (${response.status}).`);
      }
      const data = await response.json() as { refreshedAt?: string; photos?: MemoryPhoto[]; items?: (MemoryPhoto & { sortOrder?: number })[] };
      const items = data.items || data.photos;
      if (!Array.isArray(items)) throw new Error('Memories API returned an invalid response.');
      const normalized: MemoriesResponse = { refreshedAt: data.refreshedAt || new Date().toISOString(), photos: items.map((photo) => ({ ...photo, order: ('sortOrder' in photo ? photo.sortOrder : photo.order) || photo.order || 0, width: photo.width || 1200, height: photo.height || 900, alt: photo.alt || photo.caption || `Memory ${photo.order}`, thumbnailSrc: photo.thumbnailSrc || photo.src })) as MemoryPhoto[] };
      cached = { data: normalized, expiresAt: Date.now() + 30_000 };
      return normalized;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Memories are temporarily unavailable.');
      if (attempt < 2) await new Promise((resolve) => window.setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  throw lastError || new Error('Memories are temporarily unavailable.');
}
