import assert from 'node:assert/strict';
import test from 'node:test';
import QRCode from 'qrcode';
import sharp from 'sharp';
import { BinaryBitmap, HybridBinarizer, QRCodeReader, RGBLuminanceSource } from '@zxing/library';
import { createHeartQr, createShareCard } from './share-card.mjs';

test('heart QR and full share card decode to the configured URL at chat preview sizes', async () => {
  const url = 'https://thifchann14.newbiexyz.id.vn/share?v=4';
  const heartQr = await createHeartQr(url);
  const squareQr = await QRCode.toBuffer(url, { errorCorrectionLevel: 'H', margin: 4, width: 600, color: { dark: '#c52f72', light: '#fffafd' } });
  const heartPixels = await sharp(heartQr).resize({ width: 300, height: 300, kernel: 'nearest' }).flatten({ background: '#fff' }).greyscale().raw().toBuffer();
  const squarePixels = await sharp(squareQr).resize({ width: 300, height: 300, kernel: 'nearest' }).flatten({ background: '#fff' }).greyscale().raw().toBuffer();
  const inkCount = (pixels) => pixels.reduce((count, value) => count + Number(value < 120), 0);
  assert.ok(inkCount(heartPixels) < inkCount(squarePixels) * 0.9, 'heart mask removes the square QR corners');
  for (const width of [600, 450, 320]) {
    const image = await sharp(heartQr).resize({ width, height: width, kernel: 'nearest' }).flatten({ background: '#ffffff' }).greyscale().raw().toBuffer({ resolveWithObject: true });
    assert.equal(new QRCodeReader().decode(new BinaryBitmap(new HybridBinarizer(new RGBLuminanceSource(new Uint8ClampedArray(image.data), image.info.width, image.info.height)))).getText(), url);
  }
  const card = await createShareCard(url);
  const metadata = await sharp(card).metadata();
  assert.deepEqual([metadata.width, metadata.height], [1200, 630]);
  for (const width of [1200, 750, 600]) {
    const image = await sharp(card).resize({ width }).flatten({ background: '#ffffff' }).greyscale().raw().toBuffer({ resolveWithObject: true });
    const bitmap = new BinaryBitmap(new HybridBinarizer(new RGBLuminanceSource(new Uint8ClampedArray(image.data), image.info.width, image.info.height)));
    assert.equal(new QRCodeReader().decode(bitmap).getText(), url);
  }
});
