'use strict';
/* =====================================================================
   ARTE: todos los dibujos son vectoriales (SVG) armados con código.
   Cada objeto se dibuja con la paleta (P) del estilo elegido, por eso
   al cambiar de estilo se repinta toda la casa.
   ===================================================================== */

/* ---- atajos para dibujar ---- */
const R  = (x, y, w, h, f, rx = 0, o = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" ${o}/>`;
const C  = (x, y, r, f, o = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${o}/>`;
const E  = (x, y, rx, ry, f, o = '') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${o}/>`;
const Pa = (d, f = 'none', o = '') => `<path d="${d}" fill="${f}" ${o}/>`;
const Ln = (x1, y1, x2, y2, s, w = 1.5, o = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${s}" stroke-width="${w}" stroke-linecap="round" ${o}/>`;
const st = (c, w = 1.5) => `stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const SH = (w, h, k = 0.46) => E(w / 2, h - 1.5, w * k, 3.4, 'rgba(70,55,40,.15)');
const LUZ = 'rgba(255,255,255,.22)';

/* ---------------- Objetos ---------------- */
const hoja = (cx, cy, rx, ry, rot, col, P) =>
  `<g transform="rotate(${rot} ${cx} ${cy})">${E(cx, cy, rx, ry, col)}${Ln(cx - rx * .8, cy, cx + rx * .8, cy, 'rgba(255,255,255,.35)', 1)}</g>`;
const flor = (x, y, r, col, centro) => {
  let s = '';
  for (let i = 0; i < 5; i++) { const a = i * 72 * Math.PI / 180; s += C((x + Math.cos(a) * r * .8).toFixed(1), (y + Math.sin(a) * r * .8).toFixed(1), r * .55, col); }
  return s + C(x, y, r * .35, centro);
};

const DIBUJO = {
  cama_basica: P => SH(150, 74) + R(6, 14, 138, 40, P.wood, 6) + R(2, 46, 146, 18, P.wood2, 3) + R(8, 34, 134, 18, P.fab, 8) +
    R(8, 42, 134, 16, P.fab2, 5) + R(16, 26, 42, 16, P.paper, 8) + R(92, 26, 42, 16, P.paper, 8) +
    R(10, 62, 6, 10, P.wood2, 1) + R(134, 62, 6, 10, P.wood2, 1),

  cama_lino: P => SH(164, 90) + R(4, 4, 156, 58, P.fab2, 12) + Ln(56, 12, 56, 54, P.fab, 1.2) + Ln(82, 12, 82, 54, P.fab, 1.2) + Ln(108, 12, 108, 54, P.fab, 1.2) +
    R(2, 54, 160, 22, P.wood, 4) + R(8, 38, 148, 24, P.fab, 9) + R(8, 46, 148, 24, P.paper, 7) + R(8, 61, 148, 7, P.acc, 3) +
    R(20, 30, 46, 17, P.paper, 8) + R(98, 30, 46, 17, P.paper, 8) + R(10, 76, 7, 12, P.wood2, 1) + R(147, 76, 7, 12, P.wood2, 1),

  cama_boucle: P => SH(172, 94) + Pa('M6 66V36Q6 6 86 6Q166 6 166 36V66Z', P.acc2) + R(2, 58, 168, 22, P.wood, 4) +
    R(10, 40, 152, 24, P.fab, 9) + R(10, 48, 152, 24, P.paper, 8) + R(10, 65, 152, 6, P.fab2, 3) +
    R(36, 30, 46, 18, P.fab2, 9) + R(90, 30, 46, 18, P.fab2, 9) + R(12, 80, 7, 12, P.wood2, 1) + R(153, 80, 7, 12, P.wood2, 1),

  mesita: P => SH(40, 50) + R(0, 6, 40, 5, P.wood2, 2) + R(3, 11, 34, 28, P.wood, 2) + R(7, 15, 26, 10, P.wood2, 1.5, 'opacity=".4"') +
    R(7, 28, 26, 8, P.wood2, 1.5, 'opacity=".4"') + C(20, 20, 1.8, P.metal) + C(20, 32, 1.8, P.metal) +
    R(5, 39, 3.5, 9, P.wood2, 1) + R(31.5, 39, 3.5, 9, P.wood2, 1),

  mesita_redonda: P => SH(38, 56, .4) + Ln(8, 14, 5, 54, P.metal, 2) + Ln(30, 14, 33, 54, P.metal, 2) + Ln(19, 15, 19, 54, P.metal, 2) +
    E(19, 40, 13, 3, P.wood2, 'opacity=".7"') + E(19, 12, 19, 5, P.wood2) + E(19, 10.5, 19, 5, P.wood),

  comoda: P => SH(104, 64) + R(0, 6, 104, 5, P.wood2, 2) + R(2, 11, 100, 40, P.wood, 2) + R(6, 15, 44, 15, P.wood2, 2, 'opacity=".4"') +
    R(54, 15, 44, 15, P.wood2, 2, 'opacity=".4"') + R(6, 33, 92, 14, P.wood2, 2, 'opacity=".4"') +
    C(28, 22.5, 1.8, P.metal) + C(76, 22.5, 1.8, P.metal) + C(52, 40, 1.8, P.metal) + R(8, 51, 5, 11, P.wood2, 1) + R(91, 51, 5, 11, P.wood2, 1),

  sillon: P => SH(78, 66) + R(10, 6, 58, 40, P.acc, 16) + R(0, 26, 18, 30, P.acc, 8) + R(60, 26, 18, 30, P.acc, 8) +
    R(14, 34, 50, 20, P.acc, 8) + R(14, 34, 50, 8, 'rgba(255,255,255,.2)', 4) + R(10, 56, 4, 8, P.wood2, 1) + R(64, 56, 4, 8, P.wood2, 1),

  sillon_boucle: P => SH(86, 68) + Pa('M6 60V34Q6 4 43 4Q80 4 80 34V60Z', P.acc2) + R(2, 36, 16, 24, P.acc2, 8) + R(68, 36, 16, 24, P.acc2, 8) +
    R(14, 38, 58, 20, P.paper, 9) + R(14, 38, 58, 7, 'rgba(255,255,255,.5)', 4) +
    C(30, 20, 1.2, 'rgba(255,255,255,.35)') + C(46, 14, 1.2, 'rgba(255,255,255,.35)') + C(58, 24, 1.2, 'rgba(255,255,255,.35)') +
    R(14, 60, 4, 8, P.wood2, 1) + R(68, 60, 4, 8, P.wood2, 1),

  sofa: P => SH(156, 68) + R(6, 4, 144, 44, P.fab, 16) + R(0, 26, 20, 34, P.fab, 9) + R(136, 26, 20, 34, P.fab, 9) +
    R(18, 34, 60, 22, P.paper, 8) + R(80, 34, 58, 22, P.paper, 8) + R(24, 12, 26, 24, P.acc, 8) + R(104, 16, 24, 20, P.acc2, 8) +
    R(10, 58, 5, 9, P.wood2, 1) + R(141, 58, 5, 9, P.wood2, 1),

  mesa_ratona: P => SH(84, 32, .42) + Ln(16, 14, 12, 30, P.dark, 2) + Ln(68, 14, 72, 30, P.dark, 2) + Ln(42, 16, 42, 30, P.dark, 2) +
    E(42, 10, 42, 8, P.wood2) + E(42, 8, 42, 8, P.wood) + E(42, 8, 30, 5.5, LUZ),

  escritorio: P => SH(124, 86) + R(5, 29, 4, 54, P.dark, 1) + R(0, 24, 124, 5, P.wood2, 2) + R(84, 29, 36, 54, P.wood, 2) +
    R(88, 34, 28, 17, P.wood2, 2, 'opacity=".4"') + R(88, 55, 28, 17, P.wood2, 2, 'opacity=".4"') + C(102, 42.5, 1.8, P.metal) + C(102, 63.5, 1.8, P.metal),

  silla: P => SH(40, 74, .4) + Ln(9, 42, 7, 72, P.wood2, 3) + Ln(31, 42, 33, 72, P.wood2, 3) + R(8, 2, 24, 34, P.wood, 4) +
    R(11, 6, 18, 26, P.fab, 3) + R(5, 36, 30, 6, P.wood2, 3),

  pouf: P => SH(46, 34, .44) + R(2, 8, 42, 24, P.fab2, 12) + E(23, 10, 21, 6, P.fab) + Ln(12, 16, 12, 29, 'rgba(0,0,0,.06)', 1) + Ln(34, 16, 34, 29, 'rgba(0,0,0,.06)', 1),

  estante: P => SH(74, 134, .5) + R(0, 0, 74, 132, P.wood, 2) + R(4, 4, 66, 124, P.paper, 1) +
    R(4, 38, 66, 3, P.wood) + R(4, 72, 66, 3, P.wood) + R(4, 106, 66, 3, P.wood) +
    R(8, 20, 5, 18, P.acc) + R(14, 24, 5, 14, P.fab2) + R(20, 18, 6, 20, P.acc2) + R(27, 23, 5, 15, P.dark) + R(33, 21, 6, 17, P.fab2) +
    Pa('M52 38Q48 28 54 28Q60 28 56 38Z', P.ceram, st(P.fab2, 1)) + Ln(54, 28, 56, 18, P.wood2, 1.2) + C(56, 17, 2, P.leaf) +
    R(8, 56, 9, 16, P.fab2) + R(18, 58, 5, 14, P.acc) + R(24, 54, 6, 18, P.acc2) + R(44, 62, 22, 10, P.wood2, 2) +
    R(8, 90, 24, 16, P.wood2, 2) + R(36, 94, 14, 12, P.fab2, 2) + C(60, 98, 7, P.leaf) + R(55, 98, 10, 8, P.ceram, 2) +
    R(8, 114, 56, 10, P.fab, 2) + R(10, 116, 8, 6, P.acc, 1) + R(20, 116, 8, 6, P.fab2, 1),

  lampara_pie: P => E(18, 129, 12, 3, P.dark) + Ln(18, 127, 18, 38, P.metal, 2) +
    E(18, 40, 17, 5, 'rgba(250,225,160,.22)') + Pa('M6 36L11 8H25L30 36Z', P.paper, st(P.fab2, 1)),

  lampara_arco: P => E(16, 137, 15, 3.2, P.dark) + R(4, 128, 24, 9, P.paper, 3, st(P.fab2, 1)) +
    Pa('M16 128C14 20 70 -2 74 34', 'none', st(P.metal, 2.6)) + E(72, 52, 18, 5, 'rgba(250,225,160,.22)') + Pa('M58 36A14 14 0 0 0 86 36Z', P.paper, st(P.fab2, 1)),

  farol_papel: P => E(20, 57, 12, 2.5, 'rgba(70,55,40,.15)') + Ln(15, 40, 8, 58, P.wood2, 2) + Ln(25, 40, 32, 58, P.wood2, 2) + Ln(20, 40, 20, 58, P.wood2, 2) +
    C(20, 22, 19, 'rgba(250,225,160,.28)') + C(20, 22, 17, P.paper, st(P.fab2, 1)) +
    E(20, 22, 17, 5.5, 'none', st(P.fab2, 1)) + E(20, 22, 8, 17, 'none', st(P.fab2, 1)) + Ln(20, 5, 20, 39, P.fab2, 1),

  monstera: P => Pa('M29 62C29 48 22 38 15 30', 'none', st(P.leaf2, 1.6)) + Pa('M29 62C29 44 34 30 31 18', 'none', st(P.leaf2, 1.6)) +
    Pa('M29 62C30 50 38 40 44 31', 'none', st(P.leaf2, 1.6)) +
    hoja(14, 27, 13, 8, -35, P.leaf, P) + hoja(30, 14, 13, 9, -100, P.leaf2, P) + hoja(45, 28, 13, 8, 35, P.leaf, P) +
    hoja(21, 44, 11, 7, -20, P.leaf2, P) + hoja(39, 46, 11, 7, 20, P.leaf, P) +
    Pa('M17 64H41L37 90H21Z', P.ceram) + R(15, 60, 28, 6, P.fab, 2) + E(29, 91, 12, 2.2, 'rgba(70,55,40,.15)'),

  olivo: P => {
    let s = E(32, 122, 14, 2.5, 'rgba(70,55,40,.15)') + Pa('M32 98C30 74 36 56 30 30', 'none', st(P.wood2, 2.8)) +
      Pa('M33 80C42 70 44 62 46 54', 'none', st(P.wood2, 1.6)) + Pa('M31 70C22 62 20 56 18 50', 'none', st(P.wood2, 1.6));
    [[32, 22, 9], [21, 32, 8], [43, 32, 8], [27, 46, 7], [40, 48, 7], [32, 36, 9], [17, 50, 6], [47, 56, 6], [30, 62, 6], [36, 14, 6]]
      .forEach((l, i) => s += E(l[0], l[1], l[2] * 1.5, l[2] * .8, i % 2 ? P.leaf : P.leaf2, `transform="rotate(${i % 2 ? -25 : 25} ${l[0]} ${l[1]})"`));
    return s + Pa('M20 98H44L40 122H24Z', P.ceram) + R(18, 94, 28, 6, P.fab, 2);
  },

  cactus: P => E(12, 29, 8, 1.6, 'rgba(70,55,40,.15)') + R(8, 4, 8, 20, P.leaf, 4) + R(3, 11, 5, 9, P.leaf, 2.5) + R(16, 8, 5, 10, P.leaf, 2.5) +
    Ln(3.5, 14, 3.5, 20, P.leaf2, 1) + R(5, 21, 14, 9, P.acc2, 2),

  bonsai: P => E(20, 41, 12, 1.8, 'rgba(70,55,40,.15)') + Pa('M20 32C15 25 25 20 18 11', 'none', st(P.wood2, 3)) +
    E(15, 11, 10, 6, P.leaf2) + E(27, 18, 9, 5, P.leaf) + E(13, 22, 8, 4.5, P.leaf) + E(22, 8, 6, 4, P.leaf) + R(8, 32, 24, 9, P.dark, 2),

  orquidea: P => E(15, 49, 9, 1.8, 'rgba(70,55,40,.15)') + Pa('M15 40C14 26 18 16 26 9', 'none', st(P.leaf2, 1.4)) +
    flor(26, 9, 4.2, '#BDB3D0', '#E9C46A') + flor(21, 16, 4.6, '#B4A9CA', '#E9C46A') + flor(16, 25, 4.8, '#C4BBD6', '#E9C46A') +
    hoja(10, 38, 6, 2.6, -30, P.leaf, P) + hoja(21, 39, 6, 2.6, 30, P.leaf2, P) + R(8, 38, 14, 11, P.paper, 2.5, st(P.fab2, 1)),

  alfombra_redonda: P => E(75, 19, 75, 18, P.fab2) + E(75, 19, 63, 14.5, P.fab) + E(75, 19, 48, 10.5, 'none', st(P.fab2, 1.2)),

  alfombra_lino: P => Pa('M18 2H158L174 40H2Z', P.fab) + Pa('M24 7H152L165 35H11Z', 'none', st(P.fab2, 1.2)) + Pa('M30 12H146L156 30H20Z', 'none', st(P.acc, 1.2)),

  alfombra_terracota: P => E(82, 20, 82, 19, P.acc2) + E(82, 20, 70, 15, 'rgba(255,255,255,.14)') + E(82, 20, 52, 10.5, 'none', st(P.paper, 1.2, ) + ' opacity=".6"'),

  alfombra_ondas: P => Pa('M18 2H158L174 40H2Z', P.paper) + Pa('M26 11q10 -5 20 0t20 0t20 0t20 0t20 0t20 0', 'none', st(P.acc, 1.5)) +
    Pa('M22 21q10 -5 20 0t20 0t20 0t20 0t20 0t20 0t20 0', 'none', st(P.acc, 1.5)) + Pa('M18 31q10 -5 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0', 'none', st(P.acc, 1.5)),

  cuadro_abs: P => R(0, 0, 46, 62, P.wood, 1.5) + R(3, 3, 40, 56, P.paper) + Pa('M10 50V32A13 13 0 0 1 36 32V50Z', P.acc2) + C(23, 27, 6, P.acc) + Ln(10, 53, 36, 53, P.dark, 1),

  cuadro_lineas: P => R(0, 0, 58, 46, P.dark, 1) + R(2.5, 2.5, 53, 41, P.paper) +
    Pa('M9 34C16 8 26 40 34 20S44 14 49 26', 'none', st(P.dark, 1.2)) + C(41, 13, 4.5, 'none', st(P.acc2, 1.3)),

  cuadro_trio: P => R(0, 10, 30, 42, P.wood, 1) + R(2.5, 12.5, 25, 37, P.paper) + C(15, 28, 7, P.acc2) +
    R(36, 0, 40, 62, P.wood, 1) + R(39, 3, 34, 56, P.paper) + Pa('M43 52C48 20 56 56 62 30S68 24 70 36', 'none', st(P.dark, 1.2)) +
    R(82, 10, 30, 42, P.wood, 1) + R(84.5, 12.5, 25, 37, P.paper) + Pa('M88 44V30A8 8 0 0 1 106 30V44Z', P.acc),

  espejo_redondo: P => C(26, 26, 25, P.metal) + C(26, 26, 22, P.glass) + Pa('M11 34A16 16 0 0 1 21 11', 'none', st('rgba(255,255,255,.8)', 2)),

  estante_flot: P => R(0, 17, 72, 4, P.wood, 1.5) + R(8, 21, 3, 3, P.wood2) + R(61, 21, 3, 3, P.wood2) +
    R(10, 8, 6, 9, P.acc) + R(17, 5, 5, 12, P.fab2) + R(23, 9, 5, 8, P.acc2) +
    Pa('M50 17Q45 6 51 6Q57 6 53 17Z', P.ceram, st(P.fab2, 1)) + Ln(52, 6, 55, 0, P.leaf2, 1.2),

  reloj: P => C(17, 17, 16, P.paper, st(P.dark, 1.5)) + Ln(17, 17, 17, 8, P.dark, 1.4) + Ln(17, 17, 24, 20, P.dark, 1.4) + C(17, 17, 1.4, P.acc2),

  luces: P => {
    let s = Pa('M2 4Q62 36 122 4', 'none', st(P.dark, 1));
    for (let i = 0; i <= 8; i++) { const u = i / 8, x = 2 + 120 * u, y = 4 + 64 * u * (1 - u) * .5 * 1; s += C(x.toFixed(1), (y + 4).toFixed(1), 5.5, 'rgba(250,220,150,.25)') + C(x.toFixed(1), (y + 3).toFixed(1), 2.4, '#F4DC9A'); }
    return s;
  },

  cortinas: P => R(0, 0, 64, 3, P.metal, 1.5) + Pa('M3 3H30L28 132H5Z', P.fab, 'opacity=".92"') + Pa('M34 3H61L59 132H36Z', P.fab, 'opacity=".92"') +
    [10, 16, 22].map(x => Ln(x, 6, x - 1.5, 130, 'rgba(120,100,80,.12)', 1)).join('') + [41, 47, 53].map(x => Ln(x, 6, x - 1.5, 130, 'rgba(120,100,80,.12)', 1)).join(''),

  tapiz: P => {
    let s = R(0, 0, 60, 3, P.wood2, 1.5) + R(6, 3, 48, 62, P.fab) + Pa('M6 3H54L30 38Z', P.fab2) + Pa('M6 65L30 38L54 65Z', P.acc2, 'opacity=".7"') + Pa('M18 3H42L30 22Z', P.acc, 'opacity=".8"');
    for (let x = 8; x <= 52; x += 4) s += Ln(x, 65, x, 86 + (x % 8), P.fab, 1.2);
    return s;
  },

  espejo_arco: P => Pa('M3 82V24A20 20 0 0 1 43 24V82Z', P.glass, st(P.metal, 2.6)) + Ln(12, 70, 30, 24, 'rgba(255,255,255,.7)', 3) + Ln(20, 76, 34, 44, 'rgba(255,255,255,.4)', 2),

  espejo_pie: P => Pa('M3 130V28A23 23 0 0 1 49 28V130Z', P.glass, st(P.metal, 2.6)) + Ln(14, 112, 34, 30, 'rgba(255,255,255,.7)', 3) + Ln(22, 122, 40, 62, 'rgba(255,255,255,.4)', 2) +
    R(4, 129, 8, 4, P.metal, 1) + R(40, 129, 8, 4, P.metal, 1),

  jarron: P => Pa('M8 42Q2 33 8 25L9 19H15L16 25Q22 33 16 42Z', P.ceram, st(P.fab2, 1)) + Ln(12, 19, 7, 5, P.wood2, 1.2) + Ln(12, 19, 12, 2, P.wood2, 1.2) + Ln(12, 19, 18, 6, P.wood2, 1.2) +
    E(7, 6, 2.4, 5.5, P.fab2, 'transform="rotate(-12 7 6)"') + E(12, 3, 2.4, 5.5, P.fab, '') + E(18, 7, 2.4, 5.5, P.fab2, 'transform="rotate(14 18 7)"'),

  libros: P => R(0, 12, 36, 6, P.acc, 1.5) + R(3, 6, 30, 6, P.fab2, 1.5) + R(6, 0, 24, 6, P.acc2, 1.5) + Ln(3, 15, 33, 15, 'rgba(255,255,255,.4)', 1),

  vela: P => R(1, 12, 7, 13, P.paper, 1.5, st(P.fab2, 1)) + R(10, 8, 7, 17, P.fab2, 1.5) + Pa('M4.5 5Q2 9 4.5 11Q7 9 4.5 5Z', '#EDB86E') + Pa('M13.5 1Q11 5 13.5 7Q16 5 13.5 1Z', '#EDB86E'),

  lampara_mesa: P => E(16, 44, 9, 1.8, 'rgba(70,55,40,.15)') + Pa('M11 43Q8 34 16 28Q24 34 21 43Z', P.ceram, st(P.fab2, 1)) + Ln(16, 28, 16, 20, P.metal, 2) +
    Pa('M5 20L10 3H22L27 20Z', P.paper, st(P.fab2, 1)),

  bandeja: P => Pa('M2 12H36L33 17H5Z', P.wood) + R(7, 4, 10, 8, P.paper, 2.5, st(P.fab2, 1)) + Pa('M17 6.5Q21 6.5 20 10', 'none', st(P.fab2, 1)) + Pa('M24 12Q22 5 27 4Q31 6 29 12Z', P.leaf) ,

  flores: P => Pa('M8 42Q4 34 9 28H17Q22 34 18 42Z', P.ceram, st(P.fab2, 1)) + Ln(11, 28, 8, 12, P.leaf2, 1.2) + Ln(13, 28, 14, 8, P.leaf2, 1.2) + Ln(15, 28, 19, 14, P.leaf2, 1.2) +
    flor(8, 10, 4.2, P.acc2, '#F3E3B5') + flor(14, 6, 4.4, P.paper, '#E9C46A') + flor(19, 12, 4, '#C7BCD8', '#F3E3B5'),

  escultura: P => E(16, 49, 12, 1.8, 'rgba(70,55,40,.15)') + R(2, 40, 28, 9, P.acc2, 3) + Pa('M7 40V27A9 9 0 0 1 25 27V40Z', P.paper, st(P.fab2, 1)) + C(16, 14, 8, P.acc),

  gato: P => E(22, 24, 19, 2, 'rgba(70,55,40,.15)') + Pa('M38 18Q46 10 40 4', 'none', st('#C4B9A8', 3)) +
    E(21, 16, 18, 9, '#CFC6B6') + E(15, 15, 6, 4, '#BBAF9D') + C(36, 14, 7, '#CFC6B6') +
    Pa('M31 9L32 3L36 8Z', '#CFC6B6') + Pa('M38 8L41 3L42 10Z', '#CFC6B6') + Ln(33, 14, 36, 14.6, P.dark, 1) + Ln(38, 14.6, 41, 14, P.dark, 1) + C(37, 17, 1, '#D9A6A0')
};

/* Rango de dibujo: la pared queda atrás, después alfombras, muebles y objetos chicos */
const RANGO = { pared: 1, alfombra: 2, piso: 3, chico: 4 };

function itemSVG(id, P, extra = '') {
  const it = ITEM[id];
  return `<svg class="prev-svg" viewBox="-6 -6 ${it.w + 12} ${it.h + 12}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" ${extra}>${DIBUJO[id](P)}</svg>`;
}

/* ---------------- Íconos de línea ---------------- */
const ICO = {
  gota: 'M12 3.5C9 8 6.5 10.8 6.5 14a5.5 5.5 0 0 0 11 0C17.5 10.8 15 8 12 3.5Z',
  sol: 'M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2ZM12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.5 1.5M16.9 16.9l1.5 1.5M5.6 18.4l1.5-1.5M16.9 7.1l1.5-1.5',
  plato: 'M12 4.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15ZM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z',
  taza: 'M5 8h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V8ZM16 9.5h1.5a2.2 2.2 0 0 1 0 4.4H16M9 3.5v2M12 3.5v2',
  luna: 'M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z',
  paso: 'M3 12h4l2.5-6 4 12 2.5-6H21',
  frasco: 'M9 4h6v2.5l1.5 2V19a1.5 1.5 0 0 1-1.5 1.5H9A1.5 1.5 0 0 1 7.5 19V8.5L9 6.5V4ZM7.5 12h9',
  hoja: 'M5 19C5 10 10 5 19 5c0 9-5 14-14 14ZM5 19l8-8',
  libro: 'M5 5.5A1.5 1.5 0 0 1 6.5 4H19v14H6.5A1.5 1.5 0 0 0 5 19.5v-14ZM5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3',
  corazon: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z',
  respirar: 'M4 9c3 0 3-3 6-3s3 3 6 3 3-3 4-3M4 15c3 0 3-3 6-3s3 3 6 3 3-3 4-3',
  n_inicio: 'M4 12 12 4l8 8M6.5 10v9.5h11V10',
  n_casa: 'M5 11V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2M3.5 13a1.5 1.5 0 0 1 3 0v1.5h11V13a1.5 1.5 0 0 1 3 0v4.5h-17V13ZM6 17.5V19M18 17.5V19',
  n_habitos: 'M9.5 6.5H20M9.5 12H20M9.5 17.5H20M4 6.5l1 1 2-2M4 12l1 1 2-2M4 17.5l1 1 2-2',
  n_tienda: 'M6 8h12l1 12H5L6 8ZM9 8V7a3 3 0 0 1 6 0v1',
  n_progreso: 'M3.5 20h4v-4h4v-4h4V8h5',
  perfil: 'M12 12a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2ZM5 20c.6-3.6 3.5-5.5 7-5.5s6.4 1.9 7 5.5',
  candado: 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z',
  check: 'M5 12.5 10 17.5 19 7',
  fuego: 'M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2.3-4.5C9.5 10 11 8 12 3ZM12 20a2.3 2.3 0 0 1-2.3-2.4c0-1.6 1.5-2.2 2.3-3.6.8 1.4 2.3 2 2.3 3.6A2.3 2.3 0 0 1 12 20Z',
  copa: 'M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5v1.5A3 3 0 0 0 8 10.5M16 6h3v1.5a3 3 0 0 1-3 3M12 13v4M9 20h6M10 17h4',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  izq: 'M15 5 8 12l7 7',
  der: 'M9 5l7 7-7 7',
  editar: 'M4 20h4L19 9l-4-4L4 16v4Z',
  mas: 'M12 5v14M5 12h14',
  cerrar: 'M6 6l12 12M18 6 6 18',
  voltear: 'M12 4v16M8 7 4 12l4 5V7ZM16 7l4 5-4 5V7Z',
  guardar: 'M4 8h16v11H4zM9 8V6h6v2M10 13h4',
  cambiar: 'M5 8h12l-3-3M19 16H7l3 3',
  regalo: 'M4 11h16v9H4zM3 7.5h18V11H3zM12 7.5V20M12 7.5C10 7.5 8 7 8 5.5S10.5 4 12 7.5ZM12 7.5c2 0 4-.5 4-2S13.5 4 12 7.5Z',
  arriba: 'M12 19V6M6 11l6-6 6 6',
  abajo: 'M12 5v13M6 13l6 6 6-6',
  basura: 'M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13',
  n_camino: 'M3 19l6.2-10.5 3.6 6 2.4-3.6L21 19ZM9.2 8.5 11 11M16 4v5M16 4l3 1.2-3 1.2',
  zoom_mas: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM16.2 16.2 21 21M8 11h6M11 8v6',
  zoom_menos: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM16.2 16.2 21 21M8 11h6',
  r_dormitorio: 'M4 19V7M4 15h16v4M20 19v-5a3 3 0 0 0-3-3h-6v4M7.5 13.2a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z',
  r_cocina: 'M5 10h14v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7ZM3 10h18M9 7c0-1.5 1-2 1-3.5M14 7c0-1.5 1-2 1-3.5',
  r_bano: 'M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3ZM6 12V6.5A2.5 2.5 0 0 1 8.5 4M7 19l-1 2M17 19l1 2',
  r_estudio: 'M4 9h16M5.5 9v10M18.5 9v10M9 9V5.5h6V9M8 14h8',
  r_jardin: 'M12 21v-6M12 15a5 5 0 1 0-1.4-9.8A4 4 0 0 0 6.8 11 4 4 0 0 0 12 15Z',
  star: 'M12 4l2.4 5 5.4.7-4 3.8 1 5.4-4.8-2.7-4.8 2.7 1-5.4-4-3.8 5.4-.7L12 4Z'
};
const ico = (k, s = 22, extra = '') => `<svg class="ico" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ${extra}><path d="${ICO[k] || ICO.hoja}"/></svg>`;
const hojaMoneda = (s = 16) => `<svg class="ico moneda" width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M4.5 19.5C4.5 10 10 4.5 20 4.5c0 10-5.5 15-15.5 15Z" fill="#8DA38A"/><path d="M5 19l8.5-8.5" stroke="#FAF6EF" stroke-width="1.4" stroke-linecap="round"/></svg>`;

/* ---------------- Sobres (entradas del día) ---------------- */
function glifoSobre(k, c) {
  if (k === 'm') return `<path d="M-6 3a6 6 0 0 1 12 0M0 -8v3M-9 -4l2 2M9 -4l-2 2M-9 3h18" fill="none" stroke="${c}" stroke-width="1.4" stroke-linecap="round"/>`;
  if (k === 't') return `<circle r="3.6" fill="none" stroke="${c}" stroke-width="1.4"/><path d="M0 -8v2M0 6v2M-8 0h2M6 0h2M-5.6 -5.6l1.4 1.4M4.2 4.2l1.4 1.4M-5.6 5.6l1.4 -1.4M4.2 -4.2l1.4 -1.4" stroke="${c}" stroke-width="1.3" stroke-linecap="round"/>`;
  return `<path d="M3 -7A7 7 0 1 0 7 4 6 6 0 0 1 3 -7Z" fill="none" stroke="${c}" stroke-width="1.4" stroke-linejoin="round"/>`;
}
function sobreSVG(k, estado) {
  const pal = { listo: ['#FDF1E7', '#EFCDB8', '#C47A5A', '#B8603F'], ok: ['#F1F5EA', '#D5E2CA', '#7F9A78', '#6F8A6D'], bloq: ['#FAF5EC', '#EEE6D6', '#C9BFAC', '#BDB29C'] }[estado];
  const g = 'sg' + k + estado, glifo = estado === 'bloq' ? '#F4EEE2' : '#FFF6EA';
  return `<svg class="sobre-svg" viewBox="0 0 84 62" aria-hidden="true">
    <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal[0]}"/><stop offset="1" stop-color="${pal[1]}"/></linearGradient>
    <radialGradient id="${g}w" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="42" cy="58" rx="34" ry="3" fill="rgba(80,60,40,.14)"/>
    <rect x="3" y="8" width="78" height="49" rx="7" fill="url(#${g})" stroke="${pal[2]}" stroke-width="1"/>
    <path d="M4 56L32 33M80 56L52 33" stroke="${pal[2]}" stroke-width="1" opacity=".45" fill="none"/>
    <path d="M4.5 10.5L42 40L79.5 10.5" fill="rgba(255,255,255,.38)" stroke="${pal[2]}" stroke-width="1" stroke-linejoin="round"/>
    <circle cx="42" cy="38" r="12" fill="${pal[3]}"/><circle cx="42" cy="38" r="12" fill="url(#${g}w)"/><circle cx="42" cy="38" r="9.2" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1"/>
    <g transform="translate(42 38) scale(.74)">${estado === 'ok' ? `<path d="M-6 .5l4.5 4.5 8.5-9" fill="none" stroke="${glifo}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` : glifoSobre(k, glifo)}</g>
  </svg>`;
}
function sobreGrande(abierto) {
  return `<svg class="sobre-grande ${abierto ? 'abierto' : ''}" viewBox="0 -30 120 110" aria-hidden="true">
    <g class="carta"><rect x="22" y="14" width="76" height="52" rx="5" fill="#FFFDF9" stroke="#E4DACA"/><path d="M34 30h52M34 40h36" stroke="#E4DACA" stroke-width="2" stroke-linecap="round"/></g>
    <rect x="8" y="26" width="104" height="52" rx="8" fill="#F6E7DD" stroke="#C47A5A" stroke-width="1.3"/>
    <path d="M9 74l36-26M111 74L75 48" stroke="#C47A5A" stroke-width="1" fill="none" opacity=".5"/>
    <g class="solapa"><path d="M8 28l52 36 52-36Z" fill="#F1D8C8" stroke="#C47A5A" stroke-width="1.3" stroke-linejoin="round"/></g>
    <circle class="sello" cx="60" cy="52" r="7" fill="#C47A5A" opacity=".85"/>
  </svg>`;
}

/* ---------------- Escalera de 7 escalones ---------------- */
function posEsc(i) {
  if (i <= 0) return { x: 10, y: 170 };
  const x = 14 + (i - 1) * 44 + 21, h = 18 + i * 20;
  return { x, y: 186 - h - 14 };
}
function escaleraSVG(step, o = {}) {
  const desde = o.desde != null ? o.desde : step;
  let s = `<svg class="escalera" viewBox="0 -18 330 224" aria-hidden="true">`;
  s += `<line x1="0" y1="186.5" x2="330" y2="186.5" stroke="#DDD2BF" stroke-width="1"/>`;
  for (let i = 1; i <= ESCALONES; i++) {
    const h = 18 + i * 20, x = 14 + (i - 1) * 44, y = 186 - h;
    const cls = i <= desde ? (i === desde ? 'hecho actual' : 'hecho') : 'falta';
    s += `<g class="esc-p ${cls}" data-i="${i}"><rect x="${x}" y="${y}" width="42" height="${h}" rx="4"/><text x="${x + 21}" y="${y + 21}" text-anchor="middle">${i}</text></g>`;
  }
  const f = posEsc(ESCALONES);
  s += `<g class="bandera"><line x1="${f.x + 17}" y1="${f.y + 6}" x2="${f.x + 17}" y2="${f.y - 18}" stroke="#B9AFA0" stroke-width="1.2"/><path d="M${f.x + 17} ${f.y - 18}l13 4.5-13 4.5Z" fill="#C47A5A"/></g>`;
  const a = posEsc(desde);
  const etiqueta = o.etiqueta === false ? '' : `<text class="marca-txt" y="-17" text-anchor="${desde <= 0 ? 'start' : 'middle'}" x="${desde <= 0 ? -8 : 0}">${desde <= 0 ? 'comienzo' : 'estás acá'}</text>`;
  s += `<g class="marca" id="marca-esc" style="transform:translate(${a.x}px,${a.y}px)"><circle r="9" fill="rgba(196,122,90,.18)"/><circle r="5.2" fill="#C47A5A"/><circle r="1.8" fill="#FDFAF4"/>${etiqueta}</g>`;
  return s + `</svg>`;
}

/* ---------------- Fondos de cada ambiente ---------------- */
const ventana = (x, y, w, h, P, u) =>
  R(x - 5, y - 5, w + 10, h + 10, P.trim, 3) + R(x, y, w, h, `url(#cielo${u})`) +
  E(x + w * .3, y + h - 11, w * .26, 11, P.leaf, 'opacity=".28"') + E(x + w * .72, y + h - 9, w * .34, 9, P.leaf, 'opacity=".2"') +
  Ln(x + w / 2, y, x + w / 2, y + h, P.trim, 3) + Ln(x, y + h * .5, x + w, y + h * .5, P.trim, 3) +
  R(x - 10, y + h + 5, w + 20, 5, P.trim, 2.5) + R(x - 10, y + h + 10, w + 20, 2, 'rgba(60,45,30,.08)') +
  R(x - 22, y - 22, w + 44, h + 44, 'rgba(255,248,222,.2)', 18) + Pa(`M${x} ${SUELO} L${x + w} ${SUELO} L${x + w + 60} ${ALTO} L${x - 40} ${ALTO}Z`, `url(#haz${u})`);

function pisoMadera(col, col2) {
  let s = R(0, SUELO, ANCHO, ALTO - SUELO, col);
  [SUELO + 22, SUELO + 48, SUELO + 78].forEach(y => s += Ln(0, y, ANCHO, y, col2, 1, 'opacity=".55"'));
  [[SUELO, SUELO + 22, [50, 170, 290]], [SUELO + 22, SUELO + 48, [20, 110, 230, 330]], [SUELO + 48, SUELO + 78, [70, 190, 300]], [SUELO + 78, ALTO, [30, 140, 250]]]
    .forEach(([a, b, xs]) => xs.forEach(x => s += Ln(x, a, x, b, col2, 1, 'opacity=".4"')));
  return s;
}
function pisoBaldosas(col, col2) {
  let s = R(0, SUELO, ANCHO, ALTO - SUELO, col);
  [SUELO + 24, SUELO + 54, SUELO + 90].forEach(y => s += Ln(0, y, ANCHO, y, col2, 1, 'opacity=".6"'));
  for (let x = -20; x <= 380; x += 60) s += Ln(x + (x - 180) * .02, SUELO, x + (x - 180) * .14, ALTO, col2, 1, 'opacity=".5"');
  return s;
}
const zocalo = P => R(0, SUELO - 9, ANCHO, 10, P.trim) + Ln(0, SUELO + 1, ANCHO, SUELO + 1, 'rgba(60,45,30,.12)', 1);
const paneles = (P, xs) => xs.map(x => R(x, 52, 96, 124, 'none', 2, `stroke="${P.wall2}" stroke-width="1.2" opacity=".7"`)).join('');

function fondoSala(sala, P, u) {
  const defs = `<defs><linearGradient id="cielo${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky1}"/><stop offset="1" stop-color="${P.sky2}"/></linearGradient><linearGradient id="vel${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="haz${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6DA" stop-opacity=".5"/><stop offset="1" stop-color="#FFF6DA" stop-opacity=".06"/></linearGradient>
    <linearGradient id="suelo${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#3A2A18" stop-opacity=".14"/></linearGradient>
    <linearGradient id="techo${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2A18" stop-opacity=".12"/><stop offset="1" stop-color="#3A2A18" stop-opacity="0"/></linearGradient>
    <radialGradient id="vig${u}" cx=".5" cy=".5" r=".72"><stop offset=".62" stop-color="#3A2A18" stop-opacity="0"/><stop offset="1" stop-color="#3A2A18" stop-opacity=".08"/></radialGradient>
    <filter id="vol${u}" x="-10%" y="-10%" width="120%" height="125%" color-interpolation-filters="sRGB">
      <feOffset in="SourceAlpha" dy="-3" result="a1"/><feComposite in="SourceAlpha" in2="a1" operator="out" result="b1"/>
      <feFlood flood-color="#3A2A18" flood-opacity=".2"/><feComposite in2="b1" operator="in" result="sombra"/>
      <feOffset in="SourceAlpha" dy="2" result="a2"/><feComposite in="SourceAlpha" in2="a2" operator="out" result="b2"/>
      <feFlood flood-color="#FFFFFF" flood-opacity=".34"/><feComposite in2="b2" operator="in" result="luz"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sombra"/><feMergeNode in="luz"/></feMerge>
    </filter></defs>`;
  const pared = R(0, 0, ANCHO, SUELO, P.wall) + R(0, 0, ANCHO, SUELO, `url(#vel${u})`);
  let s = defs;
  switch (sala) {
    case 'dormitorio':
      s += pared + ventana(240, 44, 82, 104, P, u) + pisoMadera(P.floor, P.floor2) + zocalo(P); break;
    case 'living':
      s += pared + paneles(P, [8, 262]) + ventana(106, 34, 148, 112, P, u) + pisoMadera(P.floor, P.floor2) + zocalo(P); break;
    case 'cocina': {
      let azulejos = R(0, 84, ANCHO, 62, P.trim);
      for (let x = 0; x < ANCHO; x += 24) azulejos += Ln(x, 84, x, 146, P.wall2, 1, 'opacity=".7"');
      for (let y = 84; y <= 146; y += 20) azulejos += Ln(0, y, ANCHO, y, P.wall2, 1, 'opacity=".7"');
      s += pared + ventana(200, 22, 96, 54, P, u) + azulejos +
        R(14, 12, 112, 62, P.fab2, 3) + Ln(70, 12, 70, 74, P.fab, 1.5) + C(64, 56, 1.8, P.metal) + C(76, 56, 1.8, P.metal) +
        R(0, 146, ANCHO, 6, P.paper) + R(0, 152, ANCHO, 56, P.fab2) + Ln(90, 152, 90, 208, P.fab, 1.5) + Ln(180, 152, 180, 208, P.fab, 1.5) + Ln(270, 152, 270, 208, P.fab, 1.5) +
        C(84, 168, 1.8, P.metal) + C(96, 168, 1.8, P.metal) + C(174, 168, 1.8, P.metal) + C(186, 168, 1.8, P.metal) + C(264, 168, 1.8, P.metal) + C(276, 168, 1.8, P.metal) +
        pisoBaldosas(P.floor, P.floor2) + zocalo(P); break;
    }
    case 'bano': {
      let azulejos = R(0, 96, ANCHO, 112, P.trim);
      for (let x = 0; x < ANCHO; x += 30) azulejos += Ln(x, 96, x, 208, P.wall2, 1, 'opacity=".8"');
      for (let y = 96; y <= 208; y += 28) azulejos += Ln(0, y, ANCHO, y, P.wall2, 1, 'opacity=".8"');
      s += pared + R(240, 28, 64, 48, P.trim, 3) + R(244, 32, 56, 40, P.glass, 2) + Ln(272, 32, 272, 72, P.trim, 2) + azulejos +
        R(0, 92, ANCHO, 5, P.fab2) + pisoBaldosas(P.floor, P.floor2) + zocalo(P); break;
    }
    case 'estudio': {
      let tablas = R(0, 128, ANCHO, 80, P.wood, 0, 'opacity=".32"');
      for (let x = 0; x < ANCHO; x += 18) tablas += Ln(x, 128, x, 208, P.wood2, 1, 'opacity=".25"');
      s += pared + ventana(40, 34, 104, 82, P, u) + tablas + R(0, 124, ANCHO, 5, P.wood2, 0, 'opacity=".5"') + pisoMadera(P.floor, P.floor2) + zocalo(P); break;
    }
    case 'terraza': {
      let tablas = '';
      for (let x = 0; x < ANCHO; x += 20) tablas += R(x, 0, 2, SUELO, P.wall2, 0, 'opacity=".55"');
      let hiedra = Pa('M24 0C28 40 18 80 30 120', 'none', st(P.leaf2, 1.2));
      [[24, 14], [28, 34], [22, 54], [24, 74], [30, 96], [28, 116]].forEach((p, i) => hiedra += hoja(p[0] + (i % 2 ? 6 : -6), p[1], 8, 4.5, i % 2 ? 30 : -30, i % 2 ? P.leaf : P.leaf2, P));
      s += pared + tablas + R(0, 0, ANCHO, 12, P.wood) + R(0, 12, ANCHO, 4, 'rgba(60,45,30,.1)') + hiedra +
        R(176, 34, 110, 173, P.trim, 3) + R(182, 40, 98, 161, `url(#cielo${u})`) + Ln(231, 40, 231, 201, P.trim, 3) +
        E(206, 196, 26, 9, P.leaf, 'opacity=".25"') + Pa(`M176 ${SUELO} L286 ${SUELO} L330 ${ALTO} L150 ${ALTO}Z`, LUZ) +
        pisoMadera(P.wood, P.wood2).replace('opacity=".55"', 'opacity=".5"') + zocalo(P); break;
    }
    case 'jardin': {
      let cerco = '';
      for (let x = 0; x < ANCHO; x += 24) cerco += Pa(`M${x} 40l10 -9l10 9V${SUELO}H${x}Z`, (x / 24) % 2 ? P.wood : P.wood2, 'opacity=".38"');
      let seto = '';
      for (let x = 0; x < ANCHO + 20; x += 30) seto += E(x, SUELO - 8, 26, 16, P.leaf, 'opacity=".4"') + E(x + 14, SUELO - 16, 20, 12, P.leaf2, 'opacity=".3"');
      let piedras = E(120, SUELO + 28, 28, 7, P.fab2) + E(190, SUELO + 54, 32, 8, P.fab2) + E(252, SUELO + 84, 36, 9, P.fab2);
      s += R(0, 0, ANCHO, SUELO, `url(#cielo${u})`) + cerco + R(0, 28, ANCHO, 4, P.wood2, 0, 'opacity=".4"') + seto +
        R(0, SUELO, ANCHO, ALTO - SUELO, P.leaf, 0, 'opacity=".34"') + R(0, SUELO, ANCHO, 6, 'rgba(60,45,30,.08)') + piedras; break;
    }
  }
  return s + R(0, SUELO, ANCHO, ALTO - SUELO, `url(#suelo${u})`) + R(0, 0, ANCHO, 64, `url(#techo${u})`) + R(0, 0, ANCHO, ALTO, `url(#vig${u})`);
}

/* ---------------- Personaje (figura estilizada, sin cara) ---------------- */
function personajeSVG(P, caminando) {
  const cuerpo = `<g class="pers-cuerpo">${pjSVG(.72)}</g>`;
  return caminando
    ? `<g class="pasea"><g class="giro">${cuerpo}</g></g>`
    : `<g transform="translate(324 306) scale(-1 1)">${cuerpo}</g>`;
}

/* ---------------- Rincón saludable: crece con los hábitos del día ---------------- */
function rincon(P, ef) {
  if (!(ef.agua || ef.comida || ef.prep)) return '';
  let s = `<g class="rincon" transform="translate(10 308)">`;
  s += Ln(7, -24, 5, 0, P.wood2, 2.4) + Ln(31, -24, 33, 0, P.wood2, 2.4) + R(2, -28, 34, 5, P.wood, 2.5) + E(19, 1, 16, 2, 'rgba(70,55,40,.14)');
  if (ef.agua) s += R(7, -48, 9, 20, 'rgba(210,228,232,.75)', 3, st('#9FBFC8', 1)) + R(8.2, -40, 6.6, 11, 'rgba(158,195,209,.55)', 2) + R(18, -38, 7, 10, 'rgba(210,228,232,.75)', 2, st('#9FBFC8', 1));
  if (ef.comida) {
    s += Pa('M21 -29a8 5 0 0 0 16 0Z', P.paper, st(P.fab2, 1));
    const fr = [['#C98B63', 25, -33], ['#9CAF94', 31, -34], ['#D8A06E', 28, -37], ['#B5654A', 34, -32]];
    for (let i = 0; i < Math.min(ef.comida, 4); i++) s += C(fr[i][1], fr[i][2], 3.3, fr[i][0]);
  }
  if (ef.prep) s += R(-1, -41, 7, 12, 'rgba(240,235,222,.9)', 2, st(P.fab2, 1)) + R(0, -43, 5, 3, P.metal, 1) + R(0.8, -37, 3.4, 6, P.leaf, 1);
  return s + `</g>`;
}

/* ---------------- Escena completa de un ambiente ---------------- */
function ordenar(objs) {
  return [...objs].sort((a, b) => (RANGO[ITEM[a.id].capa] - RANGO[ITEM[b.id].capa]) || (a.y - b.y));
}
function escena(o) {
  const P = o.P, u = o.u || 'x', ef = o.ef || {};
  const a = o.anid ? ` x="${o.anid.x}" y="${o.anid.y}" width="${o.anid.w}" height="${o.anid.h}"` : '';
  let s = `<svg ${o.edit ? 'id="escena"' : ''} class="escena${o.edit ? ' edit' : ''}${ef.agua ? ' ef-agua' : ''}" viewBox="0 0 ${ANCHO} ${ALTO}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"${a}>`;
  s += fondoSala(o.sala, P, u) + rincon(P, ef);
  let gotas = '';
  for (const ob of ordenar(o.objs || [])) {
    const it = ITEM[ob.id];
    const flip = ob.f ? `transform="translate(${it.w} 0) scale(-1 1)"` : '';
    s += `<g class="obj${o.sel === ob.u ? ' sel' : ''}" data-u="${ob.u}" transform="translate(${(ob.x - it.w / 2).toFixed(1)} ${(ob.y - it.h).toFixed(1)})">` +
      `<g ${flip}><g filter="url(#vol${u})">${DIBUJO[ob.id](P)}</g></g>` +
      `<rect class="selbox" x="-5" y="-5" width="${it.w + 10}" height="${it.h + 10}" rx="7" fill="none"/>` +
      `<rect class="hit" x="-3" y="-3" width="${it.w + 6}" height="${it.h + 6}" fill="transparent"/></g>`;
    if (ef.agua && it.gr === 'planta') {
      const cx = ob.x, ty = ob.y - it.h;
      for (let i = 0; i < 3; i++) gotas += `<g transform="translate(${(cx + (i - 1) * 8).toFixed(1)} ${(ty - 14).toFixed(1)})"><path class="gota" style="animation-delay:${i * .55}s" d="M0 0q-2.4 3.6 0 5.2q2.4 -1.6 0 -5.2Z"/></g>`;
    }
  }
  s += gotas;
  if (o.personaje) s += personajeSVG(P, !!ef.mov);
  return s + `</svg>`;
}
