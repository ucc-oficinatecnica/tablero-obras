'use strict';
/* =====================================================================
   JUEGO: reglas, pantallas y guardado.
   Bloques: utilidades · estado · reglas · casa/decoración · pantallas ·
            ventanas · modo desarrollo · eventos · arranque
   ===================================================================== */

/* ---------------- utilidades ---------------- */
let S;                                   // todo lo que se guarda
const UI = { tab: 'camino', cam: { modo: 'general', nivel: null, anim: null }, modo: 'sala', sala: null, sel: null, cat: 'todo', cola: [], activo: null, u: 0, firma: '', arrastrando: false };
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const p2 = n => String(n).padStart(2, '0');
const hh = h => p2(h) + ':00';
const salaDe = id => SALAS.find(s => s.id === id);
const salaDeNivel = n => SALAS[Math.min(n, SALAS.length) - 1];
const PAL = () => ESTILOS[S.estilo].P;

/* ---------------- tiempo (el modo desarrollo puede adelantar el reloj) ---------------- */
const ahora = () => new Date(Date.now() + ((S && S.dev && S.dev.off) || 0));
const clave = d => d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
const sumaDias = (k, n) => { const [y, m, d] = k.split('-').map(Number); return clave(new Date(y, m - 1, d + n)); };

/* ---------------- estado y guardado ---------------- */
const nuevoDia = f => ({ fecha: f, checks: {}, subio: false, claims: { m: false, t: false, n: false }, premio: false });
function nuevoEstado() {
  return {
    v: 1, nombre: '', estilo: 'minimalista', personaje: true, dev: { on: false, off: 0 },
    hojas: 60,
    nivel: 1, escalon: 0, fuego: false, completados: [], casaCompleta: false,
    hab: HABITOS_BASE.map(h => ({ ...h })),
    hoy: nuevoDia(clave(new Date())),
    inv: { cama_basica: 1 },
    casa: { dormitorio: { objs: [{ u: 'o1', id: 'cama_basica', x: 150, y: 270, f: 0 }] } },
    meta: null,
    stats: { racha: 0, mejor: 0, dias: 0, sinObjeto: 0 },
    avisos: [], bienvenida: false, peso: { ini: '', act: '' }, cont: 2, ultimoUso: null
  };
}
let memoria = null;
function cargar() {
  const base = nuevoEstado();
  let raw = null;
  try { raw = localStorage.getItem(CLAVE_GUARDADO); } catch (e) { raw = memoria; }
  S = base;
  if (raw) {
    try {
      const o = JSON.parse(raw);
      S = Object.assign(base, o);
      S.dev = Object.assign({ on: false, off: 0 }, o.dev);
      S.stats = Object.assign(nuevoEstado().stats, o.stats);
      S.peso = Object.assign({ ini: '', act: '' }, o.peso);
    } catch (e) { S = nuevoEstado(); }
  }
  if (!raw) S.hoy = nuevoDia(clave(ahora()));
}
function guardar() {
  S.ultimoUso = ahora().toISOString();
  const txt = JSON.stringify(S);
  try { localStorage.setItem(CLAVE_GUARDADO, txt); UI.sinGuardado = false; } catch (e) { memoria = txt; UI.sinGuardado = true; }
}

/* ---------------- avisos breves ---------------- */
let toastT;
function toast(t) {
  const el = $('#toast'); el.textContent = t; el.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2600);
}

/* =====================================================================
   REGLAS DEL JUEGO
   ===================================================================== */
const habReq = () => S.hab.filter(h => h.req);
const hechos = () => habReq().filter(h => S.hoy.checks[h.id]).length;

/* Pasa de día: si ayer no se completó la misión, se activa el Día de fuego;
   si ya estaba activo, el nivel actual vuelve al escalón 0 (nunca se pierden niveles completados). */
function cerrarDia() {
  const d = S.hoy;
  if (d.subio) { S.stats.racha++; S.stats.mejor = Math.max(S.stats.mejor, S.stats.racha); }
  else {
    S.stats.racha = 0;
    if (S.escalon > 0 && !S.casaCompleta) {
      if (S.fuego) { S.escalon = 0; S.fuego = false; S.avisos.push({ t: 'reinicio', n: S.nivel }); }
      else { S.fuego = true; S.avisos.push({ t: 'fuego', e: S.escalon }); }
    }
  }
  S.hoy = nuevoDia(sumaDias(d.fecha, 1));
}
function avanzarDias() {
  const k = clave(ahora());
  let cambio = false, guardia = 0;
  while (S.hoy.fecha < k && guardia++ < 400) { cerrarDia(); cambio = true; }
  if (S.avisos.length > 1) S.avisos = S.avisos.slice(-1);
  return cambio;
}

function checkMision() {
  const req = habReq();
  if (!S.hoy.subio && req.length && req.every(h => S.hoy.checks[h.id])) subirEscalon();
}
function alternar(id) {
  if (S.hoy.subio) { toast('La misión de hoy ya está completa. ¡Hasta mañana!'); return; }
  S.hoy.checks[id] = !S.hoy.checks[id];
  try { if (navigator.vibrate) navigator.vibrate(S.hoy.checks[id] ? 28 : 8); } catch (e) { /* nada */ }
  guardar(); render(); checkMision();
}

function subirEscalon() {
  const d = S.hoy; if (d.subio) return;
  d.subio = true; S.stats.dias++;
  const defendio = S.fuego; S.fuego = false;
  const antes = S.escalon;
  const sube = !defendio || DEFENSA_TAMBIEN_SUBE;
  if (sube) S.escalon = antes + 1;
  guardar();
  if (S.escalon >= ESCALONES) completarNivel(antes, defendio);
  else modal(modalSubida(antes, S.escalon, defendio));
}
function completarNivel(antes, defendio) {
  const hecho = S.nivel;
  S.completados.push(hecho);
  S.hojas += PREMIO_NIVEL.hojas;
  const hayMas = hecho < SALAS.length;
  if (hayMas) { S.nivel = hecho + 1; S.escalon = 0; } else { S.casaCompleta = true; S.escalon = ESCALONES; }
  S.fuego = false;
  const caja = abrirCajaRegalo(PREMIO_NIVEL.caja);
  guardar();
  modal(modalSubida(antes, ESCALONES, defendio));
  modal(modalNivel(hecho, hayMas));
  modal(modalReveal({ etq: 'Regalo por completar el nivel', titulo: 'Una caja te espera', hojas: PREMIO_NIVEL.hojas, item: caja }));
}

/* ---- sorteos ---- */
function elegirPeso(tabla) {
  const total = Object.values(tabla).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const k in tabla) { r -= tabla[k]; if (r <= 0) return k; }
  return Object.keys(tabla)[0];
}
function sortearItem(rar) {
  let pool = ITEMS.filter(i => i.r === rar && !i.inicial);
  if (rar === 'x') pool = pool.filter(i => !(S.inv[i.id] > 0));
  if (!pool.length) return sortearItem(rar === 'x' ? 'r' : 'e');
  const pesos = pool.map(i => (S.inv[i.id] > 0 ? 1 : 3));
  let r = Math.random() * pesos.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { r -= pesos[i]; if (r <= 0) return pool[i]; }
  return pool[0];
}
function darItem(id) { const nuevo = !(S.inv[id] > 0); S.inv[id] = (S.inv[id] || 0) + 1; return { it: ITEM[id], nuevo }; }
function abrirCajaRegalo(tipo) { return darItem(sortearItem(elegirPeso(CAJAS[tipo].tabla)).id); }

/* ---- entradas de mañana / tarde / noche ---- */
const disponible = k => ahora().getHours() >= HORAS[k];
function reclamar(k) {
  const cfg = SOBRES[k];
  if (S.hoy.claims[k] || !disponible(k)) return;
  S.hoy.claims[k] = true; S.hojas += cfg.hojas;
  let item = null;
  if (S.stats.sinObjeto >= SIN_OBJETO_MAX || Math.random() < cfg.pObj) { item = darItem(sortearItem(elegirPeso(cfg.tabla)).id); S.stats.sinObjeto = 0; }
  else S.stats.sinObjeto++;
  guardar(); render();
  modal(modalReveal({ etq: 'Entrada de ' + cfg.n.toLowerCase(), titulo: 'Sobre de ' + cfg.n.toLowerCase(), hojas: cfg.hojas, item }));
}
function reclamarPremio() {
  const c = S.hoy.claims;
  if (S.hoy.premio || !(c.m && c.t && c.n)) return;
  S.hoy.premio = true; S.hojas += PREMIO_DIA.hojas;
  const item = darItem(sortearItem(elegirPeso(PREMIO_DIA.tabla)).id);
  guardar(); render();
  modal(modalReveal({ etq: 'Las tres entradas de hoy', titulo: 'Premio especial del día', hojas: PREMIO_DIA.hojas, item }));
}

