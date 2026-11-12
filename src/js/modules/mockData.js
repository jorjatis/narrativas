export const parties = [
  { id: 'pp', name: 'PP', colorClass: 'is-pp' },
  { id: 'psoe', name: 'PSOE', colorClass: 'is-psoe' },
  { id: 'vox', name: 'VOX', colorClass: 'is-vox' },
  { id: 'frente-amplio', name: 'F. Amplio', colorClass: 'is-frente-amplio' },
  { id: 'erc', name: 'ERC', colorClass: 'is-erc' },
  { id: 'eh-bildu', name: 'EH Bildu', colorClass: 'is-eh-bildu' },
  { id: 'junts', name: 'Junts', colorClass: 'is-junts' },
  { id: 'pnv', name: 'PNV', colorClass: 'is-pnv' },
  { id: 'podemos', name: 'Podemos', colorClass: 'is-podemos' },
  { id: 'cc', name: 'CC', colorClass: 'is-cc' },
  { id: 'adelante', name: 'Adelante', colorClass: 'is-adelante' },
  { id: 'bng', name: 'BNG', colorClass: 'is-bng' },
  { id: 'compromis', name: 'Compromís', colorClass: 'is-compromis' },
  { id: 'salf', name: 'SALF', colorClass: 'is-salf' },
];

export const partyChosen = 'pp';

let matrixChosenId = partyChosen;
let matrixYou = null;

export function setMatrixChosen(id) {
  if (!parties.some((party) => party.id === id)) return;
  matrixChosenId = id;
}

const userListeners = new Set();

export function onUserAnswersChange(listener) {
  userListeners.add(listener);
}

function scoreFromAnswers(answers) {
  return Math.round(axisScore(answers) * 10) / 10;
}

function publishAnswers(answers) {
  userAnswers = answers.slice();
  const mid = Math.max(1, Math.ceil(userAnswers.length / 2));
  matrixYou = {
    economic: scoreFromAnswers(userAnswers.slice(0, mid)),
    social: scoreFromAnswers(userAnswers.slice(mid)),
  };
  const nextTu = themes.map((_, index) => {
    const slice = userAnswers.slice(index * 3, index * 3 + 3);
    if (!slice.length) return 3;
    const mean = slice.reduce((sum, value) => sum + value, 0) / slice.length;
    return Math.round(mean * 10) / 10;
  });
  themeScores.tu.splice(0, themeScores.tu.length, ...nextTu);
  userListeners.forEach((listener) => listener());
}

// Las respuestas del test alimentan la matriz, el radial y las barras.
export function applyUserAnswers(answers) {
  const scores = answers
    .map((value) => Number(value))
    .filter((value) => value >= 1 && value <= 5);
  if (!scores.length) return;
  publishAnswers(scores);
}

export function randomizeMatrixYou() {
  publishAnswers(Array.from({ length: 24 }, () => 1 + Math.floor(Math.random() * 5)));
}

export function getParty(id) {
  return parties.find((party) => party.id === id);
}

export const themes = [
  'Inmigración',
  'Vivienda',
  'Territorialidad',
  'Impuestos',
  'Derechos sociales',
  'Medio ambiente',
  'Seguridad',
  'Unión Europea',
];

export const themeScores = {
  tu: [4, 2, 3, 3, 5, 3, 3, 3],
  pp: [2, 4, 4, 3, 2, 2, 5, 3],
  psoe: [3, 4, 2, 4, 5, 4, 2, 4],
  vox: [5, 1, 5, 1, 2, 1, 5, 2],
};

let userAnswers = [
  4, 3, 2, 3, 4, 2, 3, 4, 3, 3, 4, 4, 5, 2, 3, 4, 3, 2, 2, 4, 3, 3, 2, 3
];

// Respuestas del cuestionario (1-5) y partido elegido. El mock de los
// widgets sigue con `userAnswers` hasta que se enchufe este resultado.
let testAnswers = [];
let testParty = null;

export function setTestAnswers(answers) {
  testAnswers = answers.map((value) => {
    const score = Number(value);
    return score >= 1 && score <= 5 ? score : null;
  });
}

export function getTestAnswers() {
  return testAnswers.slice();
}

export function setTestParty(id) {
  testParty = parties.some((party) => party.id === id) ? id : null;
}

export function getTestParty() {
  return testParty;
}

const partyAnswers = {
  pp: [
    4, 4, 3, 4, 2, 4, 4, 2, 2, 4, 2, 4, 4, 2, 2, 4, 1, 3, 3, 2, 2, 2, 1, 3
  ],
  psoe: [
    5, 2, 1, 3, 5, 1, 2, 5, 4, 2, 5, 2, 5, 4, 4, 3, 4, 1, 1, 5, 4, 5, 4, 5
  ],
  vox: [
    1, 5, 5, 2, 1, 5, 5, 1, 1, 5, 1, 5, 3, 1, 1, 5, 1, 4, 5, 1, 1, 1, 1, 1
  ],
};

export function distance(userScore, partyScore) {
  return Math.round(Math.abs(userScore - partyScore) / 4 * 100);
}

function answersOf(partyId) {
  if (partyAnswers[partyId]) return partyAnswers[partyId];
  const target = matrixTargets[partyId];
  if (!target) return null;
  return [...answersFromScore(target.economic, 12), ...answersFromScore(target.social, 12)];
}

