#!/bin/sh
# Back up prod content (read-only on prod) to ./backups/maria-<timestamp>.tar.gz.
# Exports on the Fly machine so the prod DATABASE_URL never leaves Fly. Media files
# stay in S3 and the config is left out (same as the README's local-dev steps).
#
#   npm run backup:prod
#
# Restore with: npx strapi import -f backups/<file>.tar.gz --force
# (--force deletes existing content in whichever database it points at.)
set -eu

APP=maria-ol-backend
STAMP=$(date +%Y%m%d-%H%M%S)
REMOTE="/tmp/backup-$STAMP"
LOCAL="backups/maria-$STAMP.tar.gz"

mkdir -p backups

# The machine auto-stops when idle; a request wakes it. Wait until Strapi answers.
echo "Waking $APP..."
i=0
until [ "$(curl -s -o /dev/null -m 10 -w '%{http_code}' "https://$APP.fly.dev/_health")" = "204" ]; do
  i=$((i + 1))
  [ "$i" -gt 24 ] && { echo "$APP didn't start within ~2 minutes." >&2; exit 1; }
  sleep 5
done

fly ssh console -a "$APP" -C "sh -c 'cd /app && npx strapi export --no-encrypt --exclude files,config -f $REMOTE'"
fly sftp get "$REMOTE.tar.gz" "$LOCAL" -a "$APP"
fly ssh console -a "$APP" -C "rm -f $REMOTE.tar.gz"

echo "Saved $LOCAL ($(du -h "$LOCAL" | cut -f1))"
