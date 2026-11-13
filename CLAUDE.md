# Instrucciones para Claude (leer siempre antes de trabajar)

## Quién te habla
Las personas que usan este proyecto **no saben programar**. Saben qué producto quieren, no cómo se hace.
- Hablales siempre en **español**, con palabras simples. Nada de jerga técnica: si tenés que nombrar algo técnico, explicalo en una frase.
- Explicá **qué vas a hacer y qué cambió** en lenguaje de producto ("agregué una sección de Presupuestos arriba de la lista"), no en lenguaje de código.
- No les hagas elegir entre opciones técnicas. Decidí vos lo mejor y avisá. Preguntá solo cuando la decisión cambia lo que ellos ven o usan.
- Si algo falla, explicá qué pasó y cómo lo vas a arreglar. No les pidas que ejecuten comandos: hacelo vos.

## Qué es este proyecto
**Tablero de obras** de la Oficina Técnica (Departamento de Infraestructura Edilicia, UCC). Es una página web que muestra y permite editar las obras por sede: responsable, prioridad, etapa, quién la lleva, envergadura, planificación en calendario y comentarios.
- Sitio publicado: https://ucc-oficinatecnica.github.io/tablero-obras/
- Repositorio: https://github.com/ucc-oficinatecnica/tablero-obras (público)
- Se publica **solo** cuando se suben cambios a la rama `main`.

## Cómo está armado (para vos, no para ellos)
- `index.html`: toda la página (diseño, secciones y funciones). La lista base de obras está en la constante `BASE` dentro de ese archivo.
- `firebase-shim.js`: conecta la página con la base de datos (Firebase Firestore, login anónimo).
- `firebase-config.js`: datos del proyecto Firebase `tablero-obras-ot`. Es público por diseño, no es un secreto.
- `firestore.rules`: reglas de seguridad de la base de datos. **Se publican a mano en la consola de Firebase**, no con el deploy.
- `.github/workflows/deploy.yml`: publica la página. Solo copia `index.html`, `firebase-config.js` y `firebase-shim.js`. Si agregás un archivo nuevo que la página necesite, agregalo ahí.
- Datos compartidos (asignaciones, comentarios, obras agregadas) viven en Firestore, **no** en el código. Cambiar el código no borra los datos.

## Cómo trabajar (hacelo vos, sin pedirles que lo hagan)
1. **Antes de tocar nada, traé los últimos cambios** del repositorio (`git pull`). Varias personas editan el mismo proyecto.
2. Si la carpeta todavía no tiene el proyecto, descargalo (`git clone https://github.com/ucc-oficinatecnica/tablero-obras.git`). Si falta Git o el acceso a GitHub, guialos paso a paso.
3. Hacé el cambio pedido. Mantené el estilo y el diseño existentes salvo que pidan cambiarlos. La página debe verse bien en celular y en computadora, en modo claro y oscuro.
4. **Probá que la página abra sin errores** antes de publicar.
5. **Antes de publicar, mostrales qué cambió y preguntales: "¿Lo publico?".** Publicar es subir los cambios (`git commit` + `git push`) y todos lo ven en el sitio en un minuto. No publiques sin su sí.
6. Escribí un mensaje de cambio claro y corto, en español (ej: "Agregar sección de presupuestos").
7. Si al subir hay un choque con cambios de otra persona, resolvelo con cuidado conservando el trabajo de ambos y avisales. Nunca uses fuerza (`--force`) ni borres el trabajo de otro.

## Reglas importantes (no romper)
- **Nunca borres ni sobrescribas datos de Firestore** sin que lo pidan de forma explícita y confirmen.
- **No cambies `firestore.rules`** sin avisar claramente qué implica, y recordá que hay que publicarlas en la consola de Firebase.
- **El repositorio es público.** No pongas contraseñas, claves privadas, tokens ni datos personales en ningún archivo. (La clave de `firebase-config.js` es pública a propósito.)
- No instales programas ni cambies configuraciones de la computadora sin avisar y pedir permiso.
- No agregues servicios de pago ni cuentas nuevas sin consultarlo.
- Si no sabés si un cambio puede romper algo, avisalo antes de publicar.

## Si piden algo grande
Para cambios grandes (rediseñar, reorganizar), avisales que conviene avisarle a los demás que están editando para no pisarse, y sugerí hacerlo por partes.

