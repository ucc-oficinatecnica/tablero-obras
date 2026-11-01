'use strict';
/* =====================================================================
   DATOS DEL JUEGO
   Todo lo que se puede "ajustar" vive acá: precios, premios, estilos,
   ambientes, hábitos iniciales y la lista de objetos.
   ===================================================================== */

const CLAVE_GUARDADO = 'casa_habitos_v1';
const ESCALONES = 7;                 // escalones por nivel
const ANCHO = 360, ALTO = 320, SUELO = 215;   // medidas internas de cada ambiente

/* Si completás la misión en un Día de fuego: ¿además de defender subís un escalón? */
const DEFENSA_TAMBIEN_SUBE = true;

/* Entradas del día: desde qué hora se habilita cada una (y queda disponible hasta medianoche) */
const HORAS = { m: 6, t: 13, n: 20 };

/* tabla = probabilidad relativa de cada rareza: c común, e especial, r raro, x exclusivo */
const SOBRES = {
  m: { n: 'Mañana', hojas: 10, pObj: 0.35, tabla: { c: 90, e: 10 } },
  t: { n: 'Tarde',  hojas: 15, pObj: 0.45, tabla: { c: 70, e: 28, r: 2 } },
  n: { n: 'Noche',  hojas: 20, pObj: 0.50, tabla: { c: 45, e: 42, r: 12, x: 1 } }
};
const PREMIO_DIA   = { hojas: 25, tabla: { c: 40, e: 42, r: 15, x: 3 } };
const PREMIO_NIVEL = { hojas: 100, caja: 'rara' };
const SIN_OBJETO_MAX = 4;   // después de tantas entradas sin objeto, la siguiente trae uno seguro

const CAJAS = {
  comun:    { n: 'Caja común',    p: 40,  txt: 'Casi siempre algo sencillo.',        tabla: { c: 80, e: 18, r: 2 } },
  especial: { n: 'Caja especial', p: 120, txt: 'Muy buena chance de algo especial.', tabla: { c: 30, e: 55, r: 14, x: 1 } },
  rara:     { n: 'Caja rara',     p: 300, txt: 'Objetos raros y, con suerte, uno exclusivo.', tabla: { e: 40, r: 52, x: 8 } }
};

const RAREZAS = {
  c: { n: 'Común',      col: '#9A9185' },
  e: { n: 'Especial',   col: '#7F9A78' },
  r: { n: 'Raro',       col: '#9B8FB8' },
  x: { n: 'Exclusivo',  col: '#B98B4E' }
};

/* ---------------- Estilos de decoración ----------------
   Para agregar un estilo nuevo: copiar uno de estos bloques y cambiar los colores. */
const ESTILOS = {
  minimalista: { n: 'Minimalista', P: {
    wall:'#F3EDE2', wall2:'#EBE3D4', floor:'#E3D5BE', floor2:'#D3C3A8', trim:'#FBF8F1',
    wood:'#D2BD9B', wood2:'#B9A07A', fab:'#EAE3D5', fab2:'#D8CFBC', paper:'#FCF9F3',
    acc:'#9CAF94', acc2:'#C47A5A', dark:'#4A463F', ceram:'#F6F1E7',
    leaf:'#85A07E', leaf2:'#62805F', glass:'#DDE7E2', metal:'#B9A88C', sky1:'#E9F0EC', sky2:'#F7F1E6' } },
  moderno: { n: 'Moderno', P: {
    wall:'#ECE8E1', wall2:'#E1DCD2', floor:'#CDC6BA', floor2:'#BDB5A7', trim:'#F8F6F2',
    wood:'#8F7B67', wood2:'#74624E', fab:'#D9D4CA', fab2:'#C6BFB1', paper:'#F7F5F0',
    acc:'#8E9F8B', acc2:'#B8694B', dark:'#33312E', ceram:'#EFEBE3',
    leaf:'#7B9575', leaf2:'#58704F', glass:'#D7E0DE', metal:'#9C9486', sky1:'#E4EBEA', sky2:'#F2EFE8' } },
  japandi: { n: 'Japandi', P: {
    wall:'#EFE5D3', wall2:'#E4D8C0', floor:'#C8AC84', floor2:'#B59769', trim:'#F8F1E4',
    wood:'#A98456', wood2:'#8B6A41', fab:'#E8DECA', fab2:'#D6C9AE', paper:'#FAF4E8',
    acc:'#8A8F5F', acc2:'#B0593F', dark:'#3C3830', ceram:'#EFE6D4',
    leaf:'#7C8A55', leaf2:'#5B6A3C', glass:'#DAE0D2', metal:'#A8946F', sky1:'#E8EDDF', sky2:'#F6EEDC' } },
  natural: { n: 'Natural', P: {
    wall:'#EEF0E4', wall2:'#E2E7D5', floor:'#D3C09B', floor2:'#C0AB82', trim:'#F9FAF3',
    wood:'#BE9E6F', wood2:'#A58451', fab:'#EDE8D8', fab2:'#DCD5BF', paper:'#FBFAF2',
    acc:'#7F9A78', acc2:'#CB8F66', dark:'#454236', ceram:'#F3EFE0',
    leaf:'#75946C', leaf2:'#53724B', glass:'#D9E5DC', metal:'#B0A07D', sky1:'#E5EFE6', sky2:'#F5F1E2' } }
};

