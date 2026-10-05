// Shared parts for ButtermilkClear: the numbers (milk, the churn, the souring bacteria, Stokes
// settling, the thickness of a suspension, the chemistry of baking soda), colours, chart boards,
// instanced particles, the clay pot (matka) with its churn (mathani), and glasses of chaas.
// The churn, the fat globule numbers and the pot are the same as ButterClear's (js/butter.js there),
// and the acid, pH and bacteria numbers are the same as CurdClear's (js/curd.js there), so the three
// boxes agree. Sources used across the box:
//  [DPH]   Tetra Pak, Dairy Processing Handbook. "The chemistry of milk" (globules 0.1–20 µm, average
//          3–4 µm, membrane 10–20 nm, fat 0.93 g/cm³, casein micelles about 150 nm); "Butter";
//          "Fermented milk products" (buttermilk from butter-making has about 0.5% fat and carries the
//          membrane material, whose oxidation gives it a short shelf life, and whey separation is
//          common; fermented buttermilk is made from skim or low-fat milk heated at 90–95 °C for about
//          5 minutes and soured with ordinary lactic acid bacteria).
//  [FSSAI] Food Safety and Standards (Food Products Standards and Food Additives) Regulations, 2011,
//          chapter 2.1 "Dairy products and analogues" (version of 4 November 2024), sub-regulation
//          2.1.13 "Fermented milk products": "drinks based on fermented milk" are fermented milk mixed
//          with potable water, with at least 40% (m/m) fermented milk, and "include products such as
//          lassi, chhaach, buttermilk"; the fermented milk part has at least 2.9% milk protein, at least
//          0.45% titratable acidity (as lactic acid) and at least 10⁷ cfu/g of starter bacteria; the
//          milk must be heat treated (pasteurised, boiled, and so on). The cream standard separately
//          names "the product that remains after the removal of milk fat by churning milk and cream ...
//          (often referred to as buttermilk)" as a raw material.
//  [FAO]   FAO/ILCA, traditional sour-milk churning in a clay pot: 67% of the fat recovered at 18 °C,
//          44% at 25 °C (fao.org/4/V1650T/v1650T0m.htm).
//  [WIKI]  Wikipedia, "Churning (butter)", "Buttermilk" (traditional buttermilk under 0.5% fat;
//          cultured buttermilk first sold in the United States in the 1920s), "Sodium bicarbonate"
//          (84.0 g/mol; NaHCO₃ + H⁺ → Na⁺ + CO₂ + H₂O; 2 NaHCO₃ → Na₂CO₃ + H₂O + CO₂ on heating).
//  [WHO]   WHO, Five Keys to Safer Food: keep food below 5 °C or above 60 °C, do not leave it at room
//          temperature for more than 2 hours, use safe water and pasteurised milk. WHO sodium guideline
//          (2012): less than 2 g of sodium a day for adults, which is 5 g of salt.
import { THREE, M, clamp, lerp, smooth, arrow } from './kit.js';

export const TAU = Math.PI * 2;
export const G = 9.81;

// ---------------------------------------------------------------- milk
// Typical composition, % by weight. Cow: the means of [DPH] table 2.3. Buffalo: typical figures
// from reviews of buffalo milk (about 7% fat, 4.3% protein, 5% lactose). Water is what is left.
// d = average fat globule diameter in µm (cow 3–4 µm [DPH]; buffalo about 5 µm, typical).
export const MILKS = {
  cow: { name: 'Cow milk', fat: 3.9, protein: 3.4, lactose: 4.8, ash: 0.8, d: 3.5 },
  buffalo: { name: 'Buffalo milk', fat: 7.0, protein: 4.3, lactose: 5.0, ash: 0.8, d: 5.0 },
  cream: { name: 'Cream (40% fat)', fat: 40, protein: 2.1, lactose: 3.0, ash: 0.5, d: 3.5 },
};
export const waterOf = (m) => 100 - m.fat - m.protein - m.lactose - m.ash;
export const RHO_FAT = 930;      // kg/m³ at 15.5 °C [DPH]
export const RHO_SKIM = 1035;    // kg/m³, skim milk at about 20 °C (milk is 1,028–1,038 [DPH])
export const ETA = 1.42e-3;      // Pa·s, the viscosity used in the [DPH] Stokes example
// Share of the volume taken up by fat, from the share by weight.
export const fatVol = (fatPct) => { const f = fatPct / 100; return (f / RHO_FAT) / (f / RHO_FAT + (1 - f) / RHO_SKIM); };
// Globules per millilitre if every globule had the average diameter d (µm).
export const perMl = (fatPct, d) => fatVol(fatPct) / ((Math.PI / 6) * Math.pow(d * 1e-4, 3));
// Membrane area (m²) wrapped around the fat in one litre: 6 φ ÷ d.
export const areaPerL = (fatPct, d) => (6 * fatVol(fatPct)) / (d * 1e-6) / 1000;

// ---------------------------------------------------------------- creaming
// Stokes' law: the steady speed (m/s) of a small sphere of diameter d (µm) through a liquid.
// v = d² Δρ a ÷ 18 η. [DPH] works it with Δρ = 48 kg/m³ and gets 0.6 mm/h for a 3 µm globule; with
// the handbook's own fat density (930) against skim milk (1,035) Δρ is about 105 and the same
// globule rises about 1.3 mm/h. Either way: millimetres per hour.
export const D_RHO = RHO_SKIM - RHO_FAT;
export const stokes = (dUm, a = G) => (Math.pow(dUm * 1e-6, 2) * D_RHO * a) / (18 * ETA);
// Centripetal acceleration (m/s²) at radius r (m) in a bowl turning at `rpm`.
export const spinAcc = (rpm, r) => Math.pow((rpm * TAU) / 60, 2) * r;

