// Chapter 1: two drinks, one name. Left: the clay pot (matka) and its churn (mathani), which you can
// lift apart. Right: three glasses that all get called buttermilk, and a chart of what is in each.
// 1 scene unit = 10 cm (the pot group is drawn at 0.8 scale to keep the stage's upper left clear).
// Numbers:
//  · Milk: Tetra Pak Dairy Processing Handbook table 2.3 (cow: fat 3.9, protein 3.4, lactose 4.8%).
//  · Home buttermilk: 1 kg of dahi churned with 1 kg of water at 18 °C; a pot and mathani take out
//    about 67% of the fat (FAO/ILCA), so about a third of the fat stays in the drink.
//  · Chaas: the same dahi and water with nothing taken out.
//  · Dairy cultured buttermilk: skim or low-fat milk (1% fat here) soured to about 0.85% acidity.
//    A dairy's sweet-cream buttermilk has about 0.5% fat (Dairy Processing Handbook).
//  · Dahi: 0.8% titratable acidity at pH about 4.5; each gram of acid cost about 1.5 g of lactose
//    (CurdClear's figures).
//  · FSSAI (sub-regulation 2.1.13): lassi, chhaach and buttermilk are "drinks based on fermented
//    milk", fermented milk mixed with potable water, at least 40% fermented milk by weight.
import { THREE, M, exploder } from '../kit.js';
import {
  COL, C2, TAU, MILKS, DAIRY, drink, churnSplit, hex, board, panelBg, title, note, legend,
  balls, makeMatka, glassOf, katori, tableTop, rng, layout, clamp, link, VIEW, BOARD,
} from '../buttermilk.js';

const KINDS = {
  trad: { n: 'Traditional buttermilk', short: 'Left after the makhan', what: 'Dahi churned with water. The makhan is lifted off and this is what stays in the pot.' },
  chaas: { n: 'Chaas', short: 'Dahi beaten with water', what: 'Dahi and water whisked together. Nothing is taken out, so all the fat is still in it.' },
  cult: { n: 'Cultured buttermilk', short: 'Soured skim milk from a dairy', what: 'Skim or low-fat milk, pasteurised, then soured with chosen bacteria. No butter was ever made from it.' },
};
const mix = () => {
  const sp = churnSplit({ milk: 'cow', water: 1, T: 18 });
  return {
    milk: { fat: MILKS.cow.fat, protein: MILKS.cow.protein, lactose: MILKS.cow.lactose, acid: 0, ph: 6.65 },
    trad: drink({ water: 1, skim: sp.rec }),
    chaas: drink({ water: 1, skim: 0 }),
    cult: DAIRY.cultured,
  };
};
const PARTS = [['fat', 'Fat', COL.fat], ['protein', 'Protein', COL.protein], ['lactose', 'Lactose', COL.lactose], ['acid', 'Lactic acid', C2.acid]];

