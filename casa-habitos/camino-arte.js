'use strict';
/* =====================================================================
   CAMINO: ilustraciones del mapa de montaña (vista general) y de la
   escalera de 7 escalones de cada nivel (vista de nivel).
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

/* ---- personaje (de perfil, con mochila). Pie en (0,0), mira a la derecha ---- */
const PJ = { piel: '#E9C5A8', pelo: '#5A3E2E', campera: '#EFE6D3', malla: '#3F4B48', mochila: '#C08B5A', zapa: '#F1EBDD' };
function pjSVG(esc = 1) {
  return `<g transform="scale(${esc})">
    <ellipse cx="2" cy="1" rx="17" ry="3.2" fill="rgba(50,64,40,.25)"/>
    <path d="M-3 -38L-9 -19L-13 -3" stroke="${PJ.malla}" stroke-width="7.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M-19 -2h11a2.4 2.4 0 0 1 0 4.4h-13Z" fill="${PJ.zapa}" stroke="#CFC6B2" stroke-width=".8"/>
    <rect x="-19" y="-72" width="15" height="33" rx="7" fill="${PJ.mochila}"/>
    <rect x="-19" y="-54" width="15" height="3.4" fill="rgba(0,0,0,.14)"/>
    <path d="M2 -38L15 -29L12 -9" stroke="${PJ.malla}" stroke-width="7.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 -7h12a2.4 2.4 0 0 1 0 4.4H4Z" fill="${PJ.zapa}" stroke="#CFC6B2" stroke-width=".8"/>
    <path d="M-5 -68Q-7 -52 -4 -37L8 -37Q10 -52 8 -68Q2 -72 -5 -68Z" fill="${PJ.campera}"/>
    <path d="M-5 -68Q-7 -52 -4 -37L0 -37Q-2 -52 -1 -69Z" fill="rgba(0,0,0,.06)"/>
    <path d="M3 -63L12 -50L7 -44" stroke="${PJ.campera}" stroke-width="5.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="6.6" cy="-43" r="2.8" fill="${PJ.piel}"/>
    <rect x="0" y="-73" width="4.4" height="6" rx="1.5" fill="${PJ.piel}"/>
    <circle cx="3.6" cy="-79" r="7.6" fill="${PJ.piel}"/>
    <path d="M-4 -79a8 8 0 0 1 15 -3.6q-5 -1.4 -9.4 .6q-3 1.8 -3.8 6.8Z" fill="${PJ.pelo}"/>
    <path d="M-3 -81q-10 1 -13 13q5 -5 10 -5Z" fill="${PJ.pelo}"/>
    <circle cx="8.2" cy="-78" r=".9" fill="${PJ.pelo}"/>
  </g>`;
}

const pino = (x, y, h, c1, c2) => {
  const t = (cx, top, bot, hw, f) => `<path d="M${cx} ${top}L${(cx - hw).toFixed(1)} ${bot}L${(cx + hw).toFixed(1)} ${bot}Z" fill="${f}"/>`;
  return `<rect x="${x - h * .03}" y="${y - h * .1}" width="${h * .06}" height="${h * .12}" fill="#5B4636"/>` +
    t(x, y - h, y - h * .5, h * .26, c1) + t(x, y - h * .74, y - h * .22, h * .33, c2) + t(x, y - h * .46, y - h * .02, h * .4, c1);
};
const nube = (x, y, s, o = .85) => `<g opacity="${o}" fill="#FFFFFF"><ellipse cx="${x}" cy="${y}" rx="${34 * s}" ry="${9 * s}"/><ellipse cx="${x - 16 * s}" cy="${y - 5 * s}" rx="${18 * s}" ry="${9 * s}"/><ellipse cx="${x + 12 * s}" cy="${y - 7 * s}" rx="${20 * s}" ry="${10 * s}"/></g>`;
const flor2 = (x, y, c) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - 9}" stroke="#6F8E55" stroke-width="1"/>` + [0, 3, 6].map(d => `<circle cx="${x + (d % 2 ? 1 : -1)}" cy="${y - 9 - d * .8}" r="1.7" fill="${c}"/>`).join('');
function curva(pts) {
  const seg = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    seg.push(`M${p1[0]} ${p1[1]}C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`);
  }
  return seg;
}
const bandera = (x, y, col, lado, g = 1) => {
  const d = lado === 'i' ? 1 : -1;     // la bandera mira al lado contrario de la etiqueta
  return `<g transform="translate(${x} ${y}) scale(${g})"><line x1="0" y1="0" x2="0" y2="-22" stroke="#9A9486" stroke-width="1.3"/><path d="M0 -22l${13 * d} 4.6l${-13 * d} 4.6Z" fill="${col}"/></g>`;
};