// ---------------------------------------------------------------- fat crystals
// Solid fat content of milk fat (% of the fat that is crystal) against temperature. Milk fat is a
// mix of hundreds of triglycerides that melt anywhere from about −40 °C to about +40 °C, so it has a
// melting range, not a melting point. These are typical textbook values (after Walstra, Dairy
// Science and Technology); real butter shifts by several points with season, feed and breed.
const SFC = [[-40, 100], [-20, 82], [-10, 70], [0, 58], [5, 50], [10, 41], [15, 30], [20, 19], [25, 11], [30, 5], [35, 1.5], [40, 0], [60, 0]];
export function sfc(T) {
  if (T <= SFC[0][0]) return 100;
  for (let i = 1; i < SFC.length; i++) if (T <= SFC[i][0]) { const [t0, v0] = SFC[i - 1], [t1, v1] = SFC[i]; return v0 + ((v1 - v0) * (T - t0)) / (t1 - t0); }
  return 0;
}
export const SFC_PTS = SFC.filter(([t]) => t >= -20 && t <= 45);

// ---------------------------------------------------------------- the churn
// A rope wound round a rod of radius r (m): pulling a length L (m) turns the rod by L ÷ r radians.
// One full stroke is a pull one way and a pull back, so the rod swings ±L÷2r about the middle.
export const churnSwing = (L, r) => L / r;                                       // radians per pull
export const churnPeak = (L, r, spm) => (L / (2 * r)) * TAU * (spm / 60);          // rad/s at mid-pull
// Time (minutes) for the cream to "break" into butter grains. There is no neat law for this, so this
// is a rule-of-thumb model, anchored on old dairy practice: cream at about 14 °C churned by hand
// breaks in about 45 minutes [WIKI]. Warmer cream has more liquid fat to glue clumps together, so
// it breaks sooner (here: e-fold for every 6 °C); faster churning means more collisions (time ∝ 1 ÷
// speed); soured cream or dahi breaks a little sooner than sweet cream (×0.8, dairy texts say
// "ripened cream churns more easily"). Below about 7 °C the fat is too hard to stick; above about
// 28 °C too little of it is crystal, and it smears into an oily paste instead of grains.
export const T_COLD = 7, T_SOFT = 20, T_OIL = 28;
export function breakMinutes(T, spm, sour = true) {
  return 45 * Math.exp(-(T - 14) / 6) * (60 / Math.max(5, spm)) * (sour ? 0.8 : 1) * (T < T_COLD ? 1 + (T_COLD - T) * 2 : 1);
}
// Share (%) of the fat that ends up in the makhan with a pot and mathani: a straight line through
// the two [FAO] measurements (67% at 18 °C, 44% at 25 °C), capped at 76% (the best that study got
// at 18 °C with a better paddle). A rough guide, not a law.
export const recovery = (T) => clamp(67 - (23 / 7) * (T - 18), 12, 76) * (T < T_COLD ? 0.5 : 1);
export function churnVerdict(T) {
  if (T < T_COLD) return { k: 'cold', text: 'Too cold: the fat is too hard to stick', col: COL.cold };
  if (T <= T_SOFT) return { k: 'good', text: 'Good: firm, clean grains', col: COL.ok };
  if (T <= T_OIL) return { k: 'soft', text: 'Warm: soft, greasy grains, more fat lost in the chaas', col: COL.warm };
  return { k: 'oil', text: 'Too warm: an oily paste, no grains', col: COL.hot };
}

// ---------------------------------------------------------------- standards
export const FSSAI = { table: { fat: 80, moisture: 16, curd: 1.5, salt: 3 }, desi: { fat: 76 } };

// ---------------------------------------------------------------- colours and formats
export const COL = {
  fat: '#ffd76a',      // milk fat
  makhan: '#fff6dc',   // white butter
  butter: '#f7c53a',   // table butter
  water: '#6fb6ff',
  protein: '#c49bff',
  lactose: '#5ce1a9',
  ash: '#9aa6b8',
  salt: '#e8eef8',
  air: '#8ef0ff',
  ok: '#5ce1a9',
  warm: '#ffb547',
  hot: '#ff7a59',
  cold: '#6fb6ff',
  text: '#e8eef8',
};
export const hex = (c) => new THREE.Color(c).getHex();
export const fmt = (v, d = 1) => (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString('en-IN') : v.toFixed(d));
export function fmtTime(sec) {
  if (!isFinite(sec)) return 'never';
  if (sec < 1) return (sec * 1000).toFixed(0) + ' ms';
  if (sec < 90) return sec.toFixed(sec < 10 ? 1 : 0) + ' s';
  if (sec < 5400) return Math.round(sec / 60) + ' min';
  if (sec < 48 * 3600) return (sec / 3600).toFixed(1) + ' h';
  return Math.round(sec / 86400) + ' days';
}
export const fmtMin = (m) => (!isFinite(m) || m > 600 ? 'hours and hours' : m >= 90 ? (m / 60).toFixed(1) + ' h' : m >= 1 ? Math.round(m) + ' min' : Math.round(m * 60) + ' s');
export function sci(v) { const e = Math.floor(Math.log10(v)); return `${(v / Math.pow(10, e)).toFixed(1)} × 10${String(e).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])}`; }
export const link = (slug, name, hash = '') => `<a href="https://glassbox.how/${slug}/${hash ? '#' + hash : ''}">${name}</a>`;

