'use strict';
/* =====================================================================
   CAMINO: ilustraciones del mapa de montaña (vista general) y de la
   escalera de 7 escalones de cada nivel (vista de nivel).
   Todo es vectorial (SVG) con degradados, luces y sombras.
   ===================================================================== */

/* ---- puntos del camino sobre el mapa (viewBox 360 x 560), de abajo hacia arriba ----
   lado = hacia dónde se muestra la etiqueta de cada nivel */
const MAPA_W = 360, MAPA_H = 560;
const MAPA_PTS = [
  { x: 138, y: 478, lado: 'i' }, { x: 226, y: 420, lado: 'd' }, { x: 136, y: 364, lado: 'i' },
  { x: 224, y: 312, lado: 'd' }, { x: 142, y: 262, lado: 'i' }, { x: 222, y: 214, lado: 'd' },
  { x: 190, y: 168, lado: 'd' }
];
const CUMBRE = { x: 206, y: 104 };

/* ---- ayudas de dibujo ---- */
function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
const f1 = n => (+n).toFixed(1);
function pasto(x0, y0, x1, y1, n, seed, col, op = .55) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + (x1 - x0) * r(), y = y0 + (y1 - y0) * r(), h = 3 + r() * 5, dx = r() * 4 - 2;
    s += `<path d="M${f1(x)} ${f1(y)}q${f1(dx / 2)} ${f1(-h / 2)} ${f1(dx)} ${f1(-h)}" stroke="${col}" stroke-width=".95" fill="none" stroke-linecap="round" opacity="${op}"/>`;
  }
  return s;
}
const nube = (x, y, s, o = .9) => `<g opacity="${o}"><ellipse cx="${x}" cy="${y + 4 * s}" rx="${36 * s}" ry="${8 * s}" fill="#F2E8DC"/><ellipse cx="${x}" cy="${y}" rx="${34 * s}" ry="${9 * s}" fill="#FFF"/><ellipse cx="${x - 16 * s}" cy="${y - 5 * s}" rx="${18 * s}" ry="${10 * s}" fill="#FFF"/><ellipse cx="${x + 12 * s}" cy="${y - 8 * s}" rx="${21 * s}" ry="${11 * s}" fill="#FFF"/><ellipse cx="${x + 10 * s}" cy="${y - 10 * s}" rx="${12 * s}" ry="${5 * s}" fill="#FFFDF8"/></g>`;
const ave = (x, y, s = 1) => `<path d="M${x} ${y}q${3 * s} ${-4 * s} ${6 * s} 0q${3 * s} ${-4 * s} ${6 * s} 0" stroke="#7D7A82" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
const flor2 = (x, y, c) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - 9}" stroke="#5F8248" stroke-width="1"/>` + [0, 3, 6].map(d => `<circle cx="${x + (d % 2 ? 1 : -1)}" cy="${y - 9 - d * .8}" r="1.8" fill="${c}"/>`).join('');
function lavanda(x, y, s = 1, c = '#9F8FC4') {
  let r = '';
  [[-5, 0, -.18], [0, 0, 0], [5, 1, .2], [-2.5, 1.5, -.08], [2.5, 1.5, .1]].forEach(([dx, dy, k], i) => {
    const h = (15 + (i % 3) * 3) * s, x0 = x + dx * s, y0 = y + dy * s;
    r += `<path d="M${f1(x0)} ${f1(y0)}q${f1(k * 12)} ${f1(-h / 2)} ${f1(k * 20)} ${f1(-h)}" stroke="#5F8248" stroke-width="${1 * s}" fill="none" stroke-linecap="round"/>`;
    for (let j = 0; j < 5; j++) r += `<ellipse cx="${f1(x0 + k * 20 * (j / 5 + .3) + (j % 2 ? .8 : -.8))}" cy="${f1(y0 - h * (.5 + j * .1))}" rx="${1.5 * s}" ry="${2.5 * s}" fill="${j % 2 ? c : '#B6A8D6'}"/>`;
  });
  return r;
}
const margarita = (x, y, s = 1) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - 7 * s}" stroke="#5F8248" stroke-width=".9"/>` + [0, 72, 144, 216, 288].map(a => `<ellipse cx="${f1(x + Math.cos(a * Math.PI / 180) * 2.2 * s)}" cy="${f1(y - 7 * s + Math.sin(a * Math.PI / 180) * 2.2 * s)}" rx="${1.5 * s}" ry="${1 * s}" fill="#FFF" transform="rotate(${a} ${f1(x + Math.cos(a * Math.PI / 180) * 2.2 * s)} ${f1(y - 7 * s + Math.sin(a * Math.PI / 180) * 2.2 * s)})"/>`).join('') + `<circle cx="${x}" cy="${y - 7 * s}" r="${1.2 * s}" fill="#E9B949"/>`;

