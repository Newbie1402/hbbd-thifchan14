import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { selectNumberedImages } from '../server/memory-utils.mjs';

const endpoint = process.env.MINIO_ENDPOINT?.replace(/^https?:\/\//, '').replace(/\/$/, '');
const bucket = process.env.MINIO_BUCKET;
if (!endpoint || !bucket || !process.env.MINIO_ACCESS_KEY || !process.env.MINIO_SECRET_KEY) {
  console.error('Set MINIO_ENDPOINT, MINIO_BUCKET, MINIO_ACCESS_KEY, and MINIO_SECRET_KEY in server-side .env first.');
  process.exit(1);
}
const prefix = (process.env.MINIO_PREFIX || 'birthday/memories/').replace(/^\/+/, '').replace(/\/*$/, '/');
const useSsl = process.env.MINIO_USE_SSL === 'true';
const client = new S3Client({ endpoint: `${useSsl ? 'https' : 'http'}://${endpoint}:${Number(process.env.MINIO_PORT || (useSsl ? 443 : 9000))}`, region: process.env.MINIO_REGION || 'us-east-1', forcePathStyle: true, credentials: { accessKeyId: process.env.MINIO_ACCESS_KEY, secretAccessKey: process.env.MINIO_SECRET_KEY } });
const names = [];
let continuationToken;
do {
  const page = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: continuationToken, MaxKeys: 1000 }));
  for (const item of page.Contents || []) if (item.Key) names.push(item.Key);
  continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
} while (continuationToken);
const { photos, duplicates } = selectNumberedImages(names, prefix);
console.log(`Found ${photos.length} numbered memories in ${bucket}/${prefix}. Orders: ${photos.map(({ order }) => order).join(', ') || '(none)'}`);
if (duplicates.length) console.warn(`Skipped duplicate orders (webp > avif > jpg > jpeg > png): ${duplicates.join(', ')}`);
