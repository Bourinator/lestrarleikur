/* Stafurinn í orðinu — mynd og orð birtast, einn stafur orðsins er auður; barnið velur stafinn sem vantar.
   st.stada = 'fyrsti'    fyrsti stafurinn (hljóðið sem orðið byrjar á)
              'sidasti'   síðasti stafurinn (sleppir orðum sem enda á ll/nn; -r/-i svör eru sjaldgæfari)
              'serhljodi' sérhljóði á milli tveggja samhljóða
              'midja'     hvaða innri stafur sem er (ekki hluti af ll/nn/au/ei/ey) — fellur á 'fyrsti' ef ekkert finnst
   Hljóðaleikur: y/ý/é/ð/x eru aldrei markmið. Sjá SPEC §5 lið 2 og eins-stafur.js fyrir samninginn við vélina. */
import { EKKI_HLJODMARKMID } from '../kjarni/ordaval.js';

const CSS = `
.l-fyrsti-stafur .spjald{gap:clamp(.3rem,1vh,.6rem)}
.l-fyrsti-stafur .ord{--fj:6;gap:clamp(.15rem,.6vw,.35rem);flex-wrap:nowrap}
.l-fyrsti-stafur .ord .stafur{font-size:clamp(1.4rem,min(7vw,8vh,calc(78vw / (var(--fj) * 1.2))),4rem)}
.l-fyrsti-stafur .stafaval{max-width:40rem}
.l-fyrsti-stafur .stafaval[data-fjoldi="4"]{grid-template-columns:repeat(4,1fr);max-width:26rem}
.l-fyrsti-stafur .stafaval[data-fjoldi="6"]{grid-template-columns:repeat(6,1fr);max-width:38rem}
.l-fyrsti-stafur .stafaval[data-fjoldi="8"]{grid-template-columns:repeat(4,1fr);max-width:28rem}
@media (max-width:600px){
  .l-fyrsti-stafur .stafaval[data-fjoldi="6"]{grid-template-columns:repeat(3,1fr);max-width:24rem}
  .l-fyrsti-stafur .stafatakki{font-size:clamp(1.6rem,7vw,2.4rem)}
}
@media (max-height:480px){
  .l-fyrsti-stafur .mynd{font-size:clamp(2rem,14vh,3.5rem);animation:none}
  .l-fyrsti-stafur .ord .stafur{font-size:clamp(1rem,min(7vw,8vh,calc(30vw / (var(--fj) * 1.2))),3rem)}
  .l-fyrsti-stafur .stafaval[data-fjoldi="6"]{grid-template-columns:repeat(3,1fr)}
}
`;

const SERHLJODAR = 'aáeéiíoóuúyýæö';
const STODUR = ['fyrsti', 'sidasti', 'serhljodi', 'midja'];
const erSer = s => SERHLJODAR.includes(s);
const hastafur = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
/* er stafur nr. i hluti af tvíhljóða (au, ei, ey)? */
function iTvihljoda(st, i) {
  const f = st[i - 1] || '', n = st[i + 1] || '', s = st[i];
  return (s === 'a' && n === 'u') || (s === 'u' && f === 'a') || (s === 'e' && (n === 'i' || n === 'y')) || ((s === 'i' || s === 'y') && f === 'e');
}
const iTvofoldum = (st, i) => st[i] === st[i - 1] || st[i] === st[i + 1];   /* ll, nn, tt, kk … */
/* gildar stöður fyrir 'serhljodi': sérhljóði með samhljóða á báðum hliðum, ekki í tvíhljóða */
function stodurSerhljoda(st) {
  const k = [];
  for (let i = 1; i < st.length - 1; i++) if (erSer(st[i]) && !erSer(st[i - 1]) && !erSer(st[i + 1]) && !iTvihljoda(st, i) && !EKKI_HLJODMARKMID.has(st[i])) k.push(i);
  return k;
}
/* gildar stöður fyrir 'midja': innri stafur sem er ekki hluti af tvöföldum staf eða tvíhljóða */
function stodurMidju(st) {
  const k = [];
  for (let i = 1; i < st.length - 1; i++) if (!iTvofoldum(st, i) && !iTvihljoda(st, i) && !EKKI_HLJODMARKMID.has(st[i])) k.push(i);
  return k;
}