// ---------------------------------------------------------------- boards (live charts in 3D)
export function panelBg(g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,12,18,.9)'; g.fillRect(0, 0, w, h); }
export function board(root, w, h, pxW, pxH, draw, pos) {
  const c = document.createElement('canvas'); c.width = pxW; c.height = pxH;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const redraw = () => { draw(g, pxW, pxH); tex.needsUpdate = true; };
  redraw();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
  m.position.set(...pos); root.add(m);
  return { tex, redraw, canvas: c, mesh: m };
}
export function axes(g, w, h, { x0 = 84, x1 = w - 28, y0 = h - 64, y1 = 70, xMax, yMax, xMin = 0, yMin = 0, xTicks, yTicks, xFmt = String, yFmt = String, xLabel = '', yLabel = '', logY = false }) {
  const X = (x) => x0 + ((x - xMin) / (xMax - xMin)) * (x1 - x0);
  const Y = logY
    ? (y) => y0 - ((Math.log10(Math.max(y, 1e-30)) - Math.log10(yMin)) / (Math.log10(yMax) - Math.log10(yMin))) * (y0 - y1)
    : (y) => y0 - ((y - yMin) / (yMax - yMin)) * (y0 - y1);
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; g.fillStyle = 'rgba(255,255,255,.6)'; g.font = '19px sans-serif';
  for (const t of xTicks) { g.beginPath(); g.moveTo(X(t), y1); g.lineTo(X(t), y0); g.stroke(); const s = xFmt(t); g.fillText(s, X(t) - g.measureText(s).width / 2, y0 + 26); }
  for (const t of yTicks) { g.beginPath(); g.moveTo(x0, Y(t)); g.lineTo(x1, Y(t)); g.stroke(); const s = yFmt(t); g.fillText(s, x0 - 10 - g.measureText(s).width, Y(t) + 6); }
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '18px sans-serif';
  if (xLabel) g.fillText(xLabel, x1 - g.measureText(xLabel).width, y0 + 52);
  if (yLabel) g.fillText(yLabel, x0 + 8, y1 - 10);
  return { X, Y, x0, x1, y0, y1 };
}
export function title(g, text, sub = '') {
  g.fillStyle = COL.text; g.font = 'bold 24px sans-serif'; g.fillText(text, 20, 34);
  if (sub) { const x = 34 + g.measureText(text).width; g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText(sub, x, 34); }
}
export function line(g, pts, X, Y, col, wdt = 5, dash = null) {
  if (pts.length < 2) return;
  g.strokeStyle = col; g.lineWidth = wdt; g.setLineDash(dash || []); g.lineJoin = 'round'; g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
  g.stroke(); g.setLineDash([]);
}
export function dot(g, x, y, col, r = 10) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); }
export function legend(g, items, x = 24, y = 50, font = 18) {
  g.font = `bold ${font}px sans-serif`;
  for (const [n, c] of items) { g.fillStyle = c; g.fillRect(x, y, 16, 16); g.fillStyle = COL.text; g.fillText(n, x + 22, y + 15); x += 36 + g.measureText(n).width; }
}
export function note(g, text, x, y, col = 'rgba(255,255,255,.75)', font = '17px sans-serif') { g.font = font; g.fillStyle = col; g.fillText(text, x, y); }
export function band(g, x0, x1, y0, y1, col) { g.fillStyle = col; g.fillRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0)); }
// Stacked horizontal bars: rows [{ label, parts: [[value, colour], …] }], all in %.
export function stacks(g, rows, { x = 20, y = 64, w = 600, rowH = 56, labelW = 170 } = {}) {
  const span = w - labelW - 20;
  rows.forEach((r, i) => {
    const yy = y + i * rowH; let xx = x + labelW;
    g.font = 'bold 19px sans-serif'; g.fillStyle = COL.text; g.fillText(r.label, x, yy + 26);
    for (const [v, c] of r.parts) { const L = (v / 100) * span; g.fillStyle = c; g.fillRect(xx, yy + 6, Math.max(0, L - 1), rowH - 20); xx += L; }
    if (r.text) { g.font = '16px sans-serif'; g.fillStyle = 'rgba(255,255,255,.7)'; g.fillText(r.text, x + labelW, yy + rowH - 0); }
  });
}

// ---------------------------------------------------------------- small helpers
export function rng(seed = 1) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
export const inReel = () => document.body.classList.contains('gb-reel');
// True in the tall or square reel video, where boards stack above the model.
export const reelTall = (stage) => inReel() && stage.camera.aspect <= 1.3;
// On a phone-width stage: hide minor labels and nudge the picture down, clear of the readout.
export function fitNarrow(stage, minor = []) {
  const narrow = stage.host.clientWidth < 560;
  minor.forEach((l) => { if (l) l.visible = !narrow; });
  const y = narrow && !inReel() ? -0.16 : 0;
  if (!stage.shift || stage.shift[1] !== y) stage.setShift(0, y);
  return narrow;
}
const WIDE = { pos: [0.1, 4.35, 11.9], target: [0.1, 3.95, 0] };
// Chart boards sit above and beside the model. In the tall reel video they stack above it instead.
export function reelBoards(boards, x = 0, stage = null, view = null, top = 6.6, gap = 3.0, sc = 1.0) {
  const r = inReel(), wide = r && stage && stage.camera.aspect > 1.3;
  boards.forEach((b, i) => {
    if (!b.home) b.home = b.mesh.position.clone();
    // only the first board fits above the model in the tall video
    b.mesh.visible = !(r && !wide && i > 0);
    if (r && !wide) { b.mesh.position.set(x, top - i * gap, 0); b.mesh.scale.setScalar(sc); }
    else { b.mesh.position.copy(b.home); b.mesh.scale.setScalar(1); }
  });
  // the wide (16:9) video shows the whole two-row layout, from a little further back than the page does
  if (wide && view) { stage.controls.autoRotate = false; if (stage.home?.pos !== WIDE.pos) stage.setView(WIDE.pos, WIDE.target, 0.01); }
}