/* ---- tienda ---- */
function comprar(id) {
  const it = ITEM[id];
  if (!it.p || S.hojas < it.p) return false;
  S.hojas -= it.p; darItem(id);
  if (S.meta === id) S.meta = null;
  guardar(); render(); return true;
}
function comprarCaja(tipo) {
  const c = CAJAS[tipo];
  if (S.hojas < c.p) { toast('Te faltan ' + (c.p - S.hojas) + ' hojas para esta caja'); return; }
  S.hojas -= c.p;
  const item = abrirCajaRegalo(tipo);
  guardar(); render();
  modal(modalReveal({ etq: 'Sorpresa', titulo: c.n, hojas: 0, item }));
}

/* =====================================================================
   CASA Y DECORACIÓN
   ===================================================================== */
const enSala = id => S.casa[id] || (S.casa[id] = { objs: [] });
const objsDe = id => (S.casa[id] && S.casa[id].objs) || [];
const objDe = u => objsDe(UI.sala).find(o => o.u === u);
function colocados(id) { let n = 0; for (const k in S.casa) for (const o of S.casa[k].objs) if (o.id === id) n++; return n; }
const libres = id => (S.inv[id] || 0) - colocados(id);
const listaLibres = () => ITEMS.filter(i => libres(i.id) > 0);
const abierta = id => S.casaCompleta || SALAS.findIndex(s => s.id === id) + 1 <= S.nivel;

function limitar(it, x, y) {
  x = Math.max(it.w / 2 + 2, Math.min(ANCHO - it.w / 2 - 2, x));
  let lo, hi;
  if (it.capa === 'pared') { lo = it.h + 14; hi = SUELO - 10; }
  else if (it.capa === 'alfombra') { lo = SUELO + it.h * .85; hi = ALTO - 4; }
  else if (it.capa === 'piso') { lo = SUELO + 16; hi = ALTO - 6; }
  else { lo = it.h + 4; hi = ALTO - 4; }
  hi = Math.max(hi, lo);
  return { x, y: Math.max(lo, Math.min(hi, y)) };
}
function posIni(it, n) {
  const off = (n % 5 - 2) * 38;
  const p = it.capa === 'pared' ? { x: 180 + off * 1.4, y: 110 + it.h / 2 }
    : it.capa === 'alfombra' ? { x: 180, y: ALTO - 14 }
    : it.capa === 'piso' ? { x: 180 + off, y: 292 } : { x: 180 + off, y: 278 };
  return limitar(it, p.x, p.y);
}
function colocar(id) {
  if (libres(id) <= 0) return;
  if (!UI.sala || !abierta(UI.sala)) UI.sala = salaDeNivel(S.nivel).id;
  const it = ITEM[id], sala = enSala(UI.sala);
  const p = posIni(it, sala.objs.filter(o => ITEM[o.id].capa === it.capa).length);
  const ob = { u: 'o' + (S.cont++), id, x: p.x, y: p.y, f: 0 };
  sala.objs.push(ob); UI.sel = ob.u; guardar();
}
function efectos() {
  const ef = { agua: false, comida: 0, mov: false, prep: false };
  S.hab.forEach(h => {
    if (!S.hoy.checks[h.id]) return;
    if (h.ef === 'agua') ef.agua = true; else if (h.ef === 'comida') ef.comida++; else if (h.ef === 'mov') ef.mov = true; else if (h.ef === 'prep') ef.prep = true;
  });
  return ef;
}
function escenaDe(salaId, o = {}) {
  return escena({ sala: salaId, objs: objsDe(salaId), P: PAL(), sel: o.sel, edit: o.edit, personaje: S.personaje, ef: efectos(), u: 's' + (UI.u++), anid: o.anid });
}

/* =====================================================================
   PANTALLAS
   ===================================================================== */
const TITULOS = { casa: 'Mi casa', tienda: 'Tienda', perfil: 'Perfil' };
function pintarTop() {
  const izq = UI.tab === 'camino' ? `<div class="marca">${ico('hoja', 25)}<span>Mi Camino</span></div>` : `<div class="ttl">${TITULOS[UI.tab]}</div>`;
  $('#top').innerHTML = `${izq}<div class="der"><button class="chip-hojas" id="chip-hojas" data-a="ir" data-t="tienda" aria-label="Tus hojas">${hojaMoneda(17)}<span>${S.hojas}</span></button></div>`;
}
function pintarNav() {
  const tabs = [['camino', 'Camino', 'n_camino'], ['casa', 'Mi casa', 'n_casa'], ['tienda', 'Tienda', 'n_tienda'], ['perfil', 'Perfil', 'perfil']];
  const nuevo = listaLibres().length > 0;
  $('#nav').innerHTML = tabs.map(([k, n, i]) => `<button class="${UI.tab === k ? 'on' : ''}" data-a="ir" data-t="${k}"><span class="ic">${ico(i, 23)}${k === 'casa' && nuevo && UI.tab !== 'casa' ? '<i class="punto"></i>' : ''}</span><span>${n}</span></button>`).join('');
  $('#devbtn').innerHTML = S.dev.on ? `<button data-a="devAbrir">DEV</button>` : '';
}

const saludo = () => { const h = ahora().getHours(); return h < 6 ? 'Buenas noches' : h < 13 ? 'Buen día' : h < 20 ? 'Buenas tardes' : 'Buenas noches'; };
const fechaLarga = () => { const t = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(ahora()); return t.charAt(0).toUpperCase() + t.slice(1); };
const barritas = step => `<span class="barritas">${Array.from({ length: ESCALONES }, (_, i) => `<i class="${i < step ? 'h' : ''}" style="height:${6 + i * 2}px"></i>`).join('')}</span>`;

function proxima() {
  const c = S.hoy.claims;
  for (const k of ['m', 't', 'n']) {
    if (c[k]) continue;
    return disponible(k) ? `Tu sobre de ${SOBRES[k].n.toLowerCase()} ya está listo.` : `Tu sobre de ${SOBRES[k].n.toLowerCase()} se abre a las ${hh(HORAS[k])}.`;
  }
  if (!S.hoy.premio) return 'Tu premio especial del día te está esperando.';
  return `Mañana desde las ${hh(HORAS.m)} hay un sobre nuevo.`;
}
function bannerFuego(largo) {
  if (!S.fuego || S.hoy.subio) return '';
  return `<div class="banner-fuego">${ico('fuego', 22)}<div><b>Día de fuego</b><span>${largo ? `Ayer no se completó la misión. Si hoy la completás, defendés tu escalón ${S.escalon} y seguís como si nada.` : `Hoy podés defender tu escalón ${S.escalon}.`}</span></div></div>`;
}

/* ---------------- CAMINO: pantalla principal ---------------- */
const ICO_SALA = { dormitorio: 'r_dormitorio', living: 'n_casa', cocina: 'r_cocina', bano: 'r_bano', estudio: 'r_estudio', terraza: 'sol', jardin: 'r_jardin' };
const nEstado = n => S.completados.includes(n) ? 'hecho' : n === S.nivel ? 'actual' : 'futuro';
const pasoDe = n => { const e = nEstado(n); return e === 'hecho' ? ESCALONES : e === 'actual' ? S.escalon : 0; };

