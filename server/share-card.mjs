import QRCode from 'qrcode';
import sharp from 'sharp';

export const SHARE_CARD_VERSION = 3;

export async function createShareCard(url) {
  const qr = await QRCode.toBuffer(url, {
    type: 'png',
    errorCorrectionLevel: 'Q',
    margin: 2,
    width: 600,
    color: { dark: '#c52f72', light: '#fffafd' },
  });
  const background = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop stop-color="#ccffff"/><stop offset="1" stop-color="#ffcccc"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><rect x="274" y="4" width="652" height="622" rx="38" fill="#fffafd"/></svg>`);
  const heart = Buffer.from('<svg width="76" height="76" xmlns="http://www.w3.org/2000/svg"><rect width="76" height="76" rx="15" fill="#fffafd"/><path d="M38 57C29 49 16 41 16 30c0-12 14-16 22-3 8-13 22-9 22 3 0 11-13 19-22 27Z" fill="#e34e8a"/></svg>');
  return sharp(background)
    .composite([{ input: qr, left: 300, top: 15 }, { input: heart, left: 562, top: 277 }])
    .png()
    .toBuffer();
}