## Seguimiento de etapas (tiempo por etapa de cada obra)
- Al cambiar la etapa de una obra, la página registra sola la fecha y guarda el historial. No hay que cargar nada dos veces: el calendario de planificación se dibuja a partir de ese historial.
- Datos: cada obra (documento de `asignaciones/<id>` en Firestore) tiene `hist` (lista de períodos `{e: etapa, i: fecha inicio, f: fecha fin o null}`, el último abierto es la etapa actual), `prev` (duración prevista en días, por etapa, propia de esa obra) y `prog` (fecha para la que está programada, solo si la etapa es Programada).
- Los plazos por defecto de cada etapa se guardan en el documento `asignaciones/config-plazos` (campo `prev`). Se usa ese documento y no una colección nueva porque las reglas de Firestore ya permiten escribir en `asignaciones`. No uses ids que empiecen y terminen con doble guion bajo: Firestore los reserva.
- `fix()` en `index.html` filtra los campos de lo que lee de la base. Si agregás un campo nuevo a las obras, agregalo también ahí o se perderá al guardar.
- Reglas por etapa (constantes `CON_PLAZO`, `SOLO_DIAS` en `index.html`): **Proyecto/Planificación, Presupuestación/Adjudicación, Ejecución y Post-Venta** cuentan días y tienen plazo con semáforo. **Pendiente y En stand by** solo cuentan los días que llevan ahí (sin plazo). **Programada** no cuenta: tiene una fecha objetivo (campo `prog`). **Suspendida** no cuenta ni muestra nada. **Terminada** marca la fecha de fin de la obra.
- Cómo se cuenta: días corridos desde la fecha de inicio. Estado del plazo: **en término**, **próxima a vencer** (le queda el 20% del plazo o menos, mínimo 2 días) y **demorada** (superó lo previsto). Sin duración prevista solo se cuentan días.
- Todo se puede corregir a mano en el detalle de la obra: la fecha de inicio, los días que lleva (se ajustan entre sí), y las fechas de inicio y fin de las etapas anteriores (quedan pegadas: el fin de una es el inicio de la siguiente).
- Las obras que ya tenían etapa antes de esta función no tienen fecha de inicio: aparecen como "sin fecha" hasta que alguien la cargue en el detalle de la obra, o use "Usar hoy como inicio en todas" en el panel "Plazos por etapa".
- La planificación manual por días pintados (campo `plan`) se reemplazó por estas barras automáticas. Los datos viejos de `plan` no se borran, pero ya no se muestran.
- Los colores de cada etapa son los mismos en la lista, los gráficos y el calendario (`ECOL`, `eVar` en `index.html`).

## Plan teórico y fecha límite
- Cada obra tiene dos seguimientos: el **real** (`hist`, lo que va pasando) y el **teórico** (`teo`, lo que se planificó: lista de `{e: etapa, i: inicio, f: fin}` editable). El calendario los dibuja en dos carriles: real arriba, teórico abajo.
- `limite` es la fecha límite de la obra. `teo` se arma agregando etapas a mano; la fecha límite sirve para el semáforo y la línea roja del calendario. Las etapas que se planifican son `ORDEN_PLAN`.
- El semáforo compara lo real con el plan teórico de la etapa en curso (si existe; si no, con la duración estimada). Si pasó la fecha límite y la obra no terminó, figura como demorada.
- Todo es editable a mano en el detalle de la obra: etapa en curso, fechas reales y del plan, agregar o quitar períodos.
- `fix()` filtra `teo` y `limite` al leer; si agregás otro campo a las obras, sumalo ahí también.
- Cómo está organizado el panel de seguimiento (`seguimientoHtml` en `index.html`, clases `sg-*`): arriba un **resumen** con una sola tarjeta: la **fecha límite**, con un selector "Sin fecha límite / Con fecha límite" (el casillero de fecha aparece solo con "Con"), después dos **pestañas**: *Real* (tarjeta "Etapa actual", con el botón para agregar una etapa que ya pasó; la tarjeta "Etapas anteriores" solo aparece si hay alguna) y *Plan teórico* (plan actual y un asistente de tres pasos para armarlo). Los campos llevan la etiqueta arriba y el estado se muestra como un cartel de color. *Plan teórico* tiene una sola tarjeta, "Estimar el plan": la tabla de etapas con sus fechas y el botón "+ Agregar una etapa al plan" (cada etapa nueva se agrega a continuación de la última, con los días generales de "Duración general por etapa"). La **fecha límite se edita en la tarjeta de resumen de arriba** (visible en las dos pestañas). Las funciones `armar`, `planTeoAtras`, `planTeoAdelante` y `estimarPlan` siguen en `index.html` pero ya no tienen botón: el usuario pidió sacar "Armar el plan automáticamente". No agregues preguntas que el programa pueda resolver solo, ni repitas en una tarjeta lo que ya dice el resumen. Mantené esa jerarquía si agregás cosas: título, tarjetas con título, campos con etiqueta, textos de ayuda en gris.

