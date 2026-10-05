// Chapter 3: sour, thin, and it settles. Left: a glass 12 cm tall (drawn large) standing on the table.
// Middle: a microscope box about 150 µm wide showing the casein: free micelles in milk, one joined-up
// gel in dahi, broken flocs in chaas. Right: how far the whey line has moved, and how thick the drink is.
// What is real and what is a model:
//  · The souring is CurdClear's: lactic acid bacteria turn lactose into lactic acid, the pH falls from
//    about 6.65 to about 4.5, and the casein micelles lose their charge near pH 4.6 (the isoelectric
//    point) and link into a gel. Dahi here: 0.8% titratable acidity.
//  · Stokes' law for one floc is exact arithmetic: v = d² Δρ g ÷ 18 η. The density difference (30 kg/m³)
//    and the floc sizes (tens of micrometres, the range reported for stirred yoghurt) are estimates.
//  · A crowd settles more slowly: Richardson & Zaki (1954), × (1 − φ)^4.65. The gel is taken to fill
//    90% of the dahi, so φ = 0.9 ÷ (1 + water). The sediment packs to φ = 0.6.
//  · Thickness: Krieger & Dougherty (1959). A model with typical values, not a measurement. Real
//    chaas also thins when stirred or swallowed (shear-thinning).
//  · In the microscope box the micelles are drawn far larger than life (a real one is 0.15 µm).
import { THREE } from '../kit.js';
import {
  COL, C2, TAU, PH_MILK, TA_DAHI, phOfAcid, drink, flocPhi, thickness, stokesFloc, hindered, wheyMax, wheyLayer, stokesMicelle, hex,
  board, panelBg, axes, title, line, dot, note, balls, chamber, glassOf, tableTop, rng, layout, clamp, lerp, smooth, link, VIEW, BOARD,
} from '../buttermilk.js';

const BX = { x0: -1.5, x1: 1.7, y0: 0.5, y1: 3.9, d: 1.0 };
const NCL = 18, PER = 9, N = NCL * PER, GX = -3.5, GH = 3.9, GR = 1.05, NP = 150;
const mmh = (v) => v * 3.6e6;
const speedText = (v) => { const m = mmh(v); return m >= 10 ? `${Math.round(m)} mm an hour` : m >= 0.1 ? `${m.toFixed(1)} mm an hour` : `${(m * 24 * 365).toFixed(0)} mm a year`; };