function bloqueSobres() {
  const c = S.hoy.claims, tres = c.m && c.t && c.n;
  const sobres = ['m', 't', 'n'].map(k => {
    const est = c[k] ? 'ok' : disponible(k) ? 'listo' : 'bloq';
    const sub = est === 'ok' ? 'Abierto' : est === 'listo' ? 'Tocá para abrir' : 'Desde las ' + hh(HORAS[k]);
    return `<button class="sobre ${est}" data-a="sobre" data-k="${k}" ${est === 'listo' ? '' : 'disabled'}>${sobreSVG(k, est)}<span class="nombre">${SOBRES[k].n}</span><span class="sub">${sub}</span></button>`;
  }).join('');
  const premioEst = S.hoy.premio ? 'ok' : tres ? 'listo' : '';
  const tag = tres && !S.hoy.premio ? 'button data-a="premio"' : 'div', cierre = tres && !S.hoy.premio ? 'button' : 'div';
  return `<div class="s-lbl" style="margin-bottom:10px">Tus entradas de hoy</div>
    <div class="sobres">${sobres}</div>
    <${tag} class="premio-dia ${premioEst}" style="width:100%;text-align:left">
      <span style="color:${tres ? '#8579A8' : 'var(--ink3)'}">${ico('regalo', 24)}</span>
      <span style="flex:1"><b style="font-weight:600">Premio especial del día</b><br><span class="peq suave">${S.hoy.premio ? 'Ya lo abriste hoy' : tres ? 'Listo para abrir' : 'Abrí las tres entradas para desbloquearlo'}</span></span>
      <span class="puntos">${[c.m, c.t, c.n].map(x => `<i class="${x ? 'h' : ''}"></i>`).join('')}</span></${cierre}>
    <div class="prox">${ico('hoja', 16)}<span>${proxima()}</span></div>`;
}

function anilloSVG(n, tot) {
  const r = 24, c = 2 * Math.PI * r, f = tot ? Math.min(1, n / tot) : 0;
  return `<svg viewBox="0 0 60 60" class="cta-anillo"><circle cx="30" cy="30" r="${r}" fill="rgba(255,255,255,.16)" stroke="rgba(255,255,255,.35)" stroke-width="6"/><circle cx="30" cy="30" r="${r}" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-dasharray="${f * c} ${c}" transform="rotate(-90 30 30)"/><text x="30" y="35.5" text-anchor="middle" font-size="16" font-weight="800" fill="#fff">${n}/${tot}</text></svg>`;
}
function vGeneral() {
  const estados = SALAS.map((_, i) => nEstado(i + 1)), sa = salaDeNivel(S.nivel);
  const n = hechos(), tot = habReq().length;
  let cta;
  if (S.casaCompleta) cta = `<button class="cta ok" data-a="nivelVer" data-n="${S.nivel}"><span class="cta-ic">${ico('copa', 32)}</span><span class="cta-t"><b>¡Llegaste a la cumbre!</b><small>Completaste los 7 niveles</small></span>${ico('der', 24)}</button>`;
  else if (S.hoy.subio) cta = `<button class="cta ok" data-a="nivelVer" data-n="${S.nivel}"><span class="cta-ic">${ico('check', 32)}</span><span class="cta-t"><b>¡Misión de hoy cumplida!</b><small>Subiste al escalón ${S.escalon} de ${ESCALONES}</small></span>${ico('der', 24)}</button>`;
  else cta = `<button class="cta" data-a="nivelVer" data-n="${S.nivel}">${anilloSVG(n, tot)}<span class="cta-t"><b>Hacer mi misión de hoy</b><small>${tot - n === 0 ? 'Todo listo' : 'Te faltan ' + (tot - n) + (tot - n === 1 ? ' hábito' : ' hábitos')}</small></span>${ico('der', 24)}</button>`;
  return `<div class="camino ${UI.cam.anim ? 'anim-' + UI.cam.anim : ''}">
    <div class="mapa">${mapaSVG(estados, 'g', S.casaCompleta ? 7 : S.nivel - 1)}
      <div class="cam-tit"><h1>Construyendo mi vida saludable</h1></div>
      <button class="pill-act" data-a="nivelVer" data-n="${S.nivel}"><span class="rm">${ico(ICO_SALA[sa.id], 22)}</span><b>Nivel ${S.nivel}</b><small>Escalón ${S.escalon} de ${ESCALONES}</small></button>
    </div>
    <div class="cam-resto">
      ${cta}
      ${S.fuego && !S.hoy.subio ? '<div class="sep-s"></div>' + bannerFuego(false) : ''}
      <div class="sep"></div>${bloqueSobres()}
    </div></div>`;
}

function misionCard() {
  const n = hechos(), req = habReq(), tot = req.length, bloq = S.hoy.subio;
  const fila = h => `<button class="hab mini ${S.hoy.checks[h.id] ? 'on' : ''} ${bloq ? 'bloqueado' : ''}" data-a="hab" data-id="${h.id}"><span class="icono">${ico(h.ic, 20)}</span><span class="nom">${esc(h.n)}</span><span class="tilde">${ico('check', 14)}</span></button>`;
  const extras = S.hab.filter(h => !h.req);
  return `${S.fuego && !S.hoy.subio ? '<div class="fuego-nv">' + bannerFuego(true) + '</div>' : ''}
    <div class="card mision-card">
      <div class="fila" style="justify-content:space-between"><h3>Misión de hoy</h3><span class="mc-n">${n} de ${tot}</span></div>
      ${bloq ? `<p class="peq suave" style="margin:6px 0 10px">Misión cumplida. Hoy subiste al escalón ${S.escalon}${S.escalon >= ESCALONES ? '' : ' de ' + ESCALONES}.</p>` : `<div class="barra" style="margin:10px 0 12px"><i style="width:${tot ? n / tot * 100 : 0}%"></i></div>`}
      <div class="habs">${req.map(fila).join('')}</div>
      ${extras.length ? `<div class="s-lbl extras-t">Extras · no cuentan</div><div class="habs">${extras.map(fila).join('')}</div>` : ''}
      <button class="link" data-a="habEditar">${ico('editar', 15)} Editar mis hábitos</button>
    </div>`;
}

function vNivel(n) {
  const sa = SALAS[n - 1], e = nEstado(n), paso = pasoDe(n);
  const dots = Array.from({ length: ESCALONES }, (_, i) => `<i class="${i < paso ? 'h' : ''}"></i>`).join('');
  let panel;
  if (e === 'actual') panel = misionCard();
  else if (e === 'hecho') panel = `<div class="card nv-panel"><span class="anillo" style="margin:0 auto 10px;width:52px;height:52px">${ico('copa', 24)}</span><h3>¡Terminaste este nivel!</h3><p class="peq suave" style="margin:4px 0 14px">Quedó guardado para siempre.</p><button class="btn bloque" data-a="irSala" data-id="${sa.id}">Ir a decorar</button></div>`;
  else panel = `<div class="card nv-panel"><span style="color:var(--ink3)">${ico('candado', 24)}</span><h3 style="margin-top:6px">Todavía bloqueado</h3><p class="peq suave" style="margin-top:4px">Se desbloquea al completar el Nivel ${n - 1}.</p></div>`;
  return `<div class="nivel-vista ${UI.cam.anim ? 'anim-' + UI.cam.anim : ''}">
    <div class="nv-head"><button class="redondo" data-a="verGeneral" aria-label="Volver al camino">${ico('izq', 18)}</button>
      <div class="nv-sala"><span class="nv-ic">${ico(ICO_SALA[sa.id], 28)}</span><div><h2>Nivel ${n}</h2></div></div></div>
    <div class="nv-esc">${e === 'hecho' ? 'Nivel completado' : `Escalón ${paso} de ${ESCALONES}`}</div><div class="nv-dots">${dots}</div>
    <div class="nv-ilu">${nivelSVG(paso, { u: 'v', final: e === 'hecho', sinPj: e === 'futuro' })}<button class="zoom" data-a="verGeneral" aria-label="Ver todo el camino">${ico('zoom_menos', 22)}</button></div>
    <div class="nv-panel-w">${panel}</div></div>`;
}
const vCamino = () => UI.cam.modo === 'nivel' ? vNivel(UI.cam.nivel || S.nivel) : vGeneral();

