import sharp from 'sharp';
import { mkdir, readdir } from 'node:fs/promises';
import { join, basename } from 'node:path';

const source = 'assets-source';
const destination = 'public/assets';
for (const group of ['photos', 'illustrations']) {
  const dir = join(destination, group);
  await mkdir(dir, { recursive: true });
  for (const file of await readdir(join(source, group))) {
    if (!file.endsWith('.png')) continue;
    const input = join(source, group, file);
    const name = basename(file, '.png');
    const widths = group === 'photos' ? [480, 960, 1440] : [720, 1122];
    const metadata = await sharp(input).metadata();
    for (const width of widths) {
      if (metadata.width && width > metadata.width) continue;
      await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 84, alphaQuality: 90 }).toFile(join(dir, `${name}-${width}.webp`));
    }
  }
}
console.log('Optimized original photos and illustrations into responsive WebP assets.');