export function getDistances(partyId) {
  const answers = answersOf(partyId);
  if (!answers) return [];

  return userAnswers.map((userScore, index) => distance(userScore, answers[index]));
}

const MATRIX_AXIS = 12;

const matrixTargets = {
  tu: { economic: 86, social: 63 },
  pp: { economic: 63, social: 63 },
  vox: { economic: 78, social: 79 },
  salf: { economic: 83, social: 90 },
  psoe: { economic: 40, social: 40 },
  'frente-amplio': { economic: 24, social: 13 },
  erc: { economic: 22, social: 26 },
  'eh-bildu': { economic: 28, social: 35 },
  junts: { economic: 55, social: 50 },
  pnv: { economic: 59, social: 30 },
  podemos: { economic: 13, social: 9 },
  cc: { economic: 38, social: 54 },
  adelante: { economic: 32, social: 22 },
  bng: { economic: 43, social: 23 },
  compromis: { economic: 33, social: 23 },
};

parties.forEach((party) => {
  if (themeScores[party.id] || !matrixTargets[party.id]) return;
  const economic = 1 + (matrixTargets[party.id].economic / 100) * 4;
  const social = 1 + (matrixTargets[party.id].social / 100) * 4;
  themeScores[party.id] = themes.map((_, index) => {
    const base = index % 2 === 0 ? economic : social;
    const wobble = ((index % 3) - 1) * 0.6;
    return Math.min(5, Math.max(1, Math.round(base + wobble)));
  });
});

function answersFromScore(score, count = MATRIX_AXIS) {
  const total = Math.round((1 + (score / 100) * 4) * count);
  const answers = Array.from({ length: count }, () => 1);
  let left = total - count;
  let index = 0;

  while (left > 0 && index < count * 5) {
    const slot = index % count;
    if (answers[slot] < 5) {
      answers[slot] += 1;
      left -= 1;
    }
    index += 1;
  }

  return answers;
}

function axisScore(answers) {
  const sum = answers.reduce((total, value) => total + (value - 1) / 4, 0);
  return (sum / answers.length) * 100;
}

const matrixAnswers = Object.fromEntries(
  Object.entries(matrixTargets).map(([id, target]) => [id, {
    economic: answersFromScore(target.economic),
    social: answersFromScore(target.social),
  }])
);

export function getMatrixModel() {
  const scores = Object.fromEntries(
    Object.entries(matrixAnswers).map(([id, answers]) => [id, {
      economic: axisScore(answers.economic),
      social: axisScore(answers.social),
    }])
  );
  const you = matrixYou || scores.tu;
  const max = Math.hypot(100, 100);
  const ranked = parties
    .filter((party) => scores[party.id])
    .map((party) => {
      const score = scores[party.id];
      const gap = Math.hypot(you.economic - score.economic, you.social - score.social);
      return {
        party,
        score,
        distance: gap,
        closeness: Math.round((1 - Math.min(gap, max) / max) * 100),
      };
    })
    .sort((a, b) => a.distance - b.distance);

  const chosen = ranked.find((item) => item.party.id === matrixChosenId) ?? ranked[0];

  return {
    you,
    scores,
    ranked,
    closest: ranked[0],
    chosen,
    closeness: chosen.closeness,
  };
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return function random() {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Nube de lectores. `force` es el peso del grupo (cuánta gente cae ahí);
// al llegar las estadísticas reales se sustituye este mock por la misma forma.
export function getMatrixReaders(seed = 20261106) {
  const random = mulberry32(seed >>> 0);
  const shift = seed === 20261106 ? 0 : 12;
  const clusters = [
    { economic: 33, social: 68, n: 15, spreadX: 11, spreadY: 8, force: 26 },
    { economic: 18, social: 61, n: 10, spreadX: 7, spreadY: 7, force: 14 },
    { economic: 25, social: 47, n: 12, spreadX: 9, spreadY: 8, force: 18 },
    { economic: 19, social: 31, n: 11, spreadX: 8, spreadY: 8, force: 12 },
    { economic: 35, social: 22, n: 9, spreadX: 7, spreadY: 6, force: 9 },
    { economic: 53, social: 38, n: 8, spreadX: 4, spreadY: 10, force: 15 },
    { economic: 59, social: 27, n: 5, spreadX: 4, spreadY: 6, force: 7 },
    { economic: 74, social: 70, n: 7, spreadX: 7, spreadY: 6, force: 10 },
    { economic: 80, social: 57, n: 4, spreadX: 5, spreadY: 4, force: 6 },
  ].map((cluster) => {
    if (!shift) return cluster;
    return {
      ...cluster,
      economic: clamp(cluster.economic + (random() - 0.5) * shift, 10, 90),
      social: clamp(cluster.social + (random() - 0.5) * shift, 10, 90),
    };
  });

  return clusters.flatMap((cluster) => Array.from({ length: cluster.n }, () => {
    const drift = () => ((random() + random() + random()) / 3 - 0.5) * 2;
    return {
      economic: clamp(cluster.economic + drift() * cluster.spreadX, 7, 93),
      social: clamp(cluster.social + drift() * cluster.spreadY, 7, 93),
      force: Math.max(1, Math.round(cluster.force * (0.4 + random() * 0.85))),
    };
  }));
}
