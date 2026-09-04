/* Hljóðaðu saman — stutt hljóðrétt orð birtist; stafirnir lýsast upp einn í einu (og orðið er lesið ef rödd er til).
   Barnið hljóðar stafina saman og velur myndina sem passar við orðið meðal þriggja mynda.
   Svarspjöldin eru óvirk þangað til stafirnir hafa allir lýst upp. */
const CSS = `
.l-hljoda-saman .ordSpjald{border:none;-webkit-appearance:none;appearance:none;cursor:pointer;
  padding:clamp(.7rem,2vh,1.2rem) clamp(1.2rem,4vw,2.2rem);transition:transform .08s}
.l-hljoda-saman .ordSpjald:active{transform:scale(.98)}
.l-hljoda-saman .ord{gap:clamp(.25rem,1vw,.5rem);flex-wrap:nowrap}
.l-hljoda-saman .stafur{font-size:clamp(2rem,min(calc(62vw / var(--n,3)),12vh),5.5rem);min-width:.85em;padding:.04em .16em;
  background:var(--graleitt);border-bottom:.12em solid transparent;opacity:.5;transition:opacity .2s,background .2s}
.l-hljoda-saman .stafur.buid{opacity:1}
.l-hljoda-saman .valkostur.bidur{opacity:.55;pointer-events:none;transform:none}
.l-hljoda-saman .valkostur .ordtexti{max-width:100%;overflow-wrap:anywhere;line-height:1.1}
@media (max-height:480px){
  .l-hljoda-saman .ordSpjald{padding:.5rem 1rem}
  .l-hljoda-saman .stafur{font-size:clamp(1.5rem,min(calc(24vw / var(--n,3)),15vh),3.6rem)}
}
`;

const BID_FYRIR = 450;   /* ms áður en fyrsti stafurinn lýsist upp (efnið svífur inn fyrst) */
const BID_MILLI = 380;   /* ms á milli stafa */
const BID_EFTIR = 250;   /* ms eftir síðasta staf þar til orðið er lesið og svörin virkjast */

