/* Hvað eru mörg? — n eins hlutir birtast á spjaldi, barnið telur þá og ýtir á réttu töluna.
   Reikningsleikur (talnaeyja). Sjá SPEC §5 lið 14 og eins-stafur.js fyrir samninginn við vélina. */
const CSS = `
.l-telja .spjald{padding:clamp(.6rem,1.6vh,1rem) clamp(1rem,3vw,2rem);gap:clamp(.4rem,1.2vh,.8rem)}
/* hlutirnir raðast í raðir af fimm (fimmuhugsun) — stærðin minnkar eftir því sem þeir eru fleiri */
.l-telja .hlutir{display:grid;grid-template-columns:repeat(var(--dalkar,5),1.3em);gap:.08em .12em;justify-content:center;
  line-height:1;font-size:clamp(1.8rem,min(8vh,9.5vw),3rem)}
.l-telja .hlutir.faair{font-size:clamp(2.4rem,min(10vh,11vw),4.2rem)}
.l-telja .hlutir.margir{font-size:clamp(1.5rem,min(6vh,7vw),2.6rem)}
.l-telja .hlutur{position:relative;width:1.3em;height:1.3em;display:flex;align-items:center;justify-content:center;
  animation:birtast .45s cubic-bezier(.34,1.56,.64,1) backwards}
/* talningarmerki (1, 2, 3 …) — birtast sem vísbending og þegar svarað er rétt */
.l-telja .hlutur::after{content:attr(data-nr);position:absolute;right:-.25em;bottom:-.15em;font-size:max(.42em,.8rem);font-weight:800;
  line-height:1;background:var(--fjolublar);color:#fff;border-radius:50%;width:1.7em;height:1.7em;display:flex;align-items:center;
  justify-content:center;opacity:0;transform:scale(0);transition:opacity .2s,transform .25s cubic-bezier(.34,1.56,.64,1)}
.l-telja .hlutur.talinn::after{opacity:1;transform:scale(1)}
.l-telja .setning{font-size:clamp(1.3rem,min(5vh,5.5vw),2.4rem)}
/* tölurnar í röðum af fimm svo 10 og 15 verði jafnar raðir */
.leiksvaedi > .svor.l-telja .tolur{grid-template-columns:repeat(5,1fr);max-width:32rem}
.leiksvaedi > .svor.l-telja .tolur.fimm{max-width:30rem}
/* fyrri tölustafur í tveggja stafa tölu bíður eftir þeim seinni */
.l-telja .tolutakki.bidur{outline:4px dashed var(--blar);outline-offset:3px}
@media (max-height:480px){
  .l-telja .hlutir{font-size:clamp(1.4rem,7vh,2.4rem)}
  .l-telja .hlutir.faair{font-size:clamp(1.8rem,9vh,3rem)}
  .l-telja .hlutir.margir{font-size:clamp(1.2rem,5.5vh,2rem)}
  .l-telja .setning{font-size:clamp(1.1rem,7vh,1.6rem)}
}
`;

const MORG = { hk: 'mörg', kvk: 'margar', kk: 'margir' };
const EINN = { hk: 'eitt', kvk: 'ein', kk: 'einn' };
/* töluorð: 1–4 beygjast eftir kyni, 5 og upp úr ekki */
const TOLUORD = {
  kk:  ['', 'einn', 'tveir', 'þrír', 'fjórir'],
  kvk: ['', 'ein', 'tvær', 'þrjár', 'fjórar'],
  hk:  ['', 'eitt', 'tvö', 'þrjú', 'fjögur'],
};
const TOLUORD_FOST = ['', '', '', '', '', 'fimm', 'sex', 'sjö', 'átta', 'níu', 'tíu', 'ellefu', 'tólf', 'þrettán', 'fjórtán', 'fimmtán',
  'sextán', 'sautján', 'átján', 'nítján', 'tuttugu'];
const toluord = (n, kyn) => (n <= 4 ? TOLUORD[kyn][n] : (TOLUORD_FOST[n] || String(n)));

