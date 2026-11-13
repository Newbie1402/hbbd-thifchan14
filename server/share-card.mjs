import QRCode from 'qrcode';
import sharp from 'sharp';

export const SHARE_CARD_VERSION = 4;

export async function createHeartQr(url) {
  const qr = QRCode.create(url, { errorCorrectionLevel: 'H' });
  const margin = 4;
  const size = qr.modules.size + margin * 2;
  const scale = (size - 1) / 41;
  const heartPath = `M${20.5 * scale} ${41 * scale}C${12 * scale} ${36 * scale} 0 ${29 * scale} 0 ${16 * scale}C0 ${4 * scale} ${12 * scale} ${1 * scale} ${20.5 * scale} ${10 * scale}C${29 * scale} ${1 * scale} ${41 * scale} ${4 * scale} ${41 * scale} ${16 * scale}C${41 * scale} ${29 * scale} ${29 * scale} ${36 * scale} ${20.5 * scale} ${41 * scale}Z`;
  const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="black"/><path d="${heartPath}" fill="white"/></svg>`);
  const { data: maskPixels } = await sharp(mask).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const modules = [];
  for (let row = 0; row < qr.modules.size; row += 1) {
    for (let column = 0; column < qr.modules.size; column += 1) {
      if (!qr.modules.get(row, column)) continue;
      const moduleOffset = (row + margin) * size + column + margin;
      const insideHeart = maskPixels[moduleOffset * 3] > 127;
      const finder = (row < 8 && column < 8) || (row < 8 && column >= qr.modules.size - 8) || (row >= qr.modules.size - 8 && column < 8);
      const timing = row === 6 || column === 6;
      if (insideHeart || finder || timing) {
        modules.push(`<rect x="${column + margin}" y="${row + margin}" width="1" height="1"/>`);
      }
    }
  }
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="#fffafd"/><g fill="#c52f72">${modules.join('')}</g></svg>`);
  return sharp(svg).png().toBuffer();
}

export async function createShareCard(url) {
  const qr = await createHeartQr(url);
  const background = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop stop-color="#ccffff"/><stop offset="1" stop-color="#ffcccc"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><rect x="274" y="4" width="652" height="622" rx="38" fill="#fffafd"/></svg>`);
  return sharp(background)
    .composite([{ input: qr, left: 300, top: 15 }])
    .png()
    .toBuffer();
}
