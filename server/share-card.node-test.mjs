import assert from 'node:assert/strict';
import test from 'node:test';
import sharp from 'sharp';
import { BinaryBitmap, HybridBinarizer, QRCodeReader, RGBLuminanceSource } from '@zxing/library';
import { createHeartQr, createShareCard } from './share-card.mjs';

test('heart QR and full share card decode to the configured URL at chat preview sizes', async () => {
  const url = 'https://thifchann14.newbiexyz.id.vn/share?v=4';
  const heartQr = await createHeartQr(url);
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
