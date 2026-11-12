import assert from 'node:assert/strict';
import test from 'node:test';
import sharp from 'sharp';
import { BinaryBitmap, HybridBinarizer, QRCodeReader, RGBLuminanceSource } from '@zxing/library';
import { createShareCard } from './share-card.mjs';

test('share card is full-size and its heart-marked QR decodes to the share URL', async () => {
  const url = 'https://birthday.example.com/share';
  const card = await createShareCard(url);
  const metadata = await sharp(card).metadata();
  assert.deepEqual([metadata.width, metadata.height], [1200, 630]);
  for (const width of [1200, 750, 600]) {
    const image = await sharp(card).resize({ width }).flatten({ background: '#ffffff' }).greyscale().raw().toBuffer({ resolveWithObject: true });
    const bitmap = new BinaryBitmap(new HybridBinarizer(new RGBLuminanceSource(new Uint8ClampedArray(image.data), image.info.width, image.info.height)));
    assert.equal(new QRCodeReader().decode(bitmap).getText(), url);
  }
});