export default {
  id: 'names',
  short: 'Two drinks, one name',
  title: 'Two drinks, one name',
  subtitle: 'Buttermilk is what the churn leaves behind. It is also the name of a drink no churn has ever touched.',
  view: VIEW,
  learn: `<p>Ask for <b>buttermilk</b> in three places and you get three different things.</p>
    <p><b>1. Traditional buttermilk</b> is a leftover. Churn dahi or soured cream until the fat clumps into <b>makhan</b>, lift the makhan out, and the thin, tangy liquid still in the pot is buttermilk. It has lost most of its fat. ${link('butterclear', 'ButterClear')} shows that churn in full.</p>
    <p><b>2. Chaas</b> is dahi beaten with water, with the butter taken off or left in. It goes by many names: <b>chaas</b> or <b>chhachh</b> in Gujarati and Hindi, <b>mattha</b> in the Hindi belt, <b>taak</b> in Marathi, <b>moru</b> in Tamil and Malayalam, <b>majjige</b> in Kannada, <b>majjiga</b> in Telugu and <b>ghol</b> in Bengali and Odia. In most Indian homes today it is simply dahi whisked with water.</p>
    <p><b>3. Cultured buttermilk</b> is what a dairy sells in the West. Skim milk is pasteurised and then soured by <b>lactic acid bacteria</b>. It was named after the old drink because it tastes like it.</p>
    <p>All three start the same way: bacteria turn milk sugar into <b>lactic acid</b>, as ${link('curdclear', 'CurdClear')} explains. What differs is the fat and the water. India's food regulator, FSSAI, puts lassi, chhaach and buttermilk in one group: <b>drinks based on fermented milk</b>, which must be at least 40% fermented milk.</p>
    <p class="tip"><b>Try it:</b> pick each glass and compare the bars. Which one has the least fat? Then slide <b>Lift apart</b> to see the pot, the mathani and the rope that spins it.</p>`,
  terms: [
    { t: 'Buttermilk', d: 'First, the liquid left after butter is churned out. Now also any thin, sour milk drink made to taste like it.' },
    { t: 'Chaas', d: 'Dahi beaten with water, salted and often spiced. Also called mattha, taak, moru, majjige, majjiga or ghol.' },
    { t: 'Mathani', d: 'The wooden churning rod with wings at its lower end, spun back and forth by a rope. Also madhani, bilona or ravai.' },
    { t: 'Makhan', d: 'White butter: the fat of the milk, clumped together by churning.' },
    { t: 'Cultured', d: 'Soured on purpose by adding chosen bacteria, called a culture or a starter.' },
  ],
  defaults: { kind: 'trad', explode: 0 },
  controls: [
    { key: 'kind', type: 'seg', label: 'Which buttermilk?', options: [{ v: 'trad', label: 'Left after makhan' }, { v: 'chaas', label: 'Chaas' }, { v: 'cult', label: 'Cultured' }] },
    { key: 'explode', type: 'range', label: 'Lift apart', min: 0, max: 1, step: 0.01, ends: ['together', 'apart'], fmt: (v) => (v < 0.05 ? 'together' : v > 0.95 ? 'apart' : '') },
  ],
  quiz: [
    { q: 'What is traditional buttermilk?', options: ['Milk with butter stirred in', 'The liquid left in the churn after the butter is taken out', 'Melted butter', 'Milk that has been boiled twice'], answer: 1, why: 'Churning gathers the fat into butter. The thin, tangy liquid left behind is the original buttermilk.' },
    { q: 'A dairy\'s cultured buttermilk is made from…', options: ['The leftovers of butter-making', 'Skim or low-fat milk soured by chosen bacteria', 'Butter melted into water', 'Cream whipped with sugar'], answer: 1, why: 'It never goes near a churn. Bacteria sour skim milk, which gives the same tangy taste.' },
    { q: 'Moru, majjige, taak, ghol and mattha are all names for…', options: ['Kinds of ghee', 'The churning rod', 'Chaas: dahi beaten with water', 'Sweets made from milk'], answer: 2, why: 'Almost every Indian language has its own word for the same thin, sour, salted drink.' },
  ],
  reel: [
    { ms: 5200, caption: 'Buttermilk is two drinks with one name: the liquid left after churning butter, and dahi beaten with water.', set: { kind: 'trad' }, anim: { explode: [0, 0.9] }, spin: 0.1 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const rnd = rng(7);
    tableTop(root, 11.5, 5.2);
    const DATA = mix();
    // the pot and the churn, at 0.8 scale
    const pot = makeMatka(root, { x: 0, level: 1.75, hands: false, post: true });
    pot.g.position.set(-2.9, 0, -0.2); pot.g.scale.setScalar(0.75);
    const grains = balls(26, { seg: 10, rough: 0.6 }); pot.g.add(grains);
    const cG = new THREE.Color(COL.makhan);
    for (let i = 0; i < 26; i++) { const a = rnd() * TAU, r = 0.25 + 0.95 * Math.sqrt(rnd()); grains.tint(i, cG); grains.place(i, r * Math.cos(a), 1.78 + 0.03 * rnd(), r * Math.sin(a), 0.09 + 0.07 * rnd(), 0.06); }
    grains.done();
    const lota = new THREE.Group(); root.add(lota); lota.position.set(-1.2, 0, 1.6);
    const brass = M.metal(0xd4a646, { roughness: 0.35, side: THREE.DoubleSide });
    lota.add(new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.3, 0.02], [0.46, 0.3], [0.44, 0.55], [0.26, 0.75], [0.3, 0.9]].map(([r, y]) => new THREE.Vector2(r, y)), 32), brass));
    const wat = new THREE.Mesh(new THREE.CircleGeometry(0.25, 24), M.plastic(hex(COL.water), { transparent: true, opacity: 0.8 })); wat.rotation.x = -Math.PI / 2; wat.position.y = 0.8; lota.add(wat);
    const dahi = katori(root, -0.5, 0.2, 0xf7f4ea, 0.5);
    const boom = exploder([{ obj: pot.rod, off: [0, 2.3, 0] }, { obj: grains, off: [0, 0.9, 1.6] }, { obj: lota, off: [0.9, 0, 0.3] }, { obj: dahi, off: [0.9, 0, -0.6] }]);

    // three glasses
    const GX = { trad: 1.2, chaas: 2.9, cult: 4.6 };
    const gl = {
      trad: glassOf(root, { x: GX.trad, z: 1.2, r: 0.5, h: 1.5, liquid: 0xeef0e2 }),
      chaas: glassOf(root, { x: GX.chaas, z: 1.2, r: 0.5, h: 1.5, liquid: 0xf8f6ee }),
      cult: glassOf(root, { x: GX.cult, z: 1.2, r: 0.5, h: 1.5, liquid: 0xfbfaf4 }),
    };
    gl.trad.liqMat.opacity = 0.72; gl.chaas.liqMat.opacity = 0.9; gl.cult.liqMat.opacity = 0.97;
    // where each comes from: a lump of makhan, a bowl of dahi, a steel milk can
    const lump = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 14), M.matte(hex(COL.makhan))); lump.scale.y = 0.62; lump.position.set(GX.trad, 0.2, -0.3); lump.castShadow = true; root.add(lump);
    katori(root, GX.chaas, -0.3, 0xf7f4ea, 0.42);
    const can = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.42, 0.02], [0.45, 0.9], [0.3, 1.2], [0.3, 1.4], [0.36, 1.45]].map(([r, y]) => new THREE.Vector2(r, y)), 32), M.metal(0xc4c9d2, { roughness: 0.35 })); can.position.set(GX.cult, 0, -0.5); can.castShadow = true; root.add(can);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.035, 8, 48), M.glow(0xf59ee6)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.03; root.add(ring);
    const lG = {
      trad: stage.label('', [GX.trad, -0.45, 2.5], root, 'hot'), chaas: stage.label('', [GX.chaas, -0.45, 2.5], root, 'hot'), cult: stage.label('', [GX.cult, -0.45, 2.5], root, 'hot'),
    };
    const lSrc = [stage.label('Makhan, lifted out', [GX.trad, 2.1, -0.3], root), stage.label('Dahi and water', [GX.chaas, 2.55, -0.3], root), stage.label('Skim milk, soured', [GX.cult, 2.1, -0.5], root)];
    const lRod = stage.label('Mathani (churning rod)', [1.2, 5.6, 0], pot.g);
    const lRope = stage.label('Neti: the rope that spins it', [1.3, 4.25, 0.3], pot.g);
    const lPot = stage.label('Matka (clay pot)', [-0.6, 2.6, 1.4], pot.g);
    const lWing = stage.label('Wings', [0.9, 0.5, 0.9], pot.rod);
    const lGr = stage.label('Makhan grains float up', [0, 0.25, 0], grains, 'hot'); lGr.position.set(0.6, 2.1, 0.6); lGr.element.style.setProperty('--c', COL.makhan);
    const lWat = stage.label('Water', [0, 1.2, 0], lota), lDahi = stage.label('Dahi', [0, 0.65, 0], dahi);

    let S = { kind: 'trad' };
    const bd = board(root, 4.6, 3.3, 720, 516, (g, w, h) => {
      panelBg(g, w, h); title(g, 'What is in 100 g', 'the rest is water');
      legend(g, PARTS.map(([, n, c]) => [n, c]), 22, 52, 17);
      const rows = [['milk', 'Cow milk'], ['trad', 'Left after makhan'], ['chaas', 'Chaas, 1 : 1'], ['cult', 'Cultured']];
      const x0 = 214, span = w - x0 - 96, max = 13;
      rows.forEach(([k, n], i) => {
        const d = DATA[k], y = 98 + i * 98, on = k === S.kind;
        if (on) { g.fillStyle = 'rgba(245,158,230,.14)'; g.fillRect(8, y - 12, w - 16, 88); }
        g.font = `bold 21px sans-serif`; g.fillStyle = on ? '#f59ee6' : COL.text; g.fillText(n, 20, y + 30);
        let x = x0, tot = 0;
        for (const [key, , c] of PARTS) { const L = (d[key] / max) * span; g.fillStyle = c; g.fillRect(x, y, Math.max(0, L - 1), 44); x += L; tot += d[key]; }
        g.font = '18px sans-serif'; g.fillStyle = 'rgba(255,255,255,.75)'; g.fillText(`fat ${d.fat.toFixed(1)}%`, x + 10, y + 20); g.fillText(`pH ${d.ph.toFixed(1)}`, x + 10, y + 42);
        g.font = '15px sans-serif'; g.fillStyle = 'rgba(255,255,255,.55)'; g.fillText(`${(100 - tot - 0.8 * (d.f ?? 1)).toFixed(0)}% water`, 20, y + 54);
      });
      note(g, 'Chaas and home buttermilk: 1 part dahi to 1 part water.', 20, h - 14, 'rgba(255,255,255,.55)', '15px sans-serif');
    }, BOARD);

    let lastKind = '';
    return {
      update(dt, s) {
        dt = Math.max(0, dt); S = s;
        const narrow = layout(stage, [bd], [lRope, lPot, lWing, lWat, lDahi, lGr, ...lSrc], { box: [1.0, 0, 4.7, 9.6] });
        boom(s.explode);
        lRod.visible = !narrow || s.explode > 0.5;
        ring.position.x = GX[s.kind]; ring.position.z = 1.2;
        for (const k of Object.keys(gl)) {
          gl[k].set(0.86, 0);
          lG[k].element.innerHTML = k === s.kind ? `<b>${KINDS[k].n}</b>` : KINDS[k].n;
          lG[k].element.style.setProperty('--c', k === s.kind ? '#f59ee6' : '#9aa6b8');
          lG[k].visible = !narrow || k === s.kind;
        }
        if (s.kind !== lastKind) { lastKind = s.kind; bd.redraw(); }
      },
      readout: (s) => {
        const d = DATA[s.kind], k = KINDS[s.kind], m = DATA.milk;
        return `<div class="big">${k.n}</div>
          <div class="row"><span>How it is made</span><b>${k.short}</b></div>
          <div class="row"><span>Fat</span><b>${d.fat.toFixed(1)}% · milk has ${m.fat.toFixed(1)}%</b></div>
          <div class="row"><span>Protein · lactose</span><b>${d.protein.toFixed(1)}% · ${d.lactose.toFixed(1)}%</b></div>
          <div class="row"><span>Lactic acid · pH</span><b>${d.acid.toFixed(2)}% · ${d.ph.toFixed(1)}</b></div>
          <small>${k.what}${s.kind === 'trad' ? ' A dairy that churns sweet cream gets a buttermilk with about 0.5% fat that is not sour at all.' : s.kind === 'chaas' ? ' In a packet, FSSAI calls it a drink based on fermented milk: at least 40% dahi.' : ' Typical figures for a low-fat version.'}</small>`;
      },
    };
  },
};
