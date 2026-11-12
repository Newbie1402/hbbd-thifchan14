import test from 'node:test';
import assert from 'node:assert/strict';
import { selectNumberedImages } from './memory-utils.mjs';

test('sorts numbered files numerically and permits gaps', () => {
  const result = selectNumberedImages(['birthday/10.webp', 'birthday/2.png', 'birthday/1.jpg', 'birthday/7.jpeg'], 'birthday/');
  assert.deepEqual(result.photos.map(({ order }) => order), [1, 2, 7, 10]);
});

test('filters invalid and nested names and normalizes uppercase extensions', () => {
  const result = selectNumberedImages(['x/01.JPG', 'x/2.PNG', 'x/README.jpg', 'x/nested/3.jpg', 'other/4.jpg', 'x/0.jpg'], 'x');
  assert.deepEqual(result.photos.map(({ order, extension }) => [order, extension]), [[1, 'jpg'], [2, 'png']]);
});

test('deduplicates numeric order with stable webp preference and handles empty listing', () => {
  const result = selectNumberedImages(['1.png', '1.jpg', '1.webp', '3.avif']);
  assert.deepEqual(result.photos.map(({ name }) => name), ['1.webp', '3.avif']);
  assert.deepEqual(result.duplicates, [1]);
  assert.deepEqual(selectNumberedImages([]), { photos: [], duplicates: [] });
});
