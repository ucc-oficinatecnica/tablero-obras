'use strict';
/* =====================================================================
   CAMINO: ilustraciones del mapa de montaña (vista general) y de la
   escalera de 7 escalones de cada nivel (vista de nivel).
   Todo es vectorial (SVG) con degradados, luces y sombras.
   ===================================================================== */

/* ---- puntos del camino sobre el mapa (viewBox 360 x 560), de abajo hacia arriba ----
   lado = hacia dónde se muestra la etiqueta de cada nivel */
const MAPA_W = 360, MAPA_H = 600;
const MAPA_PTS = [
  { x: 216, y: 540, lado: 'd' }, { x: 150, y: 482, lado: 'i' }, { x: 208, y: 432, lado: 'd' },
  { x: 160, y: 390, lado: 'i' }, { x: 202, y: 354, lado: 'd' }, { x: 168, y: 324, lado: 'i' },
  { x: 196, y: 298, lado: 'd' }
];
const CUMBRE = { x: 196, y: 112 };

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

/* protagonista vista desde atrás: pie en (0,0) */
function pjEspalda(esc = 1) {
  return `<g transform="scale(${esc})"><ellipse cx="0" cy="1.5" rx="22" ry="4" fill="rgba(40,56,30,.3)"/>
    <path d="M-5 -38L-7 -16L-8 -3" stroke="${PJ.malla}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M5 -38L7 -22L12 -6" stroke="${PJ.malla}" stroke-width="8" fill="none" stroke-linecap="round"/>
    <ellipse cx="-8" cy="1" rx="6.5" ry="3.4" fill="${PJ.zapa}" stroke="#CDC3AE" stroke-width=".8"/><ellipse cx="14" cy="-3" rx="6.5" ry="3.4" fill="${PJ.zapa}" stroke="#CDC3AE" stroke-width=".8"/>
    <path d="M-13 -74Q-15 -52 -12 -36L12 -36Q15 -52 13 -74Z" fill="${PJ.campera}"/>
    <path d="M-12 -70L-18 -46" stroke="${PJ.campera}" stroke-width="6" stroke-linecap="round"/><path d="M12 -70L18 -46" stroke="${PJ.campera}" stroke-width="6" stroke-linecap="round"/><circle cx="-18.4" cy="-43" r="3" fill="${PJ.piel}"/><circle cx="18.4" cy="-43" r="3" fill="${PJ.piel}"/>
    <rect x="-15" y="-80" width="30" height="42" rx="11" fill="${PJ.mochila}"/><path d="M-15 -68a11 11 0 0 1 11 -12h8a11 11 0 0 1 11 12v2h-30Z" fill="${PJ.mochilaS}"/>
    <rect x="-11" y="-56" width="22" height="14" rx="5" fill="${PJ.mochilaS}" opacity=".8"/><path d="M-4 -80V-38M4 -80V-38" stroke="rgba(0,0,0,.12)" stroke-width="1.2"/>
    <rect x="-18" y="-88" width="36" height="10" rx="5" fill="#7FA06A"/><path d="M-12 -88v10M-4 -88v10M4 -88v10M12 -88v10" stroke="rgba(255,255,255,.3)" stroke-width="1.3"/>
    <rect x="15" y="-66" width="6" height="18" rx="3" fill="#8FB2C4"/>
    <rect x="-3" y="-96" width="6" height="8" rx="3" fill="${PJ.pielS}"/>
    <ellipse cx="0" cy="-102" rx="8" ry="8.6" fill="${PJ.pelo}"/><path d="M0 -96Q5 -88 2 -76Q-1 -84 0 -96Z" fill="${PJ.pelo}"/><path d="M-2 -84Q1 -80 0 -76" stroke="${PJ.peloL}" stroke-width="1.1" fill="none"/>
    <ellipse cx="0" cy="-96" rx="3.4" ry="2" fill="#C2674A"/><path d="M-5 -106Q0 -110 5 -106" stroke="${PJ.peloL}" stroke-width="1.1" fill="none" stroke-linecap="round"/></g>`;
}

