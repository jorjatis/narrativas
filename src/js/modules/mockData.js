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

const userAnswers = [
  4, 3, 2, 3, 4, 2, 3, 4, 3, 3, 4, 4, 5, 2, 3, 4, 3, 2, 2, 4, 3, 3, 2, 3
];

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

export function getDistances(partyId) {
  const answers = partyAnswers[partyId];
  if (!answers) return [];

  return userAnswers.map((userScore, index) => distance(userScore, answers[index]));
}
