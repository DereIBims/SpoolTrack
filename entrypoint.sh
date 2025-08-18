#!/bin/sh

set -e
: "${APP_LANG:=de}"
echo "[entrypoint] APP_LANG=${APP_LANG}"

if [ -f /usr/share/nginx/html/config.template.js ]; then
  envsubst < /usr/share/nginx/html/config.template.js > /usr/share/nginx/html/config.js
fi

exec /usr/bin/supervisord -c /etc/supervisord.conf