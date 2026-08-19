/* Compound library: loads the dataset, renders the index, filters it, and
   renders a detail view for #/slug. Progressive: the list works without JS
   only insofar as the no-JS notice explains where to get the raw JSON. */
(function () {
  var listEl = document.getElementById('cmp-list');
  if (!listEl) return;

  var countEl = document.getElementById('cmp-count');
  var searchEl = document.getElementById('cmp-search');
  var detailEl = document.getElementById('cmp-detail');
  var indexEl = document.getElementById('cmp-index');
  var metaEl = document.getElementById('cmp-meta');
  var emptyEl = document.getElementById('cmp-empty');

  var DATA = null;
  var filters = { q: '', tier: '', category: '' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var CATEGORY_LABELS = {
    metabolic: 'Metabolic',
    appetite: 'Appetite',
    'growth-hormone': 'GH axis',
    recovery: 'Recovery',
    gut: 'Gut',
    skin: 'Skin',
    immune: 'Immune',
    neuro: 'Neuro',
    longevity: 'Longevity',
    'sexual-health': 'Sexual health'
  };

  function tierBadge(tier) {
    var labels = { 1: 'Tier 1 · Approved', 2: 'Tier 2 · Clinical', 3: 'Tier 3 · Early', 4: 'Tier 4 · Preclinical' };
    return '<span class="badge badge--tier' + tier + '">' + esc(labels[tier]) + '</span>';
  }

  function matches(c) {
    if (filters.tier && String(c.tier) !== filters.tier) return false;
    if (filters.category && c.categories.indexOf(filters.category) === -1) return false;
    if (filters.q) {
      var hay = (c.name + ' ' + c.aka.join(' ') + ' ' + c.class + ' ' + c.summary).toLowerCase();
      if (hay.indexOf(filters.q.toLowerCase()) === -1) return false;
    }
    return true;
  }

  function renderList() {
    var rows = DATA.compounds.filter(matches);
    countEl.textContent = rows.length + ' of ' + DATA.compounds.length + ' compounds';
    emptyEl.hidden = rows.length > 0;

    listEl.innerHTML = rows.map(function (c) {
      return '' +
        '<a class="cmp-card" href="#/' + esc(c.slug) + '">' +
          '<div class="cmp-card__top">' +
            '<h3>' + esc(c.name) + '</h3>' + tierBadge(c.tier) +
          '</div>' +
          (c.aka.length ? '<p class="cmp-card__aka mono">' + esc(c.aka.join(' · ')) + '</p>' : '') +
          '<p class="cmp-card__class">' + esc(c.class) + '</p>' +
          '<p class="cmp-card__sum">' + esc(c.summary) + '</p>' +
          '<div class="tags">' + c.categories.map(function (k) {
            return '<span class="badge">' + esc(CATEGORY_LABELS[k] || k) + '</span>';
          }).join('') + '</div>' +
        '</a>';
    }).join('');
  }

  function renderDetail(slug) {
    var c = DATA.compounds.filter(function (x) { return x.slug === slug; })[0];
    if (!c) { location.hash = ''; return; }

    indexEl.hidden = true;
    detailEl.hidden = false;
    document.title = c.name + ' — Compound Library — Peptide Commons';

    var tierInfo = DATA.meta.tiers[String(c.tier)];
    var pubmed = 'https://pubmed.ncbi.nlm.nih.gov/?term=' + encodeURIComponent(c.name);
    var pubchem = 'https://pubchem.ncbi.nlm.nih.gov/#query=' + encodeURIComponent(c.name);

    detailEl.innerHTML = '' +
      '<p class="breadcrumb"><a href="#/">&larr; All compounds</a></p>' +
      '<div class="cmp-detail__head">' +
        '<div>' +
          '<h1>' + esc(c.name) + '</h1>' +
          (c.aka.length ? '<p class="mono muted">' + esc(c.aka.join(' · ')) + '</p>' : '') +
          '<p class="lede">' + esc(c.summary) + '</p>' +
        '</div>' +
        '<div class="cmp-detail__badges">' + tierBadge(c.tier) +
          c.categories.map(function (k) { return '<span class="badge">' + esc(CATEGORY_LABELS[k] || k) + '</span>'; }).join('') +
        '</div>' +
      '</div>' +

      '<div class="callout"><strong>' + esc(tierInfo.label) + '</strong>' + esc(tierInfo.detail) + '</div>' +

      '<div class="table-wrap" style="margin-top:1.5rem">' +
        '<table><caption class="visually-hidden">Identity and pharmacology reference for ' + esc(c.name) + '</caption><tbody>' +
          row('Regulatory status', c.status) +
          row('Class', c.class) +
          row('Sequence', '<span class="mono">' + esc(c.sequence) + '</span>') +
          row('Molecular weight', '<span class="mono">' + esc(c.mw) + '</span>') +
          row('Half-life', c.halfLife) +
          row('Routes studied', c.routes.join(', ')) +
          row('Storage', c.storage) +
        '</tbody></table>' +
      '</div>' +

      '<div class="grid grid--2" style="margin-top:1.5rem">' +
        '<section class="card"><h3>Mechanism</h3><p>' + esc(c.mechanism) + '</p></section>' +
        '<section class="card"><h3>What the evidence actually shows</h3><p>' + esc(c.evidence) + '</p></section>' +
      '</div>' +

      '<section class="card callout--warn" style="margin-top:1rem;border-left:3px solid var(--warn)">' +
        '<h3>Risks and cautions</h3><ul class="risk-list">' +
        c.risks.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') +
        '</ul></section>' +

      '<section class="card" style="margin-top:1rem">' +
        '<h3>Identity &amp; sourcing note</h3><p>' + esc(c.counterfeitNote) + '</p></section>' +

      '<div class="cmp-detail__links">' +
        '<a class="btn btn--ghost btn--sm" href="' + pubmed + '" rel="noopener nofollow" target="_blank">Search PubMed</a>' +
        '<a class="btn btn--ghost btn--sm" href="' + pubchem + '" rel="noopener nofollow" target="_blank">Search PubChem</a>' +
        '<a class="btn btn--ghost btn--sm" href="../tools.html">Reconstitution calculator</a>' +
      '</div>' +

      '<p class="tiny muted" style="margin-top:1.5rem">' + esc(DATA.meta.dataConfidence) + '</p>';

    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function row(label, value) {
    return '<tr><th scope="row" style="width:12.5rem">' + esc(label) + '</th><td>' + value + '</td></tr>';
  }

  function route() {
    var m = location.hash.match(/^#\/([a-z0-9-]+)$/i);
    if (m) {
      renderDetail(m[1]);
    } else {
      detailEl.hidden = true;
      indexEl.hidden = false;
      document.title = 'Compound Library — Peptide Commons';
    }
  }

  fetch('data/compounds.json')
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (json) {
      DATA = json;
      metaEl.textContent = 'Revision ' + json.meta.revision + ' · updated ' + json.meta.updated + ' · ' + json.meta.curators + ' curators';

      searchEl.addEventListener('input', function () { filters.q = searchEl.value.trim(); renderList(); });
      document.querySelectorAll('[data-filter]').forEach(function (sel) {
        sel.addEventListener('change', function () {
          filters[sel.dataset.filter] = sel.value;
          renderList();
        });
      });

      renderList();
      route();
      window.addEventListener('hashchange', route);
    })
    .catch(function (err) {
      listEl.innerHTML = '<div class="callout callout--danger"><strong>Could not load the library</strong>' +
        'The dataset failed to load (' + esc(err.message) + '). It is a plain file — you can read it directly at ' +
        '<a href="data/compounds.json"><code>data/compounds.json</code></a>.</div>';
    });
})();
