/* Reconstitution + dosing calculators. Everything runs locally; nothing is sent
   anywhere. Values are arithmetic only — they are not dosing advice. */
(function () {
  function num(id) {
    var el = document.getElementById(id);
    if (!el) return NaN;
    return parseFloat(el.value);
  }
  function set(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }
  function fmt(n, dp) {
    if (!isFinite(n)) return '—';
    var r = Number(n.toFixed(dp == null ? 2 : dp));
    return String(r);
  }

  /* ---- 1. Reconstitution ---- */
  var recon = document.getElementById('recon-form');
  if (recon) {
    var syringeFill = document.getElementById('syringe-fill');
    var syringeLabel = document.getElementById('syringe-label');

    function calcRecon() {
      var vialMg = num('vial-mg');
      var waterMl = num('water-ml');
      var doseMcg = num('dose-mcg');
      var syringeUnits = num('syringe-size');

      if (!(vialMg > 0) || !(waterMl > 0)) {
        set('out-conc', '—'); set('out-volume', '—'); set('out-units', '—'); set('out-doses', '—');
        return;
      }

      var mcgPerMl = (vialMg * 1000) / waterMl;
      set('out-conc', fmt(mcgPerMl, 0) + ' mcg/mL  (' + fmt(vialMg / waterMl, 2) + ' mg/mL)');

      if (!(doseMcg > 0)) {
        set('out-volume', '—'); set('out-units', '—'); set('out-doses', '—');
        if (syringeFill) syringeFill.style.width = '0%';
        if (syringeLabel) syringeLabel.textContent = 'enter a dose';
        return;
      }

      var doseMl = doseMcg / mcgPerMl;
      /* A U-100 insulin syringe reads 100 units per 1 mL, regardless of barrel size. */
      var units = doseMl * 100;
      var doses = (vialMg * 1000) / doseMcg;

      set('out-volume', fmt(doseMl, 3) + ' mL');
      set('out-units', fmt(units, 1) + ' units on a U-100 syringe');
      set('out-doses', fmt(Math.floor(doses), 0) + ' full doses per vial');

      if (syringeFill && syringeUnits > 0) {
        var pct = Math.max(0, Math.min(100, (units / syringeUnits) * 100));
        syringeFill.style.width = pct + '%';
        syringeFill.classList.toggle('is-over', units > syringeUnits);
        syringeLabel.textContent = units > syringeUnits
          ? 'exceeds a ' + syringeUnits + '-unit barrel — use less water or a larger syringe'
          : fmt(units, 1) + ' of ' + syringeUnits + ' units';
      }
    }

    recon.addEventListener('input', calcRecon);
    recon.addEventListener('change', calcRecon);
    recon.addEventListener('submit', function (e) { e.preventDefault(); calcRecon(); });
    calcRecon();
  }

  /* ---- 2. Unit converter ---- */
  var conv = document.getElementById('conv-form');
  if (conv) {
    function calcConv() {
      var v = num('conv-value');
      var from = document.getElementById('conv-from').value;
      if (!isFinite(v)) { set('conv-out', '—'); return; }
      var mcg = from === 'mg' ? v * 1000 : from === 'g' ? v * 1e6 : v;
      set('conv-out', fmt(mcg, 3) + ' mcg  ·  ' + fmt(mcg / 1000, 4) + ' mg  ·  ' + fmt(mcg / 1e6, 7) + ' g');
    }
    conv.addEventListener('input', calcConv);
    conv.addEventListener('change', calcConv);
    conv.addEventListener('submit', function (e) { e.preventDefault(); });
    calcConv();
  }

  /* ---- 3. Half-life / accumulation ---- */
  var hl = document.getElementById('hl-form');
  if (hl) {
    function calcHl() {
      var half = num('hl-hours');
      var interval = num('hl-interval');
      if (!(half > 0) || !(interval > 0)) {
        set('hl-steady', '—'); set('hl-ratio', '—'); set('hl-clear', '—');
        return;
      }
      /* Accumulation ratio for repeated dosing at a fixed interval. */
      var ratio = 1 / (1 - Math.pow(0.5, interval / half));
      set('hl-ratio', fmt(ratio, 2) + '× the single-dose peak');
      set('hl-steady', fmt(half * 5 / 24, 1) + ' days to ~97% of steady state');
      set('hl-clear', fmt(half * 5 / 24, 1) + ' days to ~97% cleared after the last dose');
    }
    hl.addEventListener('input', calcHl);
    hl.addEventListener('change', calcHl);
    hl.addEventListener('submit', function (e) { e.preventDefault(); });
    calcHl();
  }
})();
