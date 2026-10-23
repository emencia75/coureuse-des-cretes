#!/bin/sh
# Assemble les modules de src/ en une seule page : index.html (autonome) et dist/page.html (fragment pour l'artifact claude.ai)
set -e
D=$(cd "$(dirname "$0")" && pwd)
mkdir -p "$D/dist"
cat "$D"/src/01a-head.html "$D"/src/01b-menu.css "$D"/src/01c-touch.css "$D"/src/01d-body.html \
    "$D"/src/10-core.js "$D"/src/20-data.js "$D"/src/30-world.js "$D"/src/40-hazards.js \
    "$D"/src/50-runners.js "$D"/src/60-weather.js "$D"/src/70-fx.js "$D"/src/80-ui.js "$D"/src/90-race.js > "$D/dist/page.html"
{ printf '<!doctype html>\n<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>\n'
  cat "$D/dist/page.html"; printf '</body></html>\n'; } > "$D/index.html"
echo "index.html et dist/page.html générés"
