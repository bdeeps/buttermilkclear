// Chapter 2: the churn, and what it leaves behind. Left: a microscope box about 40 µm wide where fat
// globules clump into butter grains. Middle: the matka and mathani (ButterClear's, 1 unit = 10 cm,
// drawn at 0.8 scale). Right: where the fat goes, and the time to "break" against temperature.
// What is real and what is a model (the same numbers as ButterClear, so the two boxes agree):
//  · Fat globules 0.1–20 µm across, mostly 3–4 µm, each in a membrane 10–20 nm thick (Tetra Pak Dairy
//    Processing Handbook). Churning beats in air, tears membranes, and a little liquid fat glues the
//    globules into clumps (partial coalescence) until grains separate (phase inversion).
//  · Time to break: ButterClear's rule-of-thumb model, 45 min at 14 °C by hand, faster when warmer.
//  · Fat recovered with a pot and mathani: 67% at 18 °C and 44% at 25 °C (FAO/ILCA), a straight line
//    through those two points, capped at 76%. A dairy churn loses under 1% of the fat.
//  · Solid fat at each temperature: the typical curve for milk fat (after Walstra).
//  · The mass balance is plain arithmetic: 1 kg of dahi plus the water added, minus makhan at 80% fat.
//  · The membrane pieces (phospholipids and proteins) torn off the globules stay in the liquid. Reviews
//    put the phospholipids of sweet buttermilk several times above skim milk's; no figure is drawn here.
import { THREE } from '../kit.js';
import {
  COL, C2, TAU, MILKS, T_COLD, T_OIL, breakMinutes, recovery, churnVerdict, churnSplit, sfc, churnPeak, hex,
  board, panelBg, axes, title, line, dot, note, band, balls, chamber, makeMatka, tableTop, rng, layout, clamp, lerp, smooth, fmtMin, link, VIEW, BOARD,
} from '../buttermilk.js';

const BX = { x0: -4.6, x1: -1.6, y0: 0.5, y1: 3.7, d: 1.0 };
const NG = 190, NC = 9, NM = 110, NGR = 22, PX = 0.55;

