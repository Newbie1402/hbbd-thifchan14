export interface MemoryPhoto {
  id: string;
  order: number;
  src: string;
  caption: string | null;
  alt: string;
  thumbnailSrc?: string;
  objectPosition?: string;
  width?: number;
  height?: number;
  filename?: string;
  filenameIndex?: number | null;
}
export interface MemoriesResponse { photos: MemoryPhoto[]; refreshedAt: string }
export type MemoriesSource = 'local' | 'minio';