function htmlBarra() {
  const ob = UI.sel && objDe(UI.sel);
  if (!ob) return `<p class="ayuda">Tocá un objeto para moverlo, girarlo, cambiarlo o guardarlo.</p>`;
  return `<div style="width:100%;text-align:center"><div class="peq suave" style="margin-bottom:8px">${ITEM[ob.id].n}</div>
    <div class="fila" style="justify-content:center;gap:8px">
      <button class="btn sec" data-a="voltear">${ico('voltear', 18)} Girar</button>
      <button class="btn sec" data-a="cambiar">${ico('cambiar', 18)} Cambiar</button>
      <button class="btn sec" data-a="guardarObj">${ico('guardar', 18)} Guardar</button></div></div>`;
}
function pintarBarra() { const b = $('#barra'); if (b) b.innerHTML = htmlBarra(); }

function vCasa() {
  if (!UI.sala || !abierta(UI.sala)) UI.sala = salaDeNivel(S.nivel).id;
  const seg = `<div class="seg"><button class="${UI.modo === 'sala' ? 'on' : ''}" data-a="modo" data-m="sala">Ambiente</button><button class="${UI.modo === 'plano' ? 'on' : ''}" data-a="modo" data-m="plano">Mi casa</button></div>`;
  if (UI.modo === 'plano') return seg + vPlano();
  const sa = salaDe(UI.sala), i = SALAS.indexOf(sa), hecho = S.completados.includes(i + 1);
  const estado = hecho ? 'Terminado' : `Escalón ${S.escalon} de ${ESCALONES}`;
  const hayPrev = i > 0, hayNext = i + 1 < SALAS.length && abierta(SALAS[i + 1].id);
  if (UI.sel && !objDe(UI.sel)) UI.sel = null;
  const libre = listaLibres();
  const tira = libre.length
    ? `<div class="tira">${libre.map(it => `<button class="thumb" data-a="poner" data-id="${it.id}" aria-label="Colocar ${esc(it.n)}">${itemSVG(it.id, PAL())}${libres(it.id) > 1 ? `<span class="cnt">×${libres(it.id)}</span>` : ''}</button>`).join('')}</div>`
    : `<div class="tira"><div class="vacio">Todo lo que tenés está en tu ${sa.n.toLowerCase()}. Pasá por la tienda o abrí tus sobres.</div></div>`;
  return `${seg}
    <div class="sala-nav"><button class="redondo" data-a="salaMover" data-d="-1" ${hayPrev ? '' : 'disabled'} aria-label="Ambiente anterior">${ico('izq', 18)}</button>
      <div class="centro"><div class="s-lbl">Nivel ${i + 1} · ${estado}</div><h2>${sa.n}</h2></div>
      <button class="redondo" data-a="salaMover" data-d="1" ${hayNext ? '' : 'disabled'} aria-label="Ambiente siguiente">${ico('der', 18)}</button></div>
    <div class="escena-wrap">${escenaDe(UI.sala, { edit: true, sel: UI.sel })}</div>
    <div class="barra-sel" id="barra">${htmlBarra()}</div>
    <div class="s-lbl" style="margin:10px 0 4px">Guardado en tu inventario</div>
    ${tira}
    <div class="acciones"><button class="btn sec" data-a="ir" data-t="tienda">${ico('n_tienda', 18)} Tienda</button><button class="btn sec" data-a="estiloAbrir">${ico('hoja', 18)} Estilo</button></div>`;
}

function vPlano() {
  let s = `<svg class="plano" viewBox="0 0 360 452" xmlns="http://www.w3.org/2000/svg">`;
  s += `<rect x="6" y="108" width="348" height="256" rx="18" fill="none" stroke="#E2D8C6" stroke-width="1.2" stroke-dasharray="2 5"/>`;
  SALAS.forEach((sa, i) => {
    const b = PLANO[sa.id], idx = i + 1, ab = abierta(sa.id), hecho = S.completados.includes(idx), actual = idx === S.nivel && !hecho;
    const label = sa.corto + (actual ? ` · ${S.escalon}/${ESCALONES}` : '');
    const lw = label.length * 6.1 + (hecho ? 30 : 18);
    if (ab) {
      s += `<g class="celda" data-a="irSala" data-id="${sa.id}"><clipPath id="cp-${sa.id}"><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="14"/></clipPath>
        <g clip-path="url(#cp-${sa.id})">${escenaDe(sa.id, { anid: b })}</g>
        <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="14" fill="none" stroke="${actual ? '#C47A5A' : '#D9CFBC'}" stroke-width="${actual ? 2 : 1.2}"/>
        <rect x="${b.x + 8}" y="${b.y + b.h - 28}" width="${lw}" height="20" rx="10" fill="rgba(255,253,249,.92)"/>
        <text x="${b.x + 17}" y="${b.y + b.h - 14}" font-size="10.5">${esc(label)}</text>
        ${hecho ? `<path d="M${b.x + lw - 6} ${b.y + b.h - 18}l3 3 5.5-6" fill="none" stroke="#6F8A6D" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>` : ''}</g>`;
    } else {
      s += `<g><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="14" fill="#F3ECDF" stroke="#D8CDB9" stroke-dasharray="4 4" stroke-width="1.2"/>
        <g transform="translate(${b.x + b.w / 2 - 10} ${b.y + b.h / 2 - 22}) scale(.85)" fill="none" stroke="#B9AE9B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${ICO.candado}"/></g>
        <text x="${b.x + b.w / 2}" y="${b.y + b.h / 2 + 16}" font-size="10.5" text-anchor="middle" style="fill:#A89E8D">${esc(sa.corto)}</text></g>`;
    }
  });
  s += `</svg>`;
  return `${s}<p class="ayuda" style="margin-top:8px">Tocá un ambiente para entrar. Los que todavía no abriste se desbloquean al completar el nivel anterior.</p>`;
}

function vTienda() {
  const chips = CATS.map(([k, n]) => `<button class="chip ${UI.cat === k ? 'on' : ''}" data-a="cat" data-k="${k}">${n}</button>`).join('');
  let cuerpo;
  if (UI.cat === 'sorpresas') {
    cuerpo = Object.entries(CAJAS).map(([k, c]) => {
      const odds = Object.entries(c.tabla).map(([r, v]) => `${RAREZAS[r].n.toLowerCase()} ${Math.round(v / Object.values(c.tabla).reduce((a, b) => a + b, 0) * 100)}%`).join(' · ');
      return `<div class="card caja-card"><div class="caja-ico ${k}">${ico('regalo', 28)}</div><div style="flex:1"><h3>${c.n}</h3><div class="peq suave">${c.txt}</div><div class="peq" style="color:var(--ink3);margin-top:2px">${odds}</div></div>
        <button class="btn chico ${S.hojas < c.p ? 'off' : ''}" data-a="caja" data-k="${k}" style="flex-direction:column;gap:0;min-height:48px">${hojaMoneda(14)}<span>${c.p}</span></button></div>`;
    }).join('') + `<p class="ayuda">Los objetos exclusivos solo salen en sorpresas y en el premio del día.</p>`;
  } else {
    const lista = ITEMS.filter(i => i.p > 0 && (UI.cat === 'todo' || CAT_TIENDA[i.gr] === UI.cat)).sort((a, b) => a.p - b.p);
    cuerpo = `<div class="grilla">${lista.map(it => {
      const tiene = S.inv[it.id] || 0, alcanza = S.hojas >= it.p;
      return `<div class="prod" data-a="ver" data-id="${it.id}" style="cursor:pointer">
        <button class="corazon ${S.meta === it.id ? 'on' : ''}" data-a="meta" data-id="${it.id}" aria-label="Ahorrar para esto">${ico('corazon', 16)}</button>
        ${tiene ? `<span class="tienes">Tenés ${tiene}</span>` : ''}
        <div class="vista">${itemSVG(it.id, PAL())}</div><div class="nom">${it.n}</div>
        <div class="pie"><span class="precio ${alcanza ? '' : 'no'}">${hojaMoneda(14)}${it.p}</span><span class="rar" style="color:${RAREZAS[it.r].col}">${RAREZAS[it.r].n}</span></div></div>`;
    }).join('')}</div>`;
  }
  return `<div class="hola"><h1>Tienda</h1><p class="peq suave" style="margin-top:4px">Tocá el corazón para ahorrar para algo que quieras.</p></div><div class="chips">${chips}</div>${cuerpo}`;
}

