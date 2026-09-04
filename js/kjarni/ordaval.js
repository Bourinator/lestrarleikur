/* Orðaval: sameiginlegt val á orðum og truflunum svo allir leikir hegði sér eins.
   - veljaOrd({stafir, lengd, n, fordast, sia}) víkkar síurnar í fastri röð ef of fá orð finnast
   - truflStafir(rett, n, {likir}) velur truflunarstafi, helst „líka“ stafi (b/d/p, m/n, a/á …)
   - truflOrd(rett, n, {samiFyrsti}) velur truflunarorð, a.m.k. eitt með sama fyrsta staf ef óskað
   Hver leikjavél fær sitt `notad`-sett svo orð endurtaki sig ekki innan borðs. */
import { stokka, velja, stafir as skipta, nfc } from './skraut.js';

/* stafir sem hljóma eins — mega ekki vera saman sem svar + truflun í hljóðleikjum */
export const SAMHLJOMA = { i: 'y', y: 'i', í: 'ý', ý: 'í' };
/* stafir sem eru aldrei markmið í hljóðleikjum (fyrsti stafur, finna mynd, kapp): y/ý/é hafa engin barnaorð, ð/x byrja ekki orð */
export const EKKI_HLJODMARKMID = new Set(['y', 'ý', 'é', 'ð', 'x']);

/* hljóðrétt orð: ekkert af ll/nn/au/ei/ey/hv/hj/fn/fl/rn/rl/pp/tt/kk-gildrunum */
const GILDRUR = /ll|nn|au|ei|ey|^hv|^hj|^hl|^hn|^hr|fn|fl|rn|rl|pp|tt|kk|gg|dd|bb|mm|ng|nk|x/;
export const erHljodrett = o => !GILDRUR.test(typeof o === 'string' ? o : o.o);
/* öruggt fyrsta hljóð: merkt fh:false í gögnum eða byrjar á hv/hj/hl/hn/hr */
export const oruggtFyrstaHljod = o => o.fh !== false && !/^h[vjlnr]/.test(o.o);
export const nucleusFjoldi = o => ((typeof o === 'string' ? o : o.o).match(/au|ei|ey|[aáeéiíoóuúyýæö]/g) || []).length;

export const LIKIR_STAFIR = {
  a: 'áoe', á: 'aóé', b: 'dpð', d: 'bðp', ð: 'dbþ', e: 'éao', é: 'eáó', f: 'tþr', g: 'pj', h: 'nkb', i: 'íjl', í: 'ijý',
  j: 'ig', k: 'hxt', l: 'ití', m: 'nu', n: 'mu', o: 'óaö', ó: 'oöá', p: 'bdþ', r: 'nf', s: 'z', t: 'fl', u: 'úvn', ú: 'uýv',
  v: 'uw', x: 'k', y: 'ýv', ý: 'yí', þ: 'pbð', æ: 'aö', ö: 'oó',
};

