# Update Log — 2026-02-25

## Changes
- scanner.js: Improved local fallback selection using pixel stats (green/wood ratios, brightness variance) to better detect leaves/grass and avoid generic outputs.
- scanner.js: Loosened plant gating thresholds and exposed stats to keep more plant-like images (including grass/leaves) while still filtering obvious non-plant photos.
- plant-scanner.html: Bumped scanner.js cache-buster to pull the new logic.

## Deployment
- Uploaded scanner.js and plant-scanner.html to Hostinger via pscp (prod path /home/u243907064/domains/thenurserygreen.com/public_html/).

## Notes / Next Steps
- Hard refresh or use incognito to ensure the new JS loads (cache-buster v=20260225c).
- Re-test with leaf/grass and non-plant photos to validate gating and local fallback behavior.