function statsHtml() {
  return `<div class="stats">
      <div class="stat"><b>${S.stats.racha}</b><span class="peq suave">días seguidos</span></div>
      <div class="stat"><b>${S.stats.mejor}</b><span class="peq suave">mejor racha</span></div>
      <div class="stat"><b>${S.stats.dias}</b><span class="peq suave">misiones cumplidas</span></div>
      <div class="stat"><b>${ITEMS.filter(i => S.inv[i.id] > 0).length}<span class="peq suave"> / ${ITEMS.length}</span></b><span class="peq suave">objetos descubiertos</span></div></div>`;
}
function largoHtml() {
  const ini = parseFloat(String(S.peso.ini).replace(',', '.')), act = parseFloat(String(S.peso.act).replace(',', '.'));
  let largo = 'Tu objetivo de fondo es cuidarte. Lo que pase con tu cuerpo es una consecuencia de estos hábitos.';
  if (ini > 0 && act > 0) {
    const d = ini - act;
    largo = d > 0.05 ? `${d.toFixed(1).replace('.', ',')} kg menos desde que empezaste. Es la consecuencia de lo que venís construyendo.` : 'Cada cuerpo tiene su ritmo. Lo que se construye ahora es la constancia, y el resto llega.';
  }
  return `<div class="card"><div class="s-lbl" style="margin-bottom:6px">A largo plazo</div><p class="peq">${largo}</p></div>`;
}

function vPerfil() {
  const estilos = Object.entries(ESTILOS).map(([k, e]) => `<button class="estilo-op ${S.estilo === k ? 'on' : ''}" data-a="estilo" data-id="${k}"><span class="mues">${[e.P.wall, e.P.wood, e.P.acc, e.P.acc2].map(c => `<i style="background:${c}"></i>`).join('')}</span>${e.n}</button>`).join('');
  return `
    <div class="hola"><h1>Perfil</h1></div>
    ${statsHtml()}<div class="sep-s"></div>${largoHtml()}<div class="sep"></div>
    <div class="card lista-sep">
      <div><div class="s-lbl" style="margin-bottom:6px">Tu nombre</div><input class="campo" data-i="nombre" value="${esc(S.nombre)}" placeholder="Opcional" maxlength="24"></div>
      <div><div class="s-lbl" style="margin-bottom:8px">Estilo de decoración</div><div class="estilos">${estilos}</div><p class="peq suave" style="margin-top:8px">Cambia los colores de toda tu casa. Tus objetos se quedan donde están.</p></div>
      <div class="fila"><div style="flex:1"><div>Mostrar personaje</div><div class="peq suave">Una figura pequeña que acompaña en cada ambiente.</div></div><button class="interruptor ${S.personaje ? 'on' : ''}" data-a="persToggle" aria-label="Mostrar personaje"></button></div>
    </div>
    <div class="sep-s"></div>
    <button class="card fila" style="width:100%" data-a="habEditar"><span style="flex:1">Editar mis hábitos</span>${ico('der', 18)}</button>
    <div class="sep-s"></div>
    <div class="card lista-sep">
      <div class="s-lbl">A largo plazo · opcional y privado</div>
      <p class="peq suave">Si querés, anotá tu peso. Solo se ve en tu progreso, como un apunte tranquilo.</p>
      <div class="fila"><div style="flex:1"><div class="peq suave">Al empezar (kg)</div><input class="campo" inputmode="decimal" data-i="pesoIni" value="${esc(S.peso.ini)}"></div><div style="flex:1"><div class="peq suave">Hoy (kg)</div><input class="campo" inputmode="decimal" data-i="pesoAct" value="${esc(S.peso.act)}"></div></div>
    </div>
    <div class="sep-s"></div>
    <div class="card lista-sep">
      <div class="s-lbl">Avisos del juego · próximamente</div>
      <p class="peq suave">Más adelante la app podrá avisarte cuando haya algo esperándote, con mensajes como estos:</p>
      <div class="aviso-ej">Hay algo nuevo esperándote en tu habitación.</div>
      <div class="aviso-ej">Tu recompensa de la tarde ya está disponible.</div>
      <div class="aviso-ej">Tu premio de la noche está listo.</div>
    </div>
    <div class="sep-s"></div>
    <div class="card lista-sep">
      <div class="fila"><div style="flex:1"><div>Modo desarrollo</div><div class="peq suave">Para probar mañana, tarde, noche y días siguientes sin esperar.</div></div><button class="interruptor ${S.dev.on ? 'on' : ''}" data-a="devToggle" aria-label="Modo desarrollo"></button></div>
      <button class="btn sec bloque" data-a="reiniciarTodo">Empezar una partida nueva</button>
      ${UI.sinGuardado ? '<p class="peq" style="color:var(--terra)">Este navegador no deja guardar datos: la partida dura solo mientras esta página esté abierta.</p>' : ''}
    </div>`;
}

function vistaActual() {
  switch (UI.tab) {
    case 'casa': return vCasa();
    case 'tienda': return vTienda();
    case 'perfil': return vPerfil();
    default: return vCamino();
  }
}
function render() {
  UI.u = 0;
  pintarTop();
  $('#main').innerHTML = vistaActual();
  UI.cam.anim = null;
  pintarNav();
  if (UI.tab === 'casa' && UI.modo === 'sala') ligarEscena();
}

/* ---------------- mover objetos con el dedo ---------------- */
function aSvg(svg, e) {
  const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}
function marcarSel() { document.querySelectorAll('#escena .obj').forEach(g => g.classList.toggle('sel', g.dataset.u === UI.sel)); }
function ligarEscena() {
  const svg = $('#escena'); if (!svg) return;
  let drag = null;
  svg.addEventListener('pointerdown', e => {
    const g = e.target.closest('.obj');
    if (!g) { if (UI.sel) { UI.sel = null; marcarSel(); pintarBarra(); } return; }
    const ob = objDe(g.dataset.u); if (!ob) return;
    const pt = aSvg(svg, e);
    drag = { ob, g, dx: pt.x - ob.x, dy: pt.y - ob.y, mov: false, x0: e.clientX, y0: e.clientY };
    UI.sel = ob.u; marcarSel(); pintarBarra();
    try { g.setPointerCapture(e.pointerId); } catch (_) { /* no pasa nada */ }
    e.preventDefault();
  });
  svg.addEventListener('pointermove', e => {
    if (!drag) return;
    if (!drag.mov && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 5) return;
    drag.mov = true; UI.arrastrando = true;
    const pt = aSvg(svg, e), it = ITEM[drag.ob.id], p = limitar(it, pt.x - drag.dx, pt.y - drag.dy);
    drag.ob.x = p.x; drag.ob.y = p.y;
    drag.g.setAttribute('transform', `translate(${(p.x - it.w / 2).toFixed(1)} ${(p.y - it.h).toFixed(1)})`);
  });
  const fin = () => { if (!drag) return; const mov = drag.mov; drag = null; UI.arrastrando = false; if (mov) { guardar(); render(); } };
  svg.addEventListener('pointerup', fin);
  svg.addEventListener('pointercancel', fin);
}

/* =====================================================================
   VENTANAS (modales)
   ===================================================================== */
function modal(def) { UI.cola.push(def); if (!UI.activo) sigModal(); }
function sigModal() {
  const def = UI.cola.shift(), host = $('#modal');
  if (!def) { UI.activo = null; host.classList.remove('on'); host.innerHTML = ''; return; }
  def.st = def.st || {}; UI.activo = def;
  pintarModal(); host.classList.add('on');
  if (def.despues) def.despues();
}
function pintarModal() {
  const def = UI.activo; if (!def) return;
  $('#modal').innerHTML = `<div class="velo" data-a="velo"></div><div class="hoja ${def.clase || ''}">${def.html(def.st)}</div>`;
}
function cerrarModal() { const d = UI.activo; if (d && d.alCerrar) d.alCerrar(); sigModal(); render(); }
const btnCerrar = (t = 'Seguir') => `<div class="mod-btns"><button class="btn" data-a="cerrar">${t}</button></div>`;

