const extensionPriority = new Map([['webp', 0], ['avif', 1], ['jpg', 2], ['jpeg', 3], ['png', 4]]);
const numberedImage = /^(\d+)\.(jpg|jpeg|png|webp|avif)$/i;

export function selectNumberedImages(names, prefix = '') {
  const normalizedPrefix = prefix.replace(/^\/+|\/+$/g, '');
  const candidates = [];
  for (const name of names) {
    if (normalizedPrefix && !name.startsWith(`${normalizedPrefix}/`)) continue;
    const relative = normalizedPrefix ? name.slice(normalizedPrefix.length + 1) : name;
    if (relative.includes('/')) continue;
    const match = numberedImage.exec(relative);
    if (!match) continue;
    const order = Number(match[1]);
    if (!Number.isSafeInteger(order) || order < 1) continue;
    const extension = match[2].toLowerCase();
    candidates.push({ name, order, extension });
  }
  candidates.sort((a, b) => a.order - b.order || extensionPriority.get(a.extension) - extensionPriority.get(b.extension) || a.name.localeCompare(b.name));
  const seen = new Set();
  const duplicates = new Set();
  const photos = [];
  for (const image of candidates) {
    if (seen.has(image.order)) { duplicates.add(image.order); continue; }
    seen.add(image.order);
    photos.push(image);
  }
  return { photos, duplicates: [...duplicates].sort((a, b) => a - b) };
}