// ---------------------------------------------------------------- 3D pieces
// Many shaded spheres in one instanced mesh, each with its own size and colour.
export function balls(n, { seg = 14, rough = 0.35, opacity = 1, basic = false } = {}) {
  const mat = basic
    ? new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 })
    : new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: rough, metalness: 0, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 });
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, seg, Math.max(6, seg - 4)), mat, n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.frustumCulled = false;
  const o = new THREE.Object3D(), c = new THREE.Color(0xffffff);
  for (let i = 0; i < n; i++) { mesh.setColorAt(i, c); o.scale.setScalar(0.0001); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); }
  mesh.place = (i, x, y, z, s = 1, sy = s) => { o.position.set(x, y, z); o.scale.set(Math.max(1e-4, s), Math.max(1e-4, sy), Math.max(1e-4, s)); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); };
  mesh.tint = (i, col) => mesh.setColorAt(i, col);
  mesh.done = () => { mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; };
  return mesh;
}
// A see-through box with bright edges: the "microscope view".
export function chamber(parent, x0, x1, y0, y1, d, { color = 0xcfe8ff, opacity = 0.08, edge = 0x9fb4c8 } = {}) {
  const g = new THREE.Group();
  const glass = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, d), M.clear(color, opacity)); glass.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0); g.add(glass);
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(glass.geometry), new THREE.LineBasicMaterial({ color: edge, transparent: true, opacity: 0.7 }));
  e.position.copy(glass.position); g.add(e);
  parent.add(g); g.glass = glass; g.edges = e;
  return g;
}
// An arrow that ignores depth, aimed from a point along a direction.
const UP = new THREE.Vector3(0, 1, 0), tmpV = new THREE.Vector3(), tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
export function flowArrow(color, r = 0.05, head = 0.28) {
  const a = arrow(color, 1, head, r);
  a.traverse((o) => { if (o.material) { o.material.depthTest = false; o.renderOrder = 10; } });
  a.aim = (from, dir, len) => {
    a.position.set(...from);
    tmpV.set(...dir); if (tmpV.lengthSq() < 1e-9) tmpV.set(1, 0, 0);
    a.quaternion.setFromUnitVectors(UP, tmpV.normalize());
    a.set(Math.max(0.001, len));
    if (len < 0.05) a.visible = false;
  };
  return a;
}
// A cylinder you can re-aim every frame between two points (ropes, drips).
export function strand(r, mat) {
  const g = new THREE.CylinderGeometry(r, r, 1, 10);
  const m = new THREE.Mesh(g, mat); m.castShadow = true;
  m.span = (a, b) => {
    tmpA.set(...a); tmpB.set(...b);
    const len = tmpA.distanceTo(tmpB);
    m.position.copy(tmpA).add(tmpB).multiplyScalar(0.5);
    m.scale.set(1, Math.max(1e-3, len), 1);
    m.quaternion.setFromUnitVectors(UP, tmpB.sub(tmpA).normalize());
  };
  return m;
}
// A lathed shape around the vertical axis from [r, y] pairs. `cut` opens a wedge towards the viewer.
export function lathe(profile, mat, cut = 0, seg = 56) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(Math.max(0, r), y)), seg, Math.PI * cut, Math.PI * (2 - 2 * cut));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------- the matka and the mathani
// Scene units here are 10 cm. A clay pot about 30 cm across and 28 cm tall, cut open towards the
// viewer, with a wooden churning rod (mathani, or bilona) standing in it. The rod is held upright by
// two cord loops tied to a post behind the pot. A rope (neti) is wound a few turns round the rod;
// the churner sits in front with one end in each hand. Pulling the right-hand end turns the rod one
// way, pulling the left-hand end turns it back.
const POT = [[0.0, 0.0], [0.7, 0.03], [1.2, 0.35], [1.48, 0.95], [1.5, 1.45], [1.32, 2.05], [1.0, 2.45], [0.95, 2.62], [1.12, 2.84]];
const potR = (y) => { for (let i = 1; i < POT.length; i++) if (y <= POT[i][1]) { const [r0, y0] = POT[i - 1], [r1, y1] = POT[i]; return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0); } return 1.1; };
export function makeMatka(parent, { x = 0, rodR = 0.14, level = 1.9, post = true, hands = true, liquid = 0xfdf8ea } = {}) {
  const g = new THREE.Group(); g.position.x = x; parent.add(g);
  const clay = new THREE.MeshStandardMaterial({ color: 0xb5613a, roughness: 0.9, side: THREE.DoubleSide });
  g.add(lathe(POT, clay, 0.3));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.13, 10, 40), M.matte(0xc9a25e)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.06; g.add(ring);
  // the liquid: the pot's inner shape up to the level
  const liqMat = new THREE.MeshStandardMaterial({ color: liquid, roughness: 0.25, transparent: true, opacity: 0.62, depthWrite: false });
  const liq = new THREE.Group(); g.add(liq);
  let lvl = -1;
  const setLevel = (h) => {
    h = clamp(h, 0.3, 2.4); if (Math.abs(h - lvl) < 0.01) return; lvl = h;
    liq.children.slice().forEach((c) => { liq.remove(c); c.geometry.dispose(); });
    const prof = [[0, 0.08]]; for (const [, y] of POT) if (y > 0.08 && y < h) prof.push([potR(y) - 0.07, y]);
    prof.push([potR(h) - 0.07, h], [0, h]);
    liq.add(new THREE.Mesh(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 48), liqMat));
  };
  setLevel(level);
  // the churn
  const wood = M.matte(0x9a6a3c), woodD = M.matte(0x6f4a28);
  const rod = new THREE.Group(); g.add(rod);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(rodR, rodR, 5.6, 20), wood); shaft.position.y = 0.5 + 2.8; shaft.castShadow = true; rod.add(shaft);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(rodR * 1.5, 16, 12), woodD); knob.position.y = 6.15; rod.add(knob);
  // a painted stripe so the turning shows
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.4, rodR * 2.06), M.matte(0xe2483a)); stripe.position.set(0, 5.2, 0); rod.add(stripe);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.5, 16), woodD); hub.position.y = 0.62; rod.add(hub);
  for (let i = 0; i < 4; i++) {          // the head: a cross of carved wooden wings
    const w = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.42, 0.09), wood); w.rotation.y = (i / 4) * Math.PI; w.position.y = 0.62; w.castShadow = true; rod.add(w);
  }
  // rope coil on the rod (four turns), part of the rod so it turns with it
  const ropeMat = M.matte(0xe8dcc0), coil = [];
  for (let i = 0; i <= 96; i++) { const a = (i / 96) * 4 * TAU; coil.push(new THREE.Vector3((rodR + 0.035) * Math.sin(a), 4.05 + (i / 96) * 0.36, (rodR + 0.035) * Math.cos(a))); }
  const coilMesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil), 200, 0.035, 8), ropeMat); rod.add(coilMesh);
  const ropes = [strand(0.035, ropeMat), strand(0.035, ropeMat)], hand = [];
  if (hands) {
    ropes.forEach((r) => g.add(r));
    for (let i = 0; i < 2; i++) { const h = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), M.plastic(0xd9a273)); g.add(h); hand.push(h); }
  }
  if (post) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 6.0, 14), woodD); p.position.set(0, 3.0, -1.75); p.castShadow = true; g.add(p);
    for (const y of [3.1, 5.6]) {
      const loop = new THREE.Mesh(new THREE.TorusGeometry(rodR + 0.07, 0.03, 8, 24), ropeMat); loop.rotation.x = Math.PI / 2; loop.position.y = y; g.add(loop);
      const tie = strand(0.03, ropeMat); tie.span([0, y, -rodR - 0.05], [0, y, -1.6]); g.add(tie);
    }
  }
  let rk = 1;
  const api = {
    g, rod, liq, liqMat, hand, ropes, rodR, setLevel, level: () => lvl, inner: (y) => potR(y) - 0.07,
    // make the rod thicker or thinner (k = 1 is 2.8 cm across)
    setRod(k) { rk = k; shaft.scale.set(k, 1, k); coilMesh.scale.set(k, 1, k); stripe.scale.z = k; },
    showHands(on) { ropes.forEach((r) => { r.visible = on; }); hand.forEach((h) => { h.visible = on; }); },
    // theta: the rod's angle (radians, anticlockwise seen from above). Rope paid out = rodR × theta.
    // shift: how far the rope has been pulled to the right (scene units); by default rod radius × angle.
    pose(theta, shift = rodR * rk * theta) {
      rod.rotation.y = theta;
      if (!hands) return;
      const s = clamp(shift, -1.8, 1.8), rodR = api.rodR * rk;
      // both rope ends leave the rod from its front, so a pull to the right turns the front of the rod to the right
      // the churner sits in front: the hands are out to each side and towards the viewer
      const R = [1.5 + 0.7 * s, 3.85, 1.1 + 0.7 * s], L = [-1.5 + 0.7 * s, 3.85, 1.1 - 0.7 * s];
      ropes[0].span([rodR * 0.6, 4.1, rodR], R); ropes[1].span([-rodR * 0.6, 4.38, rodR], L);
      hand[0].position.set(...R); hand[1].position.set(...L);
    },
  };
  api.pose(0);
  return api;
}
export { clamp, lerp, smooth };

