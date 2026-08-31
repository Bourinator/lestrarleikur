# Stafaleikur

Lestrarleikur á íslensku fyrir byrjendur. Mynd birtist — barnið ýtir á rétta
stafinn á lyklaborðinu.

## Ræsa

    ~/lestrarleikur/start.sh

Opnast á http://localhost:8080

## Leikirnir

Á valmyndinni velur hann leik (eða ýtir á `1`–`6`):

**1. Finndu stafinn** — mynd birtist, hann slær inn stafinn. Þrjú borð:

1. *Fyrsti stafurinn* — orðið sést, fyrsti stafurinn er falinn. 10 rétt → næsta borð.
2. *Stuttu orðin* — allt orðið stafað (orð með 4 stöfum eða færri).
3. *Stóru orðin* — lengri orðin stafað.

**2. Finndu myndina** — stafur birtist, ýmist stór (`B`) eða lítill (`b`), og fjórar
myndir. Hann velur myndina sem byrjar á þeim staf, með tökkunum `1`–`4` eða með
því að smella. Undir stafnum sést alltaf parið `B b` svo hann tengi stóra og litla
stafinn saman.

### Stærðfræði

**3. Plús og mínus** — venjuleg dæmi, `3 + 2 = ?`, og hann velur svarið úr
tölutökkunum fyrir neðan.

**4. Teldu hlutina** — sama dæmi en með myndum: `🍎🍎🍎 ➕ 🍎🍎`. Í mínusdæmum
birtast allir hlutirnir og þeir sem dragast frá eru krossaðir út, svo hann sjái
frádráttinn í stað þess að þurfa að ímynda sér hann.

**5. Hvað vantar?** — `4 + ? = 7`. Hann finnur töluna sem vantar í miðjuna.

**6. Hvað gerðist?** — hlutirnir birtast einn og einn á sviðinu, svo gerist eitthvað:
blöðrur springa 💥, epli eru borðuð 😋, fuglar fljúga burt 💨, stjörnur slokkna ✨ —
eða fleiri bætast við. Hann telur svo það sem eftir stendur. Hlutirnir sem hverfa
eru raunverulega fjarlægðir af skjánum, svo hann getur talið svarið beint í stað
þess að reikna það í huganum.

Allir fjórir byrja með tölur upp að 5. Eftir 8 rétt svör hækkar þakið í 10, svo 15
og loks 20, og tölutökkunum fjölgar samhliða. Rangt svar gefur vísbendingu
(„aðeins of hátt" / „aðeins of lágt") og dofnar út, svo hann getur ekki valið
sömu vitlausu töluna aftur.

## Stýring

- Leikur 1: stafatakkar = svara. Leikur 2: `1`–`4` = velja mynd.
- Bilstöng = heyra orðið aftur (eða smella á myndina)
- Enter/bilstöng = halda áfram á verðlaunaskjá
- `Esc` eða 🏠 = aftur í valmyndina

## Hljóð

Leikurinn spilar hljóðbrellur (rétt / rangt / nýtt borð) sem eru búnar til í
vafranum sjálfum — engar hljóðskrár.

Talað mál er ekki með: macOS 26 býður ekki upp á íslenska talgervilsrödd
(raddasafn Apple nær yfir 25 tungumál og íslenska er ekki þar á meðal). Ef
íslensk rödd verður einhvern tímann uppsett á vélinni les leikurinn orðin
sjálfkrafa upphátt — kóðinn þekkir hana og notar hana þá.

## Bæta við orðum

Efst í `<script>` blokkinni í `index.html` er listinn `ORD`. Bættu við línu:

    {o:'sæla', e:'😀'},

Orðið verður sjálfkrafa með í réttu borði eftir lengd.
