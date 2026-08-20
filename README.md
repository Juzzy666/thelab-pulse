# thelab-pulse
Keeps The Lab's flow radar scanning every ~60 seconds by looping inside hourly GitHub Actions jobs.
Contains no secrets — it only requests public, read-only endpoints. Alerts fire server-side.

## `site/` — juzzypeps

Also in this repo: [juzzypeps](site/README.md), a vendor-neutral peptide
reference and community site. Static HTML, no build step, no third-party
requests. Deployed to GitHub Pages from `site/` by `.github/workflows/pages.yml`.
