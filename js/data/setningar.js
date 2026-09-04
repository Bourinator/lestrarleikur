// Setningar fyrir Setningaströnd.
//   s    = stutt setning (2–5 orð, nútíð, endar á punkti)
//   e    = 1–3 tákn sem sýna setninguna (einstök í listanum)
//   eyda = vísir (0-miðaður) orðsins sem er falið í „Orðið sem vantar“
//   val  = tvö röng orð sem passa málfræðilega í eyðuna en ekki við myndina
//          (þegar eyda er 0 byrja rangorðin á stórum staf eins og setningin)
export const SETNINGAR = [
  // --- Dýr ---
  { s: 'Kötturinn sefur.',            e: '🐱💤',  eyda: 1, val: ['hoppar', 'syngur'] },
  { s: 'Hundurinn hleypur.',          e: '🐕💨',  eyda: 0, val: ['Kötturinn', 'Hesturinn'] },
  { s: 'Fuglinn syngur.',             e: '🐦🎵',  eyda: 1, val: ['sefur', 'syndir'] },
  { s: 'Fiskurinn syndir.',           e: '🐟🌊',  eyda: 0, val: ['Fuglinn', 'Hundurinn'] },
  { s: 'Hesturinn borðar gras.',      e: '🐴🌿',  eyda: 2, val: ['fisk', 'kjöt'] },
  { s: 'Kýrin gefur mjólk.',          e: '🐄🥛',  eyda: 2, val: ['egg', 'ull'] },
  { s: 'Kindin er hvít.',             e: '🐑⚪',  eyda: 2, val: ['svört', 'brún'] },
  { s: 'Froskurinn er grænn.',        e: '🐸🟢',  eyda: 2, val: ['rauður', 'gulur'] },
  { s: 'Býflugan býr til hunang.',    e: '🐝🍯',  eyda: 3, val: ['sultu', 'mjólk'] },
  { s: 'Músin borðar ost.',           e: '🐭🧀',  eyda: 2, val: ['kex', 'brauð'] },
  { s: 'Apinn klifrar í tré.',        e: '🐒🌴',  eyda: 1, val: ['syndir', 'flýgur'] },
  { s: 'Kanínan borðar gulrót.',      e: '🐰🥕',  eyda: 2, val: ['banana', 'brauð'] },
  { s: 'Fíllinn er stór.',            e: '🐘',    eyda: 2, val: ['lítill', 'gulur'] },
  { s: 'Ljónið öskrar.',              e: '🦁🔊',  eyda: 1, val: ['sefur', 'syndir'] },
  { s: 'Slangan er löng.',            e: '🐍',    eyda: 2, val: ['stutt', 'feit'] },
  { s: 'Skjaldbakan er hæg.',         e: '🐢',    eyda: 2, val: ['fljót', 'blá'] },
  { s: 'Fiðrildið flýgur.',           e: '🦋',    eyda: 1, val: ['syndir', 'sefur'] },
  { s: 'Svínið er bleikt.',           e: '🐷🌸',  eyda: 2, val: ['grænt', 'blátt'] },
  { s: 'Hænan verpir eggi.',          e: '🐔🥚',  eyda: 0, val: ['Kýrin', 'Músin'] },
  { s: 'Unginn er gulur.',            e: '🐤🟡',  eyda: 2, val: ['blár', 'rauður'] },
  { s: 'Snigillinn skríður.',         e: '🐌',    eyda: 1, val: ['flýgur', 'hoppar'] },
  { s: 'Gíraffinn er hár.',           e: '🦒',    eyda: 2, val: ['lágur', 'lítill'] },
  { s: 'Kengúran hoppar.',            e: '🦘',    eyda: 1, val: ['sefur', 'syndir'] },
  { s: 'Kisan er með fjóra fætur.',   e: '🐈🐾🐾', eyda: 3, val: ['tvo', 'þrjá'] },
  { s: 'Ég gef öndinni brauð.',       e: '🦆🍞',  eyda: 3, val: ['fisk', 'ost'] },
  { s: 'Bangsinn er brúnn.',          e: '🧸🟤',  eyda: 2, val: ['blár', 'hvítur'] },

  // --- Fólk ---
  { s: 'Mamma les bók.',              e: '👩📖',  eyda: 0, val: ['Pabbi', 'Afi'] },
  { s: 'Pabbi eldar mat.',            e: '👨‍🍳🍳', eyda: 0, val: ['Mamma', 'Amma'] },
  { s: 'Afi drekkur kaffi.',          e: '👴☕',  eyda: 2, val: ['safa', 'mjólk'] },
  { s: 'Amma prjónar.',               e: '👵🧶',  eyda: 1, val: ['syngur', 'dansar'] },
  { s: 'Barnið grætur.',              e: '👶😢',  eyda: 1, val: ['hlær', 'sefur'] },
  { s: 'Stelpan hlær.',               e: '👧😄',  eyda: 1, val: ['grætur', 'sefur'] },
  { s: 'Strákurinn hjólar.',          e: '👦🚲',  eyda: 1, val: ['syngur', 'les'] },
  { s: 'Konan dansar.',               e: '💃',    eyda: 1, val: ['sefur', 'les'] },
  { s: 'Maðurinn syngur.',            e: '👨🎤',  eyda: 0, val: ['Fuglinn', 'Stelpan'] },
  { s: 'Kennarinn skrifar.',          e: '👨‍🏫📝', eyda: 1, val: ['syngur', 'les'] },
  { s: 'Börnin hlaupa.',              e: '👧👦💨', eyda: 1, val: ['sofa', 'syngja'] },
  { s: 'Við syngjum saman.',          e: '👫🎵',  eyda: 1, val: ['sofum', 'borðum'] },
  { s: 'Jólasveinninn kemur.',        e: '🎅',    eyda: 0, val: ['Mamma', 'Hundurinn'] },
  { s: 'Kóngurinn er með kórónu.',    e: '🤴👑',  eyda: 3, val: ['húfu', 'hatt'] },
  { s: 'Snjókarlinn brosir.',         e: '⛄😊',  eyda: 1, val: ['grætur', 'sefur'] },

  // --- Ég ---
  { s: 'Ég klappa.',                  e: '👏',    eyda: 1, val: ['syng', 'sef'] },
  { s: 'Ég fer að sofa.',             e: '🛏️😴', eyda: 3, val: ['borða', 'lesa'] },
  { s: 'Ég bursta tennurnar.',        e: '🪥😁',  eyda: 2, val: ['skóna', 'hendurnar'] },
  { s: 'Ég þvæ hendurnar.',           e: '🧼🤲',  eyda: 2, val: ['fæturna', 'diskana'] },
  { s: 'Ég drekk safa.',              e: '🧃',    eyda: 2, val: ['vatn', 'mjólk'] },
  { s: 'Ég borða pitsu.',             e: '🍕',    eyda: 2, val: ['köku', 'súpu'] },
  { s: 'Ég teikna hjarta.',           e: '🖍️❤️', eyda: 2, val: ['hús', 'tré'] },
  { s: 'Ég spila á píanó.',           e: '🎹',    eyda: 3, val: ['gítar', 'flautu'] },
  { s: 'Ég á afmæli.',                e: '🎂🎈',  eyda: 2, val: ['hund', 'bíl'] },
  { s: 'Ég fæ gjöf.',                 e: '🎁',    eyda: 2, val: ['bók', 'köku'] },
  { s: 'Ég opna dyrnar.',             e: '🚪',    eyda: 2, val: ['gluggana', 'kassana'] },
  { s: 'Ég fer í bað.',               e: '🛁',    eyda: 3, val: ['bíó', 'búðina'] },
  { s: 'Ég fer í skólann.',           e: '🏫🎒',  eyda: 3, val: ['búðina', 'sund'] },
  { s: 'Ég horfi á sjónvarpið.',      e: '📺',    eyda: 3, val: ['bílinn', 'fuglinn'] },
  { s: 'Ég er með húfu.',             e: '🧢',    eyda: 3, val: ['trefil', 'kjól'] },
  { s: 'Ég er með gleraugu.',         e: '👓',    eyda: 3, val: ['skó', 'vettlinga'] },

  // --- Tölur ---
  { s: 'Ég sé þrjú epli.',            e: '🍎🍎🍎', eyda: 2, val: ['tvö', 'fimm'] },
  { s: 'Ég á tvo bolta.',             e: '⚽🎾',  eyda: 2, val: ['þrjá', 'fjóra'] },
  { s: 'Hér eru þrjár stjörnur.',     e: '⭐⭐⭐', eyda: 2, val: ['tvær', 'fimm'] },
  { s: 'Höndin er með fimm fingur.',  e: '🖐️',   eyda: 3, val: ['þrjá', 'tvo'] },
  { s: 'Ég á tvær hendur.',           e: '✋🤚',  eyda: 2, val: ['þrjár', 'fimm'] },
  { s: 'Klukkan er þrjú.',            e: '🕒3️⃣',  eyda: 2, val: ['sex', 'tólf'] },

  // --- Litir ---
  { s: 'Bíllinn er rauður.',          e: '🚗🔴',  eyda: 2, val: ['blár', 'grænn'] },
  { s: 'Sólin er gul.',               e: '☀️🟡',  eyda: 2, val: ['blá', 'græn'] },
  { s: 'Sjórinn er blár.',            e: '🌊🔵',  eyda: 2, val: ['rauður', 'gulur'] },

  // --- Hlutir, náttúra og veður ---
  { s: 'Síminn hringir.',             e: '📱📞',  eyda: 0, val: ['Bókin', 'Stóllinn'] },
  { s: 'Lampinn lýsir.',              e: '💡',    eyda: 0, val: ['Sólin', 'Tunglið'] },
  { s: 'Tunglið skín.',               e: '🌙',    eyda: 0, val: ['Sólin', 'Stjarnan'] },
  { s: 'Regnboginn er fallegur.',     e: '🌈',    eyda: 2, val: ['svartur', 'grár'] },
  { s: 'Það rignir.',                 e: '🌧️',   eyda: 1, val: ['snjóar', 'blæs'] },
  { s: 'Það snjóar.',                 e: '❄️',    eyda: 1, val: ['rignir', 'blæs'] },
  { s: 'Það er kalt úti.',            e: '🥶🧣',  eyda: 2, val: ['heitt', 'blautt'] },
  { s: 'Eldurinn er heitur.',         e: '🔥',    eyda: 2, val: ['kaldur', 'blár'] },
  { s: 'Ísinn er kaldur.',            e: '🍦🧊',  eyda: 2, val: ['heitur', 'svartur'] },
  { s: 'Sítrónan er súr.',            e: '🍋😖',  eyda: 2, val: ['sæt', 'heit'] },
  { s: 'Kakan er góð.',               e: '🧁😋',  eyda: 2, val: ['vond', 'köld'] },
  { s: 'Blómið vex.',                 e: '🌷',    eyda: 0, val: ['Tréð', 'Grasið'] },
  { s: 'Tréð er hátt.',               e: '🌳',    eyda: 2, val: ['lítið', 'blátt'] },
  { s: 'Fjallið er stórt.',           e: '⛰️',    eyda: 2, val: ['lítið', 'heitt'] },
  { s: 'Boltinn rúllar.',             e: '🏀',    eyda: 1, val: ['syngur', 'sefur'] },
  { s: 'Skórnir eru blautir.',        e: '👟💧',  eyda: 2, val: ['þurrir', 'stórir'] },

  // --- Farartæki ---
  { s: 'Traktorinn keyrir.',          e: '🚜',    eyda: 0, val: ['Bíllinn', 'Báturinn'] },
  { s: 'Flugvélin flýgur hátt.',      e: '✈️☁️', eyda: 0, val: ['Fuglinn', 'Bíllinn'] },
  { s: 'Báturinn siglir.',            e: '⛵',    eyda: 1, val: ['flýgur', 'keyrir'] },
  { s: 'Strætó stoppar.',             e: '🚌🛑',  eyda: 1, val: ['keyrir', 'flýgur'] },
  { s: 'Lestin kemur.',               e: '🚂',    eyda: 0, val: ['Bíllinn', 'Strætó'] },
  { s: 'Eldflaugin fer upp.',         e: '🚀',    eyda: 2, val: ['niður', 'heim'] },
];