/* pino con luz de un lado, sombra en el suelo y 4 niveles */
function pino(x, y, h, c1 = '#4F6E4A', c2 = '#5E7E52') {
  const tier = (top, bot, hw, c) =>
    `<path d="M${f1(x)} ${f1(top)}L${f1(x - hw)} ${f1(bot)}Q${f1(x)} ${f1(bot + h * .04)} ${f1(x + hw)} ${f1(bot)}Z" fill="${c}"/>` +
    `<path d="M${f1(x)} ${f1(top)}L${f1(x + hw)} ${f1(bot)}Q${f1(x + hw * .4)} ${f1(bot + h * .03)} ${f1(x)} ${f1(bot)}Z" fill="rgba(10,30,20,.2)"/>` +
    `<path d="M${f1(x)} ${f1(top)}L${f1(x - hw * .9)} ${f1(bot - h * .03)}L${f1(x - hw * .55)} ${f1(bot - h * .04)}Z" fill="rgba(255,255,230,.1)"/>`;
  return `<ellipse cx="${f1(x + h * .1)}" cy="${f1(y)}" rx="${f1(h * .3)}" ry="${f1(h * .045)}" fill="rgba(30,50,25,.25)"/>` +
    `<rect x="${f1(x - h * .035)}" y="${f1(y - h * .14)}" width="${f1(h * .07)}" height="${f1(h * .15)}" fill="#5B4636"/>` +
    tier(y - h * .5, y - h * .1, h * .4, c1) + tier(y - h * .72, y - h * .3, h * .33, c2) + tier(y - h * .9, y - h * .52, h * .25, c1) + tier(y - h, y - h * .72, h * .17, c2);
}
/* árbol de copa redonda (algunos con tono de otoño para dar color) */
function arbol(x, y, h, c = '#7FA05F', c2 = '#5E8148') {
  return `<ellipse cx="${f1(x + h * .12)}" cy="${f1(y)}" rx="${f1(h * .36)}" ry="${f1(h * .05)}" fill="rgba(30,50,25,.22)"/>` +
    `<path d="M${x} ${y}L${f1(x - 1.4)} ${f1(y - h * .45)}L${f1(x + 1.6)} ${f1(y - h * .45)}Z" fill="#6B5240"/>` +
    `<circle cx="${f1(x - h * .17)}" cy="${f1(y - h * .55)}" r="${f1(h * .23)}" fill="${c2}"/><circle cx="${f1(x + h * .16)}" cy="${f1(y - h * .58)}" r="${f1(h * .24)}" fill="${c2}"/>` +
    `<circle cx="${x}" cy="${f1(y - h * .72)}" r="${f1(h * .27)}" fill="${c}"/><circle cx="${f1(x - h * .1)}" cy="${f1(y - h * .78)}" r="${f1(h * .14)}" fill="rgba(255,255,220,.22)"/>`;
}
function cabana(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="2" cy="1" rx="22" ry="3.4" fill="rgba(30,50,25,.25)"/>
    <rect x="12" y="-30" width="5" height="11" fill="#9A8574"/><path d="M13 -33q3 -4 -1 -8q4 2 3 -4" stroke="#fff" opacity=".7" fill="none"/>
    <rect x="-17" y="-18" width="32" height="18" fill="#F2E8D5"/><rect x="5" y="-18" width="10" height="18" fill="rgba(0,0,0,.07)"/>
    <path d="M-21 -17L-1 -35L19 -17Z" fill="#B96A4C"/><path d="M-1 -35L19 -17L-1 -17Z" fill="rgba(0,0,0,.15)"/>
    <rect x="-11" y="-12" width="8" height="12" rx="1" fill="#8B6A4C"/><rect x="3" y="-14" width="8" height="7" rx="1" fill="#F6D98A"/><path d="M7 -14v7M3 -10.5h8" stroke="#8B6A4C" stroke-width=".8"/></g>`;
}
function bandera(x, y, col, lado) {
  const d = lado === 'i' ? 1 : -1;
  return `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="1" rx="4" ry="1.4" fill="rgba(0,0,0,.2)"/><line x1="0" y1="0" x2="0" y2="-24" stroke="#8D8779" stroke-width="1.4"/><circle cx="0" cy="-24.5" r="1.4" fill="#C9B88C"/>
    <path d="M0 -23C${4 * d} -26 ${8 * d} -20 ${14 * d} -23L${12.4 * d} -18.4L${14 * d} -14C${8 * d} -11 ${4 * d} -17 0 -14Z" fill="${col}"/><path d="M0 -23C${4 * d} -26 ${8 * d} -20 ${14 * d} -23L${13 * d} -20.6C${8 * d} -17.6 ${4 * d} -23 0 -20Z" fill="rgba(255,255,255,.25)"/></g>`;
}

/* ---- personaje (de perfil, con mochila). Pie en (0,0), mira a la derecha ---- */
const PJ = { piel: '#EBC8AC', pielS: '#D9AE90', pelo: '#573B2C', peloL: '#7A5640', campera: '#F2EADB', camperaS: '#DDD1BC', malla: '#3D4946', mallaL: '#55635F', mochila: '#C28D5B', mochilaS: '#A06F43', zapa: '#F3EDE0' };
function pjSVG(esc = 1) {
  return `<g transform="scale(${esc})">
    <ellipse cx="2" cy="1.4" rx="19" ry="3.6" fill="rgba(40,56,30,.28)"/>
    <path d="M-3 -38L-9 -19L-13 -3" stroke="${PJ.malla}" stroke-width="7.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M-19 -3h11.5a2.6 2.6 0 0 1 0 5h-14Z" fill="${PJ.zapa}" stroke="#CDC3AE" stroke-width=".8"/><path d="M-20.5 3.4h14.6" stroke="#B8AD96" stroke-width="1.6"/>
    <rect x="-22" y="-73" width="17" height="35" rx="7.5" fill="${PJ.mochila}"/>
    <path d="M-22 -66a7.5 7.5 0 0 1 7.5 -7h2a7.5 7.5 0 0 1 7.5 7v1h-17Z" fill="${PJ.mochilaS}"/>
    <rect x="-20.5" y="-52" width="14" height="11" rx="3.5" fill="${PJ.mochilaS}" opacity=".75"/><rect x="-20.5" y="-52" width="14" height="2.4" rx="1.2" fill="rgba(255,255,255,.18)"/>
    <rect x="-24" y="-80" width="21" height="8" rx="4" fill="#7FA06A"/><path d="M-20 -80v8M-14 -80v8M-8 -80v8" stroke="rgba(255,255,255,.28)" stroke-width="1.2"/>
    <path d="M-5 -66Q-3 -52 -2 -43" stroke="#8B5E36" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M2 -38L15 -29L12 -9" stroke="${PJ.malla}" stroke-width="7.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2 -38L15 -29" stroke="${PJ.mallaL}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".55"/>
    <path d="M6 -8h12.5a2.6 2.6 0 0 1 0 5H3.5Z" fill="${PJ.zapa}" stroke="#CDC3AE" stroke-width=".8"/><path d="M4 -3h15" stroke="#B8AD96" stroke-width="1.6"/>
    <path d="M-5 -68Q-7.5 -52 -4.5 -36L8.5 -36Q10.5 -52 8.6 -68Q2 -72 -5 -68Z" fill="${PJ.campera}"/>
    <path d="M-5 -68Q-7.5 -52 -4.5 -36L0 -36Q-2.4 -52 -1.4 -69Z" fill="${PJ.camperaS}" opacity=".7"/>
    <path d="M-4.4 -37Q2 -34 8.4 -37" stroke="${PJ.camperaS}" stroke-width="2.2" fill="none"/><path d="M1 -58q3 6 1 14" stroke="${PJ.camperaS}" stroke-width="1" fill="none" opacity=".6"/>
    <path d="M3 -63L12.5 -50L7.6 -44" stroke="${PJ.campera}" stroke-width="5.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12.5 -50L7.6 -44" stroke="${PJ.camperaS}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/>
    <circle cx="7" cy="-42.6" r="3" fill="${PJ.piel}"/>
    <rect x="0" y="-74" width="4.8" height="7" rx="2" fill="${PJ.pielS}"/>
    <path d="M-3 -81q-11 0 -14 14q6 -5 11.5 -5Z" fill="${PJ.pelo}"/><path d="M-6 -75q-8 4 -9 10" stroke="${PJ.peloL}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="-3" cy="-79" rx="3" ry="2" fill="#C2674A"/>
    <ellipse cx="3.6" cy="-79.5" rx="7.4" ry="8" fill="${PJ.piel}"/>
    <ellipse cx="-2.2" cy="-78" rx="2" ry="2.6" fill="${PJ.pielS}" opacity=".5"/>
    <path d="M-4.4 -80a8 8.4 0 0 1 15.2 -3.4q-5.4 -1.8 -10 .8q-3.2 2.2 -3.8 7.4Z" fill="${PJ.pelo}"/>
    <path d="M0 -86q4 -2 8 0" stroke="${PJ.peloL}" stroke-width="1" fill="none" stroke-linecap="round" opacity=".8"/>
    <ellipse cx="8.6" cy="-79.6" rx=".95" ry="1.3" fill="#3A2A22"/><path d="M6.8 -82.2q1.8 -1 3.4 -.2" stroke="${PJ.pelo}" stroke-width=".8" fill="none" stroke-linecap="round"/>
    <path d="M10.7 -77.4l1.4 1.1l-1.4 .4" stroke="${PJ.pielS}" stroke-width=".8" fill="none" stroke-linejoin="round"/>
    <path d="M8 -74.6q1.6 .9 3 -.1" stroke="#B5675A" stroke-width=".9" fill="none" stroke-linecap="round"/>
    <ellipse cx="7" cy="-75.8" rx="1.8" ry="1" fill="#E8998A" opacity=".35"/>
  </g>`;
}

function curva(pts) {
  const seg = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    seg.push([p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2]);
  }
  return seg;
}
const bz = (s, t) => { const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t; return [a * s[0][0] + b * s[1][0] + c * s[2][0] + d * s[3][0], a * s[0][1] + b * s[1][1] + c * s[2][1] + d * s[3][1]]; };
const bzD = seg => `M${seg[0][0]} ${seg[0][1]}C${f1(seg[1][0])} ${f1(seg[1][1])} ${f1(seg[2][0])} ${f1(seg[2][1])} ${seg[3][0]} ${seg[3][1]}`;

/* ---------------- Mapa de la montaña (vista general) ---------------- */
const mezcla = (a, b, t) => { const h = x => [1, 3, 5].map(k => parseInt(x.slice(k, k + 2), 16)); const A = h(a), B = h(b); return '#' + A.map((v, k) => Math.round(v + (B[k] - v) * t).toString(16).padStart(2, '0')).join(''); };
/* bosque: grupo de árboles; los de más arriba se ven más lejanos (más claros y azulados) */
function bosque(cx, cy, n, dx, dy, seed, hMin, hMax) {
  const r = rng(seed), a = [];
  for (let i = 0; i < n; i++) a.push([cx + (r() * 2 - 1) * dx, cy + (r() * 2 - 1) * dy, hMin + (hMax - hMin) * r(), r()]);
  a.sort((p, q) => p[1] - q[1]);
  return a.map(([x, y, h, k]) => {
    const t = Math.max(0, Math.min(1, (y - 180) / 330));
    if (k < .16) return arbol(x, y, h * .75, mezcla('#9DB98C', '#8DB06A', t), mezcla('#86A57C', '#6C9150', t));
    return pino(x, y, h, mezcla('#6F8F78', '#456443', t), mezcla('#7C9A82', '#5E7E52', t));
  }).join('');
}
const nodoSVG = (p, e) => {
  if (e === 'hecho') return `<g transform="translate(${p.x} ${p.y})"><circle r="11" fill="rgba(255,255,255,.92)"/><circle r="8" fill="#6F9A3F"/><path d="M-3.4 .2l2.6 2.7 4.6-5.2" stroke="#fff" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  if (e === 'actual') return `<g transform="translate(${p.x} ${p.y})"><circle class="pulso" r="14" fill="rgba(227,165,60,.38)"/><circle r="11" fill="#fff"/><circle r="7.6" fill="#E3A53C"/><circle r="2.6" fill="#fff"/></g>`;
  return `<g transform="translate(${p.x} ${p.y})"><circle r="9" fill="rgba(255,255,255,.85)"/><circle r="5.6" fill="#BDB4CB"/></g>`;
};