## Orden manual de las obras
- Cada obra puede tener un campo `orden` (número) en `asignaciones/<id>`. Sin `orden`, vale su posición original x 1000 (`ordOf` en `index.html`). Para cambiar una obra de lugar se **arrastra la fila** (sin botones ni flechas a la vista: el usuario los pidió invisibles); no se arrastra si se aprieta sobre un campo editable (nombre, listas). Se guarda **solo esa obra** con un número intermedio entre sus nuevas vecinas (`moverObra`). No se puede arrastrar mientras está activo "Ordenar por prioridad". `fix()` filtra `orden`: no lo saques de ahí.

## Acceso con código
- Al abrir la página se pide un código numérico. El código correcto vive en Firestore, en el documento `seguridad/acceso` (campo `codigo`, de tipo **texto**), que nadie puede leer desde la página. Cada visitante anota el código que escribió en `miembros/<su uid>`, y las reglas (`firestore.rules`) solo dejan leer y escribir a quien tiene anotado el código vigente.
- **Cambiar el código**: editar el campo `codigo` en la consola de Firebase. Corta el acceso de todos al instante; al recargar la página piden el nuevo. Nunca escribas el código real en ningún archivo ni lo repitas en el chat: el repositorio es público.
- Si `seguridad/acceso` no existe o `codigo` no es texto, **nadie** puede entrar. Las reglas se publican a mano en la consola (Firestore → Reglas), igual que antes.
- La pantalla de código está en `index.html` (`pedirCodigo`, `probe`, clases `gate-*`). Si cambia el diseño del login, mantenela simple: logo, un campo numérico y "Entrar".
- Limitación a tener presente: con 6 dígitos alguien podría probar números con un programa. Si hace falta más protección, alargar el código (cambiarlo en la consola no requiere tocar la página).

## Obras que no cuentan (Suspendida, En stand by, Mantenimiento)
- Las obras con etapa **Suspendida**, **En stand by** o **Mantenimiento** (constante `FUERA` en `index.html`) **no entran en el contador de obras** ni en los gráficos de arriba, ni en los números de las pestañas de sede. Se muestran aparte, debajo de las sedes, en una sección desplegable por cada una (`GRUPOS_FUERA`): "Obras suspendidas", "Obras en stand by" y "Obras en mantenimiento".
- La tarjeta "Obras" muestra el total en curso y, abajo, cuántas hay en cada grupo (ej: "+ 1 suspendida", "+ 2 stand by").
- **Mantenimiento** es una etapa más (`ESTADOS`, color `--e10b`/`--e10f`) y, igual que Suspendida, **no cuenta días** ni muestra semáforo. **En stand by** sigue contando solo los días que lleva ahí (`SOLO_DIAS`).
- Una obra vuelve al conteo cuando se le cambia la etapa a cualquiera que no sea una de las tres.

## Obras destacadas (estrella)
- Cada obra tiene una estrella junto al nombre (campo `destacada` en `asignaciones/<id>`, booleano; `fix()` lo conserva: no lo saques de ahí). Se marca y se saca tocando la estrella.
- Las obras destacadas **salen de su sede** y se muestran juntas en una sección "Obras destacadas" arriba de las sedes (filas amarillas, borde dorado; colores `--dst-*`). Si hay una sede elegida arriba, la sección muestra solo las destacadas de esa sede. Cada fila lleva una etiqueta con su sede.
- **Siguen contando** como obras en curso (en el número grande, los gráficos y las pestañas). La tarjeta "Obras" dice cuántas hay ("★ 3 destacadas") y el título de cada sede aclara cuántas están arriba.
- Una obra destacada que pase a Suspendida, En stand by o Mantenimiento se muestra en esa sección aparte (conserva su estrella).