// ================================================================ new in ButtermilkClear
export const C2 = { whey: '#cfe28a', curd: '#f6f3ea', acid: '#ff7a8a', bug: '#8fb0ff', gas: '#8ef0ff', spice: '#d9a441', soda: '#c49bff', bad: '#ff6b6b' };

// ---------------------------------------------------------------- acid and pH (same table as CurdClear)
// Fresh milk: pH about 6.65 and a "titratable acidity" of about 0.15% counted as lactic acid (that
// first 0.15% is the buffering of the proteins and phosphates, not lactic acid). Typical titration
// of fermenting milk (Tamime & Robinson, Yoghurt: Science and Technology). Dahi sets near pH 4.6,
// the isoelectric point of casein, at about 0.75–0.8% acidity.
const TITRATION = [[0.15, 6.65], [0.20, 6.35], [0.25, 6.05], [0.32, 5.75], [0.40, 5.5], [0.50, 5.2], [0.57, 5.0], [0.66, 4.8], [0.75, 4.6], [0.87, 4.4], [1.02, 4.2], [1.20, 4.0], [1.45, 3.8], [1.80, 3.6]];
export function interp(tab, x) {
  if (x <= tab[0][0]) return tab[0][1];
  for (let i = 1; i < tab.length; i++) if (x <= tab[i][0]) { const [x0, y0] = tab[i - 1], [x1, y1] = tab[i]; return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0); }
  return tab[tab.length - 1][1];
}
export const PH_MILK = 6.65, TA_MILK = 0.15, PH_ISO = 4.6, TA_DAHI = 0.8;
export const phOfAcid = (ta) => interp(TITRATION, ta);
export const TITRATION_PTS = TITRATION;
// Each gram of lactic acid costs about 1.5 g of lactose (CurdClear's mid value).
export const LACTOSE_PER_ACID = 1.5;

// ---------------------------------------------------------------- what is in the glass
// Dahi made from a milk (MILKS above), with `ta` % titratable acidity. `water` = parts of water added
// to one part of dahi. `skim` = share of the fat taken out as makhan (0 = none). Returns grams in
// 100 g of the drink. Adding water dilutes everything, the buffers included, so the pH hardly moves
// while the acid in each sip falls: that is why thin chaas tastes mild.
export function drink({ milk = 'cow', water = 1, skim = 0, ta = TA_DAHI } = {}) {
  const m = MILKS[milk], f = 1 / (1 + water);
  const acid = Math.max(0, ta - TA_MILK);
  const lactose = Math.max(0, m.lactose - LACTOSE_PER_ACID * acid);
  return { f, fat: m.fat * (1 - skim) * f, protein: m.protein * f, lactose: lactose * f, acid: acid * f, ta: ta * f, ash: m.ash * f, ph: phOfAcid(ta), lactoseUsed: 1 - lactose / m.lactose };
}
// What packets and textbooks say about the two dairy products. Sweet-cream buttermilk: about 0.5% fat
// [DPH] (0.3–1.0% in reviews), protein and lactose close to skim milk, acidity near fresh milk.
// Cultured buttermilk: skim or low-fat milk (1% fat taken here) soured to about 0.85% acidity, pH 4.5.
export const DAIRY = {
  sweet: { fat: 0.5, protein: 3.4, lactose: 4.6, acid: 0.02, ta: 0.17, ph: 6.6 },
  cultured: { fat: 1.0, protein: 3.4, lactose: 4.8 - LACTOSE_PER_ACID * 0.7, acid: 0.7, ta: 0.85, ph: 4.5 },
};
// Churning 1 kg of dahi with `water` kg of water at T °C: where everything goes. Makhan (white
// butter) is taken as 80% fat. The same arithmetic as ButterClear's last chapters.
export function churnSplit({ milk = 'cow', water = 1, T = 18 } = {}) {
  const m = MILKS[milk], fatIn = m.fat * 10, rec = recovery(T) / 100;
  const makhan = (fatIn * rec) / 0.8;
  const liquid = 1000 * (1 + water) - makhan;
  const fatLeft = fatIn * (1 - rec);
  return { fatIn, rec, makhan, liquid, fatLeft, chaasFat: (100 * fatLeft) / liquid, protein: (m.protein * 1000) / liquid };
}

