// NOTE: Helpers
import fadeOnScroll from './helpers/fadeOnScroll';
import moveEls from './helpers/moveEls';

// Version sin google sheets
import gameEvents, { DEFAULT_EVENTS } from './modules/gameEvents';
// Version con google sheets 
// import gameEventsFromSheet from './helpers/gameEventsSheet'; // Aqui llama al anterior import

// NOTE: Modules
export async function initAll() {
  fadeOnScroll('.scr-ind');
  moveEls(".v-a--d-s-1 .v-a-inf-c .v-a-s-t", ".v-d--abc", "prepend");

  // Opciones sin google sheets
  // Opción 1: usa los eventos por defecto (DEFAULT_EVENTS)
  gameEvents({
    selector: '.events-roll',
    typeGame: 'both',
    title: 'Línea temporal',
    timeline: {
      min: 1900,
      max: 2100,
      step: 10,
      startYear: 1950,
    },
  });
  // Opción 2: eventos propios hardcodeados
  // gameEvents({
  //   selector: '.events-roll',
  //   events: [
  //     {
  //       id: '1',
  //       description: 'Mi evento...',
  //       image: { src: 'https://...', alt: 'Texto alt' },
  //       correctTime: 1980,
  //     },
  //   ],
  // });
  // Opción 3: selector simple (usa DEFAULT_EVENTS y config por defecto)
  // gameEvents('.events-roll');

  // Opciones con google sheets
  // Mock activo por defecto (MOCK_SHEET_ROWS). Para sheet real: useMock: false + spreadsheetId.
  // await gameEventsFromSheet({
  //   selector: '.events-roll',
  //   typeGame: 'both',
  //   title: 'Línea temporal',
  //   useMock: true,
  //   // spreadsheetId: 'TU_SPREADSHEET_ID',
  //   // sheetName: 'Sheet1',
  //   timeline: {
  //     min: 1900,
  //     max: 2100,
  //     step: 10,
  //     startYear: 1950,
  //   },
  // });
}

// NOTE: Para prod el evento load de window se borra, dejamos solo:
// initAll();

window.addEventListener('load', initAll);