## Ordenar tocando el título de las tarjetas
- Los títulos Envergadura, Prioridad, Etapa y Quién lo lleva (tarjetas de arriba) son botones de orden (`state.orden`, tabla `ORD` en `index.html`). Al tocar uno, dentro de cada sede (y de las secciones Destacadas, Suspendidas, etc.) las obras se acomodan: Prioridad Alta, Media, Baja; Envergadura Grande, Mediana, Pequeña; Etapa en orden de avance; Quién lo lleva primero Oficina Técnica, después estudios. Lo "sin definir" va al final y el resto mantiene el orden manual. Tocar de nuevo lo apaga.
- Aparece un cartel "Orden: ..." con una ✕ arriba de la lista. "Limpiar filtros" también lo quita. Mientras hay un orden elegido no se puede arrastrar para reordenar a mano.
- Esto es distinto de tocar un círculo, columna o barra dentro de la tarjeta: eso filtra, no ordena.

## Obras importantes (segundo nivel, rombo)
- Las obras tienen tres niveles de importancia: **1.º destacadas** (estrella, amarillo), **2.º importantes** (rombo ◆, azul) y **3.º el resto**, sin marca, en sus sedes.
- El rombo está junto a la estrella en cada obra. **El campo en la base se llama `gestionar`** (nombre viejo, de cuando se llamaba "A gestionar" con un rayo; se conservó para no perder las marcas ya hechas; `fix()` lo conserva). Hoy significa "obra importante".
- Se muestran en una sección "Obras importantes" **justo debajo de "Obras destacadas"** y arriba de las sedes (filas azules, borde azul; colores `--gst-*`). Salen de su sede, igual que las destacadas. Siguen contando como obras en curso; la tarjeta "Obras" dice "◆ N importantes" y el título de cada sede aclara cuántas están arriba.
- **Una obra es destacada o importante, nunca las dos**: al marcar una, se saca la otra (en `index.html`, los clics de `data-star` y `data-rayo` guardan los dos campos juntos). Si por datos viejos tuviera las dos, manda la estrella.

## Calendario (vacaciones, calendario académico y feriados)
- Pestaña lateral "Calendario": en pantallas anchas (1340 px o más) va **pegada a la izquierda de Minutas**, con Mejoras a la derecha de todo, las tres con el alto de las tarjetas de arriba (las acomoda `alinearPestanas`, que es una sola función para las tres pestañas); en pantallas angostas se apilan hacia abajo. El usuario probó antes una franja "Próximos días" y prefirió la pestaña. Abre un panel ancho con cinco vistas: **Mes** (grilla con todo lo marcado y detalle del día), **Línea de tiempo** (barras por persona, períodos académicos arriba, rayas de feriados y rombos de fechas límite; se puede ver 3, 4, 6 o 12 meses), **Vacaciones**, **Académico** y **Feriados**. El panel usa los colores de la página (fondo claro u oscuro según el modo), no el azul de los otros paneles: el usuario pidió que no tenga fondo azul. Código en `index.html`: `initCalendario` (se llama desde `iniciar`, junto con las demás).
- Datos en la colección `calendario` de Firestore (reglas en `firestore.rules`, **hay que publicarlas a mano**): `tipo` `vac` (vacaciones de una persona, `t` = nombre), `aca` (período del calendario académico, `t` = nombre), `fer` (feriado agregado a mano) y `oculto` (un feriado de la lista base que se sacó); `d1`/`d2` son las fechas aaaa-mm-dd (inicio y fin; el feriado usa la misma).
- Los nombres para las vacaciones salen de los responsables de las obras (`people()`) más los que ya tengan vacaciones; se puede escribir uno nuevo.
- Feriados de referencia: la lista `FER_BASE` (2026 y 2027) está en el código y **hay que verificarla con el calendario oficial** (puentes y traslados cambian por decreto). Para sacar uno se guarda un `oculto`; no se edita el código. Actualizar la lista cuando cambie el año.
- El calendario académico no está precargado: lo cargan ellos (la UCC no nos dio las fechas).
- La grilla también muestra las **fechas límite de las obras** (campo `limite`) para tenerlas presentes al planificar.

- **Vista Mes:** los días de feriado se pintan de rojo suave (`.cl-c.fer`) y las vacaciones se dibujan como **barras gruesas que cruzan los días**, una por persona y de un color distinto (como en Google Calendar). La grilla se arma por semanas (`.cl-wk`): las barras de cada semana ocupan carriles para no pisarse y las que siguen en la semana siguiente se cortan en el borde. Los colores por persona están en `PCOL` (se eligen por el nombre).