/* ---------------- Mapa de la montaña (vista general) ---------------- */
function mapaSVG(estados, u = 'm') {
  const E = estados;   // 'hecho' | 'actual' | 'futuro' por nivel
  const pts = [[112, 590], ...MAPA_PTS.map(p => [p.x, p.y]), [CUMBRE.x, CUMBRE.y]];
  const segs = curva(pts);
  let camino = '';
  segs.forEach((d, i) => { const w = Math.max(4, 17 - i * 1.55); camino += `<path d="${d}" fill="none" stroke="#D4C3A0" stroke-width="${w + 3}" stroke-linecap="round"/>`; });
  segs.forEach((d, i) => { const w = Math.max(4, 17 - i * 1.55); camino += `<path d="${d}" fill="none" stroke="#F5EDDC" stroke-width="${w}" stroke-linecap="round"/>`; });
  const colB = { hecho: '#86A957', actual: '#E3A53C', futuro: '#CDC4D9' };
  const banderas = MAPA_PTS.map((p, i) => bandera(p.x, p.y, colB[E[i]], p.lado)).join('');
  const arboles = [
    [30, 330, 44], [54, 346, 52], [80, 330, 40], [24, 392, 50], [50, 408, 58], [78, 396, 44], [26, 452, 46],
    [300, 352, 46], [326, 336, 40], [312, 396, 54], [338, 410, 46], [290, 450, 50], [326, 462, 56],
    [28, 262, 36], [58, 276, 42], [300, 258, 34], [330, 270, 40], [286, 204, 30], [318, 214, 34], [40, 200, 28]
  ].map(([x, y, h], i) => pino(x, y, h, i % 2 ? '#4F6E4A' : '#5E7E52', i % 3 ? '#6A8A5A' : '#476445')).join('');
  return `<svg class="mapa-svg" viewBox="0 0 ${MAPA_W} ${MAPA_H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
    <defs>
      <linearGradient id="cie${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FAF6EF"/><stop offset=".42" stop-color="#F6E6D2"/><stop offset="1" stop-color="#F1E4D2"/></linearGradient>
      <radialGradient id="sol${u}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF1C9" stop-opacity=".95"/><stop offset="1" stop-color="#FFF1C9" stop-opacity="0"/></radialGradient>
      <linearGradient id="niebla${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FAF6EF" stop-opacity="0"/><stop offset="1" stop-color="#FAF6EF" stop-opacity=".7"/></linearGradient>
    </defs>
    <rect width="${MAPA_W}" height="${MAPA_H}" fill="url(#cie${u})"/>
    <circle cx="206" cy="96" r="120" fill="url(#sol${u})"/>
    <path d="M-10 300L38 214L74 248L118 176L168 258L190 300Z" fill="#C0CAD2"/>
    <path d="M190 300L238 206L290 168L330 214L372 186L372 300Z" fill="#B3C0CB"/>
    <path d="M90 316L146 204L186 146L206 100L230 140L264 186L330 316Z" fill="#A9B7C3"/>
    <path d="M206 100L230 140L264 186L330 316L232 316L214 196Z" fill="#8FA0B0" opacity=".65"/>
    <path d="M146 204L186 146L206 100L196 178L170 236Z" fill="#C3CFD9" opacity=".7"/>
    <path d="M206 100L187 142L198 133L206 147L215 132L229 140Z" fill="#F8F4EC"/>
    ${nube(300, 258, 1.05, .9)}${nube(70, 296, .9, .85)}${nube(318, 128, .7, .7)}${nube(40, 150, .7, .65)}
    <path d="M0 310Q90 262 190 298T360 286V560H0Z" fill="#B3C39E"/>
    <path d="M0 368Q110 308 222 352T360 336V560H0Z" fill="#9FB887"/>
    <path d="M0 436Q120 392 242 428T360 416V560H0Z" fill="#88A870"/>
    <path d="M0 506Q100 478 200 506T360 496V560H0Z" fill="#729655"/>
    <rect y="296" width="360" height="90" fill="url(#niebla${u})" opacity=".55"/>
    ${arboles}
    ${camino}
    ${banderas}
    <g><circle cx="${CUMBRE.x}" cy="${CUMBRE.y - 14}" r="22" fill="url(#sol${u})"/>
    <line x1="${CUMBRE.x}" y1="${CUMBRE.y}" x2="${CUMBRE.x}" y2="${CUMBRE.y - 27}" stroke="#8A8478" stroke-width="1.6"/>
    <path d="M${CUMBRE.x} ${CUMBRE.y - 27}l17 5.4l-17 5.4Z" fill="#C2503A"/></g>
    <path d="M-6 568Q4 516 52 506Q100 500 128 568Z" fill="#A3A89F"/><path d="M8 566Q20 524 56 514Q84 510 100 524Q60 528 44 566Z" fill="#B9BDB3"/>
    <g transform="translate(66 512)">${pjSVG(1.35)}</g>
    ${flor2(150, 540, '#B9AFCB')}${flor2(162, 548, '#E9C46A')}${flor2(204, 536, '#B9AFCB')}${flor2(222, 546, '#F0E2B8')}${flor2(26, 548, '#E9C46A')}${flor2(300, 540, '#B9AFCB')}${flor2(318, 548, '#B9AFCB')}${flor2(260, 552, '#E9C46A')}
  </svg>`;
}