// ---------------------------------------------------------------- thin, but not watery
// Churning breaks the dahi gel into soft flocs of casein, tens of micrometres across, swollen with
// whey. We take set dahi as 90% gel by volume, so the flocs fill φ = 0.9 ÷ (1 + water) of the drink.
// Thickness: the Krieger–Dougherty equation (1959) for a crowd of particles in a liquid,
// η = η₀ (1 − φ ÷ φmax)^(−2.5 φmax), with φmax = 0.64 (random close packing). The whey itself is
// about 1.2 mPa·s at 20 °C and water 1.0. A model with typical values: real chaas also thins when
// it is stirred or swallowed (shear-thinning), which this single number leaves out.
export const PHI_DAHI = 0.9, PHI_MAX = 0.64;
export const flocPhi = (water) => PHI_DAHI / (1 + water);
export const serumEta = (water) => (1.0 + 0.2 / (1 + water)) * 1e-3;                       // Pa·s
export const thickness = (water) => { const p = Math.min(flocPhi(water), PHI_MAX * 0.985); return serumEta(water) * Math.pow(1 - p / PHI_MAX, -2.5 * PHI_MAX); };
// Settling: Stokes' law for one floc, v = d² Δρ g ÷ 18 η. A floc is mostly whey, so it is only a
// little denser than the liquid round it: Δρ about 30 kg/m³ (estimate; casein micelles are about
// 1,060–1,080 kg/m³ against whey at about 1,025). A crowd settles more slowly than one particle:
// Richardson & Zaki (1954), v = v₁ (1 − φ)^4.65. The sediment packs to about φ = 0.6, so the clear
// whey layer ends up as 1 − φ ÷ 0.6 of the height.
export const D_RHO_FLOC = 30, PHI_SED = 0.6;
export const stokesFloc = (dUm, water) => (Math.pow(dUm * 1e-6, 2) * D_RHO_FLOC * G) / (18 * serumEta(water));   // m/s, one floc
export const hindered = (dUm, water) => stokesFloc(dUm, water) * Math.pow(1 - Math.min(0.95, flocPhi(water)), 4.65);
export const wheyMax = (water) => clamp(1 - flocPhi(water) / PHI_SED, 0, 1);
// Share of the glass height that is clear whey after `min` minutes in a glass `H` m tall.
export const wheyLayer = (dUm, water, min, H = 0.12) => Math.min(wheyMax(water), (hindered(dUm, water) * min * 60) / H);
// A casein micelle in fresh milk: 150 nm across. Stokes gives it nanometres a second, and the
// jostling of water molecules (Brownian motion) easily keeps it up.
export const stokesMicelle = () => (Math.pow(150e-9, 2) * 50 * G) / (18 * 1.0e-3);

// ---------------------------------------------------------------- going more sour
// The bacteria of CurdClear, carried on: two teams, growth against temperature by the cardinal
// temperature model (Rosso et al. 1993), acid by the "maintenance" part of Luedeking & Piret (1959).
// A set dahi holds about 10⁹ live bacteria per mL; they are no longer multiplying much, but each keeps
// turning lactose into acid at a rate that follows temperature, until the acid itself stops them.
// Everything is counted per gram of the dahi in the drink, so adding water changes neither the pH
// curve nor the hours (fewer bacteria, but less buffer too).
export const TEAMS = {
  meso: { n: 'Mesophiles (Lactococcus, Leuconostoc)', Tmin: 8, Topt: 30, Tmax: 41, mu: 0.85, phStop: 4.3 },
  thermo: { n: 'Thermophiles (S. thermophilus, Lactobacillus)', Tmin: 18, Topt: 42, Tmax: 52, mu: 1.4, phStop: 3.7 },
};
export function ctmi(T, { Tmin, Topt, Tmax, mu }) {
  if (T <= Tmin || T >= Tmax) return 0;
  const a = (T - Tmax) * (T - Tmin) * (T - Tmin), b = (Topt - Tmin) * ((Topt - Tmin) * (T - Topt) - (Topt - Tmax) * (Topt + Tmin - 2 * T));
  return Math.max(0, (mu * a) / b);
}
const BETA = 0.30, N_DAHI = 1.0;                 // % acid per hour per 10⁹ bacteria per mL; 10⁹ per mL
// % of titratable acidity gained per hour (dahi basis) at T °C and the present acidity.
export function sourRate(T, ta) {
  const ph = phOfAcid(ta); let r = 0;
  for (const tm of [TEAMS.meso, TEAMS.thermo]) r += BETA * (N_DAHI / 2) * (ctmi(T, tm) / tm.mu) * clamp((ph - tm.phStop) / 0.9, 0, 1);
  return r;
}
const sourCache = new Map();
// Rows every 0.25 h: { t, ta, ph } on the dahi basis.
export function sourRun(T, hours = 48, ta0 = TA_DAHI) {
  const key = `${T}|${hours}|${ta0}`; if (sourCache.has(key)) return sourCache.get(key);
  const rows = []; let ta = ta0; const h = 0.05;
  for (let i = 0; i <= Math.round(hours / h); i++) { if (i % 5 === 0) rows.push({ t: i * h, ta, ph: phOfAcid(ta) }); ta += sourRate(T, ta) * h; }
  if (sourCache.size > 200) sourCache.clear();
  sourCache.set(key, rows); return rows;
}
export const sourAt = (rows, t) => rows[clamp(Math.round(t / 0.25), 0, rows.length - 1)];
export const hoursTo = (rows, ph) => { const r = rows.find((q) => q.ph <= ph); return r ? r.t : Infinity; };
export function taste(ph) {
  if (ph > 4.42) return { n: 'Fresh and mild', col: COL.ok };
  if (ph > 4.25) return { n: 'Pleasantly tangy', col: COL.warm };
  if (ph > 4.08) return { n: 'Sour: good for kadhi', col: COL.hot };
  return { n: 'Sharply sour', col: C2.bad };
}
export const fmtH = (h) => (h === Infinity ? 'never' : h < 1 ? Math.round(h * 60) + ' min' : h.toFixed(1).replace('.0', '') + ' h');

