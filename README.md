# Birthday OS

A pastel ice-cyan and soft-pink birthday desktop for Nguyễn Thị Thuỳ Trang (`thichannn`). Built with Vite, React, TypeScript, Motion, Tailwind CSS and local assets.

## Run locally

```sh
npm install
npm run images:optimize
npm run dev
```

The image optimization step reads original PNGs from `assets-source/` and creates responsive WebP images in `public/assets/`. The originals remain untouched. Production checks: `npm run lint`, `npm run test`, and `npm run build`; `npm run preview` serves the production build locally.

## Personalize

- Edit the recipient, handle, photos, captions, date, and sender in `src/config/birthday.ts`.
- The approved Secret Note copy is centralized in `src/config/birthday.ts`.
- Replace photo PNGs in `assets-source/photos/`, keep the filenames or update the config, then run `npm run images:optimize`.
- Change the surprise text and hero presentation in `src/config/birthday.ts`.

## Privacy

There is no analytics, external image service, or audio autoplay. The optional MinIO API runs separately and stores credentials server-side. The provided photos are copied into `public/assets` by the optimization script and will be accessible to anyone who can access a deployed site. `noindex,nofollow` and `robots.txt` discourage indexing; they do **not** restrict access. Use hosting access control if the site must remain private. Do not publish personal photos without appropriate consent.

Deploy the contents of `dist/` to any static host.

## MinIO, admin and sharing

Node 22.16+ is required (`node:sqlite` is used for persistent ordering/settings). Copy `.env.example` to server-only `.env`, set the MinIO endpoint/access key/secret/bucket/prefix, then run the API and Vite:

```sh
npm run api:dev
npm run dev
```

Open the private-by-omission admin URL directly at `/admin-setup-img`. Configure `ADMIN_USERNAME`, set `ADMIN_PASSWORD_HASH` using `npm run admin:hash`, and add a random 32+ character `SESSION_SECRET` to `.env`. The hash script prints a bcrypt hash, never a plaintext password. Keep `.env` on the server and do not prefix server secrets with `VITE_`.

The API uses SQLite at `MEMORIES_DB_PATH` to persist stable media IDs, manual order, captions, alt text, visibility and site settings. Back up that SQLite file together with the MinIO bucket; restore both before starting the API. The development checkout's ignored `.env` connects to its MinIO instance; do not copy that file into source control. For a different installation, upload numbered files such as `1.jpg`, `2.png`, `10.webp` directly under the configured prefix and use **Sync**. Newly found files are appended after the current order. “Reset to filename order” is explicit and does not rename MinIO objects. Equal numeric stems are reported to the admin API and the configured image extension priority decides which is public. The MinIO policy needs `ListBucket`, `GetObject`, `PutObject` and `DeleteObject`, scoped to the configured bucket and prefix.

For production, build with `npm run build`, set `NODE_ENV=production`, and run `npm run api:start` from the repository with `dist/` present. The Express process serves the static site and `/share`; configure the reverse proxy to pass `/api/*`, `/share`, and the SPA paths to this process. Mount persistent storage for `MEMORIES_DB_PATH`. Give MinIO a scoped read/write policy for only the configured bucket/prefix. Keep the public bucket private; the server issues one-hour signed reads. Add the deployed public HTTPS origin to `ALLOWED_ORIGINS`, then set/save `Public Website URL` and enable sharing from the admin page. Until then, sharing is intentionally disabled and no localhost QR is shown. `/share` returns server-rendered Open Graph tags; a deployed test is still required to verify reachability from Zalo and its cache behavior.

`npm run memories:check` inspects numeric objects in MinIO; `npm run test:api` checks filename ordering without contacting MinIO. Admin data is independent of object names; manual reorder does not rename or move stored originals. The currently configured development MinIO access key is read-only; provide a server-side key with the scoped write permissions above before using admin upload, replace or delete.

Upload images directly under `MINIO_PREFIX` as `1.jpg`, `2.png`, `10.webp`, etc. Only one object per numeric order is returned; duplicate preference is WebP, AVIF, JPG, JPEG, then PNG. Nested folders and non-numbered names are ignored.