/* pos = nivel donde está parada la protagonista (0 a 6), o 7 si llegó a la cumbre */
function mapaSVG(estados, u = 'm', pos = 0) {
  const E = estados;
  const pts = [[150, 596], ...MAPA_PTS.map(p => [p.x, p.y]), [CUMBRE.x, CUMBRE.y]];
  const segs = curva(pts);
  const ancho = i => Math.max(4.6, 25 - i * 2.8);
  let camino = '';
  segs.forEach((s, i) => { camino += `<path d="${bzD(s)}" fill="none" stroke="rgba(40,60,30,.22)" stroke-width="${ancho(i) + 5}" stroke-linecap="round" transform="translate(1.5 3.5)"/>`; });
  segs.forEach((s, i) => { camino += `<path d="${bzD(s)}" fill="none" stroke="#C4AE84" stroke-width="${ancho(i) + 3.4}" stroke-linecap="round"/>`; });
  segs.forEach((s, i) => { camino += `<path d="${bzD(s)}" fill="none" stroke="#F0E4CB" stroke-width="${ancho(i)}" stroke-linecap="round"/>`; });
  segs.forEach((s, i) => { camino += `<path d="${bzD(s)}" fill="none" stroke="#FBF4E4" stroke-width="${ancho(i) * .45}" stroke-linecap="round" opacity=".9"/>`; });
  const r = rng(7);
  segs.forEach((s, i) => {
    for (let t = .06; t < 1; t += .07) {
      const [x, y] = bz(s, t), [x2, y2] = bz(s, Math.min(1, t + .02)), dx = x2 - x, dy = y2 - y, L = Math.hypot(dx, dy) || 1, w = ancho(i) * .56, side = r() > .5 ? 1 : -1;
      camino += `<ellipse cx="${f1(x - dy / L * w * side)}" cy="${f1(y + dx / L * w * side)}" rx="${f1(1.1 + r() * 1.1)}" ry="${f1(.7 + r() * .6)}" fill="${r() > .5 ? '#B3A079' : '#D9CBA9'}"/>`;
    }
  });
  const nodos = MAPA_PTS.map((p, i) => nodoSVG(p, E[i])).join('');
  /* protagonista sobre el camino, justo antes de su nivel */
  const k = Math.min(pos, segs.length - 1), pt = bz(segs[k], pos >= 7 ? .5 : .8), destino = k < MAPA_PTS.length ? MAPA_PTS[k] : CUMBRE;
  const mira = destino.x >= pt[0] ? 1 : -1, ps = 0.66;
  const heroe = `<g transform="translate(${f1(pt[0])} ${f1(pt[1] + 3)})"><g transform="scale(${mira} 1)">${pjSVG(ps)}</g>
    <g transform="translate(0 ${f1(-92 * ps - 12)})"><rect x="-27" y="-8.6" width="54" height="15" rx="7.5" fill="#fff" opacity=".95"/><path d="M-4 6.4h8l-4 4Z" fill="#fff" opacity=".95"/><text x="0" y="2.2" text-anchor="middle" font-size="8.8" font-weight="700" fill="#B2603F">estás acá</text></g></g>`;
  const grupos = bosque(52, 318, 9, 34, 16, 3, 30, 44) + bosque(60, 425, 8, 34, 24, 5, 34, 50) + bosque(48, 215, 6, 28, 22, 8, 22, 32) +
    bosque(306, 366, 8, 34, 24, 11, 34, 50) + bosque(304, 262, 6, 32, 22, 13, 24, 34) + bosque(312, 140, 5, 26, 16, 17, 20, 28) + bosque(60, 135, 4, 24, 14, 19, 18, 24) +
    bosque(230, 520, 5, 70, 14, 23, 34, 46) + bosque(34, 530, 3, 18, 8, 29, 40, 50);
  const lejos = Array.from({ length: 26 }, (_, i) => pino(8 + i * 14.2, 330 + ((i * 7) % 5) * 3, 13 + (i % 3) * 2, '#7B9985', '#8AA591')).join('');
  return `<svg class="mapa-svg" viewBox="0 0 ${MAPA_W} ${MAPA_H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
    <defs>
      <linearGradient id="cie${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FAF6EF"/><stop offset=".3" stop-color="#FBEBD6"/><stop offset=".55" stop-color="#F6D9BE"/><stop offset="1" stop-color="#F2E2CF"/></linearGradient>
      <radialGradient id="sol${u}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF4D0" stop-opacity="1"/><stop offset=".4" stop-color="#FFE9B8" stop-opacity=".55"/><stop offset="1" stop-color="#FFE9B8" stop-opacity="0"/></radialGradient>
      <linearGradient id="niebla${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDF3E6" stop-opacity="0"/><stop offset="1" stop-color="#FDF3E6" stop-opacity=".9"/></linearGradient>
      <linearGradient id="hA${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9D7B0"/><stop offset="1" stop-color="#A9BF92"/></linearGradient>
      <linearGradient id="hB${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B3CA98"/><stop offset="1" stop-color="#8CAC74"/></linearGradient>
      <linearGradient id="hC${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9BBC80"/><stop offset="1" stop-color="#76A05E"/></linearGradient>
      <linearGradient id="hD${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FA763"/><stop offset="1" stop-color="#5B8545"/></linearGradient>
      <linearGradient id="rayo${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF3CF" stop-opacity=".5"/><stop offset="1" stop-color="#FFF3CF" stop-opacity="0"/></linearGradient>
      <linearGradient id="mont${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9C5D1"/><stop offset="1" stop-color="#A3B1C0"/></linearGradient>
    </defs>
    <rect width="${MAPA_W}" height="${MAPA_H}" fill="url(#cie${u})"/>
    <circle cx="206" cy="98" r="150" fill="url(#sol${u})"/>
    ${[-62, -38, -16, 8, 32, 58].map(a => `<path d="M206 98L${f1(206 + Math.sin(a * Math.PI / 180) * 330)} ${f1(98 + Math.cos(a * Math.PI / 180) * 330)}L${f1(206 + Math.sin((a + 7) * Math.PI / 180) * 330)} ${f1(98 + Math.cos((a + 7) * Math.PI / 180) * 330)}Z" fill="url(#rayo${u})" opacity=".5"/>`).join('')}
    ${ave(300, 168, 1)}${ave(322, 154, .8)}${ave(40, 188, .9)}
    ${nube(66, 172, .8, .92)}${nube(318, 196, .72, .9)}${nube(296, 84, .55, .65)}${nube(40, 96, .5, .55)}
    <path d="M-10 330L24 262L52 282L92 214L134 276L160 252L190 330Z" fill="#D5DCE4"/><path d="M92 214L134 276L160 252L120 330L104 270Z" fill="#B8C3CF" opacity=".6"/><path d="M92 214L80 236L88 230L94 244L102 230Z" fill="#F6F1EA"/>
    <path d="M190 330L240 238L272 212L306 244L336 220L372 262L372 330Z" fill="#C6D0DA"/><path d="M272 212L306 244L336 220L346 330L276 330Z" fill="#A9B7C6" opacity=".6"/><path d="M272 212L258 238L266 232L274 246L282 230Z" fill="#F6F1EA"/>
    <path d="M10 346L70 268L110 222L148 170L184 130L206 104L228 136L260 172L298 216L342 268L372 346Z" fill="url(#mont${u})"/>
    <path d="M206 104L228 136L260 172L298 216L342 268L372 346L236 346L222 220Z" fill="#8497AB" opacity=".72"/>
    <path d="M148 170L184 130L206 104L204 176L178 244L110 222Z" fill="#CEDAE4" opacity=".85"/>
    <path d="M110 222L148 170L142 250L96 280Z" fill="#9FB0C2" opacity=".5"/>
    <path d="M206 104L211 178L226 252M184 130L180 204L160 270M228 136L242 200L268 270M148 170L146 226" stroke="#7E92A6" stroke-width="1.1" fill="none" opacity=".5"/>
    <path d="M206 104L186 144L195 137L202 153L209 136L218 156L224 142L231 149L228 136Z" fill="#FAF6EE"/><path d="M206 104L228 136L231 149L218 156L209 136Z" fill="#D9E2EB"/>
    <rect y="230" width="360" height="130" fill="url(#niebla${u})" opacity=".55"/>
    ${lejos}
    <path d="M0 322Q90 276 190 306T360 292V560H0Z" fill="url(#hA${u})"/>
    <path d="M0 376Q110 318 222 358T360 342V560H0Z" fill="url(#hB${u})"/>
    <path d="M0 442Q120 398 242 432T360 420V560H0Z" fill="url(#hC${u})"/>
    <path d="M0 510Q100 484 200 510T360 502V560H0Z" fill="url(#hD${u})"/>
    ${pasto(0, 340, 360, 376, 28, 11, '#6F9558', .45)}${pasto(0, 400, 360, 436, 34, 21, '#628A4C', .5)}${pasto(0, 456, 360, 500, 40, 31, '#547C40', .55)}
    ${grupos}
    ${cabana(318, 474, 1.05)}
    ${camino}
    ${nodos}
    <g><circle cx="${CUMBRE.x}" cy="${CUMBRE.y - 14}" r="26" fill="url(#sol${u})"/>
    <line x1="${CUMBRE.x}" y1="${CUMBRE.y}" x2="${CUMBRE.x}" y2="${CUMBRE.y - 30}" stroke="#8A8478" stroke-width="1.7"/>
    <path d="M${CUMBRE.x} ${CUMBRE.y - 30}C${CUMBRE.x + 6} ${CUMBRE.y - 34} ${CUMBRE.x + 12} ${CUMBRE.y - 26} ${CUMBRE.x + 20} ${CUMBRE.y - 30}L${CUMBRE.x + 17} ${CUMBRE.y - 24}L${CUMBRE.x + 20} ${CUMBRE.y - 18}C${CUMBRE.x + 12} ${CUMBRE.y - 14} ${CUMBRE.x + 6} ${CUMBRE.y - 22} ${CUMBRE.x} ${CUMBRE.y - 18}Z" fill="#C2503A"/></g>
    ${heroe}
    <path d="M-6 574Q8 536 46 530Q84 526 108 574Z" fill="#8F968D"/><path d="M0 572Q14 544 46 538Q70 535 90 546Q54 548 38 572Z" fill="#B3B8AC"/>
    <path d="M250 574Q268 548 304 546Q340 546 366 574Z" fill="#969D93"/><path d="M256 572Q274 556 304 553Q326 553 340 560Q300 560 284 572Z" fill="#B9BEB1"/>
    ${[[16, 556], [30, 564], [118, 558], [132, 566], [214, 560]].map(([x, y]) => `<path d="M${x} ${y}q-4 -9 -8 -16M${x} ${y}q1 -10 -1 -18M${x} ${y}q4 -8 8 -15" stroke="#4E7A3E" stroke-width="1.5" fill="none" stroke-linecap="round"/>`).join('')}
    ${lavanda(150, 552, 1.05)}${lavanda(172, 558, .95, '#8E7FBA')}${lavanda(204, 548, 1)}${lavanda(232, 556, 1.1, '#8E7FBA')}${lavanda(120, 546, .95)}${lavanda(296, 552, 1.05)}${lavanda(330, 558, 1)}
    ${margarita(188, 556)}${margarita(220, 562, 1.2)}${margarita(268, 556)}${margarita(106, 560)}${margarita(346, 554, 1.1)}
    ${pasto(0, 540, 360, 562, 36, 51, '#3E6A33', .7)}
  </svg>`;
}