/* ---------------- Escalera de un nivel (vista de nivel) ---------------- */
const NV_W = 360, NV_H = 380;
const escX = i => 24 + (i - 1) * 38, escY = i => 304 - (i - 1) * 34;   // esquina superior izquierda de la cara frontal
function posPj(i) { return i <= 0 ? { x: 20, y: 322 } : { x: escX(i) + 28, y: escY(i) - 6 }; }
const nvClase = (i, paso, final) => i < paso ? 'hecho' : i === paso ? (final ? 'hecho' : 'actual') : 'futuro';

function nivelSVG(paso, o = {}) {
  const u = o.u || 'n', desde = o.desde != null ? o.desde : paso, final = !!o.final;
  let pasos = '';
  for (let i = 1; i <= ESCALONES; i++) {
    const x = escX(i), y = escY(i), w = 54, h = 44, c = nvClase(i, desde, final);
    pasos += `<g class="nv-st ${c}" data-i="${i}">
      <path class="sd" d="M${x + w} ${y}l14 -10v${h}l-14 10Z"/>
      <rect class="f" x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/>
      <path class="top" d="M${x} ${y}l14 -10h${w}l-14 10Z"/>
      <text class="num" x="${x + w / 2 - 4}" y="${y + 29}" text-anchor="middle">${i}</text>
      <g class="chk" transform="translate(${x + w - 9} ${y + 34})"><circle r="8.4"/><path d="M-3.6 .4l2.6 2.6 5-5.4"/></g>
    </g>`;
  }
  const f = { x: escX(7) + 44, y: escY(7) - 12 };
  const a = posPj(desde);
  return `<svg class="nivel-svg" viewBox="0 0 ${NV_W} ${NV_H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
    <defs>
      <linearGradient id="nc${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FAF6EF"/><stop offset=".5" stop-color="#F6E8D6"/><stop offset="1" stop-color="#EFE6D6"/></linearGradient>
      <radialGradient id="ns${u}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF1C9" stop-opacity=".9"/><stop offset="1" stop-color="#FFF1C9" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="${NV_W}" height="${NV_H}" fill="url(#nc${u})"/>
    <circle cx="290" cy="70" r="110" fill="url(#ns${u})"/>
    <path d="M-10 250L30 176L66 214L112 130L170 220L214 170L262 238L300 250Z" fill="#C0CAD2"/>
    <path d="M150 262L216 160L262 120L312 176L372 140L372 270Z" fill="#B0BDC9"/>
    <path d="M262 120L290 156L312 176L330 200L262 200Z" fill="#8FA0B0" opacity=".5"/>
    <path d="M44 252L70 214L112 130L98 190Z" fill="#CBD5DC" opacity=".7"/>
    ${nube(60, 120, .9, .9)}${nube(250, 214, .8, .8)}
    <g transform="translate(0 -34)">
    <path d="M-10 300Q60 270 140 268T290 240T372 236V460H-10Z" fill="#B0C39A" opacity=".8"/>
    <path d="M-10 392L372 62V460H-10Z" fill="#8DAE6F"/>
    <path d="M-10 410L372 100V460H-10Z" fill="#7BA05B"/>
    ${pino(334, 168, 52, '#4F6E4A', '#5E7E52')}${pino(352, 150, 44, '#476445', '#5C7C50')}${pino(318, 184, 40, '#5E7E52', '#4F6E4A')}
    <path d="M300 -6C318 22 340 28 372 20" stroke="#6B5A44" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${[[306, 8, -30], [320, 22, 20], [334, 26, -10], [348, 20, 25], [360, 14, -20], [318, 4, 10]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="5" transform="rotate(${r} ${x} ${y})" fill="${r > 0 ? '#7FA063' : '#8DAE6F'}"/>`).join('')}
    <path d="M-6 392Q18 354 54 360Q86 364 92 392Z" fill="#9FA59B"/>
    <path d="M260 218Q276 192 306 196Q330 200 336 226Z" fill="#A5ABA1"/><path d="M270 216Q284 200 304 202Q300 214 270 218Z" fill="#BDC1B7"/>
    ${pasos}
    <g class="nv-bandera" transform="translate(${f.x} ${f.y})"><line x1="0" y1="0" x2="0" y2="-34" stroke="#8D8779" stroke-width="1.6"/><path d="M0 -34l21 7.4l-21 7.4Z" fill="${final || desde >= ESCALONES ? '#86A957' : '#A7C36E'}"/></g>
    ${[[16, 372, '#B9AFCB'], [28, 380, '#B9AFCB'], [44, 372, '#E9C46A'], [108, 340, '#B9AFCB'], [118, 348, '#B9AFCB'], [180, 300, '#E9C46A'], [190, 308, '#B9AFCB'], [300, 340, '#B9AFCB'], [312, 350, '#B9AFCB'], [334, 330, '#B9AFCB']].map(([x, y, c]) => flor2(x, y, c)).join('')}
    ${o.sinPj ? '' : `<g class="pj" id="pj-nivel" style="transform:translate(${a.x}px,${a.y}px)">${pjSVG(1.18)}</g>`}
    </g>
  </svg>`;
}
