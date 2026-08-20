# juzzypeps

A vendor-neutral peptide reference and community. Static HTML, no build step, no
dependencies, and no third-party requests of any kind.

## Layout

```
site/
  index.html          home
  library.html        compound library (filter + #/slug detail routing)
  tools.html          reconstitution, unit and half-life calculators
  safety.html         harm reduction, technique, storage, interactions
  sourcing.html       reading a CoA, what it omits, third-party testing
  community.html      log template and ground rules
  about.html          grading method, funding, corrections
  404.html
  data/compounds.json the entire library — the site renders from this file
  assets/css/base.css
  assets/js/          site.js (chrome), library.js, tools.js
```

## Editing the library

`data/compounds.json` is the whole dataset. Add an object to `compounds[]` and it
appears in the index, the filters and the detail route with no other change.
Required keys: `slug`, `name`, `aka[]`, `class`, `categories[]`, `tier` (1–4),
`status`, `sequence`, `mw`, `halfLife`, `routes[]`, `summary`, `mechanism`,
`evidence`, `risks[]`, `storage`, `counterfeitNote`.

Bump `meta.revision` and `meta.updated` with every substantive change — both are
rendered on the library page.

## Running locally

```sh
cd site && python3 -m http.server 8137
```

The library uses `fetch()` for the dataset, so it needs to be served over HTTP
rather than opened as a `file://` URL.

## Deploying

Any static host. `.github/workflows/pages.yml` publishes `site/` to GitHub Pages
on pushes to `main` that touch it, and can be run manually via workflow dispatch.
Point `404.html` at the host's not-found handler if it doesn't pick it up
automatically.

## Editorial rules

These are load-bearing, not decoration:

- No products, no affiliate links, no vendor names, no sponsored placement.
- Every compound carries an evidence tier before it carries a description.
- Failed trials are stated, not omitted (see `aod-9604`).
- The calculators do arithmetic on user-supplied numbers and never suggest a dose.
- No third-party scripts, fonts, pixels or analytics. Loading a page contacts one server.
