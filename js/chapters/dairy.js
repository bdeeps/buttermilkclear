// Chapter 5: buttermilk in the dairy and in the oven. Two scenes on one table, chosen by a switch.
// The dairy: a heating tank, a culture tank and a filler, with the temperature and pH of one batch.
// The oven: a bowl of batter, a cup of buttermilk, a spoon of baking soda and the gas they make.
// 1 scene unit = 10 cm, so a ball of gas 1 unit across holds about half a litre.
// What is real and what is a model:
//  · Dairy steps: skim or low-fat milk heated at 90–95 °C for about 5 minutes (Tetra Pak Dairy
//    Processing Handbook; older American practice is 85 °C for 30 minutes), cooled to about 22 °C,
//    1–2% starter of Lactococcus lactis with Leuconostoc (which makes diacetyl, the buttery aroma,
//    from citrate), 12–16 hours to about 0.85% acidity and pH 4.5, then stirred, cooled and packed
//    (typical dairy-text figures). The curves come from CurdClear's bacteria model run at the chosen
//    temperature with one team of mesophiles: an illustration, not plant data.
//  · Baking: NaHCO₃ + lactic acid → sodium lactate + H₂O + CO₂, one mole of gas for each mole of
//    acid or soda, whichever runs out first. 84.01 and 90.08 g/mol, 24.5 L/mol at 25 °C. Spare soda
//    breaks down in the oven's heat (2 NaHCO₃ → Na₂CO₃ + H₂O + CO₂) and gives half as much gas. Gas
//    warmed from 25 to 100 °C grows by 373 ÷ 298 = 1.25 (Charles's law). Steam adds more: not counted.
//  · A level teaspoon of baking soda is about 4.6 g (kitchen figure; it varies with how it is packed).
import { THREE, M, tube as kitTube } from '../kit.js';
import {
  COL, C2, TAU, cultureRun, sourAt, hoursTo, leaven, hex,
  board, panelBg, axes, title, line, dot, note, band, balls, steelPot, glassOf, katori, lathe, tableTop, rng, layout, clamp, lerp, smooth, link, VIEW, BOARD,
} from '../buttermilk.js';

const HEAT = 0.6;             // hours for heating, holding and cooling before the culture goes in
const LIQ = { butter: { n: 'Cultured buttermilk', ta: 0.85 }, chaas: { n: 'Chaas, 1 : 1', ta: 0.15 + 0.325 }, milk: { n: 'Plain milk', ta: 0.15 } };
const batch = (s) => {
  const rows = cultureRun(s.ctemp, 1, 30), done = hoursTo(rows, 4.5);
  const tf = Math.max(0, s.hours - HEAT), r = sourAt(rows, Math.min(tf, done === Infinity ? 30 : done));
  const phase = s.hours < 0.25 ? 'heat' : s.hours < HEAT ? 'cool' : tf < done ? 'culture' : 'pack';
  const T = phase === 'heat' ? lerp(20, 92, clamp(s.hours / 0.15, 0, 1)) : phase === 'cool' ? lerp(92, s.ctemp, clamp((s.hours - 0.25) / (HEAT - 0.25), 0, 1)) : phase === 'culture' ? s.ctemp : lerp(s.ctemp, 5, clamp((tf - done) / 1.5, 0, 1));
  return { rows, done, tf, r, phase, T };
};

