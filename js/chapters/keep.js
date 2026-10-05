// Chapter 6: keeping it, and what a glass really gives you. Left: a glass on the kitchen counter with
// a thermometer. Middle: the same chaas in a fridge at 4 °C. Right: the pH of both over two days.
// What is real and what is a model:
//  · Souring: CurdClear's two teams of bacteria (cardinal temperature model, Rosso et al. 1993) keep
//    making acid after the dahi has set, at a rate that follows temperature, until the acid stops
//    them (Luedeking & Piret 1959, the non-growth term). Titration table as in CurdClear. In this
//    model the bacteria stop below 8 °C; in a real fridge they creep on slowly over days.
//  · Taste words against pH are everyday descriptions, not a standard.
//  · Food safety (official sources only): WHO Five Keys to Safer Food (keep food below 5 °C, do not
//    leave it at room temperature for more than 2 hours, use safe water and pasteurised milk, keep
//    clean). FSSAI sub-regulation 2.1.13: the milk for fermented milk must be heat treated
//    (pasteurised or boiled), and the fermented milk part must hold at least 10⁷ live starter
//    bacteria per gram. Sourness is not a safety test: this chart shows taste, not germs.
//  · Heat: India's official heat-wave advice (NDMA's do's and don'ts, as published by district and
//    weather offices) says: "Use ORS, homemade drinks like lassi, torani (rice water), lemon water,
//    buttermilk, etc. which helps to re-hydrate the body." Nothing here says it lowers body temperature.
//  · Lactose: each gram of lactic acid cost about 1.5 g of lactose (CurdClear's mid value).
import { THREE, M } from '../kit.js';
import {
  COL, C2, TAU, MILKS, TA_DAHI, TA_MILK, LACTOSE_PER_ACID, sourRun, sourAt, hoursTo, sourRate, taste, fmtH, wheyLayer, hex,
  board, panelBg, axes, title, line, dot, note, band, balls, glassOf, tableTop, rng, layout, clamp, lerp, link, VIEW, BOARD,
} from '../buttermilk.js';

const FRIDGE = 4, WATER = 1;
const feel = (T) => (T <= 8 ? 'fridge' : T < 18 ? 'cold room' : T < 27 ? 'mild day' : T < 35 ? 'warm kitchen' : 'summer afternoon');

