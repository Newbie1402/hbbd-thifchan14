import express from 'express';
import { GetObjectCommand, HeadObjectCommand, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import bcrypt from 'bcryptjs';
import { DatabaseSync } from 'node:sqlite';
import { createHmac, randomBytes } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';
import sharp from 'sharp';
import { selectNumberedImages } from './memory-utils.mjs';
import { createHeartQr, createShareCard, SHARE_CARD_VERSION } from './share-card.mjs';

const app = express();
const port = Number(process.env.MEMORIES_API_PORT || 8787);
const configured = Boolean(process.env.MINIO_ENDPOINT && process.env.MINIO_ACCESS_KEY && process.env.MINIO_SECRET_KEY && process.env.MINIO_BUCKET);
const endpoint = process.env.MINIO_ENDPOINT?.replace(/^https?:\/\//, '').replace(/\/$/, '');
const useSsl = process.env.MINIO_USE_SSL === 'true';
const client = configured ? new S3Client({
  endpoint: `${useSsl ? 'https' : 'http'}://${endpoint}:${Number(process.env.MINIO_PORT || (useSsl ? 443 : 9000))}`,
  region: process.env.MINIO_REGION || 'us-east-1',
  forcePathStyle: true,
  credentials: { accessKeyId: process.env.MINIO_ACCESS_KEY, secretAccessKey: process.env.MINIO_SECRET_KEY },
}) : null;
const prefix = (process.env.MINIO_PREFIX || 'birthday/memories/').replace(/^\/+/, '').replace(/\/*$/, '/');
const bucket = process.env.MINIO_BUCKET;
const allowedOrigins = new Set((process.env.ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean));
const cacheTtlSeconds = Math.max(30, Math.min(60, Number(process.env.MEMORIES_CACHE_TTL_SECONDS || 45)));
const cache = { expiresAt: 0, payload: null };
const requests = new Map();
const maxScan = 5000;
const maxPhotos = 250;
const signedUrlSeconds = 3600;
if (prefix.length > 1024 || Array.from(prefix).some((char) => char.charCodeAt(0) < 32) || prefix.split('/').includes('..')) throw new Error('MINIO_PREFIX is invalid.');

app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY || false);
app.use(express.json({ limit: '64kb' }));
app.use((request, response, next) => {
  const origin = request.get('origin');
  const sameOrigin = origin === `${request.protocol}://${request.get('host')}`;
  if (origin && !allowedOrigins.has(origin) && !sameOrigin) return response.status(403).json({ error: 'Origin is not allowed.' });
  if (origin) response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Vary', 'Origin');
  next();
});
app.use((request, response, next) => {
  const now = Date.now();
  const key = request.ip || 'unknown';
  const entry = requests.get(key);
  if (!entry || now - entry.startedAt >= 60_000) requests.set(key, { startedAt: now, count: 1 });
  else if (++entry.count > 120) return response.status(429).json({ error: 'Too many requests. Try again shortly.' });
  next();
});
app.options('/api/*path', (request, response) => {
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Max-Age', '600');
  response.sendStatus(204);
});
app.get('/api/health', (_request, response) => response.json({ ok: true, minioConfigured: configured }));
app.get('/api/memories', async (_request, response) => {
  if (!client || !bucket) return response.status(503).json({ error: 'Memories storage is not configured on this server.' });
  if (cache.payload && Date.now() < cache.expiresAt) return response.json(cache.payload);
  try {
    const listed = [];
    let scanned = 0;
    let continuationToken;
    do {
      const page = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: continuationToken, MaxKeys: 1000 }));
      for (const item of page.Contents || []) {
        scanned += 1;
        if (item.Key) listed.push({ name: item.Key, size: item.Size });
        if (scanned >= maxScan) break;
      }
      continuationToken = scanned >= maxScan || !page.IsTruncated ? undefined : page.NextContinuationToken;
    } while (continuationToken);
    const { photos, duplicates } = selectNumberedImages(listed.map(({ name }) => name), prefix);
    if (duplicates.length) console.warn(`Skipped duplicate memory orders: ${duplicates.join(', ')}`);
    const output = [];
    for (let offset = 0; offset < Math.min(photos.length, maxPhotos); offset += 8) {
      const batch = photos.slice(offset, offset + 8);
      const resolved = await Promise.all(batch.map(async (photo) => {
        const metadata = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: photo.name }));
        const contentType = String(metadata.ContentType || '').toLowerCase().split(';')[0];
        if (contentType && !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(contentType)) return null;
        const src = await getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: photo.name }), { expiresIn: signedUrlSeconds });
        return { id: String(photo.order), order: photo.order, src, caption: null };
      }));
      output.push(...resolved.filter(Boolean));
    }
    const payload = { photos: output, refreshedAt: new Date().toISOString() };
    cache.payload = payload;
    cache.expiresAt = Date.now() + cacheTtlSeconds * 1000;
    response.setHeader('Cache-Control', `private, max-age=${cacheTtlSeconds}`);
    return response.json(payload);
  } catch (error) {
    console.error('Unable to list birthday memories:', error instanceof Error ? error.message : 'unknown storage error');
    return response.status(502).json({ error: 'Memories are temporarily unavailable. Please retry shortly.' });
  }
});

const dbPath = resolve(process.env.MEMORIES_DB_PATH || './data/birthday-os.sqlite');
await mkdir(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec(`PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS images (id TEXT PRIMARY KEY, object_key TEXT NOT NULL UNIQUE, filename TEXT NOT NULL, filename_index INTEGER, sort_order INTEGER NOT NULL, caption TEXT NOT NULL DEFAULT '', alt TEXT NOT NULL DEFAULT '', visible INTEGER NOT NULL DEFAULT 1, mime_type TEXT NOT NULL, width INTEGER NOT NULL DEFAULT 0, height INTEGER NOT NULL DEFAULT 0, etag TEXT, thumbnail_key TEXT, missing INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS images_order_idx ON images(sort_order);`);
try{db.exec('ALTER TABLE images ADD COLUMN thumbnail_key TEXT');}catch(error){if(!String(error.message).includes('duplicate column name'))throw error;}
const sessions = new Map();
const loginAttempts = new Map();
const publicSiteConfig = () => {
  const values = Object.fromEntries(db.prepare('SELECT key,value FROM settings').all().map((row) => [row.key, row.value]));
  const base = (values.publicBaseUrl || process.env.PUBLIC_BASE_URL || '').replace(/\/+$/, '');
  return { shareUrl: base ? `${base}/share?v=${SHARE_CARD_VERSION}` : null, shareReady: Boolean(base && values.shareEnabled === 'true'), title: values.shareTitle || 'A little birthday surprise for Thuỳ Trang ♡', description: values.shareDescription || 'Một góc nhỏ pastel dành riêng cho Thuỳ Trang.', ogImageUrl: base ? `${base}/api/public/share-card.png?v=${SHARE_CARD_VERSION}` : null, questEnabled: true };
};
const safeImage = (row, src, thumbnailSrc=src) => ({ id: row.id, sortOrder: row.sort_order, src, thumbnailSrc, width: row.width||1200, height: row.height||900, alt: row.alt, caption: row.caption, filename: row.filename, visible: Boolean(row.visible), missing: Boolean(row.missing), filenameIndex: row.filename_index });
async function makeThumbnail(key,id){const object=await client.send(new GetObjectCommand({Bucket:bucket,Key:key}));if(!object.Body||object.ContentLength>50*1024*1024)throw new Error('Image is too large or unavailable.');const buffer=Buffer.from(await object.Body.transformToByteArray());const meta=await sharp(buffer,{limitInputPixels:40_000_000}).metadata();if(!meta.width||!meta.height||!['jpeg','png','webp','avif'].includes(meta.format||''))throw new Error('Unsupported image data.');const swap=[5,6,7,8].includes(meta.orientation||1);const width=swap?meta.height:meta.width;const height=swap?meta.width:meta.height;const thumbnailKey=`${prefix}.thumbnails/${id}.webp`;const thumbnail=await sharp(buffer,{limitInputPixels:40_000_000}).rotate().resize({width:480,height:480,fit:'inside',withoutEnlargement:true}).webp({quality:78}).toBuffer();await client.send(new PutObjectCommand({Bucket:bucket,Key:thumbnailKey,Body:thumbnail,ContentType:'image/webp',CacheControl:'public,max-age=31536000,immutable'}));return {width,height,thumbnailKey};}
async function syncImages() {
  if (!client || !bucket) throw new Error('Memories storage is not configured on this server.');
  const listed = []; let token; let scanned = 0;
  do {
    const page = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: token, MaxKeys: 1000 }));
    for (const item of page.Contents || []) { scanned++; if (item.Key && scanned <= 100_000) listed.push(item.Key); }
    token = page.IsTruncated && scanned <= 100_000 ? page.NextContinuationToken : undefined;
  } while (token);
  const selection = selectNumberedImages(listed, prefix); const numbered = selection.photos; duplicateOrders=selection.duplicates;
  const now = new Date().toISOString();
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare('UPDATE images SET missing=1,updated_at=?').run(now);
    for (const file of numbered) {
      const current = db.prepare('SELECT id,thumbnail_key FROM images WHERE object_key=?').get(file.name);
      const ext = file.extension;
      let head = {};
      try { head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: file.name })); } catch { continue; }
      const mime = String(head.ContentType || ({jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',avif:'image/avif'}[ext]) || '');
      if (!['image/jpeg','image/png','image/webp','image/avif'].includes(mime)) continue;
      const filename = file.name.slice(prefix.length);
      if (current) {let details={};if(!current.thumbnail_key){try{details=await makeThumbnail(file.name,current.id);}catch(error){console.warn('Unable to create memory thumbnail:',error.message);}}db.prepare('UPDATE images SET missing=0,etag=?,mime_type=?,width=CASE WHEN ?>0 THEN ? ELSE width END,height=CASE WHEN ?>0 THEN ? ELSE height END,thumbnail_key=COALESCE(?,thumbnail_key),updated_at=? WHERE object_key=?').run(head.ETag||null,mime,details.width||0,details.width||0,details.height||0,details.height||0,details.thumbnailKey||null,now,file.name);}
      else {
        const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order),0) AS n FROM images').get().n;
        const id=randomBytes(16).toString('hex');let details={};try{details=await makeThumbnail(file.name,id);}catch(error){console.warn('Unable to create memory thumbnail:',error.message);}db.prepare('INSERT INTO images(id,object_key,filename,filename_index,sort_order,caption,alt,mime_type,etag,thumbnail_key,width,height,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(id, file.name, filename, file.order, maxOrder + 1, '', `Birthday memory ${file.order}`, mime, head.ETag || null,details.thumbnailKey||null,details.width||0,details.height||0, now, now);
      }
    }
    const numberedNames=new Set(numbered.map(file=>file.name));
    for(const key of listed){if(numberedNames.has(key))continue;const existing=db.prepare('SELECT id FROM images WHERE object_key=?').get(key);if(!existing)continue;try{const head=await client.send(new HeadObjectCommand({Bucket:bucket,Key:key}));const mime=String(head.ContentType||'').toLowerCase().split(';')[0];if(['image/jpeg','image/png','image/webp','image/avif'].includes(mime))db.prepare('UPDATE images SET missing=0,mime_type=?,etag=?,updated_at=? WHERE object_key=?').run(mime,head.ETag||null,now,key);}catch(error){console.warn('Unable to refresh managed memory:',error.message);}}
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); throw error; }
  return db.prepare('SELECT * FROM images ORDER BY sort_order,id').all();
}
let duplicateOrders=[];
const requireMinio = (_req, res, next) => client && bucket ? next() : res.status(503).json({ error: 'MinIO is not configured on this server.' });
const originAllowed = (req) => {
  const origin = req.get('origin');
  return !origin || origin === `${req.protocol}://${req.get('host')}` || allowedOrigins.has(origin) || (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
};
function requireAdmin(req, res, next) {
  const key=sessionKey(req.cookies?.birthday_session || '');const session = sessions.get(key);
  if (!session || session.expiresAt < Date.now()) { if (session) sessions.delete(key); return res.status(401).json({ error: 'Please sign in again.' }); }
  if (req.method !== 'GET' && (!originAllowed(req) || req.get('x-csrf-token') !== session.csrf)) return res.status(403).json({ error: 'Security check failed. Refresh this page and retry.' });
  req.adminSession = session; next();
}
function sessionKey(token){return process.env.SESSION_SECRET?createHmac('sha256',process.env.SESSION_SECRET).update(token).digest('hex'):'';}
const mediaUrl = (id, thumbnail = false) => `/api/media/${encodeURIComponent(id)}${thumbnail ? '?thumbnail=1' : ''}`;
app.use((req, _res, next) => {
  const cookies = Object.fromEntries((req.headers.cookie || '').split(';').map((part) => part.trim().split('=').map(decodeURIComponent)).filter((parts) => parts.length === 2));
  req.cookies = cookies; next();
});
app.get('/api/public/site-config', (_req, res) => res.set('Cache-Control','public, max-age=30').json(publicSiteConfig()));
app.get('/api/media/:id', requireMinio, async (req, res) => {
  const row = db.prepare('SELECT * FROM images WHERE id=?').get(req.params.id);
  if (!row || row.missing) return res.sendStatus(404);
  const session = sessions.get(sessionKey(req.cookies?.birthday_session || ''));
  if (!row.visible && (!session || session.expiresAt < Date.now())) return res.sendStatus(404);
  const useThumbnail = req.query.thumbnail === '1' && Boolean(row.thumbnail_key);
  try {
    const object = await client.send(new GetObjectCommand({ Bucket: bucket, Key: useThumbnail ? row.thumbnail_key : row.object_key }));
    if (!object.Body) return res.sendStatus(404);
    res.set({
      'Content-Type': useThumbnail ? 'image/webp' : row.mime_type,
      'Cache-Control': row.visible ? 'public, max-age=300' : 'private, no-store',
      ...(object.ETag ? { ETag: object.ETag } : {}),
    });
    await pipeline(object.Body, res);
  } catch (error) {
    console.error('Unable to serve birthday memory:', error instanceof Error ? error.message : 'unknown storage error');
    if (!res.headersSent) res.status(502).json({ error: 'Image is temporarily unavailable.' });
    else res.destroy();
  }
});
app.get('/api/public/memories', requireMinio, async (_req, res) => {
  try {
    const rows = await syncImages();
    const visible = rows.filter((row) => row.visible && !row.missing);
    const items = visible.map((row) => safeImage(row, mediaUrl(row.id), mediaUrl(row.id, true)));
    const revision = rows.at(-1)?.updated_at || '0';
    res.set('Cache-Control',`public, max-age=${cacheTtlSeconds}`).json({ items, total: items.length, revision });
  } catch { res.status(502).json({ error: 'Memories are temporarily unavailable. Please retry shortly.' }); }
});
app.get('/api/public/share-card.png', async (_req, res) => {
  const config = publicSiteConfig();
  if (!config.shareReady) return res.status(404).json({ error: 'Set the public HTTPS domain in Birthday OS admin first.' });
  try {
    const png = await createShareCard(config.shareUrl);
    res.set({ 'Content-Type':'image/png','Cache-Control':'public, max-age=300' }).send(png);
  } catch { res.status(500).json({ error:'Could not build the share image.' }); }
});
app.get('/api/public/share-qr.png', async (_req, res) => {
  const config = publicSiteConfig();
  if (!config.shareReady) return res.status(404).json({ error: 'Sharing is not enabled in Birthday OS admin.' });
  try {
    const png = await createHeartQr(config.shareUrl);
    res.set({ 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=300' }).send(png);
  } catch { res.status(500).json({ error: 'Could not build the share QR.' }); }
});

app.post('/api/admin/auth/login', async (req,res) => {
  const ip = req.ip || 'unknown'; const attempt = loginAttempts.get(ip) || { start:Date.now(),count:0 };
  if (Date.now() - attempt.start > 60_000) { attempt.start=Date.now(); attempt.count=0; }
  if (attempt.count >= 8) return res.status(429).json({ error:'Too many sign-in attempts. Wait a minute and try again.' });
  attempt.count++; loginAttempts.set(ip,attempt);
  if (!originAllowed(req)) return res.status(403).json({ error:'Origin is not allowed.' });
  const { username, password } = req.body || {}; const passwordHash = process.env.ADMIN_PASSWORD_HASH || '';
  if (!process.env.ADMIN_USERNAME || !process.env.SESSION_SECRET || process.env.SESSION_SECRET.length<32 || !/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(passwordHash)) return res.status(503).json({ error:'Admin credentials are not configured. See the deployment guide.' });
  if(typeof password!=='string'||password.length>256||username!==process.env.ADMIN_USERNAME)return res.status(401).json({error:'Username or password is incorrect.'});
  if (!await bcrypt.compare(password,passwordHash)) return res.status(401).json({ error:'Username or password is incorrect.' });
  loginAttempts.delete(ip); const token=randomBytes(32).toString('base64url'); const csrf=randomBytes(24).toString('base64url'); sessions.set(sessionKey(token),{ csrf,expiresAt:Date.now()+8*60*60*1000 });
  res.cookie('birthday_session',token,{ httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:8*60*60*1000 }); res.json({ authenticated:true,csrf });
});
app.get('/api/admin/auth/me',(req,res) => { const session=sessions.get(sessionKey(req.cookies.birthday_session||'')); if (!session || session.expiresAt<Date.now()) return res.status(401).json({authenticated:false}); res.json({authenticated:true,csrf:session.csrf}); });
app.post('/api/admin/auth/logout',requireAdmin,(req,res) => { sessions.delete(sessionKey(req.cookies.birthday_session)); res.clearCookie('birthday_session',{path:'/',sameSite:'strict'}); res.sendStatus(204); });
app.get('/api/admin/images',requireAdmin,requireMinio,async (_req,res) => { try { const rows=await syncImages(); const images=rows.map(row=>safeImage(row,row.missing?'':mediaUrl(row.id,true))); res.json({items:images,total:images.length,duplicateFilenameOrders:duplicateOrders}); } catch { res.status(502).json({error:'Could not sync MinIO images.'}); } });
app.post('/api/admin/images/sync',requireAdmin,requireMinio,async (_req,res) => { try { const rows=await syncImages(); res.json({total:rows.filter(row=>!row.missing).length}); } catch { res.status(502).json({error:'Could not sync MinIO images.'}); } });
const multer = (await import('multer')).default;
const upload = multer({ storage:multer.memoryStorage(), limits:{ fileSize:20*1024*1024,files:20 } });
app.post('/api/admin/images/upload',requireAdmin,requireMinio,upload.array('images',20),async (req,res) => {
  const files=req.files||[]; if (!files.length) return res.status(400).json({error:'Choose at least one image.'});
  try {
    for (const file of files) {
      const metadata=await sharp(file.buffer,{limitInputPixels:40_000_000}).metadata(); const mime=({jpeg:'image/jpeg',png:'image/png',webp:'image/webp',avif:'image/avif'})[metadata.format||''];
      if (!mime || !metadata.width || !metadata.height) return res.status(415).json({error:`${file.originalname}: unsupported or invalid image.`});
      const filename=file.originalname.replace(/[^\p{L}\p{N}._-]/gu,'_').slice(0,120) || 'memory'; const numeric=/^([1-9]\d*)\.(jpg|jpeg|png|webp|avif)$/i.exec(filename); const key=numeric ? `${prefix}${filename}` : `${prefix}uploads/${randomBytes(16).toString('hex')}.${metadata.format}`;
      if (numeric && db.prepare('SELECT 1 FROM images WHERE object_key=?').get(key)) return res.status(409).json({error:`${filename} already exists. Rename it before uploading.`});
      const id=randomBytes(16).toString('hex');await client.send(new PutObjectCommand({Bucket:bucket,Key:key,Body:file.buffer,ContentType:mime}));const thumb=await sharp(file.buffer,{limitInputPixels:40_000_000}).rotate().resize({width:480,height:480,fit:'inside',withoutEnlargement:true}).webp({quality:78}).toBuffer();const thumbnailKey=`${prefix}.thumbnails/${id}.webp`;await client.send(new PutObjectCommand({Bucket:bucket,Key:thumbnailKey,Body:thumb,ContentType:'image/webp',CacheControl:'public,max-age=31536000,immutable'}));const now=new Date().toISOString(); const index=numeric?Number(numeric[1]):null; const order=db.prepare('SELECT COALESCE(MAX(sort_order),0)+1 AS n FROM images').get().n;const swap=[5,6,7,8].includes(metadata.orientation||1);const width=swap?metadata.height:metadata.width;const height=swap?metadata.width:metadata.height;
      db.prepare('INSERT INTO images(id,object_key,filename,filename_index,sort_order,caption,alt,mime_type,width,height,thumbnail_key,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)').run(id,key,filename,index,order,filename.replace(/\.[^.]+$/,''),filename.replace(/\.[^.]+$/,''),mime,width,height,thumbnailKey,now,now);
    }
    cache.payload=null; res.status(201).json({uploaded:files.length});
  } catch (error) { console.error('Admin upload failed:',error instanceof Error?error.message:'unknown'); res.status(400).json({error:'Upload failed. Check the image format and try again.'}); }
});
app.post('/api/admin/images/:id/replace',requireAdmin,requireMinio,upload.single('image'),async(req,res)=>{const row=db.prepare('SELECT object_key,thumbnail_key FROM images WHERE id=?').get(req.params.id);const file=req.file;if(!row)return res.sendStatus(404);if(!file)return res.status(400).json({error:'Choose a replacement image.'});try{const meta=await sharp(file.buffer,{limitInputPixels:40_000_000}).metadata();const mime=({jpeg:'image/jpeg',png:'image/png',webp:'image/webp',avif:'image/avif'})[meta.format||''];if(!mime||!meta.width||!meta.height)return res.status(415).json({error:'Unsupported or invalid image.'});const thumb=await sharp(file.buffer,{limitInputPixels:40_000_000}).rotate().resize({width:480,height:480,fit:'inside',withoutEnlargement:true}).webp({quality:78}).toBuffer();const thumbnailKey=row.thumbnail_key||`${prefix}.thumbnails/${req.params.id}.webp`;await client.send(new PutObjectCommand({Bucket:bucket,Key:row.object_key,Body:file.buffer,ContentType:mime}));await client.send(new PutObjectCommand({Bucket:bucket,Key:thumbnailKey,Body:thumb,ContentType:'image/webp',CacheControl:'public,max-age=31536000,immutable'}));const swap=[5,6,7,8].includes(meta.orientation||1);db.prepare('UPDATE images SET mime_type=?,width=?,height=?,thumbnail_key=?,etag=NULL,missing=0,updated_at=? WHERE id=?').run(mime,swap?meta.height:meta.width,swap?meta.width:meta.height,thumbnailKey,new Date().toISOString(),req.params.id);cache.payload=null;res.json({ok:true});}catch{res.status(400).json({error:'Replacement failed. Check the image and try again.'});}});
app.patch('/api/admin/images/:id',requireAdmin,async (req,res)=>{ const {caption,alt,visible,sortOrder}=req.body||{}; if (caption!==undefined && (typeof caption!=='string'||caption.length>300) || alt!==undefined && (typeof alt!=='string'||alt.length>300) || visible!==undefined && typeof visible!=='boolean' || sortOrder!==undefined && (!Number.isSafeInteger(sortOrder)||sortOrder<1)) return res.status(400).json({error:'Invalid image metadata.'}); const row=db.prepare('SELECT id FROM images WHERE id=?').get(req.params.id); if (!row) return res.sendStatus(404); db.prepare('UPDATE images SET caption=COALESCE(?,caption),alt=COALESCE(?,alt),visible=COALESCE(?,visible),sort_order=COALESCE(?,sort_order),updated_at=? WHERE id=?').run(caption??null,alt??null,visible===undefined?null:Number(visible),sortOrder??null,new Date().toISOString(),req.params.id); res.json({ok:true}); });
app.put('/api/admin/images/order',requireAdmin,(req,res)=>{const ids=req.body?.orderedIds;const rows=db.prepare('SELECT id FROM images ORDER BY sort_order,id').all();if(!Array.isArray(ids)||ids.length!==rows.length||new Set(ids).size!==ids.length||ids.some(id=>typeof id!=='string'||!rows.some(row=>row.id===id)))return res.status(400).json({error:'Order must contain every image ID exactly once.'});db.exec('BEGIN IMMEDIATE');try{const update=db.prepare('UPDATE images SET sort_order=?,updated_at=? WHERE id=?');ids.forEach((id,i)=>update.run(i+1,new Date().toISOString(),id));db.exec('COMMIT');res.json({ok:true});}catch{db.exec('ROLLBACK');res.status(500).json({error:'Could not save image order.'});}});
app.post('/api/admin/images/order/reset-to-filenames',requireAdmin,(req,res)=>{const rows=db.prepare('SELECT id,filename_index,object_key FROM images ORDER BY CASE WHEN filename_index IS NULL THEN 1 ELSE 0 END,filename_index,object_key').all();const update=db.prepare('UPDATE images SET sort_order=?,updated_at=? WHERE id=?');db.exec('BEGIN IMMEDIATE');try{rows.forEach((row,i)=>update.run(i+1,new Date().toISOString(),row.id));db.exec('COMMIT');res.json({ok:true});}catch{db.exec('ROLLBACK');res.status(500).json({error:'Could not reset image order.'});}});
app.delete('/api/admin/images/:id',requireAdmin,requireMinio,async(req,res)=>{const row=db.prepare('SELECT object_key,thumbnail_key FROM images WHERE id=?').get(req.params.id);if(!row)return res.sendStatus(404);try{await client.send(new DeleteObjectCommand({Bucket:bucket,Key:row.object_key}));if(row.thumbnail_key)await client.send(new DeleteObjectCommand({Bucket:bucket,Key:row.thumbnail_key}));db.prepare('DELETE FROM images WHERE id=?').run(req.params.id);cache.payload=null;res.sendStatus(204);}catch{res.status(502).json({error:'Could not delete this MinIO image.'});}});
app.get('/api/admin/site-settings',requireAdmin,(_req,res)=>{const v=Object.fromEntries(db.prepare('SELECT key,value FROM settings').all().map(r=>[r.key,r.value]));res.json({publicBaseUrl:v.publicBaseUrl||process.env.PUBLIC_BASE_URL||'',shareTitle:v.shareTitle||'A little birthday surprise for Thuỳ Trang ♡',shareDescription:v.shareDescription||'Một góc nhỏ pastel dành riêng cho Thuỳ Trang.',shareEnabled:v.shareEnabled==='true'});});
app.put('/api/admin/site-settings',requireAdmin,(req,res)=>{let {publicBaseUrl='',shareTitle='',shareDescription='',shareEnabled=false}=req.body||{};if(typeof publicBaseUrl!=='string'||typeof shareTitle!=='string'||typeof shareDescription!=='string'||typeof shareEnabled!=='boolean')return res.status(400).json({error:'Invalid site settings.'});publicBaseUrl=publicBaseUrl.trim().replace(/\/+$/,'');if(publicBaseUrl){try{const u=new URL(publicBaseUrl);const dev=process.env.NODE_ENV!=='production'&&['localhost','127.0.0.1'].includes(u.hostname);if(u.protocol!=='https:'&&!dev||u.username||u.password||u.search||u.hash||u.pathname!=='/'||(!dev&&(/^(localhost|.*\.local)$/i.test(u.hostname)||/^\d{1,3}(\.\d{1,3}){3}$/.test(u.hostname))))return res.status(400).json({error:'Use a public HTTPS website URL. HTTP is allowed only for localhost development.'});}catch{return res.status(400).json({error:'Enter a valid public website URL.'});}}if(shareTitle.length>120||shareDescription.length>300)return res.status(400).json({error:'Share text is too long.'});const save=db.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');Object.entries({publicBaseUrl,shareTitle,shareDescription,shareEnabled:String(shareEnabled)}).forEach(([k,v])=>save.run(k,String(v)));res.json(publicSiteConfig());});
app.get('/share',async(req,res)=>{const config=publicSiteConfig();const origin=config.shareUrl?new URL(config.shareUrl).origin:`${req.protocol}://${req.get('host')}`;const url=config.shareUrl||`${origin}/share`;let html;try{html=await readFile(resolve('dist/index.html'),'utf8');}catch{html='<!doctype html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script type="module" src="/src/main.tsx"></script></head><body><div id="root"></div></body></html>';};const tags=`<title>${escapeHtml(config.title)}</title><meta name="description" content="${escapeHtml(config.description)}"><meta property="og:title" content="${escapeHtml(config.title)}"><meta property="og:description" content="${escapeHtml(config.description)}"><meta property="og:url" content="${escapeHtml(url)}"><meta property="og:type" content="website"><meta property="og:image" content="${escapeHtml(config.ogImageUrl||`${origin}/api/public/share-card.png`)}"><meta name="twitter:card" content="summary_large_image">`;html=html.replace(/<title>[^<]*<\/title>/,tags);res.set('Cache-Control','public, max-age=60').type('html').send(html);});
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
if(process.env.NODE_ENV==='production'){app.use(express.static(resolve('dist')));app.get(/^(?!\/api\/).*/,(_req,res)=>res.sendFile(resolve('dist/index.html')));}
app.use((error, _request, response, next) => { void next; const status=error?.code==='LIMIT_FILE_SIZE'?413:error?.code==='LIMIT_FILE_COUNT'?400:400;response.status(status).json({error:status===413?'Image is too large (20 MB maximum).':'Invalid request. Check the supplied image or fields.'}); });
app.use((_request, response) => response.status(404).json({ error: 'Not found.' }));

app.listen(port, () => console.log(`Memories API listening on port ${port} (MinIO ${configured ? 'configured' : 'not configured'})`));
