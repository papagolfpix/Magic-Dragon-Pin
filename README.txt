MAGIC DRAGON PIN v0.4.1 — CORRECTED DEPLOYMENT BUILD

IMPORTANT FIX
The previous v0.4.0 deployment ZIP accidentally omitted:
- sw.js
- manifest.webmanifest

That meant the new cache/update behavior could not work as intended.

v0.4.1 includes:
- visible v0.4.1 badge at the top of the app
- Refresh App button
- complete service worker
- complete PWA manifest
- cache version magic-dragon-pin-v0.4.1
- network-first loading for page navigation so GitHub Pages updates are fetched
- automatic deletion of older Magic Dragon caches
- service-worker registration with updateViaCache:none
- Sunday Screenshot Import test workflow retained

DEPLOYMENT
Upload the individual files from this ZIP to the ROOT of the GitHub repository, replacing files with the same names.
Do not upload the ZIP itself as the app file.
