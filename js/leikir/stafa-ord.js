/* Stafaðu orðið — mynd og orð með auðum stafareitum; barnið ýtir á stafina í réttri röð.
   Reitirnir eru fastir alla umferðina og eru EKKI gerðir óvirkir eftir rétta notkun
   (tvöfaldir stafir eins og „ll“ nota sama reit tvisvar). Rangur reitur dofnar aðeins ef
   stafurinn kemur ekki fyrir seinna í orðinu. Sjá SPEC §5 lið 4. */
import { LIKIR_STAFIR } from '../kjarni/ordaval.js';

const CSS = `
/* spurningin er alltaf jafnbreið leiksvæðinu (100 % / 38 % í landslagi) svo stafastærðin geti miðast við hana (cqw) */
.l-stafa-ord.spurning{width:100%;container-type:inline-size}
.l-stafa-ord .spjald{position:relative;padding-inline:clamp(1rem,3vw,2rem)}
.l-stafa-ord .ord{--n:5;flex-wrap:nowrap}
/* stafirnir minnka sjálfkrafa svo langt orð komist fyrir í einni línu */
.l-stafa-ord .ord .stafur{font-size:min(clamp(1.9rem,min(7vw,8vh),4rem),calc((100cqw - 3.6rem) / (var(--n) * 1.3)))}
/* daufur leiðarvísir (synaOrd): liturinn dofnar en ekki reiturinn sjálfur */
.l-stafa-ord .stafur.reitur.sest{color:rgba(43,26,74,.35);opacity:1}
.l-stafa-ord .stafur.buid{opacity:1}
/* reitirnir í jöfnum röðum (--d dálkar) á öllum skjám — endurtekinn klasi til að vinna landslagsreglu vélarinnar */
.l-stafa-ord.svor .stafaval.stafaval.stafaval{grid-template-columns:repeat(var(--d,4),1fr);max-width:calc(var(--d,4) * 6.4rem)}
.l-stafa-ord .stafatakki.hrista{animation:hrista .35s}
.l-stafa-ord .stafatakki.pikk{animation:skella .3s}
.l-stafa-ord .mynd.rett{animation:snua .6s ease}
@media (max-height:480px){
  .l-stafa-ord .ord .stafur{font-size:min(clamp(1.3rem,8vh,3rem),calc((100cqw - 2.4rem) / (var(--n) * 1.25)))}
  .l-stafa-ord.svor .stafaval.stafaval.stafaval{max-width:calc(var(--d,4) * 5.6rem)}
}
`;

const HVATNING = ['Rétt! Hvaða stafur kemur næst? 🙂', 'Flott! Áfram með næsta staf!', 'Vel gert! Næsti stafur…'];

/** fjöldi dálka svo reitirnir raðist í jafnar raðir: 6 → 3×2, 8 → 4×2, 10 → 5×2 */
const dalkar = n => (n <= 4 ? n : Math.ceil(n / 2));