let nfcBuid = false;
export function nyttOrdaval(ORD, STAFROF) {
  if (!nfcBuid) { ORD.forEach(o => { o.o = nfc(o.o); if (o.a) o.a = o.a.map(nfc); }); nfcBuid = true; }
  const notad = new Set();
  const fyrsti = o => skipta(o.o)[0].toLowerCase();
  const lengdIn = (o, l) => !l || (skipta(o.o).length >= l[0] && skipta(o.o).length <= l[1]);
  const byrjarA = (o, st) => !st || st.includes(fyrsti(o));
  const allirI = (o, st) => !st || skipta(o.o).every(s => st.includes(s.toLowerCase()));

  return {
    notad,
    /** velur n ólík orð; víkkar síurnar í fastri röð ef of fá finnast:
     *  stafir      — orðið byrjar á einum af þessum stöfum (eða: allir stafir orðsins eru í settinu ef allirStafir:true)
     *  lengd       — [min,max] stafafjöldi
     *  hljodrett   — engar ll/nn/au/ei/hv…-gildrur (byrjendaborð)
     *  fyrstaHljod — aðeins orð með öruggt fyrsta hljóð (hljóðleikir)
     *  fordast     — orð sem má ekki velja; sia — sérsía */
    veljaOrd({ stafir, lengd, n = 1, fordast = [], sia, allirStafir = false, hljodrett = false, fyrstaHljod = false } = {}) {
      const st = stafir ? [...stafir].map(s => s.toLowerCase()) : null;
      const ekki = new Set(fordast.map(o => (typeof o === 'string' ? o : o.o)));
      const grunn = ORD.filter(o => !ekki.has(o.o) && (!sia || sia(o)) && (!fyrstaHljod || (oruggtFyrstaHljod(o) && !EKKI_HLJODMARKMID.has(fyrsti(o)))));
      const stafaSia = o => (allirStafir ? allirI(o, st) : byrjarA(o, st));
      const tilraunir = [
        o => stafaSia(o) && lengdIn(o, lengd) && (!hljodrett || erHljodrett(o)) && !notad.has(o.o),
        o => stafaSia(o) && lengdIn(o, lengd) && (!hljodrett || erHljodrett(o)),
        o => byrjarA(o, st) && lengdIn(o, lengd) && !notad.has(o.o),
        o => byrjarA(o, st) && lengdIn(o, lengd),
        o => lengdIn(o, lengd) && !notad.has(o.o),
        o => lengdIn(o, lengd),
        o => byrjarA(o, st),
        () => true,
      ];
      let valin = [];
      for (const t of tilraunir) {
        const hopur = stokka(grunn.filter(t)).filter(o => !valin.includes(o));
        valin = valin.concat(hopur).slice(0, n);
        if (valin.length >= n) break;
      }
      valin.forEach(o => notad.add(o.o));
      return valin;
    },
    /** n truflunarstafir ólíkir rétta stafnum (og hver öðrum); helst líkir stafir, síðan úr stafrófinu */
    truflStafir(rett, n, { likir = true, ur, hljod = false } = {}) {
      rett = String(rett).toLowerCase();
      const ut = new Set([rett]);
      if (hljod && SAMHLJOMA[rett]) ut.add(SAMHLJOMA[rett]);   /* i/y og í/ý aldrei saman í hljóðleik */
      if (hljod) EKKI_HLJODMARKMID.forEach(s => ut.add(s));
      const nidurstada = [];
      const baeta = s => { s = s.toLowerCase(); if (!ut.has(s) && (!ur || ur.includes(s))) { ut.add(s); nidurstada.push(s); } };
      if (likir && LIKIR_STAFIR[rett]) stokka([...LIKIR_STAFIR[rett]]).slice(0, Math.min(2, n)).forEach(baeta);
      if (ur) stokka([...ur]).forEach(s => { if (nidurstada.length < n) baeta(s); });
      stokka(STAFROF).forEach(s => { if (nidurstada.length < n) baeta(s); });
      return nidurstada.slice(0, n);
    },
    /** n truflunarorð með ólíkum myndum; samiFyrsti=true → a.m.k. eitt byrjar á sama staf, olikurFyrsti=true → engin byrja á sama staf */
    truflOrd(rett, n, { samiFyrsti = false, olikurFyrsti = false, lengd, sia } = {}) {
      const f = fyrsti(rett);
      const grunn = ORD.filter(o => o !== rett && o.o !== rett.o && o.e !== rett.e && (!sia || sia(o)));
      const somu = stokka(grunn.filter(o => fyrsti(o) === f));
      const adrir = stokka(grunn.filter(o => fyrsti(o) !== f));
      let listi = [];
      if (samiFyrsti && somu.length) listi.push(somu[0]);
      const afgangur = olikurFyrsti ? adrir : stokka(adrir.concat(somu.slice(samiFyrsti ? 1 : 0)));
      /* ólíkir fyrstu stafir innbyrðis þegar hægt er (svo „fyrsti stafur“-leikir séu ótvíræðir) */
      const notadirFyrstu = new Set(listi.map(fyrsti));
      if (olikurFyrsti) notadirFyrstu.add(f);
      const helst = afgangur.filter(o => lengdIn(o, lengd));
      for (const o of helst.concat(afgangur)) {
        if (listi.length >= n) break;
        if (listi.includes(o)) continue;
        if (olikurFyrsti && notadirFyrstu.has(fyrsti(o))) continue;
        listi.push(o); notadirFyrstu.add(fyrsti(o));
      }
      for (const o of afgangur) { if (listi.length >= n) break; if (!listi.includes(o)) listi.push(o); }
      return listi.slice(0, n);
    },
    fyrsti,
  };
}
