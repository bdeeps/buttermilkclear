// Chapter 4: making chaas. A steel pot of dahi and water with a small hand churn, a glass, bowls of
// salt and spices, and a tadka ladle. Right: what one 250 mL glass holds. 1 scene unit = 10 cm.
// What is real and what is a model:
//  · The glass: plain arithmetic from the milk's composition (Tetra Pak Dairy Processing Handbook
//    table 2.3; buffalo typical), dahi at 0.8% acidity, and the water added. Chaas is taken as 1.03 g/mL.
//  · FSSAI (sub-regulation 2.1.13): a packaged "drink based on fermented milk" (lassi, chhaach,
//    buttermilk) has at least 40% fermented milk, so at most 1.5 parts of water to 1 of dahi.
//  · Sodium: salt is 39.3% sodium. WHO (2012 guideline): under 2,000 mg of sodium a day for adults,
//    which is 5 g of salt.
//  · Thickness: the Krieger–Dougherty model in buttermilk.js, typical values.
//  · Names by thickness are everyday usage, not a standard. The Sushruta Samhita (Sutrasthana 45)
//    describes takra as churned curd with the fat removed and half its quantity of water added.
//  · The tadka: see TadkaClear. Hot oil spits when it meets water: that is physics, and a hazard.
import { THREE, M } from '../kit.js';
import {
  COL, C2, TAU, MILKS, drink, thickness, sodiumMg, WHO_SODIUM, recovery, hex,
  board, panelBg, title, note, balls, steelPot, glassOf, katori, tableTop, rng, layout, clamp, lerp, smooth, link, VIEW, BOARD,
} from '../buttermilk.js';

const GLASS = 250 * 1.03;      // g in a 250 mL glass
const nameOf = (w) => (w <= 0.6 ? 'Lassi: thick' : w <= 1.5 ? 'Chaas' : w <= 2.5 ? 'Thin chaas' : 'Very thin chaas');
export const cup = (s) => {
  const d = drink({ milk: s.milk, water: s.water, skim: s.skim ? recovery(18) / 100 : 0 }), g = (v) => (v * GLASS) / 100;
  return { d, dahi: GLASS * d.f, waterAdded: GLASS * (1 - d.f), fat: g(d.fat), protein: g(d.protein), lactose: g(d.lactose), acid: g(d.acid), sodium: sodiumMg(s.salt) + 45 * d.f * (GLASS / 100), eta: thickness(s.water) * 1000 };
};

