/* Heimar og borð. Röðin á kortinu fylgir hljóðaaðferðinni: stafir → rím og atkvæði → orð → setningar → tölur.
   Stafahópar (kennsluröð): G1 a s ó l í m · G2 i u ú r e n · G3 o t k f h b (+ð inni í orði) · G4 v d g j á æ · G5 p é y ý þ ö (+x)
   Borða-id eru varanleg (vistaðar stjörnur vísa í þau) — bæta má við borðum en ekki endurnýta id. */
export const G1 = 'asólím';
export const G2 = G1 + 'iuúren';
export const G3 = G2 + 'otkfhbð';
export const G4 = G3 + 'vdgjáæ';
export const G5 = G4 + 'péyýþöx';

export const HEIMAR = [
  { id: 'stafaland',      nafn: 'Stafaland',      takn: '🔤', litur: 'fjolublar', lysing: 'Lærðu stafina' },
  { id: 'rimfjall',       nafn: 'Rímfjall',       takn: '⛰️', litur: 'appelsinu', lysing: 'Klappaðu, rímaðu og hljóðaðu' },
  { id: 'ordaskogur',     nafn: 'Orðaskógur',     takn: '🌳', litur: 'graenn',    lysing: 'Lestu og stafaðu orð' },
  { id: 'setningastrond', nafn: 'Setningaströnd', takn: '🏖️', litur: 'blar',      lysing: 'Lestu setningar' },
  { id: 'talnaeyja',      nafn: 'Talnaeyja',      takn: '🔢', litur: 'bleikur',   lysing: 'Teldu, plús og mínus' },
];

const b = (id, heimur, nr, leikur, nafn, throf, st, limmidi, extra = {}) => Object.assign({ id, heimur, nr, leikur, nafn, throf, st, limmidi }, extra);

