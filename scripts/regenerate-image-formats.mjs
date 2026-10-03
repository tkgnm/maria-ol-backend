// Rebuild the generated sizes (thumbnail/small/medium/large/xlarge) of existing
// images with the current upload config: the breakpoints in config/plugins.ts and
// the WebP conversion in src/index.ts. Originals are never modified or deleted.
//
//   node scripts/regenerate-image-formats.mjs            # dry run: lists what would change
//   node scripts/regenerate-image-formats.mjs --apply    # uploads new sizes, updates the DB, deletes the old sizes
//
// It writes to whichever database and bucket the environment points at. For prod,
// run it on the Fly machine (where DATABASE_URL is prod), not from a laptop whose
// .env uses SQLite. Take a backup first. Safe to re-run: files that are already
// WebP are skipped.
import { mkdtempSync, writeFileSync, createReadStream } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const apply = process.argv.includes('--apply');
const FILE_UID = 'plugin::upload.file';

const app = await createStrapi(await compileStrapi()).load();
const images = app.plugin('upload').service('image-manipulation');
const provider = app.plugin('upload').provider;

const files = await app.db.query(FILE_UID).findMany({ where: { mime: { $startsWith: 'image/' } } });
console.log(`${apply ? 'APPLY' : 'DRY RUN'}: ${files.length} image(s)`);

let changed = 0;
for (const file of files) {
  const old = file.formats ?? {};
  const alreadyWebp = Object.keys(old).length > 0 && Object.values(old).every((f) => f.mime === 'image/webp');
  if (alreadyWebp) {
    console.log(`skip   ${file.name} (already WebP)`);
    continue;
  }
  if (!apply) {
    console.log(`would  ${file.name} (${Object.keys(old).join(', ') || 'no sizes'})`);
    continue;
  }

  const res = await fetch(file.url);
  if (!res.ok) throw new Error(`Couldn't download ${file.url}: ${res.status}`);
  const dir = mkdtempSync(path.join(tmpdir(), 'regen-'));
  const filepath = path.join(dir, file.hash);
  writeFileSync(filepath, Buffer.from(await res.arrayBuffer()));
  const source = {
    name: file.name, hash: file.hash, ext: file.ext, mime: file.mime,
    width: file.width, height: file.height, filepath, tmpWorkingDirectory: dir,
    getStream: () => createReadStream(filepath),
  };

  const next = {};
  const thumb = await images.generateThumbnail(source);
  if (thumb) next.thumbnail = thumb;
  for (const { key, file: f } of await images.generateResponsiveFormats(source)) next[key] = f;

  for (const f of Object.values(next)) await provider.upload(f); // sets f.url

  const formats = Object.fromEntries(
    Object.entries(next).map(([key, f]) => [key, {
      name: f.name, hash: f.hash, ext: f.ext, mime: f.mime, path: f.path ?? null,
      width: f.width, height: f.height, size: f.size, sizeInBytes: f.sizeInBytes, url: f.url,
    }])
  );
  await app.db.query(FILE_UID).update({ where: { id: file.id }, data: { formats } });
  for (const f of Object.values(old)) await provider.delete(f); // only after the DB points at the new ones

  changed++;
  console.log(`done   ${file.name} -> ${Object.keys(formats).join(', ')}`);
}

console.log(apply ? `Regenerated ${changed} image(s).` : 'Dry run only. Re-run with --apply to make changes.');
await app.destroy();
process.exit(0);
