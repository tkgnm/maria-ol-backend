# maria-ol-backend

## 🧪 Local development with prod data

Local Strapi uses SQLite (`.tmp/data.db`) by default; prod is Postgres on Fly. To test against realistic content, copy prod's data into your local database with Strapi's transfer commands. Prod is only read from. Nothing is written to it.

> **Safety:** never put the prod `DATABASE_URL` in your local `.env`. The local `.env` should have no `DATABASE_*` variables so that `npm run develop` always uses SQLite.

1. **Export on the Fly machine** (so the prod database URL never leaves Fly). Media files stay on S3/CloudFront, and the config is left out so your local admin settings aren't overwritten:

   ```sh
   fly ssh console -a maria-ol-backend -C "sh -c 'cd /app && npx strapi export --no-encrypt --exclude files,config -f /tmp/maria-export'"
   ```

2. **Download the archive** (it's gitignored, so don't commit it):

   ```sh
   fly sftp get /tmp/maria-export.tar.gz ./maria-export.tar.gz -a maria-ol-backend
   ```

3. **Import locally.** This **deletes the existing local content first**, so back up the database if you care about it:

   ```sh
   cp .tmp/data.db .tmp/data.db.bak
   npx strapi import -f maria-export.tar.gz --force
   ```

4. **Start Strapi** with `npm run develop` and open <http://localhost:1337/admin>. Admin users and API tokens are *not* exported, so create a local admin the first time. Then create a read-only API token under Settings → API Tokens for the frontend to use.

Re-run steps 1–3 whenever you want to refresh local data. Local and prod must be on the same Strapi version.

Then point the frontend at this backend: see the [frontend README](https://github.com/tkgnm/maria-ol-frontend#developing-against-a-local-backend).