export default {
  id: 'chaas',
  short: 'Making chaas',
  title: 'Making chaas',
  subtitle: 'The recipe is one decision, how much water, and then whatever your grandmother added.',
  view: VIEW,
  learn: `<p>Put <b>dahi</b> in a pot, add cold <b>water</b>, and beat it. At home that means a small wooden churn rolled between the palms, called a <b>mathani</b>, <b>ravi</b> or <b>ghotni</b>, or a few seconds in a mixer. The gel breaks and you have chaas.</p>
    <p>The one real choice is the <b>water</b>. With very little, you get <b>lassi</b>: thick, creamy, sweet or salted, from Punjab. With about as much water as dahi, you get <b>chaas</b>. With two or three parts of water, a thin summer drink. An old Ayurvedic text, the Sushruta Samhita, describes <b>takra</b> as churned curd with the fat taken off and half as much water added.</p>
    <p>Then the flavour. <b>Salt</b>, or black salt. <b>Roasted jeera</b>, ground: roasting makes new aroma molecules. <b>Ginger</b>, <b>green chilli</b>, coriander or mint, <b>curry leaves</b>, a pinch of <b>hing</b>. In Gujarat and the south, a <b>tadka</b> goes on top: mustard seeds, jeera and curry leaves crackled in a spoon of hot oil or ghee. Most aroma molecules dissolve in fat, not water, so the oil carries them into the drink. ${link('tadkaclear', 'TadkaClear')} shows why the seeds pop.</p>
    <p>Sour chaas simmered with <b>besan</b> becomes <b>kadhi</b>: Punjabi with pakoras, Gujarati thin and a little sweet, mor kuzhambu and majjige huli in the south. Cooks rely on the besan's starch to thicken it and to keep the curd from splitting in the heat.</p>
    <p class="tip"><b>Try it:</b> slide the water from lassi to thin chaas and watch the glass and the bars. Then add salt, and see how much of a day's sodium one glass can use up.</p>`,
  terms: [
    { t: 'Lassi', d: 'Dahi blended with only a little water, sweet or salted. Thick enough to need a spoon in Punjab.' },
    { t: 'Takra', d: 'The Sanskrit word for buttermilk. Old Ayurvedic texts name kinds of it by how much water is added and whether the fat is removed.' },
    { t: 'Tadka', d: 'Spices crackled in hot oil or ghee and poured over a dish. Also called chhaunk, vaghar or thalippu.' },
    { t: 'Kadhi', d: 'Sour chaas or dahi simmered with gram flour (besan) and spices.' },
    { t: 'Sodium', d: 'The part of salt that matters for health guidelines. Salt is about 39% sodium by weight.' },
  ],
  defaults: { water: 1, salt: 0.6, milk: 'cow', skim: false, tadka: false },
  controls: [
    { key: 'water', type: 'range', label: 'Water for each part of dahi', min: 0.2, max: 4, step: 0.05, ends: ['lassi', 'very thin'], fmt: (v) => `1 : ${v.toFixed(2)} · ${nameOf(v)}` },
    { key: 'salt', type: 'range', label: 'Salt in the glass', min: 0, max: 2.5, step: 0.1, ends: ['none', '½ teaspoon'], fmt: (v) => `${v.toFixed(1)} g` },
    { key: 'milk', type: 'seg', label: 'Dahi made from', options: [{ v: 'cow', label: 'Cow milk' }, { v: 'buffalo', label: 'Buffalo milk' }] },
    { key: 'skim', type: 'toggle', label: 'Makhan churned out first', hint: 'The traditional way: about two thirds of the fat leaves as makhan.' },
    { key: 'tadka', type: 'toggle', label: 'Pour a tadka on top', hint: 'Mustard, jeera and curry leaves crackled in a teaspoon of hot oil.' },
    { type: 'buttons', label: 'Jump to', items: [{ label: 'Lassi', act: (s) => { s.water = 0.3; } }, { label: 'Chaas', act: (s) => { s.water = 1; } }, { label: 'Thin summer chaas', act: (s) => { s.water = 3; } }] },
  ],
  quiz: [
    { q: 'What is the main difference between lassi and chaas?', options: ['Lassi is made from cream', 'Lassi has much less water, so it is thick', 'Chaas is not fermented', 'Chaas is always sweet'], answer: 1, why: 'Both are dahi and water. Lassi keeps the water low and is thick; chaas is thinned until it pours like a drink.' },
    { q: 'Why is a tadka made in oil or ghee rather than water?', options: ['Oil is cheaper', 'Oil gets far hotter than boiling water, and most aroma molecules dissolve in fat', 'Water would turn the spices blue', 'Spices do not float on water'], answer: 1, why: 'Oil reaches well above 100 °C, which crackles the spices, and it dissolves their aroma molecules and carries them into the chaas.' },
    { q: 'A glass of chaas has 1 g of salt in it. Roughly how much of the WHO daily sodium limit (2,000 mg) is that?', options: ['About 2%', 'About 20%', 'About 80%', 'More than all of it'], answer: 1, why: 'Salt is about 39% sodium, so 1 g of salt carries about 390 mg of sodium: about a fifth of 2,000 mg.' },
  ],
  reel: [
    { ms: 5000, caption: 'Chaas is dahi beaten with water. A little water gives thick lassi, a lot gives a thin summer drink.', set: { salt: 0.6, milk: 'cow', skim: false, tadka: false }, anim: { water: [0.25, 3] }, spin: 0.05 },
    { ms: 5200, caption: 'Salt, roasted jeera, ginger, then a tadka: hot oil carries the spice aromas into the glass.', set: { water: 1.2, salt: 0.8, milk: 'cow', skim: false }, anim: { tadka: [false, true] }, spin: 0.05 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const rnd = rng(5);
    tableTop(root, 11.5, 5.2);
    const PXp = -3.0, GXg = 0.2;
    const pot = steelPot(root, { x: PXp, z: -0.1, r: 1.35, h: 1.5 });
    // a small hand churn: a rod with a ribbed wooden head, rolled between the palms
    const wood = M.matte(0x9a6a3c), churn = new THREE.Group(); churn.position.set(PXp, 0, -0.1); root.add(churn);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.4, 14), wood); shaft.position.y = 2.0; shaft.castShadow = true; churn.add(shaft);
    for (let i = 0; i < 6; i++) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.3, 0.06), wood); w.rotation.y = (i / 6) * Math.PI; w.position.y = 0.4; churn.add(w); }
    const palms = [0, 1].map((i) => { const h = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.7, 0.5), M.plastic(0xd9a273)); h.position.set(i ? 0.16 : -0.16, 3.2, 0); churn.parent.add(h); return h; });
    const glass = glassOf(root, { x: GXg, z: 0.9, r: 0.62, h: 1.9, liquid: 0xf6f3ea });
    // the spice bowls
    const SP = [['Salt', 0xf2f2f2], ['Roasted jeera', 0x7a5230], ['Ginger', 0xd9b45a], ['Green chilli', 0x4f9a3a], ['Curry leaves', 0x2f6b2c]];
    const bowls = SP.map(([n, c], i) => { const b = katori(root, 1.45 + i * 0.85, 1.7 - (i % 2) * 0.7, c, 0.33); return { b, l: stage.label(n, [0, i % 2 ? 1.0 : 0.55, 0], b) }; });
    // floating spice flecks in the glass
    const fl = balls(40, { seg: 6, basic: true }); glass.g.add(fl);
    const FL = Array.from({ length: 40 }, (_, i) => ({ a: rnd() * TAU, r: 0.5 * Math.sqrt(rnd()), c: i % 3 }));
    const cF = [new THREE.Color(0x7a5230), new THREE.Color(0x3f8a36), new THREE.Color(0x2a2a2a)]; FL.forEach((f, i) => fl.tint(i, cF[f.c]));
    // the tadka ladle
    const ladle = new THREE.Group(); root.add(ladle);
    const iron = M.metal(0x4a4d55, { roughness: 0.5, side: THREE.DoubleSide });
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 12, 0, TAU, Math.PI / 2, Math.PI / 2), iron); ladle.add(bowl);
    const oil = new THREE.Mesh(new THREE.CircleGeometry(0.37, 24), M.plastic(0xe0a52e, { transparent: true, opacity: 0.9 })); oil.rotation.x = -Math.PI / 2; oil.position.y = -0.12; ladle.add(oil);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.0, 8), iron); handle.rotation.z = Math.PI / 2 - 0.25; handle.position.set(1.3, 0.25, 0); ladle.add(handle);
    const seeds = balls(34, { seg: 6, basic: true }); root.add(seeds);
    const SD = Array.from({ length: 34 }, () => ({ t: rnd(), a: rnd() * TAU, r: rnd() * 0.45, v: 0.6 + rnd() * 0.8 }));
    const cS = new THREE.Color(0x2a2118), cL = new THREE.Color(0x2f6b2c); SD.forEach((q, i) => seeds.tint(i, i % 4 === 0 ? cL : cS));
    const steam = balls(26, { seg: 8, basic: true, opacity: 0.22 }); root.add(steam);
    const ST = Array.from({ length: 26 }, () => ({ t: rnd(), a: rnd() * TAU, r: rnd() * 0.5 }));

    const lPot = stage.label('Dahi and cold water', [PXp, -0.4, 1.9], root);
    const lChurn = stage.label('Hand churn (mathani, ravi)', [PXp + 0.2, 4.0, 0], root);
    const lGlass = stage.label('', [GXg, 2.35, 0.9], root, 'hot');
    const lLad = stage.label('Tadka: about 180 °C', [0, 0.75, 0], ladle, 'hot'); lLad.element.style.setProperty('--c', COL.hot);

    let S = { water: 1, salt: 0.6, milk: 'cow', skim: false, tadka: false }, tt = 0, tk = 0, fr = 0, key = '';
    const bd = board(root, 4.6, 3.3, 720, 516, (g, w, h) => {
      panelBg(g, w, h); title(g, 'One 250 mL glass', nameOf(S.water).toLowerCase());
      const c = cup(S), x0 = 24, span = w - 48;
      // dahi against water
      g.fillStyle = '#f4f1e8'; g.fillRect(x0, 58, span * c.d.f, 44); g.fillStyle = COL.water; g.fillRect(x0 + span * c.d.f, 58, span * (1 - c.d.f), 44);
      g.font = 'bold 18px sans-serif'; g.fillStyle = '#1a1206';
      if (c.d.f > 0.2) g.fillText(`dahi ${Math.round(c.dahi)} g`, x0 + 8, 87); if (c.d.f < 0.8) g.fillText(`water ${Math.round(c.waterAdded)} g`, x0 + span * c.d.f + 8, 87);
      const lx = x0 + span * 0.4; g.strokeStyle = '#f59ee6'; g.lineWidth = 3; g.setLineDash([6, 5]); g.beginPath(); g.moveTo(lx, 50); g.lineTo(lx, 110); g.stroke(); g.setLineDash([]);
      note(g, c.d.f >= 0.4 ? 'FSSAI: a packaged drink needs at least 40% dahi ✓' : 'Under 40% dahi: thinner than FSSAI allows in a packet', x0, 132, c.d.f >= 0.4 ? COL.ok : COL.warm, '16px sans-serif');
      const rows = [['Protein', c.protein, 12, 'g', COL.protein], ['Fat', c.fat, 12, 'g', COL.fat], ['Lactose', c.lactose, 12, 'g', COL.lactose], ['Lactic acid', c.acid, 12, 'g', C2.acid], ['Sodium', c.sodium, WHO_SODIUM, 'mg', COL.salt]];
      rows.forEach(([n, v, mx, u, col], i) => {
        const y = 162 + i * 62; g.font = 'bold 19px sans-serif'; g.fillStyle = COL.text; g.fillText(n, x0, y + 26);
        g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(x0 + 130, y + 4, span - 300, 30); g.fillStyle = col; g.fillRect(x0 + 130, y + 4, (span - 300) * clamp(v / mx, 0, 1), 30);
        note(g, u === 'mg' ? `${Math.round(v)} mg · ${Math.round((v / WHO_SODIUM) * 100)}%` : `${v.toFixed(1)} g`, x0 + span - 160, y + 26, COL.text, '17px sans-serif');
      });
      note(g, 'Bars for protein, fat, lactose and acid run to 12 g. Sodium runs to 2,000 mg, a day\'s limit.', x0, h - 14, 'rgba(255,255,255,.55)', '14px sans-serif');
    }, BOARD);

    return {
      update(dt, s) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s; tt += dt;
        layout(stage, [bd], [lPot, lChurn, lLad, ...bowls.map((q) => q.l)], { box: [0.4, 0, 4.4, 10.0] });
        const f = 1 / (1 + s.water), thick = clamp(thickness(s.water) * 1000 / 60, 0, 1);
        pot.set(clamp(0.28 + 0.16 * (1 + s.water), 0.3, 0.92));
        const col = new THREE.Color(0xf6f3ea).lerp(new THREE.Color(0xeef3f1), clamp(1 - f * 1.6, 0, 0.75));
        pot.liqMat.color.copy(col); pot.liqMat.opacity = lerp(0.6, 0.92, clamp(f * 1.5, 0, 1));
        glass.liqMat.color.copy(col); glass.liqMat.opacity = lerp(0.74, 0.97, clamp(f * 1.5, 0, 1)); glass.set(0.86, 0);
        // rolling the churn between the palms: back and forth, slower in thick lassi
        const th = 9 * Math.sin(tt * lerp(7, 4, thick));
        churn.rotation.y = th; palms[0].position.set(PXp - 0.17, 3.2, -0.1 + 0.22 * Math.sin(tt * lerp(7, 4, thick))); palms[1].position.set(PXp + 0.17, 3.2, -0.1 - 0.22 * Math.sin(tt * lerp(7, 4, thick)));
        FL.forEach((q, i) => fl.place(i, q.r * Math.cos(q.a), glass.top + 0.005, q.r * Math.sin(q.a), (s.salt > 0 && q.c === 0) || (tk > 0.6 && q.c > 0) ? 0.03 : 1e-4, 0.008));
        fl.done();
        // the tadka: the ladle swings over the glass and tips
        tk += ((s.tadka ? 1 : 0) - tk) * (1 - Math.exp(-dt * 2.2));
        const e = smooth(tk), tip = smooth(clamp((tk - 0.55) / 0.4, 0, 1));
        ladle.position.set(lerp(4.6, GXg + 0.75, e), lerp(1.2, 3.1, e), lerp(-0.6, 0.9, e)); ladle.rotation.z = lerp(0, 1.0, tip);
        oil.visible = tip < 0.9;
        const pour = tip > 0.3 && s.tadka;
        SD.forEach((q, i) => {
          q.t = (q.t + dt * q.v) % 1;
          const x0 = ladle.position.x - 0.42, y0 = ladle.position.y - 0.1, y = lerp(y0, glass.top, q.t * q.t);
          seeds.place(i, lerp(x0, GXg + q.r * Math.cos(q.a) * 0.8, q.t), y, 0.9 + q.r * Math.sin(q.a) * 0.6 * q.t, pour ? 0.028 : 1e-4);
        });
        seeds.done();
        ST.forEach((q, i) => { q.t = (q.t + dt * 0.5) % 1; steam.place(i, GXg + q.r * Math.cos(q.a) * (1 + q.t), glass.top + q.t * 1.5, 0.9 + q.r * Math.sin(q.a) * (1 + q.t), pour ? 0.08 + 0.14 * q.t : 1e-4); });
        steam.done();
        lLad.element.innerHTML = pour ? '<b>Sizzle!</b> hot oil meets water' : 'Tadka: oil at about 180 °C';
        lGlass.element.innerHTML = `<b>${nameOf(s.water)}</b>`; lGlass.element.style.setProperty('--c', '#f59ee6');
        const k2 = [s.water, s.salt, s.milk, s.skim].join('|'); if (k2 !== key || fr++ % 30 === 0) { key = k2; bd.redraw(); }
      },
      readout: (s) => {
        const c = cup(s);
        return `<div class="big">${nameOf(s.water)}</div>
          <div class="row"><span>In a 250 mL glass</span><b>${Math.round(c.dahi)} g dahi + ${Math.round(c.waterAdded)} g water</b></div>
          <div class="row"><span>Thickness</span><b>${c.eta >= 10 ? Math.round(c.eta) : c.eta.toFixed(1)} mPa·s · water is 1</b></div>
          <div class="row"><span>pH · lactic acid</span><b>${c.d.ph.toFixed(1)} · ${c.acid.toFixed(1)} g</b></div>
          <div class="row"><span>Protein · fat</span><b>${c.protein.toFixed(1)} g · ${c.fat.toFixed(1)} g</b></div>
          <div class="row"><span>Sodium, with ${s.salt.toFixed(1)} g of salt</span><b>${Math.round(c.sodium)} mg · ${Math.round((c.sodium / WHO_SODIUM) * 100)}% of a day's limit</b></div>
          <small>${s.tadka ? 'Hot oil spits when it meets water, so a tadka is poured from the side, away from the face, and by someone used to it.' : c.d.f < 0.4 ? 'Thinner than the 40% dahi that FSSAI asks of a packaged chaas. At home, it is your glass.' : 'WHO advises adults to stay under 2,000 mg of sodium a day. The dahi brings a little of its own, about 45 mg in 100 g of milk (typical).'}</small>`;
      },
    };
  },
};