export default {
  id: 'sour',
  short: 'The sour',
  title: 'Sour, thin, and it settles',
  subtitle: 'Bacteria set milk into a gel. The churn breaks the gel into specks, and specks sink.',
  view: VIEW,
  learn: `<p>Buttermilk is sour because of <b>lactic acid bacteria</b>. They eat <b>lactose</b>, the sugar in milk, and give out <b>lactic acid</b>. The pH falls from about 6.6 to about 4.5. ${link('acidbaseclear', 'Acids and bases')} explains the scale, and ${link('curdclear', 'CurdClear')} follows the bacteria hour by hour.</p>
    <p>Milk's main protein, <b>casein</b>, floats in tiny bundles called <b>micelles</b>. Each carries an electric charge, so they push each other away. Near <b>pH 4.6</b> the charge is gone. The micelles stick together into one soft net that holds all the water: the milk has <b>set</b> into dahi.</p>
    <p>Churning tears that net into millions of soft specks called <b>flocs</b>, and water spreads them out. That is why chaas is <b>thin but not watery</b>: the flocs get in each other's way, so it flows a few times more slowly than water.</p>
    <p>It is also why chaas <b>separates</b>. A floc is slightly heavier than the liquid round it, so it sinks, slowly, by <b>Stokes' law</b>: twice as wide means four times as fast. After a while there is clear, greenish <b>whey</b> on top and white curd below. Nothing has gone wrong. <b>Stir</b> it and it is chaas again.</p>
    <p class="tip"><b>Try it:</b> choose <b>Chaas</b> and slide the minutes. Then add more water: the whey line falls much faster. Make the flocs smaller, as a mixer would, and it stays mixed far longer.</p>`,
  terms: [
    { t: 'Lactic acid', d: 'The mild acid that bacteria make from milk sugar. It gives dahi and chaas their tang.' },
    { t: 'Casein micelle', d: 'A bundle of milk protein about 150 millionths of a millimetre across.' },
    { t: 'Isoelectric point', d: 'The pH at which a protein carries no net charge. For casein it is 4.6.' },
    { t: 'Floc', d: 'A soft speck of broken curd, mostly whey, tens of thousandths of a millimetre across.' },
    { t: 'Whey', d: 'The clear, greenish-yellow liquid of milk: water, lactose, minerals and whey proteins.' },
    { t: 'Stokes\' law', d: 'The speed of a small ball through a liquid: v = d² Δρ g ÷ 18 η.' },
  ],
  defaults: { stage: 'chaas', water: 2, floc: 40, mins: 0 },
  controls: [
    { key: 'stage', type: 'seg', label: 'In the glass', options: [{ v: 'milk', label: 'Milk' }, { v: 'dahi', label: 'Set dahi' }, { v: 'chaas', label: 'Chaas' }] },
    { key: 'mins', type: 'range', label: 'Minutes left standing', min: 0, max: 240, step: 1, ends: ['just stirred', '4 hours'], fmt: (v) => (v < 60 ? `${Math.round(v)} min` : `${(v / 60).toFixed(1)} h`) },
    { key: 'water', type: 'range', label: 'Water for each part of dahi', min: 0.5, max: 4, step: 0.05, ends: ['thick', 'thin'], fmt: (v) => `1 : ${v.toFixed(2)}` },
    { key: 'floc', type: 'range', label: 'Size of the flocs', min: 10, max: 80, step: 1, ends: ['mixer-fine', 'hand-churned'], fmt: (v) => `${v} µm` },
    { type: 'buttons', label: 'Fix it', items: [{ label: 'Stir', act: (s) => { s.mins = 0; } }] },
  ],
  quiz: [
    { q: 'Why does milk set into dahi near pH 4.6?', options: ['The water evaporates', 'Casein micelles lose their charge and stick together into a net', 'The fat freezes', 'The lactose crystallises'], answer: 1, why: 'pH 4.6 is the isoelectric point of casein. With no charge to push them apart, the micelles link up and trap the water.' },
    { q: 'A glass of chaas has clear liquid on top after an hour. What happened?', options: ['It has gone bad', 'The curd specks sank and left whey above them', 'The water evaporated', 'Fat rose to the top'], answer: 1, why: 'Flocs of casein are a little denser than the liquid, so they settle. A stir mixes them back.' },
    { q: 'By Stokes\' law, a floc twice as wide sinks…', options: ['Half as fast', 'At the same speed', 'Twice as fast', 'Four times as fast'], answer: 3, why: 'Speed goes with the square of the diameter. That is why finely blended chaas stays mixed much longer.' },
  ],
  reel: [
    { ms: 5000, caption: 'Bacteria turn milk sugar into lactic acid. Near pH 4.6 the milk protein links up and the milk sets.', set: { stage: 'milk', water: 2, floc: 40, mins: 0 }, anim: { stage: ['milk', 'dahi'] }, spin: 0.04 },
    { ms: 5600, caption: 'Churning breaks the gel into specks. They slowly sink, leaving clear whey on top. A stir fixes it.', set: { stage: 'chaas', water: 2.5, floc: 45 }, anim: { mins: [0, 200] }, spin: 0.04 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const rnd = rng(11);
    tableTop(root, 11.5, 5.2);
    const glass = glassOf(root, { x: GX, z: 0.4, r: GR, h: GH, liquid: 0xf6f3ea, level: 0.9 });
    const sp = balls(NP, { seg: 8, rough: 0.7 }); glass.g.add(sp);
    const P = Array.from({ length: NP }, () => ({ a: rnd() * TAU, r: 0.92 * Math.sqrt(rnd()), u: rnd(), ph: rnd() * TAU }));
    const cC = new THREE.Color(0xffffff); for (let i = 0; i < NP; i++) sp.tint(i, cC);
    // the microscope box
    chamber(root, BX.x0, BX.x1, BX.y0, BX.y1, BX.d);
    const W = BX.x1 - BX.x0, Hh = BX.y1 - BX.y0;
    const dots = balls(N, { seg: 10, rough: 0.5 }); root.add(dots);
    const cols = 6, rows = 3;
    const C = Array.from({ length: NCL }, (_, c) => {
      const gx = c % cols, gy = Math.floor(c / cols);
      return {
        gel: [BX.x0 + (gx + 0.5) * (W / cols) + (rnd() - 0.5) * 0.12, BX.y0 + (gy + 0.5) * (Hh / rows) + (rnd() - 0.5) * 0.2, (rnd() - 0.5) * 0.3],
        fl: [BX.x0 + 0.4 + ((c * 7) % NCL + 0.5) * ((W - 0.8) / NCL), (((c * 5) % NCL) + 0.5) / NCL, (rnd() - 0.5) * 0.5],
      };
    });
    const D = Array.from({ length: N }, (_, i) => {
      const u = rnd() * 2 - 1, a = rnd() * TAU, q = Math.sqrt(1 - u * u), rr = 0.3 * Math.cbrt(0.2 + 0.8 * rnd());
      return { c: Math.floor(i / PER), off: [rr * q * Math.cos(a) * 1.25, rr * q * Math.sin(a) * 1.9, rr * u * 0.6], free: [BX.x0 + 0.1 + rnd() * (W - 0.2), BX.y0 + 0.1 + rnd() * (Hh - 0.2), (rnd() - 0.5) * 0.7], ph: rnd() * TAU };
    });
    for (let i = 0; i < N; i++) dots.tint(i, cC);
    // links: inside a cluster (kept in chaas), and between neighbouring clusters (dahi only)
    const inner = [], outer = [];
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      if (D[i].c === D[j].c) { if ((i + j) % 3 === 0) inner.push([i, j]); }
      else {
        const a = C[D[i].c].gel, b = C[D[j].c].gel, dx = a[0] + D[i].off[0] - b[0] - D[j].off[0], dy = a[1] + D[i].off[1] - b[1] - D[j].off[1];
        if (dx * dx + dy * dy < 0.2) outer.push([i, j]);
      }
    }
    const mkLines = (pairs, col) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pairs.length * 6), 3)); const m = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.8 })); m.frustumCulled = false; root.add(m); return m; };
    const lin = mkLines(inner, 0xf4f1e8), lout = mkLines(outer, 0xf59ee6);
    const pos = new Float32Array(N * 3);

    const lBox = stage.label('Under a microscope: about 150 µm across', [(BX.x0 + BX.x1) / 2, BX.y1 + 0.28, 0], root);
    const lState = stage.label('', [(BX.x0 + BX.x1) / 2, BX.y0 - 0.3, 0.6], root, 'hot');
    const lGlass = stage.label('A glass 12 cm tall', [GX, GH + 0.35, 0.4], root);
    const lWhey = stage.label('', [GX + 1.5, 3, 0.4], root, 'hot'); lWhey.element.style.setProperty('--c', C2.whey);
    const lCurd = stage.label('', [GX + 1.5, 0.9, 0.4], root, 'hot'); lCurd.element.style.setProperty('--c', '#f4f1e8');

    let S = { stage: 'chaas', water: 2, floc: 40, mins: 0 }, kGel = 0, kFl = 1, wf = 0, tt = 0, fr = 0;
    const bd = board(root, 4.6, 3.3, 720, 516, (g, w, h) => {
      panelBg(g, w, h); title(g, 'Clear whey on top', 'share of the glass');
      const top = Math.max(0.2, Math.ceil(wheyMax(S.water) * 5) / 5);
      const { X, Y } = axes(g, w, h, { x0: 84, y1: 84, y0: h - 150, xMin: 0, xMax: 240, yMin: 0, yMax: top * 100, xTicks: [0, 60, 120, 180, 240], yTicks: [0, top * 50, top * 100], xFmt: (v) => (v ? v / 60 + ' h' : '0'), yFmt: (v) => Math.round(v) + '%', xLabel: 'time left standing' });
      if (S.stage === 'chaas') {
        const pts = []; for (let m = 0; m <= 240; m += 4) pts.push([m, wheyLayer(S.floc, S.water, m) * 100]);
        line(g, pts, X, Y, C2.whey, 5); dot(g, X(S.mins), Y(wheyLayer(S.floc, S.water, S.mins) * 100), C2.whey);
      } else note(g, S.stage === 'milk' ? 'Milk: the micelles are far too small to settle.' : 'Set dahi: one piece. Nothing is free to sink.', 110, 150, COL.text, 'bold 19px sans-serif');
      // thickness bar, log scale 1 to 1000 mPa·s
      const y = h - 86, x0 = 24, span = w - 48, lx = (v) => x0 + (Math.log10(clamp(v, 1, 1000)) / 3) * span;
      note(g, 'How thick? (mPa·s, each step is ×10)', x0, y - 10, COL.text, 'bold 18px sans-serif');
      g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(x0, y, span, 26);
      for (const [v, n] of [[1, 'water 1'], [2, 'milk 2'], [10, '10'], [100, '100'], [1000, '1,000']]) { g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(lx(v) - 1, y, 2, 26); note(g, n, lx(v) - (v === 1000 ? 44 : v === 1 ? 0 : 12), y + 48, 'rgba(255,255,255,.65)', '15px sans-serif'); }
      const eta = S.stage === 'milk' ? 2 : S.stage === 'dahi' ? 1000 : thickness(S.water) * 1000;
      g.fillStyle = '#f59ee6'; g.beginPath(); g.arc(lx(eta), y + 13, 12, 0, TAU); g.fill();
      const tx = S.stage === 'dahi' ? 'a soft solid: it does not flow until stirred' : `this glass: about ${eta < 10 ? eta.toFixed(1) : Math.round(eta)}`;
      g.font = 'bold 16px sans-serif'; const tw = g.measureText(tx).width;
      note(g, tx, lx(eta) + 18 + tw > w - 12 ? lx(eta) - 18 - tw : lx(eta) + 18, y + 19, '#f59ee6', 'bold 16px sans-serif');
    }, BOARD);

    return {
      update(dt, s) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s; tt += dt;
        layout(stage, [bd], [lBox, lGlass], { box: [-1.0, 0, 4.6, 7.6] });
        const st = s.stage, a = 1 - Math.exp(-dt * 3);
        kGel += ((st === 'milk' ? 0 : 1) - kGel) * a; kFl += ((st === 'chaas' ? 1 : 0) - kFl) * a;
        const target = st === 'chaas' ? wheyLayer(s.floc, s.water, s.mins) : 0;
        wf += (target - wf) * (1 - Math.exp(-dt * 6));
        glass.set(0.9, wf);
        glass.liqMat.opacity = st === 'chaas' ? lerp(0.8, 0.92, clamp(1 - flocPhi(s.water), 0, 1) * 0 + 0.5) : 0.96;
        const y0 = 0.1, y1 = glass.line - 0.04, show = st === 'chaas';
        P.forEach((p, i) => sp.place(i, p.r * GR * 0.9 * Math.cos(p.a), y0 + p.u * (y1 - y0) + 0.02 * Math.sin(tt * 2 + p.ph), p.r * GR * 0.9 * Math.sin(p.a), show ? 0.03 + 0.0006 * s.floc : 1e-4));
        sp.done();
        // microscope
        const fy0 = BX.y0 + 0.35, fy1 = BX.y1 - 0.35, sink = st === 'chaas' ? wf : 0;
        D.forEach((d, i) => {
          const c = C[d.c], jit = 0.05 * (1 - kGel) + 0.012;
          const fx = c.fl[0], fyy = fy0 + c.fl[1] * (fy1 - fy0) * (1 - sink), fz = c.fl[2];
          const gx = lerp(c.gel[0], fx, kFl) + d.off[0] * lerp(1, 0.5, kFl), gy = lerp(c.gel[1], fyy, kFl) + d.off[1] * lerp(1, 0.32, kFl), gz = lerp(c.gel[2], fz, kFl) + d.off[2];
          const x = lerp(d.free[0], gx, kGel) + jit * Math.sin(tt * 3 + d.ph), y = lerp(d.free[1], gy, kGel) + jit * Math.cos(tt * 2.6 + d.ph), z = lerp(d.free[2], gz, kGel);
          pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
          dots.place(i, x, y, z, 0.06);
        });
        dots.done();
        for (const [m, pairs, op] of [[lin, inner, kGel], [lout, outer, kGel * (1 - kFl)]]) {
          const arr = m.geometry.attributes.position.array;
          pairs.forEach(([i, j], k) => { arr.set(pos.subarray(i * 3, i * 3 + 3), k * 6); arr.set(pos.subarray(j * 3, j * 3 + 3), k * 6 + 3); });
          m.geometry.attributes.position.needsUpdate = true; m.material.opacity = 0.75 * op; m.visible = op > 0.03;
        }
        lState.element.innerHTML = st === 'milk' ? 'Milk, pH 6.6: micelles push each other away' : st === 'dahi' ? 'Dahi, pH 4.5: one joined-up net holds the water' : 'Chaas: the net is torn into flocs, and flocs sink';
        lState.element.style.setProperty('--c', st === 'dahi' ? '#f59ee6' : '#f4f1e8');
        lWhey.visible = st === 'chaas' && wf > 0.04; lWhey.position.y = (glass.line + glass.top) / 2; lWhey.element.innerHTML = `Whey: ${(wf * 12).toFixed(1)} cm`;
        lCurd.element.innerHTML = st === 'milk' ? 'Milk' : st === 'dahi' ? 'Set dahi: a gel' : wf > 0.04 ? 'Curd specks' : 'Chaas, just stirred';
        if (fr++ % 4 === 0) bd.redraw();
      },
      readout: (s) => {
        if (s.stage !== 'chaas') {
          const milk = s.stage === 'milk';
          return `<div class="big">${milk ? 'Milk: nothing settles' : 'Set dahi: a soft solid'}</div>
            <div class="row"><span>pH</span><b>${milk ? PH_MILK.toFixed(2) : phOfAcid(TA_DAHI).toFixed(1)}</b></div>
            <div class="row"><span>Acidity, as lactic acid</span><b>${milk ? '0.15% (not really acid yet)' : TA_DAHI.toFixed(1) + '%'}</b></div>
            <div class="row"><span>Casein</span><b>${milk ? 'free micelles, 0.15 µm' : 'one net through the whole pot'}</b></div>
            <div class="row"><span>Stokes speed of one micelle</span><b>${milk ? speedText(stokesMicelle()) : 'held in the net'}</b></div>
            <small>${milk ? 'A micelle is so small that the jostling of water molecules keeps it afloat for good. Milk protein never settles on its own.' : 'The bacteria made about 0.65% lactic acid from about 1 g of lactose in every 100 g. Churn it and the net breaks.'}</small>`;
        }
        const d = drink({ water: s.water }), v1 = stokesFloc(s.floc, s.water), vh = hindered(s.floc, s.water), wl = wheyLayer(s.floc, s.water, s.mins), eta = thickness(s.water) * 1000;
        const t1 = (0.01 / vh) / 60, mx = wheyMax(s.water) * 12;
        return `<div class="big">${wl * 12 < 0.3 ? 'Mixed' : `${(wl * 12).toFixed(1)} cm of whey on top`}</div>
          <div class="row"><span>One ${s.floc} µm floc, alone</span><b>${speedText(v1)}</b></div>
          <div class="row"><span>In this crowd (${Math.round(flocPhi(s.water) * 100)}% flocs)</span><b>${speedText(vh)}</b></div>
          <div class="row"><span>First centimetre of whey after</span><b>${mx < 1 ? 'never: too crowded' : t1 < 90 ? Math.round(t1) + ' min' : (t1 / 60).toFixed(1) + ' h'}</b></div>
          <div class="row"><span>Thickness</span><b>${eta.toFixed(1)} mPa·s · ${eta.toFixed(0)}× water</b></div>
          <div class="row"><span>pH · acid in each sip</span><b>${d.ph.toFixed(1)} · ${d.acid.toFixed(2)}%</b></div>
          <small>Water thins the acid but hardly moves the pH, because milk's buffers are diluted too. Settling and thickness are models with typical values.</small>`;
      },
    };
  },
};