/* bosque: grupo de árboles; los de más arriba se ven más lejanos */
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

/* Banderín de un nivel: grande, de color fuerte y con el número bien visible.
   hecho = verde con tilde · actual = dorado, más grande, brilla y dice HOY · pendiente = violeta */
const COLOR_BAND = { hecho: '#4F9A2B', actual: '#F5A511', futuro: '#7A6EA6' };
function banderin(p, e, n, mitad) {
  const d = p.lado === 'd' ? 1 : -1, act = e === 'actual';
  const s = Math.max(.92, Math.min(1.3, .92 + (p.y - 290) / 250 * .42)) * (act ? 1.2 : 1);
  const H = 48 * s, W = 50 * s, h = 32 * s, top = -H, fs = 18 * s, col = COLOR_BAND[e];
  const px = p.x + d * (mitad + 10), py = p.y + 8;
  const forma = `M0 ${f1(top)}H${f1(d * W)}L${f1(d * (W - 10 * s))} ${f1(top + h / 2)}L${f1(d * W)} ${f1(top + h)}H0Z`;
  const brillo = act ? `<circle class="pulso" cx="${f1(d * W * .45)}" cy="${f1(top + h / 2)}" r="${f1(W * .62)}" fill="url(#bri)"/>` : '';
  const tilde = e === 'hecho' ? `<g transform="translate(${f1(d * (W - 3))} ${f1(top - 1)})"><circle r="${f1(9 * s)}" fill="#fff" stroke="#4F9A2B" stroke-width="1.6"/><path d="M${f1(-3.6 * s)} ${f1(.3 * s)}l${f1(2.6 * s)} ${f1(2.8 * s)} ${f1(4.8 * s)} ${f1(-5.4 * s)}" stroke="#4F9A2B" stroke-width="${f1(2 * s)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>` : '';
  const hoy = act ? `<g transform="translate(${f1(d * W * .45)} ${f1(top + h + 14 * s)})"><rect x="-20" y="-9" width="40" height="17" rx="8.5" fill="#2F2B26"/><text y="3.4" text-anchor="middle" font-size="11" font-weight="800" fill="#fff" letter-spacing=".8">HOY</text></g>` : '';
  return `<g class="banderin" data-a="nivelVer" data-n="${n}" transform="translate(${f1(px)} ${f1(py)})">
    <rect x="${d > 0 ? -14 : f1(-W - 14)}" y="${f1(top - 30)}" width="${f1(W + 28)}" height="${f1(H + 40)}" fill="transparent"/>
    <ellipse cx="0" cy="1" rx="${f1(7 * s)}" ry="${f1(2.4 * s)}" fill="rgba(30,40,20,.3)"/>
    ${brillo}
    <rect x="${f1(-1.8 * s)}" y="${f1(top - 3)}" width="${f1(3.6 * s)}" height="${f1(H + 3)}" rx="1.5" fill="#6E5A3E"/><circle cx="0" cy="${f1(top - 3)}" r="${f1(3 * s)}" fill="#D6BC7C"/>
    <path d="${forma}" fill="${col}" stroke="#fff" stroke-width="${f1(2.6 * s)}" stroke-linejoin="round"/>
    <path d="M0 ${f1(top)}H${f1(d * W)}" stroke="rgba(255,255,255,.35)" stroke-width="${f1(3 * s)}"/>
    <text x="${f1(d * W * .43)}" y="${f1(top + h / 2 + fs * .36)}" text-anchor="middle" font-size="${f1(fs)}" font-weight="800" fill="${act ? '#2F2B26' : '#fff'}">${n}</text>
    ${tilde}${hoy}</g>`;
}

