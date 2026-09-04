/* Kapp við klukkuna — hraðaleikur: mynd birtist með orðinu þar sem fyrsti stafurinn er auður;
   barnið velur fyrsta stafinn eins hratt og það getur. Vélin sér um klukkuna (ctx.hradi) og stigin.
   Umferðirnar eru snöggar: engin hopp-hreyfing á myndinni, stuttir textar, orðið lesið um leið og það birtist. */
const CSS = `
.l-hradi .mynd{animation:none}
.l-hradi .ord{--fj:6;gap:clamp(.15rem,.6vw,.35rem)}
.l-hradi .ord .stafur{font-size:clamp(1.2rem,min(7vw,8vh,calc(76vw / (var(--fj) * 1.25))),4rem)}
.l-hradi .stafaval{max-width:36rem}
.l-hradi .stafaval[data-fjoldi="4"]{grid-template-columns:repeat(4,1fr);max-width:26rem}
.l-hradi .stafaval[data-fjoldi="6"]{grid-template-columns:repeat(6,1fr)}
@media (max-width:600px){
  .l-hradi .stafaval[data-fjoldi="6"]{grid-template-columns:repeat(3,1fr);max-width:24rem}
  .l-hradi .stafatakki{font-size:clamp(1.7rem,7vw,2.6rem)}
}
@media (max-height:480px){
  .l-hradi .ord .stafur{font-size:clamp(1rem,min(7vw,8vh,calc(28vw / (var(--fj) * 1.25))),4rem)}
}
`;

/* öryggisnet ef orðabankinn er tómur — vélin má ekki fá tóma umferð */
const VARAORD = { o: 'sól', e: '☀️' };

export default {
  id: 'hradi',
  nafn: 'Kapp við klukkuna',
  lysing: 'Á hvaða staf byrjar orðið? Svaraðu eins mörgum og þú getur áður en tíminn rennur út!',
  takn: '⏱️ 🐶 → h',
  flokkur: 'lestur',
  stafagerdFast: false,
  sjalfgefid: { val: 6, stafir: null },
  erfidleikar: {
    lett:     { val: 4, stafir: 'asólímiuúren' },
    midlungs: { val: 6, stafir: 'asólímiuúrenotkfhbð' },
    erfitt:   { val: 6, stafir: null },
  },

  umferd(ctx) {
    const { st, el, stokka, stafir } = ctx;
    ctx.css('hradi', CSS);
    const val = Math.max(2, Math.min(12, parseInt(st.val, 10) || 6));

    /* orð með öruggt fyrsta hljóð; stutt orð eru best í kappi (síurnar víkka sjálfkrafa ef of fá finnast) */
    const ord = ctx.ordaval.veljaOrd({ stafir: st.stafir, fyrstaHljod: true, lengd: [2, 8], n: 1 })[0] || VARAORD;
    const rett = ctx.ordaval.fyrsti(ord);
    const truflanir = ctx.ordaval.truflStafir(rett, val - 1, { ur: st.stafir, hljod: true });
    const reitir = stokka([rett, ...truflanir]);
    const bokstafir = stafir(ord.o);

    /* spurning: mynd + orðið með fyrsta stafinn auðan */
    const mynd = el('button', { class: 'mynd', text: ord.e, 'aria-label': 'Heyra orðið', onclick: () => ctx.tala(ord.o) });
    const reitur = el('span', { class: 'stafur reitur naest', text: bokstafir[0], 'aria-hidden': 'true' });
    const ordEl = el('div', { class: 'ord', 'aria-label': 'Orðið — fyrsta stafinn vantar' }, reitur,
      bokstafir.slice(1).map(s => el('span', { class: 'stafur sest', text: s })));
    ordEl.style.setProperty('--fj', String(Math.max(3, bokstafir.length)));
    const spjald = el('div', { class: 'spjald' }, mynd, ordEl);
    const spurning = el('div', { class: 'spurning l-hradi' }, spjald, ctx.hljodTakki(ord.o));

    /* svör: stafareitir */
    const stafaval = el('div', { class: 'stafaval faerri', role: 'group', 'aria-label': 'Veldu fyrsta stafinn', dataset: { fjoldi: String(reitir.length) } });
    const takkar = reitir.map((s, i) => {
      const b = el('button', { class: 'stafatakki', text: s, dataset: { gildi: s, litur: String(i % 8) }, 'aria-label': 'Stafurinn ' + s,
        onclick: () => svara(s, b) });
      stafaval.appendChild(b);
      return b;
    });
    const svor = el('div', { class: 'svor l-hradi' }, stafaval);
    ctx.rot.append(spurning, svor);

    ctx.hjalp('Á hvaða staf byrjar orðið?');
    ctx.svar(rett, { texti: ctx.stafa(rett) + '… ' + ctx.stafa(rett) + '… ' + ord.o, tala: ord.o });
    ctx.timi(() => ctx.tala(ord.o), 250);

    function svara(s, b) {
      if (ctx.laest()) return;
      if (s === rett) {
        reitur.classList.remove('reitur', 'naest', 'visbending');
        reitur.classList.add('buid');
        b.classList.add('rett');
        ctx.rett({ stafur: rett, texti: 'Rétt! ✅' });
      } else {
        ctx.rangt({ stafur: rett, takki: b, texti: 'Ekki ' + ctx.stafa(s) + ' — prófaðu aftur! 🙂' });
      }
    }
    ctx.lyklar((e, lykill) => {
      if (lykill === ' ') { e.preventDefault(); ctx.tala(ord.o); return; }
      const b = takkar.find(x => x.dataset.gildi === lykill && !x.disabled);
      if (b) { e.preventDefault(); svara(lykill, b); return; }
      const n = parseInt(lykill, 10);
      if (n >= 1 && n <= takkar.length) { e.preventDefault(); const t = takkar[n - 1]; if (t && !t.disabled) svara(t.dataset.gildi, t); }
    });

    return {
      lesa() { ctx.tala(ord.o); },
      visbending() { reitur.classList.add('visbending'); },
    };
  },
};
