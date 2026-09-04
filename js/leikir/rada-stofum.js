/* Raðaðu stöfunum — mynd birtist með tómum reitum; stafirnir í orðinu eru í rugli á flísum
   og barnið ýtir á þá í réttri röð. Ýtt á fylltan reit → stafurinn (og allir á eftir) fer til baka
   (telst ekki mistök). Rangur stafur hristist en er áfram í boði. SPEC §5 liður 6. */
const CSS = `
.l-rada-stofum .spjald{padding-left:clamp(.7rem,2.5vw,2rem);padding-right:clamp(.7rem,2.5vw,2rem)}
.l-rada-stofum .mynd{margin-bottom:.1em}
.l-rada-stofum .ord{flex-wrap:nowrap;max-width:100%;gap:clamp(.15rem,.6vw,.4rem)}
.l-rada-stofum .stafur.reitur{flex:0 1 auto;min-width:2.5rem;min-height:2.75rem;font-size:clamp(1.8rem,min(6.5vw,7.5vh),3.6rem);
  display:inline-flex;align-items:center;justify-content:center;padding:.04em .12em;font-family:inherit;font-weight:800}
.l-rada-stofum .stafur.reitur.buid{cursor:pointer}
.l-rada-stofum .stafur.reitur.buid:disabled{cursor:default}
.l-rada-stofum .flisar{--fl:clamp(3.5rem,min(11vw,9vh),4.6rem);max-width:46rem;gap:clamp(.45rem,1.3vw,.8rem)}
.l-rada-stofum .flis{width:var(--fl);height:var(--fl);min-width:var(--fl);min-height:var(--fl);padding:0;
  display:inline-flex;align-items:center;justify-content:center;line-height:1;font-size:clamp(1.7rem,min(5.5vw,5.5vh),2.7rem)}
.l-rada-stofum .flis.valin{opacity:.22;pointer-events:none;transform:none;box-shadow:none}
.l-rada-stofum .flis.rangt{animation:hrista .35s;background:var(--raudur-ljos);--l-dj:var(--raudur)}
@media (max-height:480px){
  .leiksvaedi > .spurning.l-rada-stofum{flex:0 1 46%}
  .leiksvaedi > .svor.l-rada-stofum{flex:1 1 52%}
  .l-rada-stofum .spjald{padding:.4rem .7rem}
  .l-rada-stofum .stafur.reitur{font-size:clamp(1.5rem,9vh,2.4rem);min-height:2.75rem}
  .l-rada-stofum .flisar{--fl:clamp(3.2rem,14vh,3.8rem)}
  .l-rada-stofum .flis{font-size:clamp(1.5rem,7vh,2.2rem)}
}
`;

const HROS_ORD = ['Frábært!', 'Vel gert!', 'Snilld!', 'Glæsilegt!', 'Rétt!'];