function animarNivel(hasta) {
  setTimeout(() => {
    const m = $('#modal #pj-nivel'); if (!m) return;
    const p = posPj(hasta);
    m.style.transform = `translate(${p.x}px,${p.y}px)`;
    document.querySelectorAll('#modal .nv-st').forEach(g => {
      g.classList.remove('hecho', 'actual', 'futuro'); g.classList.add(nvClase(+g.dataset.i, hasta, hasta >= ESCALONES));
    });
  }, 600);
}
function modalSubida(desde, hasta, defendio) {
  const txt = defendio
    ? `Volviste con todo. Tu posición quedó defendida y ahora estás en el escalón ${hasta} de ${ESCALONES}.`
    : `Subiste al escalón ${hasta} de ${ESCALONES}.`;
  return { clase: 'centro', despues: () => animarNivel(hasta),
    html: () => `<div class="anillo ${defendio ? 'ter' : ''}">${ico(defendio ? 'fuego' : 'check', 30)}</div>
      <h2 class="mod-t">${defendio ? 'Posición defendida' : 'Misión completada'}</h2><p class="mod-sub" style="margin-bottom:10px">${txt}</p>
      <div class="nv-modal">${nivelSVG(hasta, { desde, u: 'm' })}</div>${btnCerrar('Seguir')}` };
}
function modalNivel(n, hayMas) {
  const sa = SALAS[n - 1], sig = SALAS[n];
  return { clase: 'centro',
    html: () => `<div class="anillo">${ico('copa', 32)}</div>
      <div class="s-lbl">Nivel ${n}</div><h2 class="mod-t" style="margin-top:4px">Nivel completado</h2>
      <p class="mod-sub">Tu ${sa.n.toLowerCase()} quedó terminado y guardado para siempre.${hayMas ? ` Se abrió un ambiente nuevo: <b>${sig.n}</b>.` : ' Completaste toda tu casa.'}</p>
      <div class="pastilla sal">+${PREMIO_NIVEL.hojas} hojas y una caja de regalo</div>
      <div class="mod-btns"><button class="btn" data-a="verSala" data-id="${hayMas ? sig.id : sa.id}">${hayMas ? 'Ir a ' + sig.corto : 'Ver mi casa'}</button>
      <button class="btn sec" data-a="verSala" data-id="${sa.id}">Ver mi ${sa.corto.toLowerCase()} terminado</button></div>` };
}
function modalFuego(e) {
  return { clase: 'centro',
    html: () => `<div class="anillo ter">${ico('fuego', 30)}</div><h2 class="mod-t">Día de fuego</h2>
      <p class="mod-sub">Ayer no se completó la misión, pero tu progreso está a salvo: seguís en el escalón ${e}.<br><br>Si hoy la completás, <b>defendés tu posición</b>. Si hoy tampoco, este nivel vuelve a empezar (nada de lo que ya construiste se pierde).</p>${btnCerrar('Lo tengo')}` };
}
function modalReinicio(n) {
  const sa = salaDeNivel(n);
  return { clase: 'centro',
    html: () => `<div class="anillo">${ico('hoja', 28)}</div><h2 class="mod-t">Empezamos de nuevo</h2>
      <p class="mod-sub">Tu ${sa.n.toLowerCase()} vuelve al escalón 0. Tus objetos, tus hojas y los niveles que ya completaste siguen intactos.<br><br>Cada día es una nueva oportunidad.</p>${btnCerrar('Volver a empezar')}` };
}
function mostrarAvisos() {
  S.avisos.forEach(a => modal(a.t === 'fuego' ? modalFuego(a.e) : modalReinicio(a.n)));
  if (S.avisos.length) { S.avisos = []; guardar(); }
}

function modalReveal(cfg) {
  return { clase: 'centro', st: { abierto: false },
    html: st => {
      if (!st.abierto) return `<div class="s-lbl">${cfg.etq}</div><h2 class="mod-t" style="margin-top:6px">${cfg.titulo}</h2><p class="mod-sub" style="margin-bottom:6px">Tocá para abrir</p>
        <div class="latido" data-a="abrir">${sobreGrande(false)}</div>`;
      const it = cfg.item && cfg.item.it;
      return `<div class="s-lbl revela">${cfg.etq}</div>
        ${cfg.hojas ? `<div class="mas-hojas revela" style="margin-top:8px">${hojaMoneda(24)} +${cfg.hojas}</div>` : ''}
        ${it ? `<div class="obj-card revela d2"><div class="vista" style="background:var(--bg);border-radius:14px">${itemSVG(it.id, PAL())}</div>
          <div style="margin-top:10px;font-size:17px">${it.n}</div>
          <div style="margin-top:4px"><span class="rar" style="color:${RAREZAS[it.r].col};font-size:12.5px;letter-spacing:.06em;text-transform:uppercase">${RAREZAS[it.r].n}</span>${cfg.item.nuevo ? ' · <span class="peq suave">nuevo en tu colección</span>' : ' · <span class="peq suave">ya tenías uno</span>'}</div></div>`
        : `<p class="mod-sub revela d2" style="margin-top:14px">Esta vez solo hojas. Más tarde puede haber algo más.</p>`}
        <div class="mod-btns revela d2">${it ? `<button class="btn" data-a="colocarYa" data-id="${it.id}">Colocarlo en mi casa</button><button class="btn sec" data-a="cerrar">Guardarlo por ahora</button>` : `<button class="btn" data-a="cerrar">Listo</button>`}</div>`;
    } };
}

function modalProducto(id) {
  const it = ITEM[id];
  return { st: { comprado: false },
    html: st => {
      const falta = it.p - S.hojas, tiene = S.inv[id] || 0;
      const vista = `<div class="obj-card" style="margin-top:0;max-width:none"><div class="vista" style="background:var(--bg);border-radius:14px;height:130px">${itemSVG(id, PAL())}</div></div>`;
      if (st.comprado) return `<button class="cerrar-x" data-a="cerrar">${ico('cerrar', 20)}</button>${vista}
        <h2 class="mod-t" style="margin-top:14px">${it.n}</h2><p class="mod-sub">Ya es tuyo y está en tu inventario.</p>
        <div class="mod-btns" style="margin-top:0"><button class="btn" data-a="colocarYa" data-id="${id}">Colocarlo en mi casa</button><button class="btn sec" data-a="cerrar">Seguir mirando</button></div>`;
      return `<button class="cerrar-x" data-a="cerrar">${ico('cerrar', 20)}</button>${vista}
        <h2 class="mod-t" style="margin-top:14px">${it.n}</h2>
        <div class="fila" style="margin-bottom:16px"><span class="rar" style="color:${RAREZAS[it.r].col};font-size:12.5px;letter-spacing:.06em;text-transform:uppercase">${RAREZAS[it.r].n}</span>${tiene ? `<span class="peq suave">· Tenés ${tiene}</span>` : ''}<span style="flex:1"></span><span class="precio" style="font-size:18px">${hojaMoneda(18)}${it.p}</span></div>
        <div class="mod-btns" style="margin-top:0">
          ${falta <= 0 ? `<button class="btn" data-a="comprar" data-id="${id}">Comprar</button>` : `<button class="btn off" disabled>Te faltan ${falta} hojas</button>`}
          <button class="btn sec" data-a="metaModal" data-id="${id}">${ico('corazon', 18)} ${S.meta === id ? 'Dejar de ahorrar para esto' : 'Ahorrar para esto'}</button></div>`;
    } };
}

function modalBienvenida() {
  return { clase: 'centro', fijo: true,
    html: () => `<div class="anillo">${ico('hoja', 28)}</div><h2 class="mod-t">Tu casa te espera</h2>
      <p class="mod-sub">Cada hábito que cuidás hace crecer tu casa. Empezás con un dormitorio casi vacío: completá tu misión de cada día para subir los escalones y abrí tus sobres de mañana, tarde y noche para decorarlo.</p>
      <input class="campo" data-i="nombre" placeholder="¿Cómo te llamo? (opcional)" maxlength="24" style="text-align:center">
      <div class="mod-btns"><button class="btn" data-a="empezar">Entrar a mi casa</button></div>` };
}