export default {
  id: 'hljoda-saman',
  nafn: 'Hljóðaðu saman',
  lysing: 'Stafirnir lýsast upp einn í einu — hljóðaðu þá saman og finndu myndina sem passar við orðið.',
  takn: 's·ó·l → ☀️',
  flokkur: 'lestur',
  stafagerdFast: false,
  sjalfgefid: { lengd: [2, 3], samiFyrsti: false, stafir: null },
  erfidleikar: {
    lett:     { lengd: [2, 3], samiFyrsti: false },
    midlungs: { lengd: [2, 4], samiFyrsti: true },
    erfitt:   { lengd: [3, 5], samiFyrsti: true },
  },

  umferd(ctx) {
    const { st, el, stokka, gogn } = ctx;
    ctx.css('hljoda-saman', CSS);

    /* ---- orðið og truflanirnar ---- */
    const lengd = Array.isArray(st.lengd) && st.lengd.length === 2 ? st.lengd : [2, 3];
    const [ord] = ctx.ordaval.veljaOrd({ lengd, hljodrett: true, fyrstaHljod: true, stafir: st.stafir || undefined, allirStafir: !!st.stafir, n: 1 });
    if (!ord) throw new Error('Engin orð fundust fyrir Hljóðaðu saman');
    const stafirnir = ctx.stafir(ord.o).map(s => s.toLowerCase());
    const fyrstiStafur = stafirnir[0];
    const hljodun = stafirnir.join('… ') + '…';                 /* „s… ó… l…“ — hljóðin, ekki stafanöfnin */
    /* truflanir: myndir sem passa ekki; orðin mega ekki vera of löng svo textinn komist fyrir á spjaldinu */
    const trufl = ctx.ordaval.truflOrd(ord, 2, { samiFyrsti: !!st.samiFyrsti, olikurFyrsti: !st.samiFyrsti, sia: o => ctx.stafir(o.o).length <= 8 });
    for (const o of stokka(gogn.ORD)) {                          /* vörn ef orðabankinn er örlítill */
      if (trufl.length >= 2) break;
      if (o.o !== ord.o && o.e !== ord.e && !trufl.includes(o)) trufl.push(o);
    }
    const kort = stokka([ord, ...trufl.slice(0, 2)]);
    const emoji = o => ctx.emojiListi(o.e)[0] || o.e;

    /* ---- spurning: orðið á spjaldi (smellanlegt → sjá og heyra aftur) + 🔊 ---- */
    const stafaEl = stafirnir.map(s => el('span', { class: 'stafur sest', text: s }));
    const ordEl = el('div', { class: 'ord', role: 'img', 'aria-label': 'Orðið ' + ord.o }, stafaEl);
    ordEl.style.setProperty('--n', String(Math.max(2, stafirnir.length)));
    const spjald = el('button', { class: 'spjald ordSpjald', type: 'button', 'aria-label': 'Sjá og heyra orðið aftur', onclick: () => spila() }, ordEl);
    const hljodTakki = ctx.hljodTakki(() => { spila(); return ''; });   /* les orðið í lok runu — ekki strax */
    const spurning = el('div', { class: 'spurning l-hljoda-saman' }, spjald, hljodTakki);

    /* ---- svör: þrjú myndaspjöld, óvirk þangað til stafirnir hafa lýst upp ---- */
    const takkar = kort.map((o, i) => {
      const b = el('button', { class: 'valkostur bidur', type: 'button', disabled: true, 'aria-disabled': 'true',
        dataset: { gildi: o.o }, 'aria-label': (i + 1) + ': ' + o.o,
        onclick: () => svara(o, b) },
        el('span', { class: 'nr', text: String(i + 1), 'aria-hidden': 'true' }),
        el('span', { class: 'emj', text: emoji(o) }),
        el('span', { class: 'ordtexti', text: o.o }));
      return b;
    });
    const valkostir = el('div', { class: 'valkostir thrir', role: 'group', 'aria-label': 'Veldu myndina sem passar' }, takkar);
    const svor = el('div', { class: 'svor l-hljoda-saman' }, valkostir);
    ctx.rot.append(spurning, svor);

    const strax = () => ctx.hradi || !ctx.hreyfing;   /* kappborð eða hreyfingar af: allt lýsist upp í einu */
    ctx.hjalp(strax() ? 'Hljóðaðu stafina saman — hvaða mynd passar?' : 'Horfðu á stafina lýsast upp…');

    let byrjad = false;    /* svörin hafa verið virkjuð */
    let iGangi = false;    /* runa í gangi — ný beiðni er hunsuð þangað til hún klárast */

    function virkja() {
      if (byrjad) return;
      byrjad = true;
      takkar.forEach(b => { b.disabled = false; b.removeAttribute('aria-disabled'); b.classList.remove('bidur'); });
      ctx.hjalp('Hljóðaðu stafina saman — hvaða mynd passar?');
      ctx.svar(ord.o, { texti: hljodun + ' ' + ord.o + '! Finndu ' + emoji(ord) });
    }

    /** lýsir stafina upp einn í einu með ploppi, les orðið í lokin og virkjar svörin í fyrsta skipti */
    async function spila() {
      if (iGangi) return;
      iGangi = true;
      stafaEl.forEach(s => { s.classList.remove('buid'); s.classList.add('sest'); });
      const lysa = s => { s.classList.remove('sest'); s.classList.add('buid'); };
      if (strax()) {
        stafaEl.forEach(lysa);
        ctx.hljod.plopp();
      } else {
        for (let i = 0; i < stafaEl.length; i++) {
          await ctx.bida(i === 0 ? BID_FYRIR : BID_MILLI);
          lysa(stafaEl[i]);
          ctx.hljod.plopp();
        }
        await ctx.bida(BID_EFTIR);
      }
      ctx.tala(ord.o);
      iGangi = false;
      virkja();
    }

    function svara(o, b) {
      if (ctx.laest() || !byrjad || b.disabled) return;
      if (o.o === ord.o) {
        takkar.forEach(t => t.classList.add('syna'));      /* sýna orðin undir öllum myndunum */
        b.classList.add('rett');
        ctx.rett({ stafur: fyrstiStafur, tala: ord.o, texti: 'Rétt! ' + hljodun + ' ' + ord.o + ' ' + emoji(ord) + ' 🎉' });
        return;
      }
      b.classList.add('syna', 'rangt');
      ctx.rangt({ stafur: fyrstiStafur, takki: b, texti: 'Þetta er ' + o.o + ' ' + emoji(o) + '. Hljóðaðu aftur: ' + hljodun + ' 🙂' });
      spila();                                              /* sýna orðið aftur eftir rangt svar */
    }

    ctx.lyklar((e, lykill) => {
      if (lykill === ' ') { e.preventDefault(); spila(); return; }
      const n = parseInt(lykill, 10);
      if (n >= 1 && n <= takkar.length) { e.preventDefault(); const b = takkar[n - 1]; if (b && !b.disabled) svara(kort[n - 1], b); }
    });

    spila();
    return {
      lesa() { spila(); },
      visbending() { spila(); },
      haetta() { /* bida/timi hreinsast sjálfkrafa við abort */ },
    };
  },
};