export default {
  id: 'rada-stofum',
  nafn: 'Raðaðu stöfunum',
  lysing: 'Stafirnir eru í rugli — ýttu á þá í réttri röð svo orðið verði rétt.',
  takn: 'l ó s → sól',
  flokkur: 'lestur',
  stafagerdFast: false,
  sjalfgefid: { lengd: [3, 4], hljodrett: true, stafir: null },
  erfidleikar: {
    lett:     { lengd: [3, 4], hljodrett: true },
    midlungs: { lengd: [4, 5], hljodrett: false },
    erfitt:   { lengd: [5, 7], hljodrett: false },
  },

  umferd(ctx) {
    const { st, el, stokka } = ctx;
    ctx.css('rada-stofum', CSS);

    /* orðið */
    const valin = ctx.ordaval.veljaOrd({ lengd: st.lengd, hljodrett: !!st.hljodrett, stafir: st.stafir, allirStafir: !!st.stafir });
    const ord = (valin && valin[0]) || { o: 'sól', e: '☀️' };
    const stafirOrds = ctx.stafir(ord.o).map(s => s.toLowerCase());
    const n = stafirOrds.length;
    const mynd = ctx.emojiListi(ord.e)[0] || ord.e;

    /* stokka stafina; ef röðin er sú sama og orðið er stokkað aftur */
    let blandad = stokka(stafirOrds);
    for (let i = 0; i < 20 && blandad.join('') === ord.o && n > 1; i++) blandad = stokka(stafirOrds);

    let naesti = 0;                 /* númer næsta tóma reits */
    const fyllt = new Array(n).fill(null);   /* flísin sem fyllti hvern reit */

    const tomtMerki = i => 'Reitur ' + (i + 1) + ' af ' + n;

    /* spurning: mynd + tómir reitir */
    const myndTakki = el('button', { class: 'mynd', text: mynd, 'aria-label': 'Heyra orðið', onclick: e => { e.stopPropagation(); lesa(); } });
    const reitir = stafirOrds.map((s, i) =>
      el('button', { class: 'stafur reitur', text: s, disabled: true, 'aria-disabled': 'true', 'aria-label': tomtMerki(i), dataset: { nr: String(i) },
        onclick: () => taka(i) }));
    const ordEl = el('div', { class: 'ord', role: 'group', 'aria-label': 'Orðið' }, reitir);
    const spjald = el('div', { class: 'spjald' }, myndTakki, ordEl);
    const spurning = el('div', { class: 'spurning l-rada-stofum' }, spjald, ctx.hljodTakki(ord.o));

    /* svör: stokkaðar flísar */
    const flisar = blandad.map((s, i) =>
      el('button', { class: 'flis', text: s, dataset: { gildi: s, litur: String(i % 8) }, 'aria-label': 'Stafurinn ' + s,
        onclick: () => svara(flisar[i]) }));
    const flisarEl = el('div', { class: 'flisar', role: 'group', 'aria-label': 'Stafirnir' }, flisar);
    const svor = el('div', { class: 'svor l-rada-stofum' }, flisarEl);
    ctx.rot.append(spurning, svor);

    ctx.hjalp('Raðaðu stöfunum í rétta röð!');
    setjaNaest();
    ctx.timi(lesa, 400);

    function lesa() { ctx.tala(ord.o); }

    function setjaNaest() {
      reitir.forEach((r, i) => r.classList.toggle('naest', i === naesti));
      if (naesti < n) ctx.svar(stafirOrds[naesti], { texti: 'Næsti stafurinn blikkar — ýttu á hann! 🙂', tala: ord.o });
    }

    function svara(flis) {
      if (ctx.laest() || !flis || flis.disabled || naesti >= n) return;
      const s = flis.dataset.gildi;
      const vaentur = stafirOrds[naesti];
      if (s === vaentur) {
        flis.classList.add('valin');
        flis.disabled = true; flis.setAttribute('aria-disabled', 'true');
        const r = reitir[naesti];
        r.classList.remove('naest', 'visbending');
        r.classList.add('buid', 'smellanlegur');
        r.disabled = false; r.removeAttribute('aria-disabled');
        r.setAttribute('aria-label', 'Stafurinn ' + s + ' — ýttu til að taka hann til baka');
        fyllt[naesti] = flis;
        naesti++;
        if (naesti >= n) {
          reitir.forEach(x => x.classList.remove('smellanlegur'));
          ctx.rett({ stafur: s, texti: HROS_ORD[Math.floor(Math.random() * HROS_ORD.length)] + ' Þetta er ' + ord.o + ' 🎉', tala: ord.o });
          return;
        }
        ctx.hljod.plopp();
        ctx.skref();
        setjaNaest();
      } else {
        ctx.rangt({ stafur: vaentur, texti: 'Ekki þessi stafur — finndu þann sem kemur næst! 🙂' });
        flis.classList.remove('rangt'); void flis.offsetWidth; flis.classList.add('rangt');
        ctx.timi(() => flis.classList.remove('rangt'), 400);
      }
    }

    /* ýtt á fylltan reit: stafurinn þar (og allir á eftir) fara aftur á flísarnar — ekki mistök */
    function taka(i) {
      if (ctx.laest() || i >= naesti || i < 0) return;
      for (let j = naesti - 1; j >= i; j--) {
        const f = fyllt[j]; fyllt[j] = null;
        if (f) { f.classList.remove('valin', 'rangt'); f.disabled = false; f.removeAttribute('aria-disabled'); }
        const r = reitir[j];
        r.classList.remove('buid', 'smellanlegur', 'visbending');
        r.disabled = true; r.setAttribute('aria-disabled', 'true');
        r.setAttribute('aria-label', tomtMerki(j));
      }
      naesti = i;
      ctx.hljod.hvarf();
      ctx.skref();
      setjaNaest();
    }

    ctx.lyklar((e, lykill) => {
      if (lykill === 'Backspace') { e.preventDefault(); if (naesti > 0) taka(naesti - 1); return; }
      if (lykill === ' ') { e.preventDefault(); lesa(); return; }
      if (lykill.length !== 1) return;
      const nr = parseInt(lykill, 10);
      if (nr >= 1 && nr <= flisar.length) { e.preventDefault(); const f = flisar[nr - 1]; if (!f.disabled) svara(f); return; }
      const f = flisar.find(x => x.dataset.gildi === lykill && !x.disabled);
      if (f) { e.preventDefault(); svara(f); }
    });

    return {
      lesa,
      visbending() { if (naesti < n) reitir[naesti].classList.add('visbending'); },
    };
  },
};