function modalEstilo() {
  return { html: () => `<button class="cerrar-x" data-a="cerrar">${ico('cerrar', 20)}</button><h2 class="mod-t">Estilo de decoración</h2><p class="mod-sub">Cambia los colores de toda tu casa.</p>
    <div class="estilos">${Object.entries(ESTILOS).map(([k, e]) => `<button class="estilo-op ${S.estilo === k ? 'on' : ''}" data-a="estiloModal" data-id="${k}"><span class="mues">${[e.P.wall, e.P.wood, e.P.acc, e.P.acc2].map(c => `<i style="background:${c}"></i>`).join('')}</span>${e.n}</button>`).join('')}</div>` };
}
function modalCambiar(u) {
  const ob = objDe(u), it = ITEM[ob.id];
  const op = listaLibres().filter(i => i.gr === it.gr && i.id !== it.id);
  return { html: () => `<button class="cerrar-x" data-a="cerrar">${ico('cerrar', 20)}</button><h2 class="mod-t">Cambiar ${it.n.toLowerCase()}</h2>
    <p class="mod-sub">Elegí otro del inventario. El actual vuelve a guardarse.</p>
    <div class="sel-lista">${op.map(i => `<button class="thumb" style="width:auto" data-a="cambiarPor" data-u="${u}" data-id="${i.id}">${itemSVG(i.id, PAL())}</button>`).join('')}</div>` };
}

function modalHabitos() {
  return { html: () => `<button class="cerrar-x" data-a="habListo">${ico('cerrar', 20)}</button><h2 class="mod-t">Mis hábitos</h2>
    <p class="mod-sub">El tilde verde marca los hábitos <b>obligatorios</b>: son los que forman la misión del día. Los que no lo tienen son extras y no cuentan para subir.</p>
    <div class="lista-hab">${S.hab.map((h, i) => `<div class="hab-ed">
      <button class="mini-b" data-a="habIc" data-id="${h.id}" aria-label="Cambiar ícono">${ico(h.ic, 18)}</button>
      <input class="campo" data-i="habN" data-id="${h.id}" value="${esc(h.n)}" maxlength="28">
      <button class="mini-b ${h.req ? 'on' : ''}" data-a="habReq" data-id="${h.id}" aria-label="Cuenta para la misión" title="Obligatorio">${ico('check', 18)}</button>
      <button class="mini-b" data-a="habUp" data-id="${h.id}" ${i ? '' : 'disabled style="opacity:.3"'} aria-label="Subir">${ico('arriba', 16)}</button>
      <button class="mini-b" data-a="habDel" data-id="${h.id}" aria-label="Quitar">${ico('basura', 16)}</button></div>`).join('')}</div>
    <div class="mod-btns"><button class="btn sec" data-a="habNuevo">${ico('mas', 18)} Agregar un hábito</button><button class="btn" data-a="habListo">Listo</button></div>` };
}

function modalConfirmar(titulo, texto, accion, boton) {
  return { clase: 'centro', html: () => `<h2 class="mod-t">${titulo}</h2><p class="mod-sub">${texto}</p>
    <div class="mod-btns"><button class="btn terra" data-a="${accion}">${boton}</button><button class="btn sec" data-a="cerrar">Cancelar</button></div>` };
}

/* =====================================================================
   MODO DESARROLLO
   ===================================================================== */
function fijarHora(h, m = 0, dias = 0) {
  const t = ahora(); t.setDate(t.getDate() + dias); t.setHours(h, m, 0, 0);
  S.dev.off += t.getTime() - ahora().getTime();
}
function devPanel() {
  return { html: () => {
    const t = ahora();
    return `<button class="cerrar-x" data-a="cerrar">${ico('cerrar', 20)}</button><h2 class="mod-t">Modo desarrollo</h2>
    <div class="dev-info">Reloj del juego: <b>${clave(t)} ${p2(t.getHours())}:${p2(t.getMinutes())}</b>${S.dev.off ? ' (simulado)' : ' (real)'}<br>
      Nivel ${S.nivel} · escalón ${S.escalon} · día de fuego: ${S.fuego ? 'sí' : 'no'} · hábitos ${hechos()}/${habReq().length}${S.hoy.subio ? ' · misión cumplida' : ''}</div>
    <div class="s-lbl" style="margin-bottom:6px;text-align:left">Hora del día</div>
    <div class="dev-grid" style="grid-template-columns:repeat(3,1fr)"><button class="btn sec" data-a="dev" data-k="manana">Mañana</button><button class="btn sec" data-a="dev" data-k="tarde">Tarde</button><button class="btn sec" data-a="dev" data-k="noche">Noche</button></div>
    <div class="s-lbl" style="margin:14px 0 6px;text-align:left">Misión</div>
    <div class="dev-grid"><button class="btn sec" data-a="dev" data-k="completa">Misión completa</button><button class="btn sec" data-a="dev" data-k="incompleta">Misión incompleta</button>
      <button class="btn" data-a="dev" data-k="dia">Siguiente día ›</button><button class="btn sec" data-a="dev" data-k="paso6">Ir al escalón 6</button></div>
    <div class="s-lbl" style="margin:14px 0 6px;text-align:left">Otros</div>
    <div class="dev-grid"><button class="btn sec" data-a="dev" data-k="hojas">+100 hojas</button><button class="btn sec" data-a="dev" data-k="entradas">Reiniciar entradas</button>
      <button class="btn sec" data-a="dev" data-k="real">Volver a hora real</button><button class="btn sec" data-a="dev" data-k="salir">Apagar modo dev</button></div>` ;
  } };
}
function devHacer(k) {
  if ((k === 'completa' || k === 'dia') && UI.activo && UI.activo.devPanel) cerrarModal();
  switch (k) {
    case 'manana': fijarHora(8); break;
    case 'tarde': fijarHora(14); break;
    case 'noche': fijarHora(21); break;
    case 'dia': fijarHora(6, 30, 1); break;
    case 'completa':
      if (S.hoy.subio) { toast('La misión de hoy ya está completa. Probá con «Siguiente día».'); return; }
      habReq().forEach(h => { S.hoy.checks[h.id] = true; }); guardar(); render(); checkMision(); break;
    case 'incompleta':
      if (S.hoy.subio) { toast('Hoy ya está cumplida. Probá con «Siguiente día».'); return; }
      S.hoy.checks = {}; habReq().slice(0, Math.max(0, habReq().length - 3)).forEach(h => { S.hoy.checks[h.id] = true; });
      toast('Misión incompleta. Ahora tocá «Siguiente día».'); break;
    case 'paso6': S.escalon = 6; S.fuego = false; toast('Estás en el escalón 6'); break;
    case 'hojas': S.hojas += 100; break;
    case 'entradas': S.hoy.claims = { m: false, t: false, n: false }; S.hoy.premio = false; break;
    case 'real': S.dev.off = 0; { const k2 = clave(ahora()); if (S.hoy.fecha > k2) S.hoy.fecha = k2; } break;
    case 'salir': S.dev.on = false; S.dev.off = 0; { const k2 = clave(ahora()); if (S.hoy.fecha > k2) S.hoy.fecha = k2; } cerrarModal(); break;
  }
  const cambio = avanzarDias();
  guardar(); render();
  if (cambio) mostrarAvisos();
  if (UI.activo && UI.activo.devPanel) pintarModal();
}

/* =====================================================================
   ACCIONES (todo lo que se toca)
   ===================================================================== */
function irA(t) {
  if (t === 'inicio' || t === 'progreso' || t === 'camino') { t = 'camino'; UI.cam.modo = 'general'; }
  if (t === 'habitos') { t = 'camino'; UI.cam.modo = 'nivel'; UI.cam.nivel = S.nivel; }
  UI.tab = t; UI.sel = null; render(); $('#main').scrollTop = 0;
}
function abrirNivel(n) { UI.tab = 'camino'; UI.cam.modo = 'nivel'; UI.cam.nivel = n; UI.cam.anim = 'in'; render(); $('#main').scrollTop = 0; }
function verGeneral() { UI.tab = 'camino'; UI.cam.modo = 'general'; UI.cam.anim = 'out'; render(); $('#main').scrollTop = 0; }
function irSala(id) { UI.tab = 'casa'; UI.modo = 'sala'; UI.sala = id; UI.sel = null; render(); $('#main').scrollTop = 0; }