// ---------------------------------------------------------------- acid meets baking soda
// The acid that counts is the lactic acid the bacteria made: the titratable acidity minus the 0.15%
// that fresh milk already shows (that part is buffering by proteins and phosphates, and gives no gas).
// Lactic acid 90.08 g/mol, sodium bicarbonate 84.01 g/mol, one CO₂ for each. A mole of gas takes
// 24.5 L at 25 °C and 1 atm (ideal gas), so 1 g of soda fully used gives about 290 mL, the same
// figure as CakeClear. Soda with no acid left breaks down in the oven's heat instead and gives half
// the gas, leaving washing soda (sodium carbonate) behind: a soapy taste and a yellow tint.
export const M_LACTIC = 90.08, M_SODA = 84.01, VM25 = 24.47;
export function leaven({ ml = 240, ta = 0.85, soda = 2.4, hot = 100 } = {}) {
  const acid = (ml * 1.03 * Math.max(0, ta - TA_MILK)) / 100 / M_LACTIC * 1000;   // mmol of lactic acid (buttermilk is about 1.03 g/mL)
  const base = (soda / M_SODA) * 1000;                             // mmol
  const used = Math.min(acid, base), spare = base - used, acidLeft = acid - used;
  const co2 = used * VM25, co2Heat = (spare / 2) * VM25;           // mL at 25 °C
  const grow = (273.15 + hot) / 298.15;
  return { acid, base, used, spare, acidLeft, co2, co2Heat, total: co2 + co2Heat, hotTotal: (co2 + co2Heat) * grow, sodaNeeded: (acid * M_SODA) / 1000, spareG: (spare * M_SODA) / 1000 };
}
// Sodium in salt: 22.99 ÷ 58.44 = 39.3% by weight. WHO: under 2,000 mg of sodium a day for adults.
export const sodiumMg = (saltG) => saltG * 393.4;
export const WHO_SODIUM = 2000;