export default {
  id: 'fyrsti-stafur',
  nafn: 'Stafurinn í orðinu',
  lysing: 'Mynd og orð birtast en einn staf vantar — hvaða stafur er það?',
  takn: '🐶 _undur',
  flokkur: 'lestur',
  stafagerdFast: false,
  sjalfgefid: { val: 4, stada: 'fyrsti', stafir: null, likir: false, hljodrett: false, lengd: null },
  erfidleikar: {
    lett:     { val: 4, stada: 'fyrsti',  stafir: 'asólímiuúren', hljodrett: true },
    midlungs: { val: 6, stada: 'sidasti', stafir: null },
    erfitt:   { val: 8, stada: 'midja',   stafir: null, likir: true },
  },

  umferd(ctx) {
    const { st, el, stokka, stafir } = ctx;
    ctx.css('fyrsti-stafur', CSS);
    const val = Math.max(2, Math.min(12, parseInt(st.val, 10) || 4));
    const lengd = Array.isArray(st.lengd) && st.lengd.length === 2 ? st.lengd : undefined;
    const stafirO = o => stafir(o.o).map(s => s.toLowerCase());
    const grunn = { stafir: st.stafir || undefined, lengd, n: 1, hljodrett: !!st.hljodrett };

    /* ---- orðið og staðan sem er auð ---- */
    let stada = STODUR.includes(st.stada) ? st.stada : 'fyrsti';
    let ord = null, pos = 0;
    if (stada === 'sidasti') {
      const sia = o => {
        const s = stafirO(o), l = s[s.length - 1];
        if (s.length < 2 || /(ll|nn)$/.test(o.o) || EKKI_HLJODMARKMID.has(l)) return false;
        return !((l === 'r' || l === 'i') && Math.random() < .7);   /* -ur/-i orð eru mjög algeng — sjaldnar sem svar */
      };
      [ord] = ctx.ordaval.veljaOrd(Object.assign({}, grunn, { fyrstaHljod: true, sia }));
      if (ord) pos = stafirO(ord).length - 1;
    } else if (stada === 'serhljodi' || stada === 'midja') {
      const finna = stada === 'serhljodi' ? stodurSerhljoda : stodurMidju;
      [ord] = ctx.ordaval.veljaOrd(Object.assign({}, grunn, { sia: o => finna(stafirO(o)).length > 0 }));
      if (ord) { const k = finna(stafirO(ord)); pos = k[Math.floor(Math.random() * k.length)]; }
    }
    if (!ord) {
      stada = 'fyrsti';
      [ord] = ctx.ordaval.veljaOrd(Object.assign({}, grunn, { fyrstaHljod: true }));
      if (!ord) [ord] = ctx.ordaval.veljaOrd({ n: 1, fyrstaHljod: true });
      pos = 0;
    }
    if (!ord) throw new Error('Engin orð fundust fyrir Stafurinn í orðinu');
    const bokstafir = stafirO(ord);
    const rett = bokstafir[pos];
    const emj = ctx.emojiListi(ord.e)[0] || ord.e;

    /* ---- truflanir: helst úr stafahópi borðsins; ef hann er of lítill fyrir reitina, þá úr öllu stafrófinu ---- */
    const ur = st.stafir && [...st.stafir].length >= val ? st.stafir : null;
    const truflanir = ctx.ordaval.truflStafir(rett, val - 1, { ur, hljod: true, likir: !!st.likir });
    const reitir = stokka([rett, ...truflanir]);

    /* ---- spurning: mynd + orðið með einn staf auðan ---- */
    const mynd = el('button', { class: 'mynd', type: 'button', text: emj, 'aria-label': 'Heyra orðið', onclick: () => ctx.tala(ord.o) });
    let reitur = null;
    const ordEl = el('div', { class: 'ord', role: 'img', 'aria-label': 'Orðið — einn staf vantar' },
      bokstafir.map((s, i) => {
        if (i !== pos) return el('span', { class: 'stafur sest', text: s });
        reitur = el('span', { class: 'stafur reitur naest', text: s, 'aria-hidden': 'true' });
        return reitur;
      }));
    ordEl.style.setProperty('--fj', String(Math.max(3, bokstafir.length)));
    const spjald = el('div', { class: 'spjald' }, mynd, ordEl);
    const spurning = el('div', { class: 'spurning l-fyrsti-stafur' }, spjald, ctx.hljodTakki(ord.o));

    /* ---- svör: stafareitir ---- */
    const stafaval = el('div', { class: 'stafaval' + (reitir.length <= 6 ? ' faerri' : ''), role: 'group', 'aria-label': 'Veldu stafinn sem vantar', dataset: { fjoldi: String(reitir.length) } });
    const takkar = reitir.map((s, i) => {
      const b = el('button', { class: 'stafatakki', type: 'button', text: s, dataset: { gildi: s, litur: String(i % 8) }, 'aria-label': 'Stafurinn ' + s, onclick: () => svara(s, b) });
      stafaval.appendChild(b);
      return b;
    });
    const svor = el('div', { class: 'svor l-fyrsti-stafur' }, stafaval);
    ctx.rot.append(spurning, svor);

    /* ---- textar: hljóðin, ekki stafanöfnin ---- */
    const R = () => ctx.stafa(rett);
    const hljodun = bokstafir.join('… ') + '… ' + ord.o;
    const SPURNING = {
      fyrsti: 'Á hvaða staf byrjar orðið?', sidasti: 'Á hvaða staf endar orðið?',
      serhljodi: 'Hvaða staf vantar í orðið?', midja: 'Hvaða staf vantar í orðið?',
    };
    const visbTexti = stada === 'fyrsti' ? `${R()}… ${R()}… ${ord.o} — ${hastafur(ord.o)} byrjar á ${R()}!`
      : stada === 'sidasti' ? `${ord.o}… ${R()}! ${hastafur(ord.o)} endar á ${R()}`
      : `${hljodun} — stafurinn sem vantar er ${R()}`;
    const visbTal = stada === 'fyrsti' ? `${rett}… ${rett}… ${ord.o}` : ord.o;
    ctx.hjalp(SPURNING[stada]);
    ctx.svar(rett, { texti: visbTexti, tala: visbTal, stafur: rett });
    ctx.timi(() => ctx.tala(ord.o), 350);

    function svara(s, b) {
      if (ctx.laest() || b.disabled) return;
      if (s === rett) {
        reitur.classList.remove('reitur', 'naest', 'visbending');
        reitur.classList.add('buid');
        b.classList.add('rett');
        mynd.classList.add('rett');
        ctx.rett({ stafur: rett, tala: ord.o, texti: `Rétt! ${ord.o} ${emj} 🎉` });
        return;
      }
      const texti = stada === 'fyrsti' ? `${hastafur(ord.o)} byrjar ekki á ${ctx.stafa(s)} — hlustaðu: ${rett}… ${rett}… ${ord.o} 🙂`
        : stada === 'sidasti' ? `Ekki ${ctx.stafa(s)} — hlustaðu á endann: ${ord.o} 🙂`
        : `Ekki ${ctx.stafa(s)} — lestu orðið aftur: ${hljodun} 🙂`;
      ctx.rangt({ stafur: rett, takki: b, texti });
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
