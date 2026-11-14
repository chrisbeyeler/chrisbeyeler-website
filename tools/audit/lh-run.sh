#!/bin/bash
# usage: lh-run.sh <url> <label> <runs>
export CHROME_PATH=${CHROME_PATH:-$(command -v chromium || command -v google-chrome)}
cd "$(dirname "$0")"; mkdir -p lh
for i in $(seq 1 ${3:-5}); do npx lighthouse "$1" --form-factor=mobile --output=json --output-path=lh/$2-$i.json --chrome-flags="--headless=new --no-sandbox" --quiet 2>&1 | grep -v "^$" | tail -2; done
node lh-sum.js $2