export const BORD = [
  /* ---- Stafaland ---- */
  b('stafaland-1',  'stafaland', 1,  'eins-stafur',   'Stafapör',             8,  { val: 3, stafir: G1 },                               '🌟'),
  b('stafaland-2',  'stafaland', 2,  'eins-stafur',   'Stórir og litlir',     8,  { val: 3, stafir: G1, par: true },                    '🍀'),
  b('stafaland-3',  'stafaland', 3,  'fyrsti-stafur', 'Fyrsti stafurinn',     8,  { val: 4, stada: 'fyrsti', stafir: G1 },              '🦄'),
  b('stafaland-4',  'stafaland', 4,  'finna-mynd',    'Finndu myndina',       8,  { snid: 'stafur', val: 3, stafir: G1 },               '🚀'),
  b('stafaland-5',  'stafaland', 5,  'eins-stafur',   'Nýir stafir',          8,  { val: 4, stafir: G2, par: true },                    '🍭'),
  b('stafaland-6',  'stafaland', 6,  'fyrsti-stafur', 'Fyrsti stafurinn 2',   10, { val: 6, stada: 'fyrsti', stafir: G2 },              '🐞'),
  b('stafaland-7',  'stafaland', 7,  'finna-mynd',    'Finndu myndina 2',     10, { snid: 'stafur', val: 4, stafir: G2 },               '🌺'),
  b('stafaland-8',  'stafaland', 8,  'eins-stafur',   'Fleiri stafir',        10, { val: 4, stafir: G3, par: true, likir: true },       '🎈'),
  b('stafaland-9',  'stafaland', 9,  'fyrsti-stafur', 'Fyrsti stafurinn 3',   10, { val: 6, stada: 'fyrsti', stafir: G3 },              '🏆'),
  b('stafaland-10', 'stafaland', 10, 'eins-stafur',   'Allir stafirnir',      10, { val: 6, stafir: null, par: true, likir: true },     '🐳'),
  b('stafaland-11', 'stafaland', 11, 'fyrsti-stafur', 'Fyrsti stafurinn 4',   10, { val: 8, stada: 'fyrsti', stafir: G5, likir: true }, '🍩'),
  b('stafaland-12', 'stafaland', 12, 'stafrofid',     'Stafrófið',            8,  { val: 4, gluggi: [0, 14] },                          '⚽'),
  b('stafaland-13', 'stafaland', 13, 'hradi',         'Kapp við klukkuna',    0,  { val: 6, stafir: G5 },                               '🎨', { timi: 60, markmid: [8, 12] }),

  /* ---- Rímfjall ---- */
  b('rimfjall-1', 'rimfjall', 1, 'atkvaedi',      'Klappaðu orðið',        8,  { hamark: 3, lengd: [2, 6] },                         '🦋'),
  b('rimfjall-2', 'rimfjall', 2, 'rim',           'Rímorð',                8,  { val: 3 },                                           '🍉'),
  b('rimfjall-3', 'rimfjall', 3, 'atkvaedi',      'Klappaðu lengri orð',   8,  { hamark: 4, lengd: [3, 12] },                        '🎁'),
  b('rimfjall-4', 'rimfjall', 4, 'rim',           'Rímorð 2',              10, { val: 4 },                                           '🌈'),
  b('rimfjall-5', 'rimfjall', 5, 'fyrsti-stafur', 'Síðasti stafurinn',     8,  { val: 4, stada: 'sidasti', stafir: G3 },             '🐝'),
  b('rimfjall-6', 'rimfjall', 6, 'hljoda-saman',  'Hljóðaðu saman',        8,  { lengd: [2, 3], samiFyrsti: false, stafir: G3 },     '🌙'),
  b('rimfjall-7', 'rimfjall', 7, 'hljoda-saman',  'Hljóðaðu saman 2',      10, { lengd: [2, 4], samiFyrsti: true, stafir: G4 },      '🎵'),
  b('rimfjall-8', 'rimfjall', 8, 'fyrsti-stafur', 'Síðasti stafurinn 2',   10, { val: 6, stada: 'sidasti', stafir: null },           '🍓'),
  b('rimfjall-9', 'rimfjall', 9, 'hradi',         'Kapp við klukkuna',     0,  { val: 6, stafir: G4 },                               '🎯', { timi: 60, markmid: [10, 15] }),

  /* ---- Orðaskógur ---- */
  b('ordaskogur-1',  'ordaskogur', 1,  'finna-mynd',    'Lestu orðið',            8,  { snid: 'ord', val: 3, lengd: [2, 4], somuUpphaf: false }, '🌳'),
  b('ordaskogur-2',  'ordaskogur', 2,  'stafa-ord',     'Stafaðu stutt orð',      8,  { lengd: [2, 3], val: 6, synaOrd: true, hljodrett: true }, '🍄'),
  b('ordaskogur-3',  'ordaskogur', 3,  'fyrsti-stafur', 'Hvaða staf vantar?',     8,  { val: 4, stada: 'serhljodi' },                            '🌰'),
  b('ordaskogur-4',  'ordaskogur', 4,  'rada-stofum',   'Raðaðu stöfunum',        8,  { lengd: [3, 4], hljodrett: true },                        '🦉'),
  b('ordaskogur-5',  'ordaskogur', 5,  'finna-mynd',    'Lestu orðið 2',          10, { snid: 'ord', val: 4, lengd: [3, 5], somuUpphaf: true },  '🍂'),
  b('ordaskogur-6',  'ordaskogur', 6,  'stafa-ord',     'Stafaðu orðið',          10, { lengd: [3, 5], val: 8, synaOrd: false },                 '🦊'),
  b('ordaskogur-7',  'ordaskogur', 7,  'fyrsti-stafur', 'Hvaða staf vantar? 2',   10, { val: 6, stada: 'midja' },                                '🐛'),
  b('ordaskogur-8',  'ordaskogur', 8,  'rada-stofum',   'Raðaðu stöfunum 2',      10, { lengd: [4, 5] },                                         '🌲'),
  b('ordaskogur-9',  'ordaskogur', 9,  'stafa-ord',     'Stóru orðin',            10, { lengd: [5, 9], val: 10, synaOrd: false },                '🦌'),
  b('ordaskogur-10', 'ordaskogur', 10, 'finna-mynd',    'Lestu orðið 3',          10, { snid: 'ord', val: 6, somuUpphaf: true },                 '🍁'),
  b('ordaskogur-11', 'ordaskogur', 11, 'hradi',         'Kapp við klukkuna',      0,  { val: 6, stafir: null },                                  '🏅', { timi: 60, markmid: [12, 18] }),

  /* ---- Setningaströnd ---- */
  b('setningastrond-1', 'setningastrond', 1, 'ordid-vantar',  'Orðið sem vantar',    8,  { hamarkOrd: 3 },                 '🐚'),
  b('setningastrond-2', 'setningastrond', 2, 'lesa-setningu', 'Lestu setninguna',    8,  { val: 3 },                       '🌊'),
  b('setningastrond-3', 'setningastrond', 3, 'rada-ordum',    'Raðaðu orðunum',      8,  { hamarkOrd: 3 },                 '⛵'),
  b('setningastrond-4', 'setningastrond', 4, 'ordid-vantar',  'Orðið sem vantar 2',  10, { hamarkOrd: 4 },                 '🐬'),
  b('setningastrond-5', 'setningastrond', 5, 'lesa-setningu', 'Lestu setninguna 2',  10, { val: 4, samiEfni: true },       '🦀'),
  b('setningastrond-6', 'setningastrond', 6, 'rada-ordum',    'Raðaðu orðunum 2',    10, { hamarkOrd: 4 },                 '🏄'),
  b('setningastrond-7', 'setningastrond', 7, 'ordid-vantar',  'Orðið sem vantar 3',  10, { hamarkOrd: 6 },                 '🐠'),
  b('setningastrond-8', 'setningastrond', 8, 'rada-ordum',    'Langar setningar',    10, { hamarkOrd: 5 },                 '🌴'),
  b('setningastrond-9', 'setningastrond', 9, 'lesa-setningu', 'Lestu setninguna 3',  12, { val: 4, samiEfni: true },       '🏝️'),

  /* ---- Talnaeyja ---- */
  b('talnaeyja-1',  'talnaeyja', 1,  'telja',         'Hvað eru mörg?',      8,  { hamark: 5 },                    '🎲'),
  b('talnaeyja-2',  'talnaeyja', 2,  'fleiri-faerri', 'Hvar eru fleiri?',    8,  { hamark: 5 },                    '🧮'),
  b('talnaeyja-3',  'talnaeyja', 3,  'plus-minus',    'Teldu hlutina',       8,  { snid: 'myndir', hamark: 5 },    '🍎'),
  b('talnaeyja-4',  'talnaeyja', 4,  'plus-minus',    'Plús og mínus',       8,  { snid: 'tolur', hamark: 5 },     '🚂'),
  b('talnaeyja-5',  'talnaeyja', 5,  'sagan',         'Hvað gerðist?',       8,  { hamark: 5 },                    '🎪'),
  b('talnaeyja-6',  'talnaeyja', 6,  'telja',         'Hvað eru mörg? 2',    10, { hamark: 10 },                   '🎂'),
  b('talnaeyja-7',  'talnaeyja', 7,  'plus-minus',    'Hvaða tölu vantar?',  10, { snid: 'vantar', hamark: 10 },   '🧩'),
  b('talnaeyja-8',  'talnaeyja', 8,  'plus-minus',    'Teldu hlutina 2',     10, { snid: 'myndir', hamark: 10 },   '🍪'),
  b('talnaeyja-9',  'talnaeyja', 9,  'sagan',         'Hvað gerðist? 2',     10, { hamark: 10 },                   '🎠'),
  b('talnaeyja-10', 'talnaeyja', 10, 'plus-minus',    'Stóru tölurnar',      10, { snid: 'tolur', hamark: 20 },    '🛸'),
  b('talnaeyja-11', 'talnaeyja', 11, 'fleiri-faerri', 'Hvar eru fleiri? 2',  10, { hamark: 12 },                   '🏰'),
];

export const LIMMIDAR = BORD.map(x => x.limmidi);