export default {
  id: 'stafa-ord',
  nafn: 'Stafaðu orðið',
  lysing: 'Mynd og orð — ýttu á stafina í réttri röð og stafaðu orðið.',
  takn: '🍎 → e p l i',
  flokkur: 'lestur',
  stafagerdFast: false,
  sjalfgefid: { lengd: [3, 5], val: 8, synaOrd: false, stafir: null, hljodrett: false, likir: false },
  erfidleikar: {
    lett:     { lengd: [2, 3], val: 6,  synaOrd: true,  hljodrett: true,  likir: false },
    midlungs: { lengd: [3, 5], val: 8,  synaOrd: false, hljodrett: false, likir: false },
    erfitt:   { lengd: [5, 9], val: 10, synaOrd: false, hljodrett: false, likir: true },
  },

  umferd(ctx) {
    const { st, el, gogn } = ctx;
    ctx.css('stafa-ord', CSS);

    /* ---- orðið ---- */
    const val = Math.max(2, parseInt(st.val, 10) || 8);
    const pool = st.stafir ? [...String(st.stafir).normalize('NFC').toLowerCase()] : null;
    const valin = ctx.ordaval.veljaOrd({ lengd: st.lengd, stafir: st.stafir || undefined, allirStafir: !!st.stafir, hljodrett: !!st.hljodrett, n: 1 });
    const ordid = valin[0] || gogn.ORD[0] || { o: 'sól', e: '☀️' };
    const bokstafir = ctx.stafir(ordid.o).map(s => s.toLowerCase());
    const einstakir = [...new Set(bokstafir)];
    const truflanir = veljaTruflanir(ctx, gogn, einstakir, Math.max(1, val - einstakir.length), pool, !!st.likir);
    const reitir = ctx.stokka([...einstakir, ...truflanir]);   /* föst röð alla umferðina */
    let i = 0;   /* næsti stafur sem á að finna */

    /* ---- spurning: mynd + stafareitir ---- */
    const mynd = el('button', { class: 'mynd', text: ordid.e, 'aria-label': 'Mynd: ' + ordid.o + ' — ýttu til að heyra orðið', onclick: () => ctx.tala(ordid.o) });
    const slots = bokstafir.map((s, k) => el('span', {
      class: 'stafur reitur' + (st.synaOrd ? ' sest' : '') + (k === 0 ? ' naest' : ''), text: s, 'aria-hidden': 'true',
    }));
    const ordEl = el('div', { class: 'ord', role: 'img', 'aria-label': 'Orð með ' + bokstafir.length + ' stöfum' }, slots);
    ordEl.style.setProperty('--n', String(bokstafir.length));
    const spjald = el('div', { class: 'spjald' }, mynd, ordEl, ctx.hljodTakki(ordid.o));
    const spurning = el('div', { class: 'spurning l-stafa-ord' }, spjald);

    /* ---- svör: stafareitir ---- */
    const stafaval = el('div', { class: 'stafaval' + (reitir.length <= 6 ? ' faerri' : ''), role: 'group', 'aria-label': 'Veldu staf' });
    stafaval.style.setProperty('--d', String(dalkar(reitir.length)));
    const takkar = reitir.map((s, k) => {
      const b = el('button', { class: 'stafatakki', text: s, dataset: { gildi: s, litur: String(k % 8) }, 'aria-label': 'Stafurinn ' + s,
        onclick: () => svara(s, b) });
      stafaval.appendChild(b);
      return b;
    });
    const svor = el('div', { class: 'svor l-stafa-ord' }, stafaval);
    ctx.rot.append(spurning, svor);

    ctx.hjalp('Stafaðu orðið! Ýttu á stafina í réttri röð.');
    setjaSvar();
    ctx.timi(() => ctx.tala(ordid.o), 300);

    /** segir vélinni hvaða stafur er næstur ásamt hljóðvísbendingu („b… b… banani“) */
    function setjaSvar() {
      const naesti = bokstafir[i];
      const buid = bokstafir.slice(0, i).join('');
      const texti = i === 0
        ? 'Orðið byrjar á „' + ctx.stafa(naesti) + '“: ' + naesti + '… ' + naesti + '… ' + ordid.o
        : 'Næst kemur „' + ctx.stafa(naesti) + '“: ' + buid + naesti + '… ' + ordid.o;
      ctx.svar(naesti, { texti, tala: ordid.o });
    }

    function blikka(b, klasi) {
      b.classList.remove(klasi); void b.offsetWidth; b.classList.add(klasi);
      ctx.timi(() => b.classList.remove(klasi), 400);
    }

    function svara(s, b) {
      if (ctx.laest() || i >= bokstafir.length) return;
      const naesti = bokstafir[i];
      if (s === naesti) {
        const slot = slots[i];
        slot.classList.remove('reitur', 'naest', 'sest', 'visbending');
        slot.classList.add('buid');
        i++;
        if (i >= bokstafir.length) {
          mynd.classList.add('rett');
          ctx.rett({ stafur: naesti, tala: ordid.o });
          return;
        }
        ctx.hljod.plopp();
        blikka(b, 'pikk');
        slots[i].classList.add('naest');
        ctx.skref();
        setjaSvar();
        ctx.hjalp(HVATNING[(i - 1) % HVATNING.length]);
        return;
      }
      /* rangur stafur: dofnar bara ef hann kemur ekki fyrir seinna í orðinu */
      const seinna = bokstafir.slice(i + 1).includes(s);
      const iOrdinu = bokstafir.includes(s);
      blikka(b, 'hrista');
      const texti = seinna ? '„' + ctx.stafa(s) + '“ kemur seinna í orðinu — hvaða stafur kemur næst? 🙂'
        : iOrdinu ? '„' + ctx.stafa(s) + '“ er ekki næsti stafurinn — reyndu aftur! 🙂'
        : '„' + ctx.stafa(s) + '“ er ekki í þessu orði — reyndu aftur! 🙂';
      ctx.rangt({ stafur: naesti, takki: seinna ? undefined : b, texti });
    }

    /* lyklaborð: stafir = reitir, 1–9 (og 0 = 10.) = reitur N, bilslá = heyra orðið */
    ctx.lyklar((e, lykill) => {
      if (lykill === ' ') { e.preventDefault(); ctx.tala(ordid.o); return; }
      const b = takkar.find(t => t.dataset.gildi === lykill && !t.disabled);
      if (b) { e.preventDefault(); svara(lykill, b); return; }
      if (/^[0-9]$/.test(lykill)) {
        const n = lykill === '0' ? 10 : parseInt(lykill, 10);
        const t = takkar[n - 1];
        if (t && !t.disabled) { e.preventDefault(); svara(t.dataset.gildi, t); }
      }
    });

    return {
      lesa() { ctx.tala(ordid.o); },
      visbending() { const slot = slots[i]; if (slot) slot.classList.add('visbending'); },
    };
  },
};

/** n truflunarstafir sem eru ekki í orðinu; helst úr stafapotti (pool) og, ef likir, líkir stöfum orðsins */
function veljaTruflanir(ctx, gogn, ordStafir, n, pool, likir) {
  const stafrof = new Set(gogn.STAFROF || []);
  const ekki = new Set(ordStafir);
  const ut = [];
  const baeta = s => {
    s = String(s).normalize('NFC').toLowerCase();
    if (ut.length < n && !ekki.has(s) && !ut.includes(s) && stafrof.has(s) && (!pool || pool.includes(s))) ut.push(s);
  };
  if (likir) {
    /* allt að helmingur truflananna eru stafir sem líkjast stöfum orðsins (b/d, m/n, a/á …) */
    const hamark = Math.ceil(n / 2);
    ctx.stokka(ordStafir.flatMap(s => [...(LIKIR_STAFIR[s] || '')])).forEach(s => { if (ut.length < hamark) baeta(s); });
  }
  ctx.ordaval.truflStafir(ordStafir[0], n + ordStafir.length + 4, { likir: false, ur: pool || undefined }).forEach(baeta);
  if (ut.length < n) ctx.ordaval.truflStafir(ordStafir[0], n + ordStafir.length + 4, { likir: false }).forEach(s => { if (!pool || !pool.includes(s)) baeta(s); });
  if (ut.length < n) {
    /* potturinn var of lítill — víkka út í allt stafrófið */
    const afgangur = pool ? ctx.stokka([...stafrof]).filter(s => !pool.includes(s)) : [];
    afgangur.forEach(s => { if (ut.length < n && !ekki.has(s) && !ut.includes(s)) ut.push(s); });
  }
  return ut.slice(0, n);
}
