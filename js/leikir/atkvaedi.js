/* Klappaðu orðið — mynd og orð birtast; barnið klappar atkvæðin og velur hvað klöppin eru mörg.
   Rétt svar: orðið birtist skipt í atkvæði (ba·na·ni) og eitt 👏 hoppar inn fyrir hvert atkvæði.
   Rangt svar: orðið birtist skipt (vísbending) en fjöldinn er ekki gefinn upp — vélin merkir reitinn eftir 2 mistök. */
import { nucleusFjoldi } from '../kjarni/ordaval.js';

const CSS = `
.l-atkvaedi .spjald{min-width:min(100%,13rem)}
.l-atkvaedi .stort-ord{--stafir:6;font-size:min(clamp(2rem,min(9vh,10vw),4.5rem),calc(82vw / ((var(--stafir) + 2) * .62)))}
.l-atkvaedi .stort-ord .atkv{display:inline-block}
.l-atkvaedi .stort-ord .atkv.virk{color:var(--fjolublar);animation:l-atkvaedi-hopp .4s ease}
.l-atkvaedi .stort-ord .skil{color:var(--fjolublar);padding:0 .02em}
.l-atkvaedi .klopp{display:flex;flex-wrap:wrap;justify-content:center;gap:.1em;min-height:1.3em;line-height:1.3;
  font-size:clamp(1.3rem,min(4.5vh,5vw),2.2rem)}
.l-atkvaedi .klopp .klapp{display:inline-block;animation:l-atkvaedi-klapp .45s cubic-bezier(.34,1.56,.64,1) backwards}
.l-atkvaedi .tolur{--n:3;grid-template-columns:repeat(var(--n),minmax(0,1fr));max-width:min(36rem,calc(var(--n) * 7.5rem));width:100%}
.l-atkvaedi .tolutakki{aspect-ratio:1;min-height:3.5rem;padding:0;display:flex;align-items:center;justify-content:center;
  font-size:clamp(1.8rem,min(5vw,6.5vh),3rem)}
@keyframes l-atkvaedi-klapp{from{transform:scale(0) rotate(-30deg);opacity:0}60%{transform:scale(1.35) rotate(8deg);opacity:1}to{transform:none;opacity:1}}
@keyframes l-atkvaedi-hopp{0%,100%{transform:none}50%{transform:translateY(-.12em) scale(1.12)}}
@media (max-height:480px){
  .l-atkvaedi .stort-ord{font-size:min(clamp(1.6rem,14vh,3rem),calc(31vw / ((var(--stafir) + 2) * .62)))}
  .l-atkvaedi .klopp{font-size:clamp(1.1rem,6vh,1.6rem)}
  .l-atkvaedi .hljodTakki{width:2.75rem;height:2.75rem;min-width:2.75rem}
}
`;

/* hvorugkyn: eitt klapp, tvö klöpp, þrjú klöpp … */
const TOLUORD = ['', 'eitt', 'tvö', 'þrjú', 'fjögur', 'fimm', 'sex', 'sjö', 'átta', 'níu'];
const klopp = n => (n === 1 ? 'eitt klapp' : (TOLUORD[n] || String(n)) + ' klöpp');
const HAMARK_MEST = 5;   /* lengstu orðin í orðabankanum eru 5 atkvæði */

const stafafjoldi = o => [...o.o].length;
/* orð er gilt ef atkvæðaskiptingin er til, myndar orðið og passar við sérhljóðafjöldann (annars er orðinu sleppt) */
const gilt = (o, hamark) => Array.isArray(o.a) && o.a.length >= 1 && o.a.length <= hamark
  && o.a.join('') === o.o && o.a.length === nucleusFjoldi(o);