const VARA_HLUTIR = [{ e: '🍎', ft: 'epli', kyn: 'hk' }, { e: '⭐', ft: 'stjörnur', kyn: 'kvk' }, { e: '🚗', ft: 'bílar', kyn: 'kk' }];
/* varfærin stöðlun: strengur → {e, ft:'hlutir', kyn:'kk'}; vantandi/ógilt kyn → kk */
function stadla(h) {
  if (typeof h === 'string') return { e: h, ft: 'hlutir', kyn: 'kk' };
  const kyn = h && MORG[h.kyn] ? h.kyn : 'kk';
  return { e: (h && h.e) || '⭐', ft: (h && h.ft) || 'hlutir', kyn };
}

/* Síðasta umferð hvers borðs, lykluð á leiksvæðið (eitt á hvert borð) — svo sama tala/mynd komi ekki tvisvar í röð.
   WeakMap á DOM-hnút lekur ekki milli borða og hverfur með leiksvæðinu. */
const SIDASTA = new WeakMap();

export default {
  id: 'telja',
  nafn: 'Hvað eru mörg?',
  lysing: 'Teldu hlutina á spjaldinu og ýttu á réttu töluna.',
  takn: '🍎🍎🍎 → 3',
  flokkur: 'reikningur',
  stafagerdFast: false,
  sjalfgefid: { hamark: 5 },
  erfidleikar: {
    lett:     { hamark: 5 },
    midlungs: { hamark: 10 },
    erfitt:   { hamark: 15 },
  },

  umferd(ctx) {
    const { st, el, rot } = ctx;
    ctx.css('telja', CSS);
    const hamark = Math.max(2, Math.min(20, parseInt(st.hamark, 10) || 5));
    const erProf = !!(typeof window !== 'undefined' && window.__stafaleikur && window.__stafaleikur.prof);

    /* velja hlut og fjölda — hvorki sami hlutur né sama tala sem í síðustu umferð */
    const allir = (ctx.gogn.HLUTIR && ctx.gogn.HLUTIR.length ? ctx.gogn.HLUTIR : VARA_HLUTIR).map(stadla);
    const sidasta = SIDASTA.get(rot) || {};
    const adrir = allir.filter(x => x.e !== sidasta.e);
    const h = ctx.velja(adrir.length ? adrir : allir, 1)[0];
    const tolur = [];
    for (let i = 1; i <= hamark; i++) if (i !== sidasta.n) tolur.push(i);
    const n = tolur[Math.floor(Math.random() * tolur.length)];
    SIDASTA.set(rot, { n, e: h.e });
    const mynd = ctx.emojiListi(h.e)[0] || h.e;

    const spurningTexti = 'Hvað eru ' + MORG[h.kyn] + ' ' + h.ft + '?';
    const lysing = n === 1 ? 'bara ' + EINN[h.kyn] : n + ' ' + h.ft;                       /* „bara eitt“ / „5 epli“ */
    const lysingOrd = n === 1 ? 'bara ' + EINN[h.kyn] : toluord(n, h.kyn) + ' ' + h.ft;    /* „fimm epli“ — fyrir röddina */
    const erEru = n === 1 ? 'Það er ' : 'Það eru ';

    /* ---- spurning: spjald með hlutunum og spurningunni ---- */
    const hlutirEl = el('div', { class: 'hlutir' + (n <= 5 ? ' faair' : n > 10 ? ' margir' : ''), role: 'img',
      'aria-label': (n === 1 ? 'Ein mynd: ' : n + ' myndir: ') + mynd });
    hlutirEl.style.setProperty('--dalkar', String(Math.min(n, 5)));
    const hlutir = [];
    for (let i = 1; i <= n; i++) {
      const s = el('span', { class: 'hlutur', text: mynd, dataset: { nr: String(i) } });
      /* hlutirnir skjótast inn einn af öðrum (aldrei í prófunarham eða með hreyfingar slökktar) */
      if (ctx.hreyfing && !erProf) s.style.animationDelay = Math.round(i * Math.min(70, 600 / n)) + 'ms';
      hlutir.push(s);
      hlutirEl.appendChild(s);
    }
    const setningEl = el('div', { class: 'setning', text: spurningTexti });
    const spjald = el('div', { class: 'spjald' }, hlutirEl, setningEl);
    const spurning = el('div', { class: 'spurning l-telja' }, spjald, ctx.hljodTakki(spurningTexti));

    /* ---- svör: tölurnar 1..hamark ---- */
    const tolurEl = el('div', { class: 'tolur' + (hamark <= 5 ? ' fimm' : ''), role: 'group', 'aria-label': 'Veldu tölu' });
    const takkar = [];
    for (let i = 1; i <= hamark; i++) {
      const b = el('button', { class: 'tolutakki', text: String(i), dataset: { gildi: String(i), litur: String((i - 1) % 8) },
        onclick: () => svara(i, b) });
      takkar.push(b);
      tolurEl.appendChild(b);
    }
    const svor = el('div', { class: 'svor l-telja' }, tolurEl);
    rot.append(spurning, svor);

    ctx.hjalp('Teldu og ýttu svo á réttu töluna!');
    ctx.svar(n, { texti: erEru + lysing + ' — ýttu á ' + n + '!' });

    /* ---- talning: merkin 1, 2, 3 … birtast á hlutunum (vísbending eða staðfesting) ---- */
    let talid = false;
    function telja(strax) {
      if (talid) return;
      talid = true;
      if (strax || !ctx.hreyfing) { hlutir.forEach(s => s.classList.add('talinn')); return; }
      hlutir.forEach((s, i) => ctx.timi(() => { s.classList.add('talinn'); ctx.hljod.plopp(); }, 260 * i));
      ctx.tala(hlutir.map((_, i) => toluord(i + 1, h.kyn)).join(', ') + '. ' + erEru + lysingOrd + '.', .75);
    }
    function lesa() { ctx.tala(spurningTexti); }

    /* ---- svar ---- */
    function svara(tala, b) {
      if (ctx.laest()) return;
      hreinsaBid();
      if (tala === n) {
        telja(true);
        ctx.rett({ texti: 'Rétt — ' + lysing + '! 🎉', tala: 'Rétt! ' + lysingOrd });
      } else {
        ctx.rangt({ takki: b, texti: 'Teldu aftur — það er ' + (tala > n ? 'færra' : 'fleira') + ' en það 🙂' });
      }
    }
    function veljaTolu(t) {
      const b = takkar[t - 1];
      if (b && !b.disabled) svara(t, b);
    }

    /* ---- lyklaborð: tölustafir = tölurnar; með hámark > 9 bíður fyrri tölustafurinn 700 ms eftir þeim seinni ---- */
    let bid = 0, bidTimer = null;
    function hreinsaBid() {
      if (bidTimer) clearTimeout(bidTimer);
      bidTimer = null;
      if (bid) takkar[bid - 1].classList.remove('bidur');
      bid = 0;
    }
    ctx.lyklar((e, lykill) => {
      if (lykill === ' ') { e.preventDefault(); lesa(); return; }
      if (lykill === 'Enter') { if (bid) { e.preventDefault(); const t = bid; hreinsaBid(); veljaTolu(t); } return; }
      if (lykill === 'Backspace') { if (bid) { e.preventDefault(); hreinsaBid(); } return; }
      if (!/^[0-9]$/.test(lykill)) return;
      e.preventDefault();
      const d = parseInt(lykill, 10);
      if (bid) {
        const t = bid * 10 + d;
        hreinsaBid();
        if (t <= hamark) veljaTolu(t); else if (d >= 1 && d <= hamark) veljaTolu(d);
        return;
      }
      if (d === 0 || d > hamark) return;
      if (hamark > 9 && d * 10 <= hamark) {
        bid = d;
        takkar[d - 1].classList.add('bidur');
        bidTimer = ctx.timi(() => { const t = bid; hreinsaBid(); if (t) veljaTolu(t); }, 700);
        return;
      }
      veljaTolu(d);
    });

    return { haetta: hreinsaBid, lesa, visbending: () => telja(false) };
  },
};