const ACC = {
  ir: el => irA(el.dataset.t),
  nivelVer: el => abrirNivel(+el.dataset.n),
  verGeneral: () => verGeneral(),
  modo: el => { UI.modo = el.dataset.m; UI.sel = null; render(); },
  salaMover: el => { const i = SALAS.findIndex(s => s.id === UI.sala) + (+el.dataset.d); if (SALAS[i] && abierta(SALAS[i].id)) { UI.sala = SALAS[i].id; UI.sel = null; render(); } },
  irSala: el => irSala(el.dataset.id),
  verSala: el => { cerrarModal(); irSala(el.dataset.id); },
  hab: el => alternar(el.dataset.id),
  sobre: el => reclamar(el.dataset.k),
  premio: () => reclamarPremio(),
  cat: el => { UI.cat = el.dataset.k; render(); $('#main').scrollTop = 0; },
  ver: el => modal(modalProducto(el.dataset.id)),
  meta: (el, e) => { e.stopPropagation(); const id = el.dataset.id; S.meta = S.meta === id ? null : id; guardar(); render(); toast(S.meta ? 'Ahorrando para ' + ITEM[id].n : 'Listo, ya no estás ahorrando para eso'); },
  metaModal: el => { const id = el.dataset.id; S.meta = S.meta === id ? null : id; guardar(); toast(S.meta ? 'Ahorrando para ' + ITEM[id].n : 'Listo'); cerrarModal(); },
  comprar: el => {
    const id = el.dataset.id;
    if (comprar(id)) { UI.activo.st.comprado = true; pintarModal(); const c = $('#chip-hojas'); if (c) c.classList.add('sube'); }
  },
  caja: el => comprarCaja(el.dataset.k),
  abrir: () => {
    const d = UI.activo; if (!d || d.st.abriendo) return; d.st.abriendo = true;
    const sv = $('#modal .sobre-grande'); if (sv) sv.classList.add('abierto');
    setTimeout(() => { if (UI.activo === d) { d.st.abierto = true; pintarModal(); } }, 900);
  },
  colocarYa: el => { const id = el.dataset.id; cerrarModal(); UI.tab = 'casa'; UI.modo = 'sala'; if (!UI.sala || !abierta(UI.sala)) UI.sala = salaDeNivel(S.nivel).id; colocar(id); render(); },
  poner: el => { colocar(el.dataset.id); render(); },
  voltear: () => { const ob = objDe(UI.sel); if (ob) { ob.f = ob.f ? 0 : 1; guardar(); render(); } },
  guardarObj: () => { const s = enSala(UI.sala); s.objs = s.objs.filter(o => o.u !== UI.sel); UI.sel = null; guardar(); render(); toast('Guardado en tu inventario'); },
  cambiar: () => {
    const ob = objDe(UI.sel); if (!ob) return;
    const hay = listaLibres().some(i => i.gr === ITEM[ob.id].gr && i.id !== ob.id);
    if (!hay) { toast('No tenés otro parecido guardado. Comprá uno en la tienda.'); return; }
    modal(modalCambiar(UI.sel));
  },
  cambiarPor: el => {
    const ob = objDe(el.dataset.u); if (!ob) return;
    const it = ITEM[el.dataset.id], p = limitar(it, ob.x, ob.y);
    ob.id = it.id; ob.x = p.x; ob.y = p.y; guardar(); cerrarModal();
  },
  estiloAbrir: () => modal(modalEstilo()),
  estilo: el => { S.estilo = el.dataset.id; guardar(); render(); },
  estiloModal: el => { S.estilo = el.dataset.id; guardar(); pintarModal(); render(); },
  persToggle: () => { S.personaje = !S.personaje; guardar(); render(); },
  cerrar: () => cerrarModal(),
  velo: () => { if (UI.activo && !UI.activo.fijo) cerrarModal(); },
  empezar: () => { S.bienvenida = true; guardar(); cerrarModal(); },
  /* hábitos */
  habEditar: () => modal(modalHabitos()),
  habNuevo: () => { S.hab.push({ id: 'h' + Date.now().toString(36), n: 'Nuevo hábito', ic: 'hoja', ef: '', req: true }); guardar(); pintarModal(); },
  habReq: el => {
    const h = S.hab.find(x => x.id === el.dataset.id);
    if (h.req && habReq().length <= 1) { toast('Tiene que haber al menos un hábito obligatorio'); return; }
    h.req = !h.req; guardar(); pintarModal();
  },
  habDel: el => {
    const h = S.hab.find(x => x.id === el.dataset.id);
    if (S.hab.length <= 1 || (h.req && habReq().length <= 1)) { toast('Tiene que quedar al menos un hábito obligatorio'); return; }
    S.hab = S.hab.filter(x => x !== h); delete S.hoy.checks[h.id]; guardar(); pintarModal();
  },
  habUp: el => { const i = S.hab.findIndex(x => x.id === el.dataset.id); if (i > 0) { [S.hab[i - 1], S.hab[i]] = [S.hab[i], S.hab[i - 1]]; guardar(); pintarModal(); } },
  habIc: el => { const h = S.hab.find(x => x.id === el.dataset.id); h.ic = ICONOS_HABITO[(ICONOS_HABITO.indexOf(h.ic) + 1) % ICONOS_HABITO.length]; guardar(); pintarModal(); },
  habListo: () => { cerrarModal(); checkMision(); },
  /* perfil */
  reiniciarTodo: () => modal(modalConfirmar('¿Empezar de nuevo?', 'Se borra toda la partida de este celular: hábitos, hojas, objetos y decoración. No se puede deshacer.', 'reiniciarOk', 'Sí, borrar todo')),
  reiniciarOk: () => { try { localStorage.removeItem(CLAVE_GUARDADO); } catch (e) { /* nada */ } memoria = null; UI.cola = []; UI.activo = null; $('#modal').classList.remove('on'); S = nuevoEstado(); S.hoy = nuevoDia(clave(ahora())); UI.tab = 'camino'; UI.cam = { modo: 'general', nivel: null, anim: null }; UI.sala = null; UI.sel = null; guardar(); render(); modal(modalBienvenida()); },
  devToggle: () => { S.dev.on = !S.dev.on; if (!S.dev.on) S.dev.off = 0; guardar(); render(); },
  devAbrir: () => { const d = devPanel(); d.devPanel = true; modal(d); },
  dev: el => devHacer(el.dataset.k)
};
const INP = {
  nombre: el => { S.nombre = el.value; guardar(); pintarTop(); },
  pesoIni: el => { S.peso.ini = el.value; guardar(); },
  pesoAct: el => { S.peso.act = el.value; guardar(); },
  habN: el => { const h = S.hab.find(x => x.id === el.dataset.id); if (h) { h.n = el.value; guardar(); } }
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el) return;
  const f = ACC[el.dataset.a];
  if (f) f(el, e);
});
document.addEventListener('input', e => {
  const f = e.target.dataset && INP[e.target.dataset.i];
  if (f) f(e.target);
});

/* ---------------- pellizcar con dos dedos para acercar o alejar el camino ---------------- */
(function () {
  let d0 = 0, dl = 0;
  const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  const m = $('#main');
  m.addEventListener('touchstart', e => { if (e.touches.length === 2) { d0 = dl = dist(e.touches); } }, { passive: true });
  m.addEventListener('touchmove', e => { if (e.touches.length === 2 && d0) dl = dist(e.touches); }, { passive: true });
  m.addEventListener('touchend', e => {
    if (!d0 || e.touches.length > 1) return;
    const r = dl / d0; d0 = 0;
    if (UI.tab !== 'camino') return;
    if (r > 1.25 && UI.cam.modo === 'general') abrirNivel(S.nivel);
    else if (r < 0.8 && UI.cam.modo === 'nivel') verGeneral();
  });
})();

/* ---------------- reloj: detecta cambios de día y de franja ---------------- */
const firma = () => clave(ahora()) + '|' + ['m', 't', 'n'].map(k => (disponible(k) ? 1 : 0)).join('');
function tick() {
  const cambio = avanzarDias(), f = firma();
  if (cambio) { guardar(); mostrarAvisos(); }
  if (cambio || f !== UI.firma) { UI.firma = f; if (!UI.activo && !UI.arrastrando) render(); }
}

/* ---------------- arranque ---------------- */
cargar();
avanzarDias();
UI.firma = firma();
guardar();
render();
if (!S.bienvenida) modal(modalBienvenida());
mostrarAvisos();
setInterval(tick, 20000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