export default {
  id: 'churn',
  short: 'The churn',
  title: 'What the churn leaves',
  subtitle: 'The mathani pulls the fat out as makhan. Everything else stays in the pot, and that is buttermilk.',
  view: VIEW,
  learn: `<p>Here is the short version of ${link('butterclear', 'ButterClear')}. Milk fat floats in <b>globules</b>, most of them 3 to 4 thousandths of a millimetre across, each wrapped in a thin <b>membrane</b> that stops them merging. The mathani beats in air and tears those skins. A little liquid fat leaks out and glues the globules into clumps. The clumps grow into <b>butter grains</b>, and the mixture turns inside out: fat in water becomes water in fat. That flip is called <b>phase inversion</b>.</p>
    <p>Now look at what is <b>left behind</b>. The water stays. So do the milk <b>protein</b>, the <b>lactose</b>, the lactic acid and the minerals. So do the torn <b>membrane pieces</b>, which is why buttermilk is unusually rich in the membrane's <b>phospholipids</b>. Only the fat has gone, and not all of it.</p>
    <p>How much fat stays depends on <b>temperature</b>. Churning works best cool, at about 10 to 15 °C, when part of the fat is crystal and part is liquid. A clay pot and a mathani at 18 °C get about two thirds of the fat out. At 25 °C less than half comes out, and the rest stays in the chaas. That is why cold water or ice goes into the pot in summer, and why home chaas tastes richer than a dairy's. A dairy churn leaves only about 0.5% fat in its buttermilk.</p>
    <p class="tip"><b>Try it:</b> slide <b>Minutes of churning</b> until the grains appear. Then warm the pot to 28 °C and watch the fat left in the chaas climb. Add more cold water and see what it does to the drink.</p>`,
  terms: [
    { t: 'Fat globule', d: 'A tiny ball of milk fat in its own membrane. A millilitre of milk holds billions.' },
    { t: 'Partial coalescence', d: 'Globules sticking together without fully merging: liquid fat is the glue and fat crystals keep the shape.' },
    { t: 'Phase inversion', d: 'An emulsion turning inside out: fat in water becomes water in fat.' },
    { t: 'The break', d: 'The moment butter grains suddenly appear and thin buttermilk runs free.' },
    { t: 'Phospholipids', d: 'The fat-like molecules that make up the globule membrane. They stay in the buttermilk.' },
  ],
  defaults: { temp: 18, spm: 60, water: 1, milk: 'cow', mins: 0 },
  controls: [
    { key: 'mins', type: 'range', label: 'Minutes of churning', min: 0, max: 90, step: 0.5, ends: ['start', '90 min'], fmt: (v) => `${Math.round(v)} min` },
    { key: 'temp', type: 'range', label: 'Temperature in the pot', min: 4, max: 34, step: 1, ends: ['4 °C', '34 °C'], fmt: (v) => `${v} °C · ${Math.round(sfc(v))}% of the fat is crystal` },
    { key: 'spm', type: 'range', label: 'Rhythm', min: 20, max: 110, step: 1, ends: ['slow', 'fast'], fmt: (v) => `${v} strokes a minute` },
    { key: 'water', type: 'range', label: 'Water added to 1 kg of dahi', min: 0.25, max: 2, step: 0.05, ends: ['a little', '2 kg'], fmt: (v) => `${v.toFixed(2)} kg` },
    { key: 'milk', type: 'seg', label: 'Dahi made from', options: [{ v: 'cow', label: 'Cow milk' }, { v: 'buffalo', label: 'Buffalo milk' }] },
  ],
  quiz: [
    { q: 'After the makhan is lifted out, what is still in the pot?', options: ['Only water', 'Water, protein, lactose, acid, membrane pieces and a little fat', 'Mostly fat', 'Nothing useful'], answer: 1, why: 'Churning removes fat and almost nothing else. Everything dissolved or floating in the watery part stays behind as buttermilk.' },
    { q: 'You churn on a hot day at 28 °C with no cold water. What happens to the chaas?', options: ['It has less fat than usual', 'It has more fat than usual, because less of it clumped into makhan', 'It turns into ghee', 'It freezes'], answer: 1, why: 'Warm fat is nearly all liquid, so it smears instead of forming firm grains. More fat stays behind in the liquid.' },
    { q: 'Why is buttermilk rich in phospholipids?', options: ['They are added by the dairy', 'They come from the globule membranes torn off during churning', 'They are made by the pot', 'They are a kind of lactose'], answer: 1, why: 'Each fat globule wears a membrane of phospholipids and protein. Churning strips it off, and the pieces stay in the liquid.' },
  ],
  reel: [
    { ms: 5600, caption: 'Churn dahi with cold water. Fat globules lose their skins, stick together and grow into grains of makhan.', set: { temp: 18, spm: 60, water: 1, milk: 'cow' }, anim: { mins: [0, 21] }, spin: 0.04 },
    { ms: 5200, caption: 'Lift the makhan out. The water, protein, milk sugar and acid stay behind: that is traditional buttermilk.', set: { temp: 18, spm: 60, water: 1, milk: 'cow' }, anim: { mins: [21, 45] }, spin: 0.04 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const rnd = rng(31);
    tableTop(root, 11.5, 5.2);
    const W = BX.x1 - BX.x0, Hh = BX.y1 - BX.y0;
    chamber(root, BX.x0, BX.x1, BX.y0, BX.y1, BX.d);
    const rp = (m = 0.2) => [BX.x0 + m + rnd() * (W - 2 * m), BX.y0 + m + rnd() * (Hh - 2 * m), (rnd() - 0.5) * 0.6];
    // globules: each belongs to a clump, or is one of those that never clump (they stay in the chaas)
    const gb = balls(NG, { seg: 12, rough: 0.35 }); root.add(gb);
    const cFat = new THREE.Color(COL.fat), cMak = new THREE.Color(COL.makhan), cTmp = new THREE.Color();
    const CL = Array.from({ length: NC }, () => rp(0.55));
    const GL = Array.from({ length: NG }, (_, i) => {
      const u = rnd() * 2 - 1, a = rnd() * TAU, q = Math.sqrt(1 - u * u), rr = 0.34 * Math.cbrt(rnd());
      return { home: rp(), c: i % NC, off: [rr * q * Math.cos(a), rr * q * Math.sin(a), rr * u * 0.7], r: 0.05 + 0.05 * rnd() * rnd() * 3, ph: rnd() * TAU, rank: rnd() };
    });
    const mem = balls(NM, { seg: 6, basic: true, opacity: 0.9 }); root.add(mem);
    const cMem = new THREE.Color(COL.protein); const ML = Array.from({ length: NM }, () => ({ p: rp(0.12), ph: rnd() * TAU, at: rnd() }));
    for (let i = 0; i < NM; i++) mem.tint(i, cMem);
    // the pot
    const pot = makeMatka(root, { x: 0, level: 1.8 }); pot.g.position.set(PX, 0, 0); pot.g.scale.setScalar(0.8);
    const gr = balls(NGR, { seg: 10, rough: 0.6 }); pot.g.add(gr);
    const GR = Array.from({ length: NGR }, () => ({ a: rnd() * TAU, r: 0.3 + 0.95 * Math.sqrt(rnd()), s: 0.1 + 0.09 * rnd(), y0: 0.4 + rnd() * 1.1 }));
    for (let i = 0; i < NGR; i++) gr.tint(i, cMak);

    const lBox = stage.label('Under a microscope: about 40 µm across', [(BX.x0 + BX.x1) / 2, BX.y1 + 0.28, 0], root);
    const lState = stage.label('', [(BX.x0 + BX.x1) / 2, BX.y0 - 0.3, 0.6], root, 'hot');
    const lPot = stage.label('', [PX + 1.7, 1.9, 0.8], root, 'hot'); lPot.element.style.setProperty('--c', COL.makhan);
    const lMem = stage.label('Membrane pieces stay in the liquid', [(BX.x0 + BX.x1) / 2, BX.y1 - 0.6, 0.6], root, 'hot'); lMem.element.style.setProperty('--c', COL.protein);

    let S = { temp: 18, spm: 60, water: 1, milk: 'cow', mins: 0 }, tt = 0, fr = 0;
    const prog = (s) => s.mins / breakMinutes(s.temp, s.spm, true);
    const bd = board(root, 4.6, 3.3, 720, 516, (g, w, h) => {
      panelBg(g, w, h); title(g, 'Where the fat goes', `from 1 kg of ${MILKS[S.milk].name.toLowerCase()} dahi`);
      const sp = churnSplit({ milk: S.milk, water: S.water, T: S.temp }), p = prog(S), done = clamp((p - 1) / 0.25, 0, 1), oily = S.temp > T_OIL;
      const x0 = 24, span = w - 48, out = sp.rec * done * (oily ? 0.15 : 1);
      g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(x0, 62, span, 50);
      g.fillStyle = COL.makhan; g.fillRect(x0, 62, span * out, 50);
      g.fillStyle = COL.fat; g.fillRect(x0 + span * out, 62, span * (1 - out), 50);
      g.font = 'bold 19px sans-serif'; g.fillStyle = '#1a1206';
      if (out > 0.2) g.fillText(`makhan ${Math.round(sp.fatIn * out)} g`, x0 + 10, 94);
      g.fillText(`in the liquid ${Math.round(sp.fatIn * (1 - out))} g`, x0 + span * out + 10, 94);
      // time to break against temperature
      const { X, Y, y0, y1 } = axes(g, w, h, { x0: 84, y1: 178, y0: h - 62, xMin: 4, xMax: 34, yMin: 0, yMax: 120, xTicks: [4, 10, 15, 20, 25, 30, 34], yTicks: [0, 30, 60, 90, 120], xFmt: (v) => v + '°', yFmt: (v) => v + '', xLabel: 'temperature in the pot, °C', yLabel: 'minutes of churning until it breaks' });
      band(g, X(10), X(15), y0, y1, 'rgba(92,225,169,.14)'); note(g, 'best: 10–15 °C', X(10) + 4, y1 + 20, COL.ok, '15px sans-serif');
      band(g, X(T_OIL), X(34), y0, y1, 'rgba(255,122,89,.14)'); note(g, 'greasy', X(T_OIL) + 8, y1 + 20, COL.hot, '15px sans-serif');
      const pts = []; for (let T = 4; T <= 34; T += 0.5) pts.push([T, Math.min(120, breakMinutes(T, S.spm, true))]);
      line(g, pts, X, Y, COL.warm, 5);
      const rc = []; for (let T = 4; T <= 34; T += 0.5) rc.push([T, recovery(T) * 1.2]);
      line(g, rc, X, Y, COL.makhan, 3, [8, 6]); note(g, 'dashed: share of fat that comes out (67% at 18 °C)', X(4) + 6, y0 - 8, COL.makhan, '15px sans-serif');
      dot(g, X(S.temp), Y(Math.min(120, breakMinutes(S.temp, S.spm, true))), COL.warm);
    }, BOARD);

    return {
      update(dt, s, time) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s; tt += dt;
        layout(stage, [bd], [lBox, lMem], { box: [-1.2, 0, 5.2, 8.8] });
        const p = prog(s), v = churnVerdict(s.temp), oily = v.k === 'oil', cold = v.k === 'cold';
        const rec = recovery(s.temp) / 100;
        const k = smooth(clamp((p - 0.3) / 0.7, 0, 1)) * (cold ? 0.35 : 1), gone = smooth(clamp((p - 1) / 0.25, 0, 1));
        // the mathani
        const f = s.spm / 60, th = (0.3 / 0.028) * Math.sin(TAU * f * tt * 0.25);
        pot.pose(th, 1.5 * Math.sin(TAU * f * tt * 0.25));
        // microscope
        GL.forEach((q, i) => {
          const stays = q.rank > rec || oily;                         // this one never joins a grain
          const kk = stays ? 0 : k, c = CL[q.c], j = 0.06 * (1 - kk);
          let x = lerp(q.home[0], c[0] + q.off[0], kk) + j * Math.sin(tt * 3.1 + q.ph), y = lerp(q.home[1], c[1] + q.off[1], kk) + j * Math.cos(tt * 2.7 + q.ph), z = lerp(q.home[2], c[2] + q.off[2], kk);
          let sc = q.r;
          if (!stays && gone > 0) { y += gone * (BX.y1 - c[1] + 0.6); sc *= 1 - smooth(clamp((y - BX.y1 + 0.1) / 0.5, 0, 1)); }
          if (oily && p > 1) { sc *= 1.25; }
          gb.place(i, x, y, z, Math.max(1e-4, sc));
          gb.tint(i, cTmp.copy(cFat).lerp(cMak, stays ? 0 : kk * 0.8));
        });
        gb.done();
        const torn = clamp((p - 0.25) / 0.75, 0, 1);
        ML.forEach((m, i) => mem.place(i, m.p[0] + 0.05 * Math.sin(tt * 2 + m.ph), m.p[1] + 0.05 * Math.cos(tt * 1.7 + m.ph), m.p[2], m.at < torn ? 0.022 : 1e-4));
        mem.done();
        // grains in the pot
        GR.forEach((q, i) => {
          const up = smooth(clamp((p - 0.9) / 0.3 - i * 0.012, 0, 1)) * (oily || cold ? 0 : 1);
          const show = i / NGR < rec / 0.76;
          gr.place(i, q.r * Math.cos(q.a + th * 0.05), lerp(q.y0, 1.82, up), q.r * Math.sin(q.a + th * 0.05), show ? q.s * up : 1e-4, show ? q.s * up * 0.7 : 1e-4);
        });
        gr.done();
        pot.liqMat.opacity = lerp(0.72, 0.5, gone); pot.liqMat.color.set(gone > 0.5 ? 0xeef0e2 : 0xfdf8ea);
        lState.element.innerHTML = p < 0.3 ? 'Globules apart, each in its skin' : p < 1 ? 'Skins tear: globules stick into clumps' : oily ? 'Too warm: smeared, no grains' : cold ? 'Too cold: they bounce apart' : `Grains float off. ${Math.round((1 - rec) * 100)}% of the fat stays`;
        lState.element.style.setProperty('--c', p < 1 ? COL.fat : oily || cold ? COL.hot : COL.makhan);
        lPot.element.innerHTML = p >= 1 ? (oily ? 'A greasy film, no grains' : cold ? 'Still no grains' : '<b>Makhan</b> on top, <b>buttermilk</b> below') : p > 0.4 ? 'Thick and foamy' : 'Churning…';
        lMem.visible = lMem.visible && torn > 0.5;
        if (fr++ % 4 === 0) bd.redraw();
      },
      readout: (s) => {
        const sp = churnSplit({ milk: s.milk, water: s.water, T: s.temp }), bm = breakMinutes(s.temp, s.spm, true), p = s.mins / bm, v = churnVerdict(s.temp);
        const done = p >= 1 && v.k !== 'oil' && v.k !== 'cold';
        return `<div class="big">${done ? `${Math.round(sp.makhan)} g of makhan, ${(sp.liquid / 1000).toFixed(2)} kg of buttermilk` : p >= 1 ? 'No grains at this temperature' : `Churning: ${Math.round(clamp(p, 0, 1) * 100)}% of the way to the break`}</div>
          <div class="row"><span>Breaks after about</span><b>${fmtMin(bm)}</b></div>
          <div class="row"><span>Fat that comes out as makhan</span><b>${Math.round(sp.rec * 100)}% of ${Math.round(sp.fatIn)} g</b></div>
          <div class="row"><span>Fat left in the buttermilk</span><b>${sp.chaasFat.toFixed(1)}% · a dairy gets 0.5%</b></div>
          <div class="row"><span>Protein in the buttermilk</span><b>${sp.protein.toFixed(1)}%</b></div>
          <div class="row"><span>At ${s.temp} °C</span><b style="color:${v.col}">${v.text}</b></div>
          <small>Break time is a rule-of-thumb model. The share of fat recovered follows two FAO measurements with a clay pot (67% at 18 °C, 44% at 25 °C).</small>`;
      },
    };
  },
};
