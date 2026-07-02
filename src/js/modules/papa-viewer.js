const COLOR_MAP = {
  blanco: '#FFFFFF',
  festivo: '#FFFFFF',
  negro: '#1D1D1D',
  rojo: '#B3261E',
  pasión: '#B3261E',
  ordinario: '#2D6A4F',
  penitencia: '#6A4C93',
  dorado: '#D4A017',
  plateado: '#B7BCC5'
}

const POPE_ITEMS = [
  {
    id: 'sotana',
    label: 'Sotana',
    colors: ['blanco'],
    simbolismo: 'Pureza, santidad y la alegría de la Resurrección. Los 33 botones aluden a los años de Cristo.',
    uso: 'Veste talar de base que cubre todo el cuerpo. Es la identidad diaria del Papa. Tiene uso cotidiano: audiencias públicas, viajes oficiales y actos no litúrgicos.',
    thumbImg: '<svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" viewBox="0 0 600 600"><g id="ICONOS"><path d="M317 30h43v30H240V30h43v15.62h34zM360 60l60 30 60 90v150h-60v225l-120-19.63L180 555V330h-60V180l60-90 60-30" fill="none" stroke="#0e3a6f" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/><path d="m180 555 120 15 120-15-120-19.63zM300 60v475.37M180 346.63V180M420 345V180" fill="none" stroke="#0e3a6f" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/><path d="M312.26 501.95h8.05V510h-8.05zM312.26 462.28h8.05v8.05h-8.05zM312.26 422.6h8.05v8.05h-8.05zM312.26 382.93h8.05v8.05h-8.05zM312.26 343.26h8.05v8.05h-8.05zM312.26 303.59h8.05v8.05h-8.05zM312.26 263.91h8.05v8.05h-8.05zM312.26 224.24h8.05v8.05h-8.05zM312.26 184.57h8.05v8.05h-8.05zM312.26 144.89h8.05v8.05h-8.05zM312.26 105.22h8.05v8.05h-8.05zM312.26 65.55h8.05v8.05h-8.05z" fill="#0e3a6f" stroke-width="0"/></g></svg>',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/sotana.webp',
    detailImage: null
  },
  {
    id: 'pelegrina',
    label: 'Pelegrina',
    colors: ['blanco'],
    simbolismo: 'La dignidad del pastor y la protección del rebaño bajo su guía.',
    uso: 'Capa corta, abierta por delante y sujeta al cuello, que cae sobre los hombros y los codos por encima de la sotana. Uso diario en actos cotidianos y oficiales.',
    thumbImg: '<svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" viewBox="0 0 600 600"><defs><style>.cls-1,.cls-2{stroke-width:0;fill:none}.cls-2{stroke:#0e3a6f;stroke-linecap:round;stroke-linejoin:round;stroke-width:8px}</style></defs><g id="ICONOS"><path d="m270 150-30 328.5-60 1.5-60-60-60-30 30-165.75L240 120zM120 420V270M180 480v-90M330 150l30 328.5 60 1.5 60-60 60-30-30-165.75L360 120zM480 420V270M420 480v-90M243.45 450h113.27M240 120h120" class="cls-2"/></g></svg>',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/pelegrina.webp',
    detailImage: null
  },
  {
    id: 'faja',
    label: 'Faja',
    colors: ['blanco'],
    simbolismo: 'Entrega del Pontífice a su misión: la castidad, la pureza y la prontitud para el servicio eclesiástico.',
    uso: 'Banda de seda que ciñe la cintura sobre la sotana y desciende por la pierna izquierda. Uso permanente: cotidiano, y bajo los ornamentos litúrgicos.',
    thumbImg: '<svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" viewBox="0 0 600 600"><defs><style>.cls-2{fill:none;stroke:#0e3a6f;stroke-linecap:round;stroke-linejoin:round;stroke-width:8px}</style></defs><g id="ICONOS"><path d="M0 0h600v600H0z" style="stroke-width:0;fill:none"/><path d="M361.35 510v30M374.02 510v30M386.68 510v30M399.34 510v30M412.01 510v30M424.67 510v30M437.34 510v30M450 510v30M512.02 70.31c0 2.61-23.7 4.97-62.02 6.68-23.31 1.03-52.05 1.83-84.15 2.3-20.73.3-42.86.46-65.85.46-117.09 0-212.02-4.22-212.02-9.44s94.93-9.43 212.02-9.43 212.02 4.22 212.02 9.43" class="cls-2"/><path d="M450 76.99V510h-88.64V79.75l4.49-.46c32.1-.47 60.84-1.27 84.15-2.3M512.02 70.31v101.15c0 2.6-23.7 4.96-62.02 6.67M87.98 70.31v101.15c0 5.21 94.93 9.43 212.02 9.43 21.34 0 41.94-.14 61.36-.4" class="cls-2"/></g></svg>',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/faja.webp',
    detailImage: null
  },
  {
    id: 'zapatos',
    label: 'Zapatos',
    colors: ['negro'],
    simbolismo: 'Los de color burdeos evocaban la sangre de los mártires de la Iglesia, los pies que llevan el Evangelio de la paz y la sumisión a Cristo.',
    uso: 'Calzado del Pontífice. Uso cotidiano, oficial y litúrgico por igual.',
    thumbImg: '<svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" viewBox="0 0 600 600"><defs><style>.cls-2{fill:none}.cls-3{stroke-width:0}.cls-2{stroke:#0e3a6f;stroke-linecap:round;stroke-linejoin:round;stroke-width:8px}.cls-3{fill:#0e3a6f}</style></defs><g id="ICONOS"><path d="M0 0h600v600H0z" style="fill:none;stroke-width:0"/><path d="M252 386.92H92v16h160v-8.35l32 8.35h256v-16z" class="cls-2"/><path d="m476 354.92-224-93.84h-2.48c-3.2 11.76-13.95 31.76-26.72 31.76h-91.83c-12.77 0-23.52-20.01-26.72-31.76h-7.98v125.84h439.81v-6.07c0-14.32-11.61-25.93-25.93-25.93h-34.14Z" class="cls-2"/><path d="M156 386.92v-27.53l-32-20.47H96.26" class="cls-2"/><path d="M282.63 286.76h8.32v8.32h-8.32zM316 299.94h8.32v8.32H316zM349.37 313.11h8.32v8.32h-8.32z" class="cls-3"/><path d="M444 341.94c0 11.59-9.39 20.98-20.98 20.98H272.99c-11.59 0-20.98 9.39-20.98 20.98v3.02M268 311.06l80 27.86M96.26 338.92H60v-16M438.99 338.92H508v-16H399.62" class="cls-2"/><path d="M96.39 322.92H64.26V197.08h7.98c3.2 11.76 13.95 31.76 26.72 31.76h91.83c12.77 0 23.52-20.01 26.72-31.76h2.48l224 93.84h34.14c14.32 0 25.93 11.61 25.93 25.93v6.07H402.39" class="cls-2"/><path d="M96.39 277.73 92 274.92H64.26" class="cls-2"/><path d="M250.63 222.76h8.32v8.32h-8.32zM284 235.94h8.32v8.32H284zM317.37 249.11h8.32v8.32h-8.32z" class="cls-3"/><path d="M412 277.94c0 11.59-9.39 20.98-20.98 20.98h-48.69" class="cls-2"/></g></svg>',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/zapatos.webp',
    detailImage: null
  },
  {
    id: 'solideo',
    label: 'Solideo',
    colors: ['blanco'],
    simbolismo: 'Consagración, reserva y sumisión total a Dios (solo se retira ante el Santísimo Sacramento por respeto).',
    uso: 'Pequeño gorro de seda redondo que cubre la coronilla. Se lleva bajo la mitra. Uso permanente: vida cotidiana, audiencias y ceremonias.',
    thumbImg: '<svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" viewBox="0 0 600 600"><defs><style>.cls-2{fill:none;stroke:#0e3a6f;stroke-linecap:round;stroke-linejoin:round;stroke-width:8px}</style></defs><g id="ICONOS"><path d="M0 0h600v600H0z" style="stroke-width:0;fill:none"/><path d="M537.97 389.45c-30.32 8.84-65.13 16.02-103.16 21.1-41.65 5.58-87.15 8.65-134.81 8.65s-93.16-3.07-134.81-8.65c-38.03-5.08-72.84-12.26-103.16-21.1C77.39 271.71 178.07 180.8 300 180.8s222.61 90.91 237.97 208.65" class="cls-2"/><path d="M434.81 410.55c-41.65 5.58-87.15 8.65-134.81 8.65s-93.16-3.07-134.81-8.65c9.33-129.38 66.13-228.9 134.81-228.9s125.48 99.52 134.81 228.9M300 181.65v-30.41" class="cls-2"/></g></svg>',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/solideo.webp',
    detailImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/details/solideo2.webp'
  },
  {
    id: 'anillo-pescador',
    label: 'Anillo del pescador',
    colors: ['dorado', 'plateado'],
    simbolismo: 'Sucesión directa del apóstol San Pedro como «pescador de hombres» y sello de fidelidad a la Iglesia.',
    uso: 'Anillo oficial del Pontífice colocado en el dedo anular de la mano derecha. Se destruye con un martillo tras su muerte o renuncia. Lleva el de oro en ceremonias y eventos solemnes.',
    thumbImg: '<svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" viewBox="0 0 600 600"><defs><style>.cls-2{fill:none;stroke:#0e3a6f;stroke-linecap:round;stroke-linejoin:round;stroke-width:8px}</style></defs><g id="ICONOS"><path d="M0 0h600v600H0z" style="stroke-width:0;fill:none"/><path d="M420 180v240h0c-16.57 0-30 13.43-30 30h0-180 0c0-16.57-13.43-30-30-30h0V180h0c16.57 0 30-13.43 30-30h180c0 16.57 13.43 30 30 30" class="cls-2"/><path d="M242 418c0-16.57-13.43-30-30-30h0V212h0c16.57 0 30-13.43 30-30h116c0 16.57 13.43 30 30 30h0v176h0c-16.57 0-30 13.43-30 30h0zM60 240l120-30v180L60 330zM540 240v90l-120 60V210z" class="cls-2"/><path d="M75 252.46v70.04l45 22.5" class="cls-2"/><path d="M89 278.49v35.36l22.23 11.11" class="cls-2"/></g></svg>',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/anillo-del-pescador.webp',
    detailImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/details/anillo-del-pescador2.webp'
  },
  {
    id: 'roquete',
    label: 'Roquete',
    colors: ['blanco'],
    simbolismo: 'La pureza bautismal y la dignidad del Estado clerical.',
    uso: 'Vestidura similar a un alba corta, hecha con encajes, que se lleva sobre la sotana. Actos solemnes de Estado, consistorios o liturgias diferentes de la misa.',
    thumbImg: '<svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" viewBox="0 0 600 600"><defs><style>.cls-2{fill:none;stroke:#0e3a6f;stroke-linecap:round;stroke-linejoin:round;stroke-width:8px}</style></defs><g id="ICONOS"><path d="M0 0h600v600H0z" style="stroke-width:0;fill:none"/><path d="M450 60h-60l-30 60H240l-30-60h-60l-60 60-30 180h90v178.11l150-29.06 150 29.06V300h90l-30-180zM150 300V180M450 300V180" class="cls-2"/><path d="m150.76 450 149.62-29.05L450 450M150 420l150-29.05L450 420M66.51 270H150M70.98 240H150M450.6 270h82.9M450.6 240h77.68" class="cls-2"/><path d="M150 478.11 300 510l150-31.89-150-29.06zM210.08 149.92h180" class="cls-2"/></g></svg>',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/roquete.webp',
    detailImage: null
  },
  {
    id: 'muceta',
    label: 'Muceta',
    colors: ['rojo'],
    simbolismo: 'Poder jurisdiccional y su función de gobierno universal sobre la Iglesia.',
    uso: 'Capa corta que cubre los hombros y se abotona por delante y se lleva sobre el roquete. Audiencias de Estado oficiales, recepción de jefes de Gobierno y actos religiosos no litúrgicos.',
    thumbImg: '<svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" viewBox="0 0 600 600"><defs><style>.cls-2{fill:none}.cls-3{stroke-width:0}.cls-2{stroke:#0e3a6f;stroke-linecap:round;stroke-linejoin:round;stroke-width:8px}.cls-3{fill:#0e3a6f}</style></defs><g id="ICONOS"><path d="M0 0h600v600H0z" style="fill:none;stroke-width:0"/><path d="M315 445.48h8.05v8.05H315zM315 405.81h8.05v8.05H315zM315 366.14h8.05v8.05H315zM315 326.47h8.05v8.05H315zM315 286.79h8.05v8.05H315zM315 247.12h8.05v8.05H315zM315 207.45h8.05v8.05H315zM315 167.77h8.05v8.05H315z" class="cls-3"/><path d="M300 150v328.5L180 480l-60-60-60-30 30-165.75L180 150h60v-30zM120 420V270M180 480v-90M300 150v328.5l120 1.5 60-60 60-30-30-165.75L420 150h-60v-30zM480 420V270M420 480v-90M240 120h120M240 150l29.25 29.25M361 150l-29.58 29.57" class="cls-2"/></g></svg>',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/muceta.webp',
    detailImage: null
  },
  {
    id: 'alba',
    label: 'Alba',
    colors: ['blanco'],
    simbolismo: 'La pureza del alma lavada por la sangre de Cristo (gracia santificante) y la vestidura de los bienaventurados en el Cielo según el Apocalipsis.',
    uso: 'Túnica amplia y larga que cubre desde el cuello hasta los pies. Se viste obligatoriamente sobre la sotana para celebrar la misa, procesiones y bendiciones solemnes.',
    thumbImg: '<svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" viewBox="0 0 600 600"><defs><style>.cls-2{fill:none;stroke:#0e3a6f;stroke-linecap:round;stroke-linejoin:round;stroke-width:8px}</style></defs><g id="ICONOS"><path d="M0 0h600v600H0z" style="stroke-width:0;fill:none"/><path d="m360 60 60 30 60 90 30 180h-90v195l-120-19.63L180 555V360H90l30-180 60-90 60-30V30h120z" class="cls-2"/><path d="m180 555 120 15 120-15-120-19.63zM180 360V180M420 360V180M240 60h120M210 480v-90M360 450V240" class="cls-2"/></g></svg>',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/alba.webp',
    detailImage: null
  },
  {
    id: 'cingulo',
    label: 'Cíngulo',
    colors: ['blanco', 'dorado'],
    simbolismo: 'La pureza, la castidad, el dominio de las pasiones y la presteza para el servicio divino.',
    uso: 'Cordón que se amarra a la cintura para ceñir y ajustar el alba al cuerpo. Exclusivamente en celebraciones litúrgicas (misas y oficios sagrados), sobre el alba.',
    thumbImg: '<svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" viewBox="0 0 600 600"><defs><style>.cls-2{fill:none;stroke:#0e3a6f;stroke-linecap:round;stroke-linejoin:round;stroke-width:8px}</style></defs><g id="ICONOS"><path d="M0 0h600v600H0z" style="stroke-width:0;fill:none"/><path d="M266.74 396.21h30.37v30.37h-30.37zM274.09 426.58h15.68v23.51a7.84 7.84 0 0 1-7.84 7.84h0a7.84 7.84 0 0 1-7.84-7.84zM325.2 366.21h30.37v30.37H325.2zM332.55 396.58h15.68v23.51a7.84 7.84 0 0 1-7.84 7.84h0a7.84 7.84 0 0 1-7.84-7.84z" class="cls-2"/><path d="m325.94 239.27-67.37 67.37 26.89 26.89 1.47 1.47v61.21h-10v-57.07l-28.96-28.96-3.54-3.54 3.54-3.53 85.51-85.52" class="cls-2"/><path d="M345.38 364.19h-10v-28.2l-25.44-25.44-3.54-3.54 3.54-3.53 28.91-28.92v-57.49h10v61.64l-1.46 1.46-26.84 26.84 23.37 23.37 1.46 1.47v32.34" class="cls-2"/><ellipse cx="300" cy="172.07" class="cls-2" rx="255" ry="30"/><path d="M45 172.07v15M555 172.07v15M555 187.07c0 16.57-114.17 30-255 30s-255-13.43-255-30M53.03 179.57c28.3-12.94 128.14-22.5 246.97-22.5s218.66 9.56 246.97 22.5" class="cls-2"/></g></svg>',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/cingulo.webp',
    detailImage: null
  },
  {
    id: 'cruz-pectoral',
    label: 'Cruz pectoral',
    colors: ['dorado', 'plateado'],
    simbolismo: 'La fe en la victoria de Cristo, la protección contra el mal y el compromiso público de testimonio evangélico.',
    uso: 'Cruz que cuelga sobre el pecho mediante un cordón (oro y pasión en la liturgia) o una cadena (en el día a día). Uso continuo tanto en la vida cotidiana como en audiencias y todas las funciones litúrgicas.',
    thumbImg: '<svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" viewBox="0 0 600 600"><defs><style>.cls-2{fill:none;stroke:#0e3a6f;stroke-linecap:round;stroke-linejoin:round;stroke-width:8px}</style></defs><g id="ICONOS"><path d="M0 0h600v600H0z" style="stroke-width:0;fill:none"/><path d="M420 301.24v60h-90v177.52h-60V361.24h-90v-60h90V208.6h20.16v9.29h19.68v-9.29H330v92.64zM60 61.24l43.27 43.27a261.96 261.96 0 0 0 185.24 76.73h1.65M309.84 181.24h1.65c69.48 0 136.11-27.6 185.24-76.73L540 61.24" class="cls-2"/><path d="M290.16 168.91h19.68v48.97h-19.68z" class="cls-2"/></g></svg>',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/crucifijo.webp',
    detailImage: null
  },
  {
    id: 'estola',
    label: 'Estola',
    colors: ['festivo', 'pasión', 'penitencia', 'ordinario'],
    simbolismo: 'Su condición sacerdotal, la autoridad espiritual del orden sagrado y el yugo de Cristo.',
    uso: 'Banda larga de tela que se cuelga del cuello sobre el pecho. Celebraciones litúrgicas (misas), administración de sacramentos, bendiciones solemnes (como Urbi et Orbi) y actos pastorales.',
    thumbImg: '<svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" viewBox="0 0 600 600"><defs><style>.cls-2{fill:none;stroke:#0e3a6f;stroke-linecap:round;stroke-linejoin:round;stroke-width:8px}</style></defs><g id="ICONOS"><path d="M0 0h600v600H0z" style="stroke-width:0;fill:none"/><path d="M79.05 510v30M60.34 510v30M97.75 510v30M116.46 510v30M135.17 510v30M153.88 510v30M172.58 510v30M191.29 510v30M210 510v30M179.32 90v267.27L210 510H60l30.68-151.49V90z" class="cls-2"/><path d="M179.32 90v90L300 240v-90zM420.68 90v90L300 240v-90zM390 510v30M408.75 510v30M427.5 510v30M446.25 510v30M465 510v30M483.75 510v30M502.5 510v30M521.25 510v30M540 510v30" class="cls-2"/><path d="M509.32 90v267.27L540 510H390l30.68-150V90z" class="cls-2"/></g></svg>',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/estola.webp',
    detailImage: null
  },
  {
    id: 'dalmatica-pontifical',
    label: 'Dalmática pontifical',
    colors: ['festivo', 'pasión', 'penitencia', 'ordinario'],
    simbolismo: 'Recuerda que el Papa es también diácono y evoca la plenitud del Sacramento del Orden y el espíritu de servicio al prójimo.',
    uso: 'Túnica con mangas que el Papa viste debajo de la casulla para manifestar visualmente que es el servidor de todos. Misas solemnes de carácter pontifical.',
    thumbImg: '<svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" viewBox="0 0 600 600"><defs><style>.cls-2{fill:none;stroke:#0e3a6f;stroke-linecap:round;stroke-linejoin:round;stroke-width:8px}</style></defs><g id="ICONOS"><path d="M0 0h600v600H0z" style="stroke-width:0;fill:none"/><path d="M450 540H150V90l90-30h120l90 30zM150 330l-30 180h30zM450 330l30 180h-30z" class="cls-2"/><path d="m210 70 60 50V60h-30zM390 70l-60 50V60h30zM270 120h60M150 300l-90-30 90-180zM450 300l90-30-90-180zM210 450V270M360 420v120" class="cls-2"/></g></svg>',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/dalmatica.webp',
    detailImage: null
  },
  {
    id: 'casulla',
    label: 'Casulla',
    colors: ['festivo', 'pasión', 'ordinario', 'penitencia'],
    simbolismo: 'Simboliza el «revestirse de Cristo» y recuerda que celebra la misa en persona de Cristo.',
    uso: 'Vestidura exterior principal, abierta por los lados y sin mangas. Exclusivo para la celebración de la Santa Misa.',
    thumbImg: '<svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" viewBox="0 0 600 600"><defs><style>.cls-2{fill:none;stroke:#0e3a6f;stroke-linecap:round;stroke-linejoin:round;stroke-width:8px}</style></defs><g id="ICONOS"><path d="M0 0h600v600H0z" style="stroke-width:0;fill:none"/><path d="m450 540-60 30-90-30-90 30-60-30V60l90-30 30 30h60l30-30 90 30zM150 420l-90-90 90-270zM210 390V210M390 390v180M300 510v26.92M210 480v90M390 180v60" class="cls-2"/><path d="M133.05 403.05 120 480l30 30v-90zM450 420l90-90-90-270z" class="cls-2"/><path d="M466.95 403.05 480 480l-30 30v-90zM90 360v30l35.09 60" class="cls-2"/><path d="M510 360v30l-35.09 60" class="cls-2"/></g></svg>',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/casulla.webp',
    detailImage: null
  },
  {
    id: 'capa-pluvial',
    label: 'Capa pluvial',
    colors: ['festivo', 'pasión', 'ordinario', 'penitencia'],
    simbolismo: 'Simboliza el escudo de la gracia y la protección de Dios.',
    uso: 'Capa larga, abierta por delante y sujeta por un broche, que llega hasta los pies. Oficios litúrgicos fuera de la misa (vísperas, adoraciones eucarísticas y procesiones).',
    thumbImg: '<svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" viewBox="0 0 600 600"><defs><style>.cls-2{fill:none;stroke:#0e3a6f;stroke-linecap:round;stroke-linejoin:round;stroke-width:8px}</style></defs><g id="ICONOS"><path d="M0 0h600v600H0z" style="stroke-width:0;fill:none"/><path d="m60 540 180 30V60l-60 30z" class="cls-2"/><path d="M68.57 510H30L180 90M540 540l-180 30V60l60 30z" class="cls-2"/><path d="M531.43 510H570L420 90M360 91.67 300 120l-60-28.33V60l60 28.33L360 60zM240 60l60-30 60 30M300 88.33V120" class="cls-2"/><path d="m287.825 104.167 12.176-12.176 12.177 12.176L300 116.344zM240 510h120" class="cls-2"/></g></svg>',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/capa-pluvial.webp',
    detailImage: null
  },
  {
    id: 'palio',
    label: 'Palio',
    colors: ['blanco'],
    simbolismo: 'Símbolo del obispo como buen pastor. Los clavos evocan al Cordero crucificado para la salvación de la humanidad.',
    uso: 'Banda de lana que se coloca sobre los hombros encima de la casulla en misas solemnes papales.',
    thumbImg: '<svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" viewBox="0 0 600 600"><defs><style>.cls-2{fill:none;stroke:#0e3a6f;stroke-linecap:round;stroke-linejoin:round;stroke-width:8px}</style></defs><g id="ICONOS"><path d="M0 0h600v600H0z" style="stroke-width:0;fill:none"/><path d="M270 240h60v60h-60zM270 120h60v60h-60zM270 300h60v210c0 16.56-13.44 30-30 30h0c-16.56 0-30-13.44-30-30zM270 480h60M60 120l30-60 180 180v60z" class="cls-2"/><path d="m90 60 90 90 90 30v-60zM540 120l-30-60-180 180v60z" class="cls-2"/><path d="m510 60-90 90-90 30v-60zM300 285v-30M285 270h30M300 405v-30M285 390h30M300 165v-30M285 150h30M105 135v-30M90 120h30M495 135v-30M480 120h30" class="cls-2"/></g></svg>',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/palio.webp',
    detailImage: null
  },
  {
    id: 'mitra',
    label: 'Mitra',
    colors: ['blanco', 'dorado'],
    simbolismo: 'El esplendor de la santidad y la corona de gloria. Sus picos recuerdan el Antiguo y Nuevo Testamento.',
    uso: 'Tocado alto de dos picos con dos cintas (ínfulas) que cuelgan sobre la espalda. Celebraciones litúrgicas solemnes, procesiones y ritos sacramentales.',
    thumbImg: '<svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" viewBox="0 0 600 600"><defs><style>.cls-2{fill:none;stroke:#0e3a6f;stroke-linecap:round;stroke-linejoin:round;stroke-width:8px}</style></defs><g id="ICONOS"><path d="M0 0h600v600H0z" style="stroke-width:0;fill:none"/><path d="M270 154.04v134.09M330 154.04v134.09M270.3 326.36V540h-60.92l30.18-215.9.53.06c8.67.96 18.92 1.72 30.21 2.2M209.38 540v17.15M224.7 540v17.15M240.02 540v17.15M255.34 540v17.15M270.3 540v17.15M329.7 326.36V540h60.92l-30.18-215.9-.53.06c-8.67.96-18.92 1.72-30.21 2.2M390.62 540v17.15M375.3 540v17.15M359.98 540v17.15M344.66 540v17.15M329.7 540v17.15M409.96 266.31c-3.38 9.19-6.96 18.05-10.18 25.68-.21.49-.42.97-.63 1.45-.18.45-.37.89-.56 1.32-.19.44-.38.88-.56 1.31-.5 1.14-.98 2.24-1.44 3.31-.08.19-.17.37-.25.56s-.16.38-.24.56c-.8 1.8-1.55 3.48-2.24 5.02s-1.33 2.94-1.89 4.17l-.54 1.17c-.66 1.43-1.21 2.6-1.62 3.47-.53 1.15-.83 1.77-.83 1.77-.01-6-39.83-10.84-88.96-10.83-49.13.02-88.95 4.89-88.95 10.89 0 0-.34-.7-.95-1.99-.78-1.66-2-4.3-3.53-7.7-.8-1.78-1.68-3.76-2.63-5.91-.08-.18-.16-.37-.24-.56-.09-.19-.17-.37-.25-.56-1.49-3.4-3.11-7.21-4.81-11.29-.19-.45-.37-.9-.56-1.36l-.57-1.38c-.71-1.7-1.41-3.45-2.12-5.23-1.4-3.48-2.81-7.09-4.18-10.78-8.9-23.68-16.84-50.29-14.07-64.18C186.59 157.88 298.36 63 298.36 63s114.58 94.29 124.45 142.14c2.73 13.29-4.42 38.27-12.85 61.17" class="cls-2"/><path d="M388.98 316.1c0 6-39.83 10.87-88.95 10.89-49.13.01-88.96-4.84-88.96-10.83s39.82-10.87 88.95-10.89c49.13 0 88.95 4.83 88.96 10.83M202.81 297.93c23.51-5.98 58.34-9.77 97.21-9.8 38.89-.01 73.73 3.74 97.25 9.7" class="cls-2"/></g></svg>',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/mitra.webp',
    detailImage: null
  },
  {
    id: 'ferula',
    label: 'Férula',
    colors: ['dorado', 'plateado'],
    simbolismo: 'El cayado del pastor representa la guía del rebaño de Dios y su jurisdicción pastoral universal.',
    uso: 'Bastón pastoral que el Papa sostiene con su mano izquierda. Procesiones de entrada y salida de la misa y momentos específicos de las funciones litúrgicas públicas.',
    thumbImg: '<svg xmlns="http://www.w3.org/2000/svg" id="Capa_2" viewBox="0 0 600 600"><defs><style>.cls-2{fill:none;stroke:#0e3a6f;stroke-linecap:round;stroke-linejoin:round;stroke-width:8px}</style></defs><g id="ICONOS"><path d="M0 0h600v600H0z" style="stroke-width:0;fill:none"/><path d="M360 72.43h-47.65V30h-24.7v42.43H240v24.69h47.65V210h24.7V97.12H360zM293.86 240.71h12.35V570h-12.35zM287.65 210h24.77v11.35h-24.77zM291.87 221.53h16.27v11.35h-16.27z" class="cls-2"/></g></svg>',
    figureImage: 'https://s1.abcstatics.com/comun/narrativas/redaccion/2026/06/06/vestimentas-papa/images/figure/ferula.webp',
    detailImage: null
  }
]

