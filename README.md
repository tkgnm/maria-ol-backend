# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

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

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
