# Stafaleikur

Íslenskur lestrar- og reikningsleikur fyrir börn (4–7 ára) sem eru að læra stafina, hljóða saman,
lesa orð og setningar og telja. Leikurinn er venjuleg vefsíða — ekkert app, engin skráning — og
virkar á síma, spjaldtölvu og tölvu, líka án nettengingar eftir fyrstu heimsókn.

Spila: **https://bourinator.github.io/lestrarleikur/**

## Leikurinn

Barnið velur sér **leikmann** (mynd, litur, nafn) á heimaskjánum og ýtir á **Spila** — leikurinn fer
þá sjálfkrafa í næsta borð. Á **Kortinu** eru fimm heimar í þeirri röð sem hljóðaaðferðin kennir:

| Heimur | Efni | Borð |
| --- | --- | --- |
| 🔤 Stafaland | stafapör, fyrsti stafur orðs, stafrófið, kapp við klukkuna | 13 |
| ⛰️ Rímfjall | atkvæði (klappa), rím, síðasti stafur, hljóða saman | 9 |
| 🌳 Orðaskógur | lesa orð, stafa orð, raða stöfum, stafinn sem vantar | 11 |
| 🏖️ Setningaströnd | orðið sem vantar, lesa setningu, raða orðum | 9 |
| 🔢 Talnaeyja | telja, fleiri/færri, plús og mínus, „Hvað gerðist?“ | 11 |

Fyrsta borð hvers heims er opið; borð opnast þegar borðið á undan hefur fengið a.m.k. eina stjörnu.
Hvert borð gefur 1–3 **stjörnur** (eftir fjölda rangra umferða) og **límmiða** í Límmiðabókina
þegar það er klárað í fyrsta sinn. Síðasta borð hvers heims er kapp við klukkuna (60 sek) og
opnar ekkert — það er bara til gamans.

Stafirnir eru kenndir sem hljóð og í kennsluröð: `a s ó l í m · i u ú r e n · o t k f h b · v d g j á æ · p é y ý þ ö`.
Í hljóðaleikjum eru y/ý/é/ð/x aldrei markmið. Ef íslensk rödd er á tækinu eru orð og setningar
lesin upphátt (Web Speech API).

**Frjáls leikur** býður alla 17 leikina með þremur erfiðleikastigum (🐣 Létt, 🐥 Miðlungs, 🦅 Erfitt),
10 umferðir í einu, auk **„Æfa stafina mína“** sem æfir stafina sem barnið hefur átt erfiðast með.

Inni í leik: 🏠 gerir hlé (halda áfram / hætta), **Aa** skiptir á milli lítilla og stórra stafa.
Eftir 8 sekúndur án snertingar er spurningin lesin aftur, eftir 20 sekúndur birtist vísbending,
og eftir fjögur mistök í umferð sýnir leikurinn svarið og heldur áfram — barnið festist aldrei.

## Foreldrar

⚙️ neðst á heimaskjánum — haltu takkanum inni í 2 sekúndur. Þar er tölfræði fyrir hvern leikmann
(stjörnur, borð, mínútur, nákvæmni eftir leikjum, stafir sem þarf að æfa), stillingar (stafagerð
fyrir hvern leikmann; hljóð, hreyfimyndir og klukka fyrir tækið), flutningur framvindu á annað tæki
með kóða, nafnabreyting, „byrja upp á nýtt“ og eyðing leikmanns.

Framvindan er aðeins vistuð í vafranum (`localStorage`). Engum gögnum um börn er safnað; heimsóknir
eru taldar með GoatCounter án persónugreinanlegra upplýsinga.

## Ræsa á eigin tölvu

    ./start.sh          # python3 -m http.server 8080 og opnar vafrann

Engin uppsetning, ekkert build. Leikurinn er hreint HTML/CSS/JS (ES-einingar) og er birtur beint
af `main` með GitHub Pages.

## Uppbygging

```
index.html  manifest.webmanifest  sw.js  404.html  icons/
css/stafaleikur.css      hönnunarkerfið og sameiginlegir leikjahlutar (skeljarstílar neðst)
js/app.js                skelin: ræsing, leiðarkerfi (#/…), þjónustuvirki
js/skjair/               heim, kort, bord (borð + niðurstaða), frjals, limmidar, foreldrar, sameiginlegt
js/kjarni/               leikjavel (vélin sem keyrir borð), stada (vistun), hljod, ordaval, skraut, prof
js/data/                 ord.js (orðabanki), rim.js, setningar.js, bord.js (heimar og borð)
js/leikir/               ein eining á hvern leik + index.js (hleður þær allar)
dev/harness.html         keyrir einn leik beint: dev/harness.html?leikur=<id>&erf=lett
```

### Bæta við efni

- **Orð** (`js/data/ord.js`): `{ o:'banani', e:'🍌', a:['ba','na','ni'], f:'matur' }` — orðið í nefnifalli
  eintölu með lágstöfum, EITT emoji, atkvæðin, flokkur. `fh:false` ef orðið hentar ekki sem
  fyrsta-hljóðs-markmið. `HLUTIR` eru talanlegir hlutir fyrir reikning: `{ e:'🍎', ft:'epli', kyn:'hk' }`.
- **Rím** (`js/data/rim.js`): listi af rímhópum, 2–4 orð sem ríma; hópar mega ekki ríma innbyrðis.
- **Setningar** (`js/data/setningar.js`): `{ s:'Kötturinn sefur.', e:'🐱💤', eyda:1, val:['hoppar','syngur'] }`
  — `eyda` er orðið sem vantar (0-miðað), `val` tvö röng orð sem passa málfræðilega.
- **Borð** (`js/data/bord.js`): `b(id, heimur, nr, leikur, nafn, throf, st, limmidi, { timi, markmid })`.
  Borða-id eru varanleg (stjörnur vísa í þau) — bæta má við borðum en ekki endurnýta id.
- **Nýr leikur**: skrá í `js/leikir/<id>.js` sem flytur út `{ id, nafn, lysing, takn, flokkur, sjalfgefid,
  erfidleikar, umferd(ctx) }` (sjá `eins-stafur.js` sem fyrirmynd og samninginn í `leikjavel.js`), og id bætt
  í `LEIKJA_ID` í `js/leikir/index.js` og `SKRAR` í `sw.js`.

### Ný útgáfa

`sw.js` forhleður allar skrár leiksins í skyndiminni. Þegar skrám er breytt eða bætt við þarf að
**hækka `UTGAFA`** í `sw.js` (og halda `SKRAR` í samræmi). Notendur fá þá „Ný útgáfa 🎈“ og
uppfærslan tekur gildi þegar þeir ýta á hana (aldrei í miðju borði).

### Prófun

`?prof=1` keyrir leikinn í prófunarham (engar biðir, engin hreyfimynd eða tal, ekkert þjónustuvirki)
og `?frae=<tala>` sáir slembitölunum svo umferðir séu endurtakanlegar. Hvert svar ber `data-gildi`
og leiksvæðið `data-svar` með rétta svarinu, svo sjálfvirk prófun geti spilað borð. Villur safnast í
`window.__stafaleikur.villur`. Prófunarskriftur fyrir höfuðlausan Chrome (puppeteer-core) eru
geymdar utan vefsins í `dev/qa/` (ekki hluti af leiknum).