export default {
  id: 'dairy',
  short: 'Dairy and oven',
  title: 'The dairy and the oven',
  subtitle: 'A dairy makes buttermilk without any butter. A baker uses its acid to blow bubbles.',
  view: VIEW,
  learn: `<p><b>In the dairy.</b> When creameries began to spin cream out of milk with a <b>centrifuge</b> and churn it sweet, the buttermilk that came out was no longer sour. So dairies started making the sour drink on purpose. They take <b>skim or low-fat milk</b>, heat it to about 90 °C to kill other microbes, cool it to about <b>22 °C</b>, and stir in a <b>starter</b>: <i>Lactococcus</i> bacteria for the acid and <i>Leuconostoc</i> for a buttery aroma called <b>diacetyl</b>. After 12 to 16 hours the pH is about 4.5. The soft gel is stirred smooth, chilled and packed. Indian dairies make spiced chaas in much the same way from dahi, water, salt and spices, in pouches and cartons.</p>
    <p><b>In the oven.</b> Buttermilk makes pancakes, soda bread, dhokla-style batters and cakes rise, and the reason is plain chemistry. <b>Baking soda</b> is a base, sodium bicarbonate. Lactic acid reacts with it and sets free <b>carbon dioxide</b> gas: one molecule of gas for every molecule of acid. The bubbles are trapped in the batter and swell in the heat. ${link('acidbaseclear', 'Acids and bases')} has the reaction, and ${link('cakeclear', 'CakeClear')} follows the bubbles through a cake.</p>
    <p>The amounts have to match. Too little soda and some acid is left: tangy, and less rise. Too much and the spare soda breaks down in the heat instead, giving half the gas and a <b>soapy</b> taste. A cup of buttermilk has enough acid for about a third of a teaspoon of soda.</p>
    <p class="tip"><b>Try it:</b> switch to <b>The oven</b> and slide the soda until nothing is left over. Then swap the buttermilk for plain milk. In <b>The dairy</b>, cool the culture tank to 18 °C and see how long the batch takes.</p>`,
  terms: [
    { t: 'Starter culture', d: 'Chosen bacteria added to milk to sour it in a known way.' },
    { t: 'Lactococcus and Leuconostoc', d: 'The two kinds of bacteria in a buttermilk starter: one makes the acid, the other the buttery aroma.' },
    { t: 'Diacetyl', d: 'The molecule that smells of butter. Leuconostoc makes it from the citrate in milk.' },
    { t: 'Baking soda', d: 'Sodium bicarbonate, NaHCO₃: a mild base that gives carbon dioxide with an acid.' },
    { t: 'Pasteurising', d: 'Heating milk enough to kill disease-causing microbes.' },
  ],
  defaults: { mode: 'dairy', hours: 0, ctemp: 22, ml: 240, soda: 1.0, liq: 'butter' },
  controls: [
    { key: 'mode', type: 'seg', label: 'Where?', options: [{ v: 'dairy', label: 'The dairy' }, { v: 'bake', label: 'The oven' }] },
    { key: 'hours', type: 'range', label: 'Dairy: hours since the batch began', min: 0, max: 20, step: 0.05, ends: ['0', '20 h'], fmt: (v) => `${v.toFixed(1)} h` },
    { key: 'ctemp', type: 'range', label: 'Dairy: culture tank temperature', min: 16, max: 32, step: 1, ends: ['16 °C', '32 °C'], fmt: (v) => `${v} °C` },
    { key: 'soda', type: 'range', label: 'Oven: baking soda', min: 0, max: 6, step: 0.1, ends: ['none', '6 g'], fmt: (v) => `${v.toFixed(1)} g · ${(v / 4.6).toFixed(2)} tsp` },
    { key: 'ml', type: 'range', label: 'Oven: liquid in the batter', min: 60, max: 360, step: 10, ends: ['60 mL', '360 mL'], fmt: (v) => `${v} mL` },
    { key: 'liq', type: 'seg', label: 'Oven: which liquid', options: [{ v: 'butter', label: 'Buttermilk' }, { v: 'chaas', label: 'Chaas' }, { v: 'milk', label: 'Plain milk' }] },
  ],
  quiz: [
    { q: 'Why does buttermilk make a batter with baking soda rise?', options: ['It contains yeast', 'Its lactic acid reacts with the soda and releases carbon dioxide', 'It boils at a low temperature', 'It contains air'], answer: 1, why: 'Acid plus sodium bicarbonate gives carbon dioxide gas. The bubbles get trapped in the batter and expand in the heat.' },
    { q: 'A recipe uses far more baking soda than the buttermilk\'s acid can react with. What happens?', options: ['Twice the rise', 'The spare soda breaks down in the heat, with less gas and a soapy taste', 'Nothing at all', 'The batter turns sour'], answer: 1, why: 'Soda with no acid left gives only half the gas when heated and leaves sodium carbonate, which tastes soapy.' },
    { q: 'Why does a dairy heat the milk before adding the starter?', options: ['To make it sweeter', 'To kill other microbes so only the chosen bacteria grow', 'To remove the lactose', 'To add fat'], answer: 1, why: 'Heating clears the field. Then the starter bacteria sour the milk in a known, repeatable way.' },
  ],
  reel: [
    { ms: 5200, caption: 'A dairy makes buttermilk with no butter at all: skim milk, heated, cooled to 22 °C and soured by chosen bacteria.', set: { mode: 'dairy', ctemp: 22 }, anim: { hours: [0, 14] }, spin: 0.04 },
    { ms: 5200, caption: 'In baking, the acid in a cup of buttermilk meets baking soda and makes about half a litre of carbon dioxide.', set: { mode: 'bake', ml: 240, liq: 'butter' }, anim: { soda: [0, 1.7] }, spin: 0.04 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const rnd = rng(77);
    tableTop(root, 11.5, 5.2);
    const dairy = new THREE.Group(), bake = new THREE.Group(); root.add(dairy, bake);
    const steel = M.metal(0xc4c9d2, { roughness: 0.35 });
    // ---- the dairy: heater, culture tank, filler
    const tankAt = (x, r, h, y0 = 0.5) => { const g = new THREE.Group(); g.position.set(x, 0, 0); dairy.add(g); for (const a of [0, 1, 2]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, y0, 8), steel); leg.position.set(r * 0.7 * Math.cos(a * 2.1), y0 / 2, r * 0.7 * Math.sin(a * 2.1)); g.add(leg); } return g; };
    const t1 = tankAt(-4.0, 0.75, 1.9);
    const heatWall = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.9, 36), new THREE.MeshStandardMaterial({ color: 0xc4c9d2, metalness: 0.8, roughness: 0.35, emissive: 0xff5a2a, emissiveIntensity: 0 })); heatWall.position.y = 1.45; t1.add(heatWall);
    const t2 = tankAt(-1.5, 1.15, 2.6);
    const wall2 = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 2.6, 40, 1, true), M.clear(0xdff1ff, 0.18)); wall2.position.y = 1.8; t2.add(wall2);
    const milk2 = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.08, 2.2, 40), new THREE.MeshStandardMaterial({ color: 0xf6f3ea, roughness: 0.4, transparent: true, opacity: 0.55, depthWrite: false })); milk2.position.y = 1.65; t2.add(milk2);
    for (const y of [0.5, 3.1]) { const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.17, 1.17, 0.08, 40), steel); cap.position.y = y; t2.add(cap); }
    const stir = new THREE.Group(); stir.position.y = 0.6; t2.add(stir);
    const sShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.9, 8), steel); sShaft.position.y = 1.45; stir.add(sShaft);
    const sBlade = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.3, 0.04), steel); sBlade.position.y = 0.4; stir.add(sBlade);
    const bugs = balls(150, { seg: 8, basic: true }); t2.add(bugs);
    const BG = Array.from({ length: 150 }, () => ({ a: rnd() * TAU, r: 1.0 * Math.sqrt(rnd()), y: 0.65 + rnd() * 2.0, rank: rnd(), k: rnd() < 0.25 ? 1 : 0, ph: rnd() * TAU }));
    const cB = [new THREE.Color(C2.bug), new THREE.Color(COL.warm)]; BG.forEach((b, i) => bugs.tint(i, cB[b.k]));
    const t3 = tankAt(1.0, 0.6, 1.3, 1.5);
    const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.35, 1.3, 30), steel); fill.position.y = 2.15; t3.add(fill);
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 10), steel); nozzle.position.y = 1.3; t3.add(nozzle);
    const belt = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 0.8), M.matte(0x2a2f3a)); belt.position.set(1.6, 0.3, 0); dairy.add(belt);
    const packs = Array.from({ length: 4 }, () => { const p = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.62, 0.3), M.plastic(0xf2f2ee)); p.castShadow = true; dairy.add(p); return p; });
    const pipe = (pts) => { const m = kitTube(pts, 0.06, steel, false, 40); dairy.add(m); };
    pipe([[-4.0, 2.4, 0], [-4.0, 3.3, 0], [-2.2, 3.5, 0], [-1.5, 3.2, 0]]); pipe([[-1.5, 0.55, 0], [-0.4, 0.6, 0.5], [0.4, 2.6, 0.3], [1.0, 2.8, 0]]);
    const lD = [stage.label('', [-4.0, 2.75, 0.4], dairy, 'hot'), stage.label('', [-1.5, 3.75, 0.6], dairy, 'hot'), stage.label('', [1.6, 3.15, 0.3], dairy, 'hot')];
    const lBug = stage.label('<span style="color:#8fb0ff">●</span> Lactococcus: acid &nbsp; <span style="color:#ffb547">●</span> Leuconostoc: aroma', [-1.5, -0.3, 1.4], dairy);
    const lPack = stage.label('Plain pouches and cartons, kept cold', [2.2, 1.2, 0.5], dairy);
    // ---- the oven: bowl, cup, soda, gas
    const bowl = steelPot(bake, { x: -2.6, z: 0, r: 1.5, h: 1.3 }); bowl.liqMat.color.set(0xf3e2b0); bowl.liqMat.opacity = 0.9;
    const bub = balls(90, { seg: 8, basic: true, opacity: 0.75 }); bowl.g.add(bub);
    const BB = Array.from({ length: 90 }, () => ({ a: rnd() * TAU, r: 1.35 * Math.sqrt(rnd()), t: rnd(), v: 0.25 + 0.5 * rnd(), s: 0.03 + 0.05 * rnd() }));
    const cGas = new THREE.Color(C2.gas); BB.forEach((b, i) => bub.tint(i, cGas));
    const cup = glassOf(bake, { x: 0.2, z: 1.2, r: 0.42, h: 1.0, liquid: 0xfbfaf4 });
    const soda = katori(bake, 1.5, 1.5, 0xf0eef8, 0.3);
    const gas = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), M.clear(hex(C2.gas), 0.22)); gas.position.set(0.9, 2.6, -0.3); bake.add(gas);
    const gas2 = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 9), new THREE.MeshBasicMaterial({ color: hex(COL.warm), wireframe: true, transparent: true, opacity: 0.25 })); gas2.position.copy(gas.position); bake.add(gas2);
    // a tawa with one pancake, which stands taller when there is more gas (an illustration)
    const tawa = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.05, 0.1, 40), M.metal(0x2c2f36, { roughness: 0.6 })); tawa.position.set(3.9, 0.1, 0.3); bake.add(tawa);
    const cake = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.9, 1, 40), M.matte(0xd9a04a)); cake.position.set(3.9, 0.2, 0.3); cake.castShadow = true; bake.add(cake);
    const lCake = stage.label('', [3.9, 1.1, 0.3], bake);
    const lB = [stage.label('Batter', [-2.6, -0.35, 1.9], bake), stage.label('', [0.2, 1.35, 1.2], bake), stage.label('', [1.5, 0.6, 1.5], bake), stage.label('', [0.9, 4.2, -0.3], bake, 'hot'), stage.label('', [-2.6, 2.1, 0], bake, 'hot')];
    lB[3].element.style.setProperty('--c', C2.gas);

    let S = { mode: 'dairy', hours: 0, ctemp: 22, ml: 240, soda: 2.4, liq: 'butter' }, tt = 0, fr = 0;
    const bd = board(root, 4.6, 3.3, 720, 516, (g, w, h) => {
      panelBg(g, w, h);
      if (S.mode === 'dairy') {
        const b = batch(S); title(g, 'One batch', `culture tank at ${S.ctemp} °C`);
        const { X, Y, x0, x1, y0, y1 } = axes(g, w, h, { x0: 70, x1: w - 70, y1: 92, y0: h - 64, xMin: 0, xMax: 20, yMin: 4, yMax: 7, xTicks: [0, 4, 8, 12, 16, 20], yTicks: [4, 4.5, 5, 6, 7], xFmt: (v) => v + ' h', yFmt: (v) => String(v) });
        const YT = (T) => y0 - (T / 100) * (y0 - y1);
        g.fillStyle = COL.warm; g.font = '17px sans-serif'; for (const T of [0, 50, 100]) g.fillText(T + '°', x1 + 8, YT(T) + 6); g.fillText('°C', x1 + 8, y1 - 10);
        g.strokeStyle = 'rgba(245,158,230,.6)'; g.setLineDash([7, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(x0, Y(4.5)); g.lineTo(x1, Y(4.5)); g.stroke(); g.setLineDash([]);
        note(g, 'pH 4.5: stir, chill and pack', x0 + 8, Y(4.5) + 22, '#f59ee6', '15px sans-serif');
        const tp = [], pp = [];
        for (let t = 0; t <= 20; t += 0.05) { const q = batch({ ...S, hours: t }); tp.push([t, q.T]); pp.push([t, q.r.ph]); }
        g.strokeStyle = COL.warm; g.lineWidth = 3; g.beginPath(); tp.forEach(([t, T], i) => (i ? g.lineTo(X(t), YT(T)) : g.moveTo(X(t), YT(T)))); g.stroke();
        line(g, pp, X, Y, '#f4f1e8', 5);
        dot(g, X(S.hours), Y(b.r.ph), '#f4f1e8'); dot(g, X(S.hours), YT(b.T), COL.warm, 7);
        note(g, 'white: pH (left)    orange: temperature (right)', x0 + 8, y1 - 12, 'rgba(255,255,255,.7)', '15px sans-serif');
      } else {
        const L = LIQ[S.liq], r = leaven({ ml: S.ml, ta: L.ta, soda: S.soda }); title(g, 'Acid meets soda', `${S.ml} mL of ${L.n.toLowerCase()}`);
        const x0 = 24, span = w - 48, mx = Math.max(40, r.acid, r.base) * 1.05;
        [['Lactic acid', r.acid, C2.acid], ['Baking soda', r.base, C2.soda]].forEach(([n, v, c], i) => {
          const y = 66 + i * 70; g.font = 'bold 19px sans-serif'; g.fillStyle = COL.text; g.fillText(n, x0, y + 28);
          g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(x0 + 140, y + 4, span - 290, 34); g.fillStyle = c; g.fillRect(x0 + 140, y + 4, (span - 290) * (v / mx), 34);
          g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 + 140 + (span - 290) * (r.used / mx), y); g.lineTo(x0 + 140 + (span - 290) * (r.used / mx), y + 42); g.stroke();
          note(g, `${v.toFixed(1)} mmol`, x0 + span - 140, y + 28, COL.text, '18px sans-serif');
        });
        note(g, 'White line: how much of each reacts. One CO₂ for each pair.', x0, 222, 'rgba(255,255,255,.7)', '16px sans-serif');
        const gm = 1400, gx = (v) => x0 + span * clamp(v / gm, 0, 1);
        g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(x0, 258, span, 46);
        g.fillStyle = C2.gas; g.fillRect(x0, 258, gx(r.co2) - x0, 46); g.fillStyle = COL.warm; g.fillRect(gx(r.co2), 258, gx(r.co2 + r.co2Heat) - gx(r.co2), 46);
        note(g, `Gas at 25 °C: ${Math.round(r.total)} mL`, x0, 248, COL.text, 'bold 19px sans-serif');
        note(g, `from the acid ${Math.round(r.co2)} mL` + (r.co2Heat > 1 ? `  ·  from spare soda in the heat ${Math.round(r.co2Heat)} mL` : ''), x0, 330, 'rgba(255,255,255,.75)', '16px sans-serif');
        note(g, `At 100 °C in the oven: about ${Math.round(r.hotTotal)} mL`, x0, 372, COL.warm, 'bold 19px sans-serif');
        const verdict = r.acid < 1 ? 'No acid: soda alone gives half the gas and a soapy taste.' : r.spareG > 0.3 ? `${r.spareG.toFixed(1)} g of soda has no acid to meet: soapy.` : r.acidLeft > 2 ? 'Acid left over: tangy, and it could have risen more.' : 'Well matched: nearly all of both is used.';
        note(g, verdict, x0, 420, r.spareG > 0.3 || r.acid < 1 ? COL.hot : r.acidLeft > 2 ? COL.warm : COL.ok, 'bold 18px sans-serif');
        note(g, `This liquid can use ${r.sodaNeeded.toFixed(1)} g of soda (${(r.sodaNeeded / 4.6).toFixed(2)} teaspoon).`, x0, 462, 'rgba(255,255,255,.75)', '16px sans-serif');
      }
    }, BOARD);

    return {
      update(dt, s) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s; tt += dt;
        const isD = s.mode === 'dairy';
        const narrow = layout(stage, [bd], [lBug, lPack, lB[0]], { box: isD ? [-0.6, 0, 4.2, 8.8] : [0.5, 0, 4.6, 9.6] });
        dairy.visible = isD; bake.visible = !isD;
        lD.forEach((l) => { l.visible = isD; }); lBug.visible = lBug.visible && isD; lPack.visible = lPack.visible && isD;
        lB.forEach((l, i) => { l.visible = !isD && (i !== 0 || !narrow); }); lCake.visible = !isD && !narrow;
        if (isD) {
          const b = batch(s), ph = b.phase;
          heatWall.material.emissiveIntensity = ph === 'heat' ? 0.9 : ph === 'cool' ? lerp(0.9, 0, clamp((s.hours - 0.25) / 0.3, 0, 1)) : 0;
          const full = ph === 'heat' || ph === 'cool' ? 0 : 1;
          milk2.visible = full > 0; const gel = clamp((5.3 - b.r.ph) / 0.8, 0, 1);
          milk2.material.opacity = lerp(0.45, 0.9, gel);
          stir.rotation.y += dt * (ph === 'pack' ? 3 : ph === 'culture' && b.tf < 0.3 ? 3 : 0);
          const nShow = full ? clamp(Math.log10(Math.max(b.r.n, 0.01) * 1e9 / 1e7) / 2.1, 0.04, 1) : 0;
          BG.forEach((q, i) => bugs.place(i, q.r * Math.cos(q.a + 0.1 * Math.sin(tt + q.ph)), q.y + 0.03 * Math.sin(tt * 1.3 + q.ph), q.r * Math.sin(q.a), q.rank < nShow ? 0.045 : 1e-4));
          bugs.done();
          const packing = ph === 'pack';
          packs.forEach((p, i) => { const u = packing ? (tt * 0.25 + i / 4) % 1 : i / 4; p.position.set(lerp(0.4, 3.1, u), 0.67, 0); p.visible = packing; });
          lD[0].element.innerHTML = ph === 'heat' ? '<b>Heat: 90–95 °C, about 5 min</b>' : 'Heater'; lD[0].element.style.setProperty('--c', ph === 'heat' ? COL.hot : '#9aa6b8');
          lD[1].element.innerHTML = ph === 'culture' ? `<b>Culture tank: ${s.ctemp} °C, pH ${b.r.ph.toFixed(2)}</b>` : ph === 'pack' ? 'Gel stirred smooth' : ph === 'cool' ? `<b>Cooling to ${s.ctemp} °C, then the starter goes in</b>` : 'Culture tank'; lD[1].element.style.setProperty('--c', ph === 'culture' || ph === 'cool' ? '#f59ee6' : '#9aa6b8');
          lD[2].element.innerHTML = ph === 'pack' ? '<b>Chill to 5 °C and pack</b>' : 'Filler'; lD[2].element.style.setProperty('--c', ph === 'pack' ? COL.cold : '#9aa6b8');
        } else {
          const L = LIQ[s.liq], r = leaven({ ml: s.ml, ta: L.ta, soda: s.soda });
          bowl.set(clamp(0.3 + s.ml / 700 + r.total / 4000, 0.3, 0.95));
          const lively = clamp(r.total / 500, 0, 1.3);
          BB.forEach((q, i) => { q.t = (q.t + dt * q.v) % 1; bub.place(i, q.r * Math.cos(q.a), 0.1 + q.t * (bowl.top - 0.1), q.r * Math.sin(q.a), i / 90 < lively / 1.3 ? q.s * (0.5 + q.t) : 1e-4); });
          bub.done();
          cup.set(clamp(s.ml / 400, 0.1, 0.95), 0); cup.liqMat.color.set(s.liq === 'milk' ? 0xffffff : 0xf6f3ea);
          soda.heap.scale.setScalar(clamp(s.soda / 3, 0.05, 1.6)); soda.heap.scale.y *= 0.45;
          const rad = (mL) => Math.cbrt((3 * (mL / 1000)) / (4 * Math.PI));     // litres → scene units (1 unit³ = 1 L)
          gas.scale.setScalar(Math.max(0.01, rad(r.total))); gas2.scale.setScalar(Math.max(0.01, rad(r.hotTotal)));
          gas.visible = gas2.visible = r.total > 5;
          const rise = 0.1 + 0.42 * clamp(r.hotTotal / 800, 0, 1.3) * clamp(240 / s.ml, 0.5, 2) ** 0.5; cake.scale.y = rise; cake.position.y = 0.15 + rise / 2;
          cake.material.color.set(r.spareG > 0.6 ? 0xc9a23a : 0xd9a04a);
          lCake.element.innerHTML = r.total < 30 ? 'Flat and dense' : r.spareG > 0.6 ? 'Risen, but soapy and yellow' : 'Light and risen'; lCake.position.y = 0.55 + rise;
          lB[1].element.innerHTML = `${s.ml} mL of ${L.n.toLowerCase()}`; lB[2].element.innerHTML = `Baking soda: ${s.soda.toFixed(1)} g`;
          lB[3].element.innerHTML = r.total > 5 ? `<b>${Math.round(r.total)} mL of CO₂</b> (to scale)` : 'No gas'; lB[3].position.y = 2.6 + rad(r.hotTotal) + 0.35;
          lB[4].element.innerHTML = r.total > 5 ? 'Bubbles trapped in the batter' : 'Flat'; lB[4].element.style.setProperty('--c', C2.gas);
        }
        if (fr++ % 6 === 0) bd.redraw();
      },
      readout: (s) => {
        if (s.mode === 'dairy') {
          const b = batch(s), names = { heat: 'Heating the milk', cool: 'Cooling for the starter', culture: 'Souring in the culture tank', pack: 'Stirred, chilled and packed' };
          return `<div class="big">${names[b.phase]}</div>
            <div class="row"><span>Milk temperature</span><b>${Math.round(b.T)} °C</b></div>
            <div class="row"><span>pH · acidity</span><b>${b.r.ph.toFixed(2)} · ${b.r.ta.toFixed(2)}%</b></div>
            <div class="row"><span>Starter bacteria</span><b>about ${b.phase === 'heat' || b.phase === 'cool' ? 'none yet' : (b.r.n * 1000).toFixed(0) + ' million per mL'}</b></div>
            <div class="row"><span>Reaches pH 4.5 after</span><b>${b.done === Infinity ? 'more than 30 h' : (b.done + HEAT).toFixed(1) + ' h'}</b></div>
            <small>Dairies allow 12 to 16 hours at about 22 °C. Warmer is faster, but the aroma bacteria do best in the low twenties. The curve is CurdClear's bacteria model, not plant data.</small>`;
        }
        const L = LIQ[s.liq], r = leaven({ ml: s.ml, ta: L.ta, soda: s.soda });
        return `<div class="big">${Math.round(r.total)} mL of carbon dioxide</div>
          <div class="row"><span>Lactic acid in ${s.ml} mL</span><b>${(r.acid * 0.09008).toFixed(2)} g · ${r.acid.toFixed(1)} mmol</b></div>
          <div class="row"><span>Baking soda</span><b>${s.soda.toFixed(1)} g · ${r.base.toFixed(1)} mmol</b></div>
          <div class="row"><span>Left over</span><b>${r.spareG > 0.05 ? r.spareG.toFixed(1) + ' g of soda' : r.acidLeft > 0.5 ? (r.acidLeft * 0.09008).toFixed(2) + ' g of acid' : 'almost nothing'}</b></div>
          <div class="row"><span>Gas once it is at 100 °C</span><b>${Math.round(r.hotTotal)} mL</b></div>
          <small>${s.liq === 'milk' ? 'Plain milk has almost no acid. Recipes with milk use baking powder, which carries its own dry acid.' : 'One gram of soda fully used gives about 290 mL of gas at room temperature. Steam adds more lift in the oven, which is not counted here.'}</small>`;
      },
    };
  },
};