export default {
  id: 'atkvaedi',
  nafn: 'Klappaðu orðið',
  lysing: 'Klappaðu orðið og teldu klöppin — hvað eru mörg atkvæði?',
  takn: '🍌 👏👏👏',
  flokkur: 'lestur',
  stafagerdFast: false,
  sjalfgefid: { hamark: 3, lengd: [2, 8] },
  erfidleikar: {
    lett:     { hamark: 3, lengd: [2, 6] },
    midlungs: { hamark: 4, lengd: [3, 12] },
    erfitt:   { hamark: 5, lengd: [4, 14] },
  },

  umferd(ctx) {
    const { st, el, gogn } = ctx;
    ctx.css('atkvaedi', CSS);
    const hamark = Math.min(HAMARK_MEST, Math.max(2, parseInt(st.hamark, 10) || 3));
    const lengd = Array.isArray(st.lengd) && st.lengd.length === 2 ? st.lengd : null;

    /* ---- orðaval: jafna atkvæðafjöldann yfir umferðirnar ----
       Síðustu orð borðsins sjást í ctx.ordaval.notad (í réttri röð) — sami fjöldi kemur aldrei þrisvar í röð.
       Fyrst er valinn atkvæðafjöldi sem enn á ónotuð orð, síðan orð með þeim fjölda. */
    function veljaOrdid() {
      const ORD = gogn.ORD || [];
      const notad = (ctx.ordaval && ctx.ordaval.notad) || new Set();
      const iLengd = o => !lengd || (stafafjoldi(o) >= lengd[0] && stafafjoldi(o) <= lengd[1]);
      const sia = o => gilt(o, hamark);
      const sidustu = [...notad].slice(-2).map(n => { const e = ORD.find(x => x.o === n); return e && Array.isArray(e.a) ? e.a.length : 0; });
      const bannad = sidustu.length === 2 && sidustu[0] > 0 && sidustu[0] === sidustu[1] ? sidustu[0] : 0;
      const laus = [];
      for (let n = 1; n <= hamark; n++) {
        if (n !== bannad && ORD.some(o => sia(o) && o.a.length === n && iLengd(o) && !notad.has(o.o))) laus.push(n);
      }
      const fjoldi = laus.length ? laus[Math.floor(Math.random() * laus.length)] : 0;
      let v = fjoldi ? ctx.ordaval.veljaOrd({ lengd, sia: o => sia(o) && o.a.length === fjoldi }) : [];
      if (!v.length) v = ctx.ordaval.veljaOrd({ lengd, sia: o => sia(o) && o.a.length !== bannad });
      if (!v.length) v = ctx.ordaval.veljaOrd({ lengd, sia });
      return v[0] || null;
    }

    const ord = veljaOrdid();
    if (!ord) throw new Error('engin orð með atkvæðaskiptingu fundust');
    const atkv = ord.a;
    const rett = atkv.length;
    const skipt = atkv.join('·');
    let erSkipt = false;

    /* ---- spurning: mynd + orð + pláss fyrir klöppin ---- */
    const mynd = el('button', { class: 'mynd', text: ord.e, 'aria-label': 'Heyra orðið ' + ord.o,
      onclick: () => { ctx.hljod.smellur(); lesa(); } });
    const ordEl = el('div', { class: 'stort-ord', text: ord.o, 'aria-label': ord.o });
    ordEl.style.setProperty('--stafir', String(stafafjoldi(ord)));
    const kloppEl = el('div', { class: 'klopp', 'aria-hidden': 'true' });
    const spjald = el('div', { class: 'spjald' }, mynd, ordEl, kloppEl);
    const spurning = el('div', { class: 'spurning l-atkvaedi' }, spjald, ctx.hljodTakki(ord.o));

    /* ---- svör: tölureitir 1..hamark ---- */
    const tolur = el('div', { class: 'tolur faerri', role: 'group', 'aria-label': 'Hvað eru mörg klöpp?' });
    tolur.style.setProperty('--n', String(hamark));
    const takkar = [];
    for (let n = 1; n <= hamark; n++) {
      const b = el('button', { class: 'tolutakki', text: String(n), dataset: { gildi: String(n), litur: String((n - 1) % 8) },
        'aria-label': klopp(n), onclick: () => svara(n, b) });
      takkar.push(b);
      tolur.appendChild(b);
    }
    const svor = el('div', { class: 'svor l-atkvaedi' }, tolur);
    ctx.rot.append(spurning, svor);

    ctx.hjalp('Klappaðu orðið! Hvað eru mörg klöpp?');
    ctx.svar(rett, { texti: skipt + ' — ' + klopp(rett) + ' ' + '👏'.repeat(rett), tala: ord.o });
    ctx.timi(() => ctx.tala(ord.o), 400);

    const lifandi = () => ordEl.isConnected;

    /* orðið sýnt skipt í atkvæði: ba·na·ni */
    function synaSkipt() {
      if (erSkipt) return;
      erSkipt = true;
      const born = [];
      atkv.forEach((a, i) => {
        if (i) born.push(el('span', { class: 'skil', 'aria-hidden': 'true', text: '·' }));
        born.push(el('span', { class: 'atkv', text: a }));
      });
      ordEl.replaceChildren(...born);
    }
    function hoppaAtkvaedi(i) {
      const s = ordEl.querySelectorAll('.atkv')[i];
      if (!s) return;
      s.classList.remove('virk'); void s.offsetWidth; s.classList.add('virk');
    }
    /* rétt: eitt 👏 á hvert atkvæði, með ploppi og hoppi á atkvæðinu */
    function synaKlopp() {
      synaSkipt();
      kloppEl.replaceChildren();
      atkv.forEach((_, i) => ctx.timi(() => {
        if (!lifandi()) return;
        ctx.hljod.plopp();
        hoppaAtkvaedi(i);
        kloppEl.appendChild(el('span', { class: 'klapp', text: '👏' }));
      }, 150 + i * 230));
    }

    function lesa() { ctx.tala(ord.o); }
    /* vísbending (vélin merkir líka rétta reitinn): atkvæðin hoppa eitt og eitt eins og klappað sé með */
    function visbending() {
      synaSkipt();
      atkv.forEach((_, i) => ctx.timi(() => { if (lifandi()) { ctx.hljod.plopp(); hoppaAtkvaedi(i); } }, i * 300));
    }

    function svara(n, b) {
      if (ctx.laest()) return;
      if (n === rett) {
        ctx.rett({ texti: 'Rétt — ' + klopp(rett) + ': ' + skipt + ' ' + '👏'.repeat(rett) });
        synaKlopp();
      } else {
        synaSkipt();
        const mistok = ctx.rangt({ takki: b, texti: 'Klappaðu aftur — ' + skipt });
        if (mistok < 2) ctx.timi(lesa, 350);   /* eftir 2 mistök les vélin sjálf með vísbendingunni */
      }
    }

    ctx.lyklar((e, lykill) => {
      if (lykill === ' ') { e.preventDefault(); lesa(); return; }
      const n = parseInt(lykill, 10);
      if (n >= 1 && n <= hamark) {
        e.preventDefault();
        const t = takkar[n - 1];
        if (t && !t.disabled) svara(n, t);
      }
    });

    return { lesa, visbending };
  },
};