import { refreshDescriptionOverflow } from '../utils/descriptionOverflow';

export default function papaViewer() {
  const itemsContainer = document.querySelector('.items-c');
  if (!itemsContainer) return;
  const title = document.querySelector('.item-label--main');
  const colorsContainer = document.querySelector('.item-colors');
  const simbolismoText = document.querySelector('.item-desc__grp--symbolism .item-desc__p');
  const usoText = document.querySelector('.item-desc__grp--usage .item-desc__p');
  const detailImageContainer = document.querySelector('.item-desc__grp--detail-img');
  const papaImage = document.querySelector('.papa-img');
  const DEFAULT_PAPA_IMAGE = papaImage?.src || '';
  const sortedItems = [...POPE_ITEMS].sort((a, b) => {
    if (a.id === 'sotana') return -1;
    if (b.id === 'sotana') return 1;
    return a.label.localeCompare(b.label);
  });

  function capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toLocaleUpperCase() + text.slice(1);
  }

  function getItemById(id) {
    return POPE_ITEMS.find(item => item.id === id);
  }

  const BASE_ITEM = getItemById('sotana');

  const state = {
    activePreset: null,
    selectedItems: [BASE_ITEM],
    focusedItem: BASE_ITEM
  };

  function clearDescription() {
    title.textContent = '';
    simbolismoText.textContent = '';
    usoText.textContent = '';
    colorsContainer.innerHTML = '';
    detailImageContainer.innerHTML = '';
  }

  function renderItemsGrid() {
    itemsContainer.innerHTML = '';
    sortedItems.forEach(item => {
      const li = document.createElement('li');
      li.className = 'item';
      li.innerHTML = ` <button class="item-btn" type="button" data-item="${item.id}"> <div class="item-img-c"> ${item.thumbImg} </div> <span class="item-label"> ${item.label} </span> </button> `;
      const button = li.querySelector('.item-btn');
      button.addEventListener('click', () => {
        handleItemClick(item.id);
      });
      itemsContainer.append(li);
    });
  }

  function renderGridState() {
    const buttons = itemsContainer.querySelectorAll('.item-btn');
    buttons.forEach(button => {
      const id = button.dataset.item;
      const isActive = state.selectedItems.some(item => item.id === id);
      button.parentElement.classList.toggle('is-active', isActive);
      if (isActive) {
        button.parentElement.setAttribute('aria-current', 'true');
      } else {
        button.parentElement.removeAttribute('aria-current');
      }
    });
  }

  function renderFigure() {
    if (!papaImage) return;
    const item = state.selectedItems[0];
    if (!item) {
      papaImage.src = DEFAULT_PAPA_IMAGE;
      return;
    }
    papaImage.src = item.figureImage;
  }

  function renderColors(colors) {
    colorsContainer.innerHTML = '';
    if (!colors?.length) return;
    colors.forEach(color => {
      const label = capitalize(color);
      const item = document.createElement('div');
      item.className = 'item-colors-item';
      item.innerHTML = ` <span class="item-color" style="background-color: ${COLOR_MAP[color]}" title="${label}" aria-hidden="true" ></span> <span class="item-color-label"> ${label} </span> `;
      colorsContainer.append(item);
    });
  }

  function renderDetailImage(src) {
    detailImageContainer.innerHTML = '';
    if (!src) return;
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.loading = 'lazy';
    detailImageContainer.append(img);
  }

  function renderDescription(data) {
    title.textContent = data.label || data.title || '';
    simbolismoText.textContent = data.simbolismo || '';
    usoText.textContent = data.uso || '';
    renderColors(data.colors);
    renderDetailImage(data.detailImage);
  }

  function renderState() {
    renderGridState();
    renderFigure();
    if (state.focusedItem) {
      renderDescription(state.focusedItem);
      refreshDescriptionOverflow(true);
      return;
    }
    clearDescription();
    refreshDescriptionOverflow(true);
  }

  function handleItemClick(id) {
    const item = getItemById(id);
    if (!item) return;
    state.activePreset = null;
    state.selectedItems = [item];
    state.focusedItem = item;
    renderState();
  }

  renderItemsGrid();
  renderState();
}