/* ---------------- Ambientes (un nivel por ambiente) ---------------- */
const SALAS = [
  { id: 'dormitorio', n: 'Dormitorio',      corto: 'Dormitorio' },
  { id: 'living',     n: 'Living-comedor',  corto: 'Living' },
  { id: 'cocina',     n: 'Cocina',          corto: 'Cocina' },
  { id: 'bano',       n: 'Baño y vestidor', corto: 'Baño' },
  { id: 'estudio',    n: 'Estudio',         corto: 'Estudio' },
  { id: 'terraza',    n: 'Terraza',         corto: 'Terraza' },
  { id: 'jardin',     n: 'Jardín',          corto: 'Jardín' }
];

/* Posición de cada ambiente en la "vista de la casa" (vista general) */
const PLANO = {
  terraza:    { x: 40,  y: 14,  w: 280, h: 92 },
  dormitorio: { x: 14,  y: 116, w: 108, h: 112 },
  bano:       { x: 126, y: 116, w: 108, h: 112 },
  estudio:    { x: 238, y: 116, w: 108, h: 112 },
  living:     { x: 14,  y: 236, w: 190, h: 120 },
  cocina:     { x: 208, y: 236, w: 138, h: 120 },
  jardin:     { x: 14,  y: 364, w: 332, h: 74 }
};

/* ---------------- Hábitos iniciales (se pueden editar en el juego) ----------------
   ef = efecto visual en la casa: agua · comida · mov · prep  (o vacío) */
const HABITOS_BASE = [
  { id: 'agua',     n: 'Agua (2 litros)',     ic: 'gota',   ef: 'agua',   req: true },
  { id: 'desayuno', n: 'Desayuno',            ic: 'sol',    ef: 'comida', req: true },
  { id: 'almuerzo', n: 'Almuerzo',            ic: 'plato',  ef: 'comida', req: true },
  { id: 'merienda', n: 'Merienda',            ic: 'taza',   ef: 'comida', req: true },
  { id: 'cena',     n: 'Cena',                ic: 'luna',   ef: 'comida', req: true },
  { id: 'mov',      n: 'Movimiento',          ic: 'paso',   ef: 'mov',    req: true },
  { id: 'prep',     n: 'Preparar alimentos',  ic: 'frasco', ef: 'prep',   req: true }
];
const ICONOS_HABITO = ['gota', 'sol', 'plato', 'taza', 'luna', 'paso', 'frasco', 'hoja', 'libro', 'respirar'];

/* ---------------- Objetos ----------------
   capa:  pared · alfombra · piso · chico (se puede apoyar en cualquier lado)
   gr:    grupo (sirve para "Cambiar" un objeto por otro parecido)
   p:     precio en la tienda (0 = no se vende, solo sale en sorpresas)
   r:     rareza  c · e · r · x
   w, h:  tamaño del dibujo. El dibujo está en arte.js (DIBUJO) */
const _it = (id, n, gr, capa, w, h, p, r, extra) => Object.assign({ id, n, gr, capa, w, h, p, r }, extra || {});
const ITEMS = [
  /* muebles grandes */
  _it('cama_basica',  'Cama de madera',        'cama',     'piso', 150, 74, 0,   'c', { inicial: true }),
  _it('cama_lino',    'Cama de lino',          'cama',     'piso', 164, 90, 300, 'e'),
  _it('cama_boucle',  'Cama bouclé',           'cama',     'piso', 172, 94, 560, 'r'),
  _it('mesita',       'Mesa de luz',           'mesa',     'piso', 40,  50, 45,  'c'),
  _it('mesita_redonda','Mesa auxiliar',        'mesa',     'piso', 38,  56, 70,  'c'),
  _it('mesa_ratona',  'Mesa ratona',           'mesa',     'piso', 84,  32, 120, 'e'),
  _it('escritorio',   'Escritorio',            'mesa',     'piso', 124, 86, 280, 'e'),
  _it('comoda',       'Cómoda',                'guardado', 'piso', 104, 64, 210, 'e'),
  _it('estante',      'Biblioteca',            'guardado', 'piso', 74, 134, 235, 'e'),
  _it('sillon',       'Sillón salvia',         'asiento',  'piso', 78,  66, 260, 'e'),
  _it('sillon_boucle','Sillón bouclé',         'asiento',  'piso', 86,  68, 490, 'r'),
  _it('sofa',         'Sofá de dos cuerpos',   'asiento',  'piso', 156, 68, 440, 'r'),
  _it('silla',        'Silla',                 'asiento',  'piso', 40,  74, 82,  'c'),
  _it('pouf',         'Puf',                   'asiento',  'piso', 46,  34, 38,  'c'),
  /* luz */
  _it('lampara_pie',  'Lámpara de pie',        'luz',      'piso', 36, 132, 95,  'e'),
  _it('lampara_arco', 'Lámpara de arco',       'luz',      'piso', 90, 140, 390, 'r'),
  _it('farol_papel',  'Farol de papel',        'luz',      'piso', 40,  60, 0,   'r'),
  _it('lampara_mesa', 'Lámpara de mesa',       'luz',      'chico', 32, 46, 58,  'c'),
  _it('luces',        'Guirnalda de luces',    'luz',      'pared', 124, 34, 72, 'c'),
  /* plantas */
  _it('monstera',     'Monstera',              'planta',   'piso', 58,  92, 65,  'c'),
  _it('olivo',        'Olivo',                 'planta',   'piso', 64, 124, 150, 'e'),
  _it('cactus',       'Cactus',                'planta',   'chico', 24, 30, 18,  'c'),
  _it('bonsai',       'Bonsái',                'planta',   'chico', 40, 42, 340, 'r'),
  _it('orquidea',     'Orquídea',              'planta',   'chico', 30, 50, 0,   'x'),
  /* alfombras */
  _it('alfombra_redonda','Alfombra redonda',   'alfombra', 'alfombra', 150, 38, 55,  'c'),
  _it('alfombra_lino','Alfombra de lino',      'alfombra', 'alfombra', 176, 42, 105, 'e'),
  _it('alfombra_terracota','Alfombra terracota','alfombra','alfombra', 164, 40, 190, 'e'),
  _it('alfombra_ondas','Alfombra ondas',       'alfombra', 'alfombra', 176, 42, 0,   'r'),
  /* pared */
  _it('cuadro_abs',   'Cuadro abstracto',      'cuadro',   'pared', 46,  62, 32,  'c'),
  _it('cuadro_lineas','Cuadro de líneas',      'cuadro',   'pared', 58,  46, 42,  'c'),
  _it('cuadro_trio',  'Trío de cuadros',       'cuadro',   'pared', 112, 62, 130, 'e'),
  _it('espejo_redondo','Espejo redondo',       'cuadro',   'pared', 52,  52, 88,  'e'),
  _it('espejo_pie',   'Espejo de pie',         'cuadro',   'piso', 52, 134, 170, 'e'),
  _it('espejo_arco',  'Espejo arco',           'cuadro',   'pared', 46,  84, 0,   'r'),
  _it('tapiz',        'Tapiz tejido',          'cuadro',   'pared', 60,  96, 0,   'r'),
  _it('reloj',        'Reloj de pared',        'cuadro',   'pared', 34,  34, 48,  'c'),
  _it('estante_flot', 'Estante flotante',      'cuadro',   'pared', 72,  24, 62,  'c'),
  _it('cortinas',     'Cortinas de lino',      'cortina',  'pared', 64, 134, 78,  'c'),
  /* detalles */
  _it('jarron',       'Jarrón con ramas',      'detalle',  'chico', 24,  44, 26,  'c'),
  _it('libros',       'Libros',                'detalle',  'chico', 36,  18, 15,  'c'),
  _it('vela',         'Velas',                 'detalle',  'chico', 18,  26, 12,  'c'),
  _it('bandeja',      'Bandeja con taza',      'detalle',  'chico', 38,  18, 22,  'c'),
  _it('flores',       'Flores',                'detalle',  'chico', 26,  44, 30,  'c'),
  _it('escultura',    'Escultura de cerámica', 'detalle',  'chico', 32,  50, 0,   'r'),
  _it('gato',         'Gato dormido',          'detalle',  'chico', 44,  26, 0,   'x')
];
const ITEM = Object.fromEntries(ITEMS.map(i => [i.id, i]));

const CAT_TIENDA = { cama: 'muebles', asiento: 'muebles', mesa: 'muebles', guardado: 'muebles',
  luz: 'luz', planta: 'plantas', alfombra: 'alfombras', cuadro: 'pared', cortina: 'pared', detalle: 'detalles' };
const CATS = [
  ['todo', 'Todo'], ['muebles', 'Muebles'], ['luz', 'Luz'], ['plantas', 'Plantas'],
  ['alfombras', 'Alfombras'], ['pared', 'Pared'], ['detalles', 'Detalles'], ['sorpresas', 'Sorpresas']
];
