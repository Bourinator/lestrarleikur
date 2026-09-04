// Rímorð fyrir Rímfjall.
//
// RIM er listi af rímhópum. Hver hópur er listi af 2–4 orðum sem ríma saman
// (sama áhersluhljóð + sama ending), t.d. bíll / fíll / krókódíll.
//   o = orðið (nefnifall, eintala, án greinis, lágstafir)
//   e = EITT emoji sem sýnir orðið ótvírætt
//
// Reglur sem gögnin fylgja (og leikurinn treystir á):
//   - Engir tveir hópar ríma saman, svo rangt svar úr öðrum hópi getur aldrei rímað
//     fyrir slysni (t.d. er bara einn hópur með -ós, einn með -ól, einn með -ór).
//   - Hvert emoji kemur aðeins fyrir einu sinni í allri skránni.
//   - Hvert orð er algengt, áþreifanlegt nafnorð sem barn á aldrinum 4–7 ára þekkir.

export const RIM = [
  // -íll
  [ { o: 'bíll',      e: '🚗' }, { o: 'fíll',    e: '🐘' }, { o: 'krókódíll', e: '🐊' } ],
  // -ús
  [ { o: 'hús',       e: '🏠' }, { o: 'mús',     e: '🐭' } ],
  // -ók
  [ { o: 'bók',       e: '📖' }, { o: 'brók',    e: '🩲' } ],
  // -ól
  [ { o: 'sól',       e: '☀️' }, { o: 'hjól',    e: '🚲' } ],
  // -ís
  [ { o: 'ís',        e: '🍦' }, { o: 'grís',    e: '🐷' } ],
  // -ós
  [ { o: 'rós',       e: '🌹' }, { o: 'ljós',    e: '💡' }, { o: 'dós',       e: '🥫' } ],
  // -ór
  [ { o: 'snjór',     e: '❄️' }, { o: 'skór',    e: '👟' }, { o: 'sjór',      e: '🌊' } ],
  // -ál
  [ { o: 'nál',       e: '🪡' }, { o: 'skál',    e: '🥣' }, { o: 'kál',       e: '🥬' } ],
  // -önd
  [ { o: 'önd',       e: '🦆' }, { o: 'hönd',    e: '✋' }, { o: 'strönd',    e: '🏖️' } ],
  // -egg
  [ { o: 'egg',       e: '🥚' }, { o: 'skegg',   e: '🧔' } ],
  // -örn
  [ { o: 'björn',     e: '🐻' }, { o: 'örn',     e: '🦅' } ],
  // -arn
  [ { o: 'barn',      e: '👶' }, { o: 'garn',    e: '🧶' } ],
  // -ind (y = i)
  [ { o: 'kind',      e: '🐑' }, { o: 'mynd',    e: '🖼️' } ],
  // -iskur
  [ { o: 'fiskur',    e: '🐟' }, { o: 'diskur',  e: '🍽️' } ],
  // -okkur
  [ { o: 'sokkur',    e: '🧦' }, { o: 'kokkur',  e: '👨‍🍳' } ],
  // -ingur
  [ { o: 'hringur',   e: '💍' }, { o: 'fingur',  e: '☝️' } ],
  // -ukka
  [ { o: 'klukka',    e: '⏰' }, { o: 'krukka',  e: '🫙' } ],
  // -aska
  [ { o: 'taska',     e: '👜' }, { o: 'flaska',  e: '🍾' } ],
  // -akki
  [ { o: 'jakki',     e: '🧥' }, { o: 'pakki',   e: '📦' }, { o: 'krakki',    e: '🧒' } ],
  // -afi
  [ { o: 'afi',       e: '👴' }, { o: 'safi',    e: '🧃' } ],
  // -amma
  [ { o: 'amma',      e: '👵' }, { o: 'mamma',   e: '👩' } ],
  // -abbi
  [ { o: 'pabbi',     e: '👨' }, { o: 'krabbi',  e: '🦀' } ],
  // -úður
  [ { o: 'trúður',    e: '🤡' }, { o: 'lúður',   e: '📯' }, { o: 'brúður',    e: '👰' } ],
  // -óna
  [ { o: 'sítróna',   e: '🍋' }, { o: 'króna',   e: '🪙' }, { o: 'kóróna',    e: '👑' } ],
  // -úfa
  [ { o: 'dúfa',      e: '🕊️' }, { o: 'húfa',    e: '🧢' } ],
  // -áni
  [ { o: 'fáni',      e: '🚩' }, { o: 'máni',    e: '🌙' } ],
  // -að
  [ { o: 'bað',       e: '🛁' }, { o: 'blað',    e: '📰' } ],
  // -affi
  [ { o: 'gíraffi',   e: '🦒' }, { o: 'kaffi',   e: '☕' } ],
  // -aka
  [ { o: 'kaka',      e: '🎂' }, { o: 'skjaldbaka', e: '🐢' } ],
];
