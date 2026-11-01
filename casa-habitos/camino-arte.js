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
  { x: 150, y: 468, lado: 'd' }, { x: 234, y: 414, lado: 'i' }, { x: 150, y: 362, lado: 'd' },
  { x: 234, y: 316, lado: 'i' }, { x: 166, y: 268, lado: 'd' }, { x: 226, y: 220, lado: 'i' },
  { x: 190, y: 166, lado: 'd' }
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
function mapaSVG(estados, u = 'm') {
  const E = estados;
  const pts = [[112, 590], ...MAPA_PTS.map(p => [p.x, p.y]), [CUMBRE.x, CUMBRE.y]];
  const segs = curva(pts);
  const ancho = i => Math.max(4.2, 18 - i * 1.7);
  let camino = '';
  segs.forEach((s, i) => { camino += `<path d="${bzD(s)}" fill="none" stroke="rgba(40,60,30,.2)" stroke-width="${ancho(i) + 5}" stroke-linecap="round" transform="translate(1.5 3)"/>`; });
  segs.forEach((s, i) => { camino += `<path d="${bzD(s)}" fill="none" stroke="#C9B58C" stroke-width="${ancho(i) + 3.2}" stroke-linecap="round"/>`; });
  segs.forEach((s, i) => { camino += `<path d="${bzD(s)}" fill="none" stroke="#F1E6CF" stroke-width="${ancho(i)}" stroke-linecap="round"/>`; });
  segs.forEach((s, i) => { camino += `<path d="${bzD(s)}" fill="none" stroke="#FAF3E3" stroke-width="${ancho(i) * .42}" stroke-linecap="round" opacity=".85"/>`; });
  const r = rng(7);
  segs.forEach((s, i) => {
    for (let t = .08; t < 1; t += .1) {
      const [x, y] = bz(s, t), [x2, y2] = bz(s, Math.min(1, t + .02)), dx = x2 - x, dy = y2 - y, L = Math.hypot(dx, dy) || 1, w = ancho(i) * .5, side = r() > .5 ? 1 : -1;
      camino += `<ellipse cx="${f1(x - dy / L * w * side)}" cy="${f1(y + dx / L * w * side)}" rx="${f1(1.1 + r() * .9)}" ry="${f1(.7 + r() * .5)}" fill="${r() > .5 ? '#B9A57F' : '#D8C9A6'}"/>`;
    }
  });
  const colB = { hecho: '#86A957', actual: '#E3A53C', futuro: '#C9C0D8' };
  const banderas = MAPA_PTS.map((p, i) => bandera(p.x, p.y, colB[E[i]], p.lado)).join('');
  const izq = [[26, 336, 46], [52, 352, 54], [80, 334, 40], [22, 396, 52], [50, 414, 60], [80, 400, 44], [28, 458, 48], [60, 470, 40]];
  const der = [[330, 340, 42], [306, 360, 50], [338, 396, 54], [294, 484, 44], [330, 480, 56]];
  const alto = [[28, 262, 36], [58, 276, 42], [300, 258, 34], [330, 270, 40], [286, 204, 30], [318, 214, 34], [40, 200, 28], [66, 214, 30]];
  const arbs = [...izq, ...der, ...alto].map(([x, y, h], i) => i % 3 === 1 ? pino(x, y, h, '#456443', '#587A4F') : pino(x, y, h, '#4F6E4A', '#628456')).join('') +
    arbol(304, 456, 34, '#D69A4A', '#C07A3E') + arbol(346, 432, 30, '#8DB06A', '#6C9150') + arbol(98, 482, 30, '#9DBB72', '#789A58');
  return `<svg class="mapa-svg" viewBox="0 0 ${MAPA_W} ${MAPA_H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
    <defs>
      <linearGradient id="cie${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FAF6EF"/><stop offset=".3" stop-color="#FBEBD6"/><stop offset=".55" stop-color="#F6D9BE"/><stop offset="1" stop-color="#F2E2CF"/></linearGradient>
      <radialGradient id="sol${u}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF4D0" stop-opacity="1"/><stop offset=".4" stop-color="#FFE9B8" stop-opacity=".55"/><stop offset="1" stop-color="#FFE9B8" stop-opacity="0"/></radialGradient>
      <linearGradient id="niebla${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDF3E6" stop-opacity="0"/><stop offset="1" stop-color="#FDF3E6" stop-opacity=".85"/></linearGradient>
      <linearGradient id="hA${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9D7B0"/><stop offset="1" stop-color="#A9BF92"/></linearGradient>
      <linearGradient id="hB${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B3CA98"/><stop offset="1" stop-color="#8CAC74"/></linearGradient>
      <linearGradient id="hC${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9BBC80"/><stop offset="1" stop-color="#76A05E"/></linearGradient>
      <linearGradient id="hD${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FA763"/><stop offset="1" stop-color="#5B8545"/></linearGradient>
      <linearGradient id="rayo${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF3CF" stop-opacity=".5"/><stop offset="1" stop-color="#FFF3CF" stop-opacity="0"/></linearGradient>
    </defs>
    <rect width="${MAPA_W}" height="${MAPA_H}" fill="url(#cie${u})"/>
    <circle cx="206" cy="98" r="150" fill="url(#sol${u})"/>
    ${[-62, -38, -16, 8, 32, 58].map(a => `<path d="M206 98L${f1(206 + Math.sin(a * Math.PI / 180) * 330)} ${f1(98 + Math.cos(a * Math.PI / 180) * 330)}L${f1(206 + Math.sin((a + 7) * Math.PI / 180) * 330)} ${f1(98 + Math.cos((a + 7) * Math.PI / 180) * 330)}Z" fill="url(#rayo${u})" opacity=".55"/>`).join('')}
    ${ave(296, 156, 1)}${ave(318, 142, .8)}
    <path d="M-10 304L30 232L58 254L96 196L140 258L172 238L198 304Z" fill="#D5DCE4"/><path d="M96 196L140 258L172 238L130 304L110 250Z" fill="#B5C0CC" opacity=".6"/>
    <path d="M178 304L236 218L268 192L300 226L330 202L372 244L372 304Z" fill="#C6D0DA"/><path d="M268 192L300 226L330 202L338 304L270 304Z" fill="#A5B3C2" opacity=".65"/><path d="M268 192L252 224L262 218L270 232L278 214Z" fill="#F6F1EA"/>
    <path d="M70 336L128 228L166 178L190 142L206 104L222 140L252 180L292 234L348 336Z" fill="#B3BFCC"/>
    <path d="M206 104L222 140L252 180L292 234L348 336L240 336L222 218Z" fill="#8C9FB3" opacity=".78"/>
    <path d="M166 178L190 142L206 104L204 174L180 236L128 228Z" fill="#CAD5DF" opacity=".85"/>
    <path d="M206 104L211 176L228 250M190 142L186 206L172 262M222 140L236 196L262 262" stroke="#8498AC" stroke-width="1.1" fill="none" opacity=".55"/>
    <path d="M206 104L187 142L196 135L203 150L210 134L218 152L224 141L230 148L222 140Z" fill="#FAF6EE"/><path d="M206 104L222 140L224 141L230 148L218 152L210 134Z" fill="#DCE4EC"/>
    <rect y="214" width="360" height="120" fill="url(#niebla${u})" opacity=".55"/>
    ${nube(304, 262, 1.1, .95)}${nube(66, 300, .95, .9)}${nube(324, 126, .7, .75)}${nube(38, 150, .75, .7)}
    <path d="M0 312Q90 262 190 298T360 286V560H0Z" fill="url(#hA${u})"/><path d="M0 312Q90 262 190 298T360 286" fill="none" stroke="rgba(255,255,235,.55)" stroke-width="1.6"/>
    ${[[24, 296, 14], [46, 290, 12], [300, 292, 14], [326, 288, 12], [346, 292, 14]].map(([x, y, h]) => pino(x, y, h, '#6F8F72', '#7E9C80')).join('')}
    <path d="M0 370Q110 308 222 352T360 336V560H0Z" fill="url(#hB${u})"/><path d="M0 370Q110 308 222 352T360 336" fill="none" stroke="rgba(255,255,235,.5)" stroke-width="1.6"/>
    <path d="M0 438Q120 392 242 428T360 416V560H0Z" fill="url(#hC${u})"/><path d="M0 438Q120 392 242 428T360 416" fill="none" stroke="rgba(255,255,235,.45)" stroke-width="1.6"/>
    <path d="M0 506Q100 478 200 506T360 496V560H0Z" fill="url(#hD${u})"/><path d="M0 506Q100 478 200 506T360 496" fill="none" stroke="rgba(255,255,235,.4)" stroke-width="1.6"/>
    <rect y="296" width="360" height="90" fill="url(#niebla${u})" opacity=".4"/>
    ${pasto(0, 330, 360, 372, 60, 11, '#6F9558', .5)}${pasto(0, 392, 360, 436, 70, 21, '#628A4C', .55)}${pasto(0, 452, 360, 500, 70, 31, '#547C40', .6)}${pasto(0, 512, 360, 556, 70, 41, '#46703A', .6)}
    ${cabana(318, 440, 1.05)}
    ${arbs}
    ${camino}
    ${banderas}
    <g><circle cx="${CUMBRE.x}" cy="${CUMBRE.y - 14}" r="26" fill="url(#sol${u})"/>
    <line x1="${CUMBRE.x}" y1="${CUMBRE.y}" x2="${CUMBRE.x}" y2="${CUMBRE.y - 30}" stroke="#8A8478" stroke-width="1.7"/>
    <path d="M${CUMBRE.x} ${CUMBRE.y - 30}C${CUMBRE.x + 6} ${CUMBRE.y - 34} ${CUMBRE.x + 12} ${CUMBRE.y - 26} ${CUMBRE.x + 20} ${CUMBRE.y - 30}L${CUMBRE.x + 17} ${CUMBRE.y - 24}L${CUMBRE.x + 20} ${CUMBRE.y - 18}C${CUMBRE.x + 12} ${CUMBRE.y - 14} ${CUMBRE.x + 6} ${CUMBRE.y - 22} ${CUMBRE.x} ${CUMBRE.y - 18}Z" fill="#C2503A"/></g>
    <path d="M-6 568Q4 514 52 504Q100 498 130 568Z" fill="#8F968D"/><path d="M-2 566Q10 520 52 510Q80 506 104 520Q60 526 44 566Z" fill="#B3B8AC"/><path d="M52 510Q80 506 104 520Q84 516 62 520Z" fill="#D2D6CB" opacity=".8"/>
    ${[[18, 548], [34, 556], [120, 546], [136, 554]].map(([x, y]) => `<path d="M${x} ${y}q-4 -9 -8 -16M${x} ${y}q1 -10 -1 -18M${x} ${y}q4 -8 8 -15" stroke="#4E7A3E" stroke-width="1.5" fill="none" stroke-linecap="round"/>`).join('')}
    <g transform="translate(68 512)">${pjSVG(1.4)}</g>
    ${lavanda(150, 546, 1.1)}${lavanda(172, 552, .95, '#8E7FBA')}${lavanda(212, 542, 1)}${lavanda(240, 550, 1.1, '#8E7FBA')}${lavanda(292, 546, 1.05)}${lavanda(326, 552, 1)}${lavanda(14, 556, .9)}
    ${margarita(188, 548)}${margarita(226, 554, 1.2)}${margarita(268, 550)}${margarita(106, 552)}${margarita(344, 548, 1.1)}
    ${pasto(0, 536, 360, 560, 40, 51, '#3E6A33', .7)}
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