export default {
  id: 'keep',
  short: 'Keeping it',
  title: 'Keeping it',
  subtitle: 'The bacteria never stopped. Warmth lets them carry on, a fridge almost stops them. And what a glass really gives you.',
  view: VIEW,
  learn: `<p>Chaas is <b>alive</b>. The bacteria that set the dahi are still in it, still turning lactose into acid. How fast depends on <b>temperature</b>, as ${link('rateclear', 'Rates of reaction')} explains. On a 35 °C afternoon a mild chaas turns sharp in a few hours. In a fridge at 4 °C it hardly changes for days, which is the whole point of ${link('fridgeclear', 'a fridge')}. Very sour chaas is not wasted: it is what kadhi is made from.</p>
    <p><b>Sour is not the same as unsafe, and mild is not the same as safe.</b> Sourness is a taste, not a safety test. The official basics are short. FSSAI's standard says the milk must be <b>boiled or pasteurised</b> before it is made into dahi. The World Health Organization's Five Keys add: clean hands and vessels, <b>safe water</b>, keep it below 5 °C, and do not leave it out for more than <b>2 hours</b>.</p>
    <p><b>Does it cool you?</b> A glass of chaas is about 94% <b>water</b>, with <b>salt</b> you added and the milk's own minerals. India's official heat-wave advice lists buttermilk and lassi with ORS, lemon water and rice water as drinks that help to rehydrate. That much is shown: it replaces water and salt lost as sweat. What is <b>not</b> shown is that it lowers your body temperature. It feels cooling because it is cold, wet, sour and salty.</p>
    <p><b>And digestion?</b> The bacteria have used up about a fifth of the lactose, and the water thins the rest, so a glass of chaas has well under half the lactose of a glass of milk. It is not lactose-free. Old Ayurvedic texts praise <b>takra</b> highly, and that is part of its history. This box makes no health promises.</p>
    <p class="tip"><b>Try it:</b> set the kitchen to 35 °C and slide the hours until it turns sharply sour. Now try 20 °C. The fridge glass beside it barely moves.</p>`,
  terms: [
    { t: 'Post-acidification', d: 'A fermented milk going on getting more sour after it is made, because its bacteria are still alive.' },
    { t: 'Pasteurised', d: 'Heated enough to kill disease-causing microbes. Boiling does the job at home.' },
    { t: 'Rehydrate', d: 'To replace the water, and the salts, that the body has lost.' },
    { t: 'Lactose', d: 'Milk sugar. Some people digest it poorly. Fermenting uses up part of it, not all.' },
    { t: 'Five Keys to Safer Food', d: 'WHO\'s short list: keep clean, separate raw and cooked, cook thoroughly, keep food at safe temperatures, use safe water and raw materials.' },
  ],
  defaults: { temp: 32, hours: 0 },
  controls: [
    { key: 'hours', type: 'range', label: 'Hours since it was made', min: 0, max: 48, step: 0.25, ends: ['fresh', '2 days'], fmt: (v) => fmtH(v) },
    { key: 'temp', type: 'range', label: 'Kitchen temperature', min: 5, max: 42, step: 1, ends: ['5 °C', '42 °C'], fmt: (v) => `${v} °C · ${feel(v)}` },
  ],
  quiz: [
    { q: 'Why does chaas left on the counter in summer turn very sour by evening?', options: ['The water evaporates', 'Its bacteria are alive and keep making acid, faster when warm', 'The salt reacts with the glass', 'Fat turns into acid'], answer: 1, why: 'The same bacteria that set the dahi carry on. Warmth speeds them up, and a fridge slows them almost to a stop.' },
    { q: 'Which statement about chaas in hot weather is supported by official advice?', options: ['It lowers body temperature by several degrees', 'It helps replace water and salt lost in sweat', 'It cures heatstroke', 'It replaces the need for water'], answer: 1, why: 'Official heat-wave advice lists buttermilk among drinks that help to rehydrate. It is water and salt. It is not a treatment for heatstroke.' },
    { q: 'Is chaas free of lactose?', options: ['Yes, the bacteria eat all of it', 'No: only part is used up, and water thins the rest', 'Yes, churning removes it', 'It has more lactose than milk'], answer: 1, why: 'The bacteria stop when the acid builds up, long before the lactose runs out. About four fifths of it is still there, diluted by the water.' },
  ],
  reel: [
    { ms: 5400, caption: 'Chaas is alive. Left out on a hot day it turns sharply sour in hours. In a fridge it barely changes.', set: { temp: 34 }, anim: { hours: [0, 12] }, spin: 0.04 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const rnd = rng(3);
    tableTop(root, 11.5, 5.2);
    const GA = -2.4, GB = 2.9;
    const gA = glassOf(root, { x: GA, z: 0.6, r: 0.85, h: 2.9, liquid: 0xf6f3ea }), gB = glassOf(root, { x: GB, z: 0.2, r: 0.85, h: 2.9, liquid: 0xf6f3ea, y: 0.25 });
    // the fridge: a pale box, open at the front, with a shelf
    const fr = new THREE.Group(); fr.position.set(GB, 0, 0.2); root.add(fr);
    const wallM = M.plastic(0xdfe6ee, { roughness: 0.6 });
    for (const [w, h, d, x, y, z] of [[2.6, 0.12, 2.0, 0, 0.12, 0], [2.6, 0.12, 2.0, 0, 4.0, 0], [0.12, 4.0, 2.0, -1.3, 2.05, 0], [0.12, 4.0, 2.0, 1.3, 2.05, 0], [2.6, 4.0, 0.12, 0, 2.05, -1.0]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallM); m.position.set(x, y, z); m.receiveShadow = true; fr.add(m); }
    const cold = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.7, 1.8), M.ghost(hex(COL.cold), 0.08)); cold.position.y = 2.05; fr.add(cold);
    // thermometer by the counter glass
    const th = new THREE.Group(); th.position.set(GA - 1.5, 0, 0.6); root.add(th);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.34, 3.2, 0.06), M.matte(0xe9e4d6)); back.position.y = 1.8; th.add(back);
    const merc = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, 0.04), M.glow(0xff5a4a)); merc.position.z = 0.05; th.add(merc);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), M.glow(0xff5a4a)); bulb.position.set(0, 0.42, 0.05); th.add(bulb);
    // bacteria at work in each glass: dots that flicker faster when it is warm
    const mk = (g) => { const b = balls(60, { seg: 8, basic: true }); g.g.add(b); const c = new THREE.Color(C2.bug); const L = Array.from({ length: 60 }, () => ({ a: rnd() * TAU, r: 0.72 * Math.sqrt(rnd()), u: rnd(), ph: rnd() * TAU })); L.forEach((_, i) => b.tint(i, c)); return { b, L }; };
    const bA = mk(gA), bB = mk(gB);
    const lA = stage.label('', [GA, 3.35, 0.6], root, 'hot'), lB = stage.label('', [GB, 3.85, 1.2], root, 'hot'); lB.element.style.setProperty('--c', COL.cold);
    const lT = stage.label('', [GA - 1.5, 3.7, 0.6], root);
    const lSafe = stage.label('', [0.2, -0.45, 2.3], root, 'hot');
    const lBug = stage.label('<span style="color:#8fb0ff">●</span> bacteria still making acid', [GA + 1.9, 0.9, 1.2], root);

    let S = { temp: 32, hours: 0 }, tt = 0, frn = 0;
    const bd = board(root, 4.6, 3.3, 720, 516, (g, w, h) => {
      panelBg(g, w, h); title(g, 'How sour?', 'pH of the chaas');
      const { X, Y, x0, x1 } = axes(g, w, h, { x0: 84, y1: 70, y0: h - 64, xMin: 0, xMax: 48, yMin: 3.6, yMax: 4.7, xTicks: [0, 12, 24, 36, 48], yTicks: [3.6, 3.8, 4.0, 4.2, 4.4, 4.6], xFmt: (v) => v + ' h', yFmt: (v) => v.toFixed(1), xLabel: 'hours since it was made' });
      for (const [a, b, n, c] of [[4.42, 4.7, 'fresh and mild', 'rgba(92,225,169,.13)'], [4.25, 4.42, 'tangy', 'rgba(255,181,71,.13)'], [4.08, 4.25, 'sour: kadhi', 'rgba(255,122,89,.13)'], [3.6, 4.08, 'sharply sour', 'rgba(255,107,107,.16)']]) { band(g, x0, x1, Y(a), Y(b), c); note(g, n, x1 - 8 - g.measureText(n).width * 0.95, Y((a + b) / 2) + 6, 'rgba(255,255,255,.6)', '15px sans-serif'); }
      const rows = sourRun(S.temp, 48), cool = sourRun(FRIDGE, 48);
      line(g, cool.map((r) => [r.t, r.ph]), X, Y, COL.cold, 4, [9, 7]); note(g, 'fridge, 4 °C', X(2), Y(cool[0].ph) - 10, COL.cold, 'bold 16px sans-serif');
      line(g, rows.map((r) => [r.t, r.ph]), X, Y, '#f59ee6', 5);
      const r = sourAt(rows, S.hours); dot(g, X(S.hours), Y(r.ph), '#f59ee6');
      note(g, `counter, ${S.temp} °C`, clamp(X(S.hours) + 14, x0, x1 - 150), Y(r.ph) - 14, '#f59ee6', 'bold 16px sans-serif');
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.setLineDash([4, 5]); g.lineWidth = 2; g.beginPath(); g.moveTo(X(2), Y(4.7)); g.lineTo(X(2), Y(3.6)); g.stroke(); g.setLineDash([]);
      note(g, 'WHO: 2 hours out, at most', X(2) + 6, Y(3.66), 'rgba(255,255,255,.75)', '15px sans-serif');
    }, BOARD);

    return {
      update(dt, s) {
        dt = Math.max(0, Math.min(dt, 0.05)); S = s; tt += dt;
        const narrow = layout(stage, [bd], [lBug, lT, lSafe], { box: [0.2, 0, 4.2, 8.6] });
        const rows = sourRun(s.temp, 48), r = sourAt(rows, s.hours), rc = sourAt(sourRun(FRIDGE, 48), s.hours), ts = taste(r.ph);
        // whey gathers on top as it stands (chapter 3), a little more in the warm glass
        gA.set(0.86, wheyLayer(40, WATER, s.hours * 60 * 0.25)); gB.set(0.86, wheyLayer(40, WATER, s.hours * 60 * 0.12));
        const sour = clamp((4.5 - r.ph) / 0.6, 0, 1);
        gA.liqMat.color.set(0xf6f3ea).lerp(new THREE.Color(0xeef0d0), sour);
        const hT = 0.5 + (clamp(s.temp, 0, 45) / 45) * 2.6; merc.scale.y = hT; merc.position.y = 0.45 + hT / 2;
        for (const [o, rate, g] of [[bA, sourRate(s.temp, r.ta) / 0.14, gA], [bB, 0.02, gB]]) {
          o.L.forEach((q, i) => o.b.place(i, q.r * Math.cos(q.a), 0.15 + q.u * (g.line - 0.25), q.r * Math.sin(q.a), 0.035 + 0.035 * clamp(rate, 0, 1) * (0.5 + 0.5 * Math.sin(tt * (2 + 9 * rate) + q.ph))));
          o.b.done();
        }
        lA.element.innerHTML = narrow ? `<b>Counter: pH ${r.ph.toFixed(2)}</b>` : `<b>On the counter: pH ${r.ph.toFixed(2)}</b> · ${ts.n.toLowerCase()}`; lA.element.style.setProperty('--c', ts.col);
        lB.element.innerHTML = narrow ? `<b>Fridge: pH ${rc.ph.toFixed(2)}</b>` : `<b>In the fridge, 4 °C: pH ${rc.ph.toFixed(2)}</b>`;
        lT.element.innerHTML = `${s.temp} °C`;
        const out = s.hours > 2;
        lSafe.element.innerHTML = out ? 'Out for more than 2 hours: past WHO\'s rule for perishable food' : 'Within 2 hours at room temperature';
        lSafe.element.style.setProperty('--c', out ? COL.warm : COL.ok);
        if (frn++ % 6 === 0) bd.redraw();
      },
      readout: (s) => {
        const rows = sourRun(s.temp, 48), r = sourAt(rows, s.hours), ts = taste(r.ph), t1 = hoursTo(rows, 4.08);
        const f = 1 / (1 + WATER), lac = Math.max(0, MILKS.cow.lactose - LACTOSE_PER_ACID * (r.ta - TA_MILK)) * f, glass = 2.575;
        return `<div class="big" style="color:${ts.col}">${ts.n}</div>
          <div class="row"><span>pH after ${fmtH(s.hours)} at ${s.temp} °C</span><b>${r.ph.toFixed(2)}</b></div>
          <div class="row"><span>Lactic acid in the glass (1 : 1 chaas)</span><b>${((r.ta - TA_MILK) * f * glass).toFixed(1)} g</b></div>
          <div class="row"><span>Turns sharply sour after</span><b>${t1 === Infinity ? 'more than 2 days' : fmtH(t1)}</b></div>
          <div class="row"><span>Lactose in a 250 mL glass</span><b>${(lac * glass).toFixed(1)} g · milk has ${(MILKS.cow.lactose * glass).toFixed(0)} g</b></div>
          <div class="row"><span>Water in the glass</span><b>about 94%</b></div>
          <small>${s.hours > 2 && s.temp > 5 ? 'Past WHO\'s 2-hour rule for food left out. Sourness tells you about taste, not about germs.' : 'A model of taste, not of safety. Use boiled or pasteurised milk, clean vessels and safe water, and keep it cold.'}</small>`;
      },
    };
  },
};