/* pos: se mantiene por compatibilidad (la protagonista siempre mira hacia la cumbre desde abajo) */
function mapaSVG(estados, u = 'm', pos = 0) {
  const E = estados;
  const pts = [[178, 612], ...MAPA_PTS.map(p => [p.x, p.y]), [186, 262], [192, 222], [CUMBRE.x, 168]];
  const segs = curva(pts), ancho = i => Math.max(3.2, 66 * Math.pow(.77, i));
  const hechos = E.filter(x => x === 'hecho').length, caminados = E.every(x => x === 'hecho') ? segs.length : Math.min(segs.length, hechos + (E.includes('actual') ? 1 : 0));
  let cam = '';
  segs.forEach((sg, i) => cam += `<path d="${bzD(sg)}" fill="none" stroke="rgba(40,60,30,.22)" stroke-width="${ancho(i) + 5}" stroke-linecap="round" transform="translate(1.5 3)"/>`);
  segs.forEach((sg, i) => cam += `<path d="${bzD(sg)}" fill="none" stroke="#C4AE84" stroke-width="${ancho(i) + 3.6}" stroke-linecap="round"/>`);
  segs.forEach((sg, i) => cam += `<path d="${bzD(sg)}" fill="none" stroke="#F0E4CB" stroke-width="${ancho(i)}" stroke-linecap="round"/>`);
  segs.forEach((sg, i) => cam += `<path d="${bzD(sg)}" fill="none" stroke="#FBF4E4" stroke-width="${ancho(i) * .42}" stroke-linecap="round" opacity=".9"/>`);
  /* lo ya recorrido se pinta de verde */
  cam += `<g opacity=".66">` + segs.slice(0, caminados).map((sg, i) => `<path d="${bzD(sg)}" fill="none" stroke="#7DB850" stroke-width="${ancho(i) * .78}" stroke-linecap="round"/>`).join('') + `</g>`;
  segs.slice(0, caminados).forEach((sg, i) => cam += `<path d="${bzD(sg)}" fill="none" stroke="#E6F6CC" stroke-width="${Math.max(1.4, ancho(i) * .16)}" stroke-dasharray="1 6" stroke-linecap="round"/>`);
  const r = rng(4);
  segs.forEach((sg, i) => { for (let t = .08; t < 1; t += .1) { const [x, y] = bz(sg, t), [x2, y2] = bz(sg, Math.min(1, t + .02)), dx = x2 - x, dy = y2 - y, L = Math.hypot(dx, dy) || 1, w = ancho(i) * .56, side = r() > .5 ? 1 : -1; cam += `<ellipse cx="${f1(x - dy / L * w * side)}" cy="${f1(y + dx / L * w * side)}" rx="${f1((1.2 + r()) * (ancho(i) / 40 + .5))}" ry="${f1((.7 + r() * .5) * (ancho(i) / 40 + .5))}" fill="${r() > .5 ? '#B3A079' : '#D9CBA9'}"/>`; } });
  const bandas = [[308, 1], [336, 2], [368, 3], [410, 4], [462, 5], [528, 6]].map(([y, k], i, a) => `<rect y="${y}" width="360" height="${(a[i + 1] ? a[i + 1][0] : MAPA_H) - y + 1}" fill="${i % 2 ? '#8FB070' : '#9AB97B'}" opacity="${.35 + k * .06}"/>`).join('');
  let arb = '';
  [322, 346, 378, 418, 468, 530, 592].forEach((y, i) => { const h = 10 + (y - 300) * .32, d = (y - 300) * .46, tt = Math.max(0, Math.min(1, (y - 180) / 420));
    arb += pino(178 - 44 - d - (i % 3) * 8, y, h, mezcla('#7B9985', '#3F5E3F', tt), mezcla('#8AA591', '#55774C', tt)) + pino(178 + 44 + d + (i % 2) * 10, y + 4, h * .92, mezcla('#7B9985', '#3F5E3F', tt), mezcla('#8AA591', '#55774C', tt)); });
  const banderines = MAPA_PTS.map((p, i) => ({ p, i })).sort((a, b) => a.p.y - b.p.y).map(({ p, i }) => banderin(p, E[i], i + 1, ancho(i + 1) / 2)).join('');
  const puntos = MAPA_PTS.map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="${E[i] === 'actual' ? 6 : 4.5}" fill="${COLOR_BAND[E[i]]}" stroke="#fff" stroke-width="2"/>`).join('');
  return `<svg class="mapa-svg" viewBox="0 0 ${MAPA_W} ${MAPA_H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
    <defs>
      <linearGradient id="cie${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FAF6EF"/><stop offset=".4" stop-color="#FBEBD6"/><stop offset="1" stop-color="#F6D9BE"/></linearGradient>
      <radialGradient id="bri" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFC947" stop-opacity=".75"/><stop offset=".6" stop-color="#FFC947" stop-opacity=".3"/><stop offset="1" stop-color="#FFC947" stop-opacity="0"/></radialGradient>
      <radialGradient id="sol${u}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF4D0"/><stop offset=".4" stop-color="#FFE9B8" stop-opacity=".55"/><stop offset="1" stop-color="#FFE9B8" stop-opacity="0"/></radialGradient>
      <linearGradient id="gr${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B8CE9C"/><stop offset="1" stop-color="#6F9A56"/></linearGradient>
      <linearGradient id="mo${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BBC7D3"/><stop offset="1" stop-color="#A2B1C0"/></linearGradient>
      <linearGradient id="ne${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDF3E6" stop-opacity="0"/><stop offset="1" stop-color="#FDF3E6" stop-opacity=".9"/></linearGradient>
    </defs>
    <rect width="${MAPA_W}" height="${MAPA_H}" fill="url(#cie${u})"/><circle cx="194" cy="180" r="170" fill="url(#sol${u})"/>${nube(64, 214, .8, .9)}${nube(320, 204, .7, .88)}
    <path d="M-10 300L24 238L52 262L92 198L140 270L170 244L200 300Z" fill="#D8DEE5"/><path d="M180 300L236 232L270 208L306 244L338 224L372 262L372 300Z" fill="#C9D2DB"/>
    <path d="M30 306L90 238L130 200L160 160L182 136L196 112L212 140L240 174L272 206L316 250L360 306Z" fill="url(#mo${u})"/>
    <path d="M196 112L212 140L240 174L272 206L316 250L360 306L230 306L214 200Z" fill="#8497AB" opacity=".72"/><path d="M160 160L182 136L196 112L194 180L170 252L130 200Z" fill="#CEDAE4" opacity=".85"/>
    <path d="M196 112L200 184L214 260M182 136L180 210L166 280" stroke="#7E92A6" stroke-width="1.1" fill="none" opacity=".5"/>
    <path d="M196 112L178 148L187 141L193 156L200 140L208 158L213 146L219 152L212 140Z" fill="#FAF6EE"/>
    <rect y="240" width="360" height="80" fill="url(#ne${u})" opacity=".7"/>
    <rect y="300" width="360" height="300" fill="url(#gr${u})"/>${bandas}<path d="M0 300Q90 290 180 300T360 298V312H0Z" fill="#9DB8A2" opacity=".55"/>
    ${pasto(0, 330, 360, 590, 70, 7, '#4F7A3C', .4)}${arb}
    <rect width="${MAPA_W}" height="${MAPA_H}" fill="#FAF6EF" opacity=".16"/>
    ${cam}${puntos}
    <g transform="translate(${CUMBRE.x} ${CUMBRE.y})"><circle cy="-20" r="26" fill="url(#sol${u})"/><line x1="0" y1="0" x2="0" y2="-34" stroke="#7E786C" stroke-width="2"/><path d="M0 -34C7 -38 13 -30 22 -34L19 -27L22 -20C13 -16 7 -24 0 -20Z" fill="#C2503A" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></g>
    ${banderines}
    <g transform="translate(150 600)">${pjEspalda(.84)}</g>
    ${lavanda(30, 592, 1.3)}${lavanda(330, 594, 1.3, '#8E7FBA')}${margarita(60, 598, 1.4)}${margarita(300, 598, 1.4)}
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
