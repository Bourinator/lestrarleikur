/* Finndu myndina / Lestu orðið — stafur (eða orð) birtist á spjaldi, barnið velur myndina sem passar.
   st.snid = 'stafur': stór stafur í slembinni stafagerð með „B b“ undir → veldu mynd sem byrjar á hljóðinu.
   st.snid = 'ord':    orðið birtist (.stort-ord) → veldu myndina sem orðið á við (somuUpphaf → a.m.k. ein
                       truflun byrjar á sama staf svo það þurfi að lesa allt orðið). */
import { SAMHLJOMA, oruggtFyrstaHljod } from '../kjarni/ordaval.js';

const CSS = `
.l-finna-mynd .spjald{border:none;cursor:pointer;min-width:min(100%,9rem)}
.l-finna-mynd .spjald:disabled{cursor:default}
.l-finna-mynd .storistafur{min-width:1.4em}
.l-finna-mynd .valkostur .ordtexti{max-width:100%;overflow-wrap:anywhere;padding:0 .15rem}
.l-finna-mynd .valkostur .emj{pointer-events:none}
`;

const FJOLDA_KLASI = { 2: 'tveir', 3: 'thrir', 6: 'sex' };
const hastafur = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export default {
  id: 'finna-mynd',
  nafn: 'Finndu myndina',
  lysing: 'Stafur eða orð birtist — veldu myndina sem passar.',
  takn: 'b → 🍌',
  flokkur: 'lestur',
  stafagerdFast: false,
  sjalfgefid: { snid: 'stafur', val: 4, lengd: null, somuUpphaf: false, stafir: null },
  erfidleikar: {
    lett:     { snid: 'stafur', val: 3 },
    midlungs: { snid: 'ord', val: 4, somuUpphaf: false, lengd: [2, 6] },
    erfitt:   { snid: 'ord', val: 6, somuUpphaf: true },
  },

  umferd(ctx) {
    const { st, el, stokka, emojiListi } = ctx;
    ctx.css('finna-mynd', CSS);
    const snid = st.snid === 'ord' ? 'ord' : 'stafur';
    const fjoldi = Math.max(2, parseInt(st.val, 10) || 4);
    const hamarkMistok = st.hamarkMistok ?? 4;

    /* ---- orðið og truflanirnar ---- */
    const [rett] = ctx.ordaval.veljaOrd({ stafir: st.stafir || undefined, lengd: st.lengd || undefined, fyrstaHljod: snid === 'stafur' });
    if (!rett) { ctx.hjalp('Engin orð fundust fyrir þetta borð.'); return {}; }
    const f = ctx.ordaval.fyrsti(rett);
    let truflanir;
    if (snid === 'stafur') {
      /* engin truflun má byrja á sama staf, á samhljóma staf (i/y, í/ý) eða hafa óöruggt fyrsta hljóð (hv-/hj-) */
      const bannad = new Set([f, SAMHLJOMA[f]].filter(Boolean));
      truflanir = ctx.ordaval.truflOrd(rett, fjoldi - 1, { olikurFyrsti: true, sia: o => !bannad.has(ctx.ordaval.fyrsti(o)) && oruggtFyrstaHljod(o) });
    } else {
      truflanir = ctx.ordaval.truflOrd(rett, fjoldi - 1, { samiFyrsti: !!st.somuUpphaf, lengd: st.lengd || undefined });
    }
    const valListi = stokka([rett, ...truflanir]);
    const mynd = o => (emojiListi(o.e)[0] || o.e);

    /* ---- spurning ---- */
    const stor = ctx.stafagerd === 'storir' ? true : Math.random() < .5;
    const syndur = stor ? f.toUpperCase() : f;
    const spurningTexti = snid === 'stafur' ? 'Hvaða mynd byrjar á ' + syndur + '?' : 'Lestu orðið — hvaða mynd passar?';
    /* orðaham: spjaldið les orðið; stafaham: spjaldið les spurninguna (orðið sjálft væri svarið) */
    const lesaSpjald = () => ctx.tala(snid === 'ord' ? rett.o : spurningTexti);
    const spjald = el('button', { class: 'spjald', 'aria-label': snid === 'ord' ? 'Orðið ' + rett.o + ' — heyra orðið' : 'Stafurinn ' + syndur + ' — heyra spurninguna', onclick: lesaSpjald },
      snid === 'stafur'
        ? [el('div', { class: 'storistafur', text: syndur, 'aria-hidden': 'true' }), el('div', { class: 'baedi', text: f.toUpperCase() + ' ' + f, 'aria-hidden': 'true' })]
        : el('div', { class: 'stort-ord', text: rett.o, 'aria-hidden': 'true' }));
    const spurning = el('div', { class: 'spurning l-finna-mynd' }, spjald, ctx.hljodTakki(() => (snid === 'ord' ? rett.o : spurningTexti)));

    /* ---- svör: myndaspjöld ---- */
    const valkostir = el('div', { class: 'valkostir' + (FJOLDA_KLASI[valListi.length] ? ' ' + FJOLDA_KLASI[valListi.length] : ''), role: 'group', 'aria-label': 'Veldu mynd' });
    const kort = valListi.map((o, i) => {
      const b = el('button', { class: 'valkostur', dataset: { gildi: o.o }, 'aria-label': 'Mynd ' + (i + 1), onclick: () => svara(o, b) },
        el('span', { class: 'nr', text: String(i + 1), 'aria-hidden': 'true' }),
        el('span', { class: 'emj', text: mynd(o) }),
        el('span', { class: 'ordtexti', text: o.o }));
      valkostir.appendChild(b);
      return b;
    });
    const rettKort = kort[valListi.indexOf(rett)];
    const svor = el('div', { class: 'svor l-finna-mynd' }, valkostir);
    ctx.rot.append(spurning, svor);

    ctx.hjalp(spurningTexti);
    if (snid === 'stafur') {
      ctx.svar(rett.o, { texti: f + '… ' + f + '… ' + rett.o + ' — ' + hastafur(rett.o) + ' byrjar á sama hljóði!', tala: f + '… ' + f + '… ' + rett.o, stafur: f });
    } else {
      ctx.svar(rett.o, { texti: 'Orðið er „' + rett.o + '“ — finndu myndina! 🙂', tala: rett.o });
    }

    function svara(o, b) {
      if (ctx.laest() || b.disabled) return;
      b.classList.add('syna');
      if (o.o === rett.o) {
        b.classList.add('rett');
        ctx.rett({
          tala: rett.o,
          stafur: snid === 'stafur' ? f : undefined,
          texti: snid === 'stafur' ? hastafur(rett.o) + ' byrjar á ' + syndur + '! 🎉' : 'Rétt — þetta er ' + rett.o + '! 🎉',
        });
        return;
      }
      b.classList.add('rangt');
      const fo = ctx.ordaval.fyrsti(o);
      const mistok = ctx.rangt({
        takki: b,
        stafur: snid === 'stafur' ? f : undefined,
        texti: snid === 'stafur'
          ? hastafur(o.o) + ' byrjar á ' + fo + ' — ekki á ' + f + '. Reyndu aftur! 🙂'
          : 'Þetta er ' + o.o + ' — lestu orðið aftur! 🙂',
      });
      /* vélin sýnir svarið og heldur áfram eftir of mörg mistök — sýnum þá orðið undir réttu myndinni líka */
      if (mistok >= hamarkMistok && rettKort) rettKort.classList.add('syna');
    }

    ctx.lyklar((e, lykill) => {
      if (lykill === ' ') { e.preventDefault(); lesaSpjald(); return; }
      const n = parseInt(lykill, 10);
      if (n >= 1 && n <= kort.length) { e.preventDefault(); const b = kort[n - 1]; if (!b.disabled) svara(valListi[n - 1], b); }
    });

    return {
      /* vélin kallar eftir 8 s án snertingar: spurningin lesin aftur (orðið sjálft kemur með vísbendingunni) */
      lesa() { ctx.tala(spurningTexti); },
    };
  },
};