/* ---------------- Escalera de un nivel (vista de nivel) ---------------- */
const NV_W = 360, NV_H = 380;
const escX = i => 24 + (i - 1) * 38, escY = i => 304 - (i - 1) * 34;
function posPj(i) { return i <= 0 ? { x: 20, y: 322 } : { x: escX(i) + 28, y: escY(i) - 6 }; }
const nvClase = (i, paso, final) => i < paso ? 'hecho' : i === paso ? (final ? 'hecho' : 'actual') : 'futuro';

function nivelSVG(paso, o = {}) {
  const u = o.u || 'n', desde = o.desde != null ? o.desde : paso, final = !!o.final;
  let pasos = '';
  for (let i = 1; i <= ESCALONES; i++) {
    const x = escX(i), y = escY(i), w = 54, h = 46, c = nvClase(i, desde, final);
    let musgo = '';
    for (let k = 0; k < 9; k++) { const bx = x + 3 + k * 6.2; musgo += `<path d="M${f1(bx)} ${y + .5}q${(k % 2 ? 1.2 : -1.2)} -4.2 ${(k % 3 ? 2.2 : -.6)} -6.2" stroke="#6D9A3C" stroke-width="1.6" fill="none" stroke-linecap="round"/>`; }
    pasos += `<g class="nv-st ${c}" data-i="${i}">
      <path d="M${x + w + 14} ${y - 10}l22 8v${h - 2}l-22 4Z" fill="rgba(35,60,25,.13)"/>
      <path class="sd" d="M${x + w} ${y}l14 -10v${h}l-14 10Z"/>
      <rect class="f" x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="url(#bloque${u})"/>
      <path d="M${x + 8} ${y + 34}h12M${x + 34} ${y + 14}h9M${x + 20} ${y + 40}h7" stroke="rgba(60,40,20,.09)" stroke-width="1.2" stroke-linecap="round"/>
      <path class="top" d="M${x} ${y}l14 -10h${w}l-14 10Z"/>
      <path d="M${x} ${y}h${w}l14 -10" stroke="rgba(255,255,255,.6)" stroke-width="1.3" fill="none"/>
      <g class="musgo">${musgo}</g>
      <text class="num" x="${x + w / 2 - 4}" y="${y + 31}" text-anchor="middle">${i}</text>
      <g class="chk" transform="translate(${x + w - 9} ${y + 35})"><circle r="8.6"/><path d="M-3.6 .4l2.6 2.6 5-5.4"/></g>
    </g>`;
  }
  const f = { x: escX(7) + 44, y: escY(7) - 12 };
  const a = posPj(desde);
  const rr = rng(5);
  let flores = '';
  for (let i = 1; i <= 7; i++) { flores += lavanda(escX(i) - 4 - rr() * 6, escY(i) + 52 + rr() * 8, .8 + rr() * .4, rr() > .5 ? '#9F8FC4' : '#8E7FBA'); if (i % 2) flores += margarita(escX(i) + 62 + rr() * 8, escY(i) + 34 + rr() * 10, 1); }
  return `<svg class="nivel-svg" viewBox="0 0 ${NV_W} ${NV_H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
    <defs>
      <linearGradient id="nc${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FAF6EF"/><stop offset=".35" stop-color="#FBEBD6"/><stop offset=".7" stop-color="#F6DCC3"/><stop offset="1" stop-color="#F0E2CF"/></linearGradient>
      <radialGradient id="ns${u}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF4D0"/><stop offset=".45" stop-color="#FFE9B8" stop-opacity=".55"/><stop offset="1" stop-color="#FFE9B8" stop-opacity="0"/></radialGradient>
      <linearGradient id="bloque${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient>
      <linearGradient id="lad${u}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#6F9B52"/><stop offset=".5" stop-color="#8DB06A"/><stop offset="1" stop-color="#A5C27E"/></linearGradient>
      <linearGradient id="nb${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDF3E6" stop-opacity="0"/><stop offset="1" stop-color="#FDF3E6" stop-opacity=".8"/></linearGradient>
    </defs>
    <rect width="${NV_W}" height="${NV_H}" fill="url(#nc${u})"/>
    <circle cx="288" cy="64" r="130" fill="url(#ns${u})"/>
    ${ave(40, 100, 1)}${ave(66, 86, .8)}${ave(250, 120, .9)}
    <path d="M-10 262L26 190L56 220L104 128L150 214L186 190L236 262Z" fill="#D2DAE2"/><path d="M104 128L150 214L186 190L128 262L112 206Z" fill="#B3BFCB" opacity=".65"/><path d="M104 128L90 158L98 152L104 164L111 150L118 160Z" fill="#FAF6EE"/>
    <path d="M150 268L214 166L262 118L312 176L372 142L372 276Z" fill="#B6C2CE"/><path d="M262 118L312 176L372 142L372 276L296 276Z" fill="#94A5B6" opacity=".7"/><path d="M262 118L238 156L248 150L258 166L268 148L280 162Z" fill="#FAF6EE"/>
    <rect y="170" width="360" height="110" fill="url(#nb${u})" opacity=".6"/>
    ${nube(58, 112, .9, .92)}${nube(238, 214, .8, .85)}
    <g transform="translate(0 -34)">
    <path d="M-10 300Q60 270 140 268T290 240T372 236V460H-10Z" fill="#B7CAA0" opacity=".9"/>
    <path d="M-10 392L372 62V460H-10Z" fill="url(#lad${u})"/>
    <path d="M-10 392L372 62" stroke="rgba(255,255,230,.5)" stroke-width="2" fill="none"/>
    <path d="M-10 420L372 100V460H-10Z" fill="rgba(60,100,40,.28)"/>
    ${pasto(-10, 250, 372, 440, 140, 3, '#527F3A', .5)}${pasto(-10, 300, 372, 440, 80, 9, '#F0F5C8', .35)}
    ${pino(338, 176, 54, '#456443', '#587A4F')}${pino(354, 156, 44, '#4F6E4A', '#628456')}${pino(318, 192, 42, '#587A4F', '#456443')}${pino(302, 208, 30, '#628456', '#4F6E4A')}
    <path d="M-6 392Q18 352 56 358Q90 362 98 392Z" fill="#8F968D"/><path d="M0 390Q18 360 54 364Q76 366 88 376Q60 372 44 390Z" fill="#B3B8AC"/>
    <path d="M254 222Q272 190 306 194Q334 198 342 230Z" fill="#9AA196"/><path d="M262 220Q280 198 304 200Q300 214 262 224Z" fill="#BCC1B5"/><path d="M304 200Q326 202 334 226L316 228Z" fill="#7F877D" opacity=".6"/>
    ${flores}
    ${pasos}
    <g transform="translate(${f.x} ${f.y})"><ellipse cx="0" cy="12" rx="5" ry="1.6" fill="rgba(0,0,0,.18)"/><line x1="0" y1="12" x2="0" y2="-36" stroke="#8D8779" stroke-width="1.7"/><circle cx="0" cy="-37" r="1.8" fill="#C9B88C"/>
      <path class="nv-flag" d="M0 -35C7 -39 13 -31 22 -35L19.5 -28.5L22 -22C13 -18 7 -26 0 -22Z" fill="${final || desde >= ESCALONES ? '#6FA337' : '#8DB84C'}"/><path d="M0 -35C7 -39 13 -31 22 -35L20.6 -31.6C13 -28 7 -35 0 -31Z" fill="rgba(255,255,255,.25)"/></g>
    ${o.sinPj ? '' : `<g class="pj" id="pj-nivel" style="transform:translate(${a.x}px,${a.y}px)">${pjSVG(1.2)}</g>`}
    </g>
    ${arbolRama()}
  </svg>`;
}
function arbolRama() {
  const h = [[306, 10, -30, 12], [322, 24, 20, 12], [337, 30, -10, 13], [350, 22, 25, 12], [362, 14, -20, 11], [318, 2, 10, 11], [334, 8, 0, 12], [346, 36, -26, 10]];
  return `<path d="M296 -8C316 22 340 30 372 20" stroke="#6B5A44" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M330 28C338 38 348 42 356 44" stroke="#6B5A44" stroke-width="2" fill="none" stroke-linecap="round"/>` +
    h.map(([x, y, r, w], i) => `<g transform="rotate(${r} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="${w}" ry="5.2" fill="${i % 2 ? '#86AA64' : '#6E9552'}"/><path d="M${x - w + 2} ${y}h${w * 2 - 4}" stroke="rgba(255,255,230,.35)" stroke-width=".9"/></g>`).join('');
}