// ---------------------------------------------------------------- glasses and pots
// A straight glass (or steel tumbler) with a liquid you can set the level, colour and whey layer of.
export function glassOf(parent, { x = 0, z = 0, y = 0, r = 0.5, h = 1.5, steel = false, liquid = 0xf6f3ea, level = 0.85 } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  const wallMat = steel ? M.metal(0xc9ced6, { side: THREE.DoubleSide, roughness: 0.3 }) : M.clear(0xdff1ff, 0.2);
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.86, h, 40, 1, true), wallMat); wall.position.y = h / 2; g.add(wall);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.86, r * 0.86, 0.06, 40), steel ? M.metal(0xc9ced6) : M.clear(0xdff1ff, 0.35)); base.position.y = 0.03; g.add(base);
  const liqMat = new THREE.MeshStandardMaterial({ color: liquid, roughness: 0.3, transparent: true, opacity: 0.9 });
  const wheyMat = new THREE.MeshStandardMaterial({ color: hex(C2.whey), roughness: 0.2, transparent: true, opacity: 0.45, depthWrite: false });
  const liq = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.94, r * 0.83, 1, 36), liqMat); g.add(liq);
  const whey = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.94, r * 0.94, 1, 36), wheyMat); g.add(whey);
  const api = {
    g, r, h, liqMat, wheyMat, wall,
    // level: 0–1 of the glass height; wheyFrac: share of the liquid that is a clear layer on top
    set(lv = level, wheyFrac = 0) {
      const H = Math.max(0.01, lv * (h - 0.08)), hw = H * clamp(wheyFrac, 0, 0.98), hl = H - hw;
      liq.scale.y = Math.max(0.001, hl); liq.position.y = 0.07 + hl / 2;
      whey.visible = hw > 0.004; whey.scale.y = Math.max(0.001, hw); whey.position.y = 0.07 + hl + hw / 2;
      api.top = 0.07 + H; api.line = 0.07 + hl;
    },
  };
  api.set(level, 0);
  return api;
}
// A round steel pot (bhagona or patila), cut open towards the viewer.
export function steelPot(parent, { x = 0, z = 0, r = 1.2, h = 1.3, cut = 0.28 } = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
  const mat = M.metal(0xc4c9d2, { side: THREE.DoubleSide, roughness: 0.35 });
  g.add(lathe([[0, 0.02], [r * 0.96, 0.02], [r, 0.12], [r, h], [r + 0.1, h + 0.03]], mat, cut));
  const liqMat = new THREE.MeshStandardMaterial({ color: 0xf6f3ea, roughness: 0.3, transparent: true, opacity: 0.8, depthWrite: false });
  const liq = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.05, r - 0.05, 1, 40), liqMat); g.add(liq);
  const api = { g, r, h, liq, liqMat, set(lv) { const H = Math.max(0.02, lv * (h - 0.1)); liq.scale.y = H; liq.position.y = 0.06 + H / 2; api.top = 0.06 + H; } };
  api.set(0.6);
  return api;
}
// A small bowl (katori) with a heap of something in it.
export function katori(parent, x, z, color, r = 0.3) {
  const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
  g.add(lathe([[0, 0.02], [r * 0.7, 0.03], [r, 0.2], [r * 1.04, 0.22]], M.metal(0xc4c9d2, { side: THREE.DoubleSide, roughness: 0.35 }), 0, 28));
  const heap = new THREE.Mesh(new THREE.SphereGeometry(r * 0.8, 20, 10, 0, TAU, 0, Math.PI / 2), M.matte(color)); heap.scale.y = 0.45; heap.position.y = 0.1; g.add(heap);
  g.heap = heap;
  return g;
}
// A wooden table top for the scene to stand on.
export function tableTop(parent, w = 11, d = 5, y = -0.08) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.16, d), M.matte(0x3a2c22)); m.position.y = y; m.receiveShadow = true; parent.add(m); return m;
}
// The page layout shared by the chapters: the model sits low and to the left (the readout is at the
// upper left of the stage), charts float on the right.
export const VIEW = { pos: [0.6, 4.0, 10.4], target: [0.6, 3.3, 0] };
export const BOARD = [4.0, 6.4, 0];
// One call per frame. On the page: hide minor labels and the boards on a phone (the readout carries
// the numbers there). In the wide video: the page layout from a little further back. In the tall or
// square video: frame the model (box = [centre x, bottom y, top y, width]) in the lower part and
// put the first board, enlarged, above it. The reel's own camera is set here, so scenes need no view.
const WIDE2 = { pos: [0.6, 3.9, 12.4], target: [0.6, 3.5, 0] };
export function layout(stage, boards, minor = [], { box = [0.6, 0, 5, 10] } = {}) {
  const r = inReel(), asp = stage.camera.aspect, narrow = stage.host.clientWidth < 560;
  minor.forEach((l) => { if (l) l.visible = !narrow; });
  // on a phone the readout covers the upper half of the stage, so the picture moves well down
  const sy = narrow && !r ? -0.22 : 0; if (!stage.shift || stage.shift[1] !== sy) stage.setShift(0, sy);
  boards.forEach((b) => { if (!b.home) b.home = b.mesh.position.clone(); });
  const home = () => boards.forEach((b) => { b.mesh.position.copy(b.home); b.mesh.scale.setScalar(1); b.mesh.visible = true; });
  if (!r) { home(); if (narrow) boards.forEach((b) => { b.mesh.visible = false; }); return narrow; }
  if (asp > 1.3) { home(); if (stage.home?.tag !== 'wide') { stage.setView(WIDE2.pos, WIDE2.target, 0.01); stage.home.tag = 'wide'; } return false; }
  const [cx, y0, y1, wM] = box, b = boards[0], { width: bw, height: bh } = b.mesh.geometry.parameters;
  let W = wM / 0.94, H = W / asp;
  if (y1 - y0 > 0.46 * H) { H = (y1 - y0) / 0.46; W = H * asp; }
  const sc = Math.min((0.94 * W) / bw, (0.36 * H) / bh), bottom = y0 - 0.1 * H, ty = bottom + H / 2;
  const free = H - 0.1 * H - (y1 - y0) - bh * sc;                  // empty height, shared out as gaps
  boards.forEach((q, i) => { q.mesh.visible = i === 0; });
  b.mesh.position.set(cx, y1 + free * 0.4 + (bh * sc) / 2, 0); b.mesh.scale.setScalar(sc);
  const tag = 'tall' + asp.toFixed(3) + cx + y0 + y1 + wM;
  if (stage.home?.tag !== tag) {
    const k = Math.min(2.5, Math.max(1, 1.45 / Math.max(0.3, asp))), dist = H / (2 * Math.tan((21 * Math.PI) / 180));
    stage.setView([cx, ty + 0.4 / k, dist / k], [cx, ty, 0], 0.01); stage.home.tag = tag;
  }
  return false;
}

// ---------------------------------------------------------------- the dairy's cultured buttermilk
// One team of mesophiles (Lactococcus lactis with aroma-making Leuconostoc), CurdClear's growth and
// acid model: logistic growth at the cardinal-temperature rate, acid by Luedeking & Piret (1959).
// Skim or low-fat milk is heated (90–95 °C for about 5 min [DPH]; older American practice is 85 °C
// for 30 min), cooled to about 22 °C, given 1–2% starter and left 12–16 h until the acidity is about
// 0.8–0.9% and the pH about 4.5, then stirred smooth, cooled and packed (typical dairy-text figures).
const cultCache = new Map();
export function cultureRun(T = 22, inoc = 1.5, hours = 24) {
  const key = `${T}|${inoc}|${hours}`; if (cultCache.has(key)) return cultCache.get(key);
  const tm = TEAMS.meso, rows = [], h = 0.05, A = 0.40, NMAX = 1.2;
  let n = (inoc / 100) * 0.5, ta = TA_MILK + (inoc / 100) * 0.7;
  for (let i = 0; i <= Math.round(hours / h); i++) {
    const t = i * h, ph = phOfAcid(ta);
    if (i % 5 === 0) rows.push({ t, n, ta, ph });
    const mu = ctmi(T, tm), fp = clamp((ph - tm.phStop) / 0.9, 0, 1), lag = clamp(t / 0.4, 0, 1);
    const grow = mu * n * Math.max(0, 1 - n / NMAX) * fp * lag;
    ta += (A * grow + BETA * n * (mu / tm.mu) * fp * lag) * h; n += grow * h;
  }
  if (cultCache.size > 100) cultCache.clear();
  cultCache.set(key, rows); return rows;
}
