/* Hvar eru fleiri? — tveir hópar af ólíkum hlutum, barnið ýtir á hópinn þar sem eru fleiri (eða færri).
   Uppbygging: .spurning (lítið spjald með spurningunni) + .svor (.valkostir.tveir með tveimur stórum .valkostur-tökkum). */
const CSS = `
.l-fleiri-faerri.spurning .spjald{padding:clamp(.4rem,1.2vh,.8rem) clamp(1rem,3vw,1.8rem);min-width:min(100%,14rem)}
.l-fleiri-faerri .setning{font-size:clamp(1.4rem,min(5.5vh,5.5vw),2.6rem);line-height:1.2}
.l-fleiri-faerri .setning .lykilord{color:var(--fjolublar)}
.l-fleiri-faerri .setning .lykilord.faerri{color:var(--appelsinu)}
.l-fleiri-faerri .valkostir.tveir{max-width:40rem;gap:clamp(.6rem,2vw,1.4rem)}
.l-fleiri-faerri .valkostur{padding:2.1rem .35rem .7rem;min-height:6rem;justify-content:center}
.l-fleiri-faerri .hopur{display:grid;gap:.1em .15em;justify-content:center;align-content:center;line-height:1}
.l-fleiri-faerri .hopur span{width:1.3em;height:1.3em;display:flex;align-items:center;justify-content:center;line-height:1}
/* stærð tákna ræðst af dálkafjölda: breiddin á símum í lóðréttri stöðu (vw), hæðin í landslagi (vh) */
.l-fleiri-faerri .valkostir.d2 .hopur{grid-template-columns:repeat(2,1.3em);font-size:clamp(2.4rem,min(12vh,12vw),3.8rem)}
.l-fleiri-faerri .valkostir.d3 .hopur{grid-template-columns:repeat(3,1.3em);font-size:clamp(1.9rem,min(9.5vh,9.2vw),3.2rem)}
.l-fleiri-faerri .valkostir.d4 .hopur{grid-template-columns:repeat(4,1.3em);font-size:clamp(1.5rem,min(7.5vh,6.8vw),2.6rem)}
.l-fleiri-faerri .fjoldi{position:absolute;top:.45rem;right:.5rem;min-width:1.9rem;height:1.9rem;padding:0 .45rem;border-radius:999px;
  background:var(--bleikur);color:#fff;font-size:1.05rem;font-weight:800;display:flex;align-items:center;justify-content:center;
  animation:skella .3s ease}
.l-fleiri-faerri .valkostur.rett .fjoldi{background:var(--graenn)}
@media (max-height:480px){
  .l-fleiri-faerri .valkostur{padding:1.9rem .4rem .4rem;min-height:5rem}
  .l-fleiri-faerri .valkostir.tveir{gap:.6rem}
}
`;

/* öryggisnet ef HLUTIR vantar eða er of stutt */
const VARA_HLUTIR = [
  { e: '🍎', ft: 'epli', kyn: 'hk' }, { e: '🍌', ft: 'bananar', kyn: 'kk' }, { e: '⭐', ft: 'stjörnur', kyn: 'kvk' },
  { e: '🎈', ft: 'blöðrur', kyn: 'kvk' }, { e: '🚗', ft: 'bílar', kyn: 'kk' }, { e: '🌸', ft: 'blóm', kyn: 'hk' },
];
/* eintala fyrir „1 …“ — gögnin geyma bara fleirtölu */
const EINTALA = {
  epli: 'epli', bananar: 'banani', 'stjörnur': 'stjarna', fiskar: 'fiskur', 'blöðrur': 'blaðra', 'jarðarber': 'jarðarber',
  'maríubjöllur': 'maríubjalla', 'smákökur': 'smákaka', 'blóm': 'blóm', 'bílar': 'bíll', endur: 'önd', 'býflugur': 'býfluga',
  hlutir: 'hlutur',
};
/* töluorð fyrir tal — 1–4 beygjast eftir kyni */
const TOLUORD = [null,
  { kk: 'einn', kvk: 'ein', hk: 'eitt' }, { kk: 'tveir', kvk: 'tvær', hk: 'tvö' }, { kk: 'þrír', kvk: 'þrjár', hk: 'þrjú' }, { kk: 'fjórir', kvk: 'fjórar', hk: 'fjögur' },
  'fimm', 'sex', 'sjö', 'átta', 'níu', 'tíu', 'ellefu', 'tólf', 'þrettán', 'fjórtán', 'fimmtán', 'sextán', 'sautján', 'átján', 'nítján', 'tuttugu'];

const hlutur = h => (typeof h === 'string' ? { e: h, ft: 'hlutir', kyn: 'kk' } : { e: h.e, ft: h.ft || 'hlutir', kyn: h.kyn || 'kk', et: h.et });
const nafn = (h, n) => (n === 1 ? (h.et || EINTALA[h.ft] || h.e) : h.ft);
function toluord(n, kyn) {
  const t = TOLUORD[n];
  if (!t) return String(n);
  return typeof t === 'string' ? t : (t[kyn] || t.hk);
}
/* tveir ólíkir fjöldar 1..hamark; í helmingi tilvika er mismunurinn lítill (1–2) svo það þurfi að telja */
function veljaFjolda(hamark) {
  const a = 1 + Math.floor(Math.random() * hamark);
  let b = a;
  if (Math.random() < .5) {
    const kostir = [a - 2, a - 1, a + 1, a + 2].filter(x => x >= 1 && x <= hamark && x !== a);
    if (kostir.length) b = kostir[Math.floor(Math.random() * kostir.length)];
  }
  let vorn = 0;
  while (b === a && vorn++ < 50) b = 1 + Math.floor(Math.random() * hamark);
  if (b === a) b = a === hamark ? a - 1 : a + 1;
  return [a, b];
}

export default {
  id: 'fleiri-faerri',
  nafn: 'Hvar eru fleiri?',
  lysing: 'Tveir hópar af hlutum — teldu og ýttu á hópinn þar sem eru fleiri (eða færri).',
  takn: '🍎🍎🍎 ⚖️ 🍌🍌',
  flokkur: 'reikningur',
  stafagerdFast: false,
  sjalfgefid: { hamark: 5, faerri: true },
  erfidleikar: {
    lett:     { hamark: 5 },
    midlungs: { hamark: 8 },
    erfitt:   { hamark: 12 },
  },

  umferd(ctx) {
    const { st, el, gogn } = ctx;
    ctx.css('fleiri-faerri', CSS);
    const hamark = Math.max(2, Math.min(20, parseInt(st.hamark, 10) || 5));

    /* hlutir: tveir ólíkir (ólíkt emoji) */
    let listi = (Array.isArray(gogn.HLUTIR) ? gogn.HLUTIR : []).map(hlutur).filter(h => h.e);
    if (listi.length < 2) listi = VARA_HLUTIR.slice();
    const stokkad = ctx.stokka(listi);
    const A = stokkad[0];
    const B = stokkad.find(h => h.e !== A.e && h.ft !== A.ft) || stokkad[1];

    const [a, b] = veljaFjolda(hamark);
    const spyrjaFaerri = st.faerri !== false && Math.random() < .5;
    const lykilord = spyrjaFaerri ? 'færri' : 'fleiri';
    const spurningTexti = 'Hvar eru ' + lykilord + '?';
    const rettHlid = (spyrjaFaerri ? a < b : a > b) ? 'vinstri' : 'haegri';
    const mest = Math.max(a, b);
    const dalkar = mest <= 4 ? 2 : mest <= 9 ? 3 : 4;

    /* spurning */
    const setning = el('div', { class: 'setning' }, 'Hvar eru ', el('span', { class: 'lykilord' + (spyrjaFaerri ? ' faerri' : ''), text: lykilord }), '?');
    const spjald = el('div', { class: 'spjald' }, setning);
    const spurning = el('div', { class: 'spurning l-fleiri-faerri' }, spjald, ctx.hljodTakki(spurningTexti));

    /* svör: tveir hópar */
    const hopar = [{ h: A, n: a, gildi: 'vinstri' }, { h: B, n: b, gildi: 'haegri' }];
    const valkostir = el('div', { class: 'valkostir tveir d' + dalkar, role: 'group', 'aria-label': spurningTexti });
    const takkar = hopar.map((x, i) => {
      const hopur = el('div', { class: 'hopur', 'aria-hidden': 'true' }, Array.from({ length: x.n }, () => el('span', { text: x.h.e })));
      const t = el('button', { class: 'valkostur', dataset: { gildi: x.gildi }, 'aria-label': 'Hópur ' + (i + 1) + ': ' + x.n + ' ' + nafn(x.h, x.n),
        onclick: () => svara(x.gildi, t) }, el('span', { class: 'nr', 'aria-hidden': 'true', text: String(i + 1) }), hopur);
      x.takki = t;
      return t;
    });
    valkostir.append(...takkar);
    const svor = el('div', { class: 'svor l-fleiri-faerri' }, valkostir);
    ctx.rot.append(spurning, svor);

    const rettHopur = hopar.find(x => x.gildi === rettHlid);
    ctx.hjalp('Í hvorum hópnum eru ' + lykilord + '? Ýttu á hann!');
    ctx.svar(rettHlid, { texti: 'Hér eru ' + lykilord + ' — ' + rettHopur.n + ' ' + nafn(rettHopur.h, rettHopur.n) + '!', tala: spurningTexti });
    ctx.tala(spurningTexti);

    /* sýna fjöldann á báðum hópum (við rétt svar og sem vísbending) */
    function synaFjolda() {
      for (const x of hopar) {
        if (!x.takki.querySelector('.fjoldi')) x.takki.appendChild(el('span', { class: 'fjoldi', 'aria-hidden': 'true', text: String(x.n) }));
      }
    }
    function svara(gildi, takki) {
      if (ctx.laest() || !takki || takki.disabled) return;
      if (gildi === rettHlid) {
        synaFjolda();
        ctx.rett({
          texti: 'Rétt — ' + a + ' ' + nafn(A, a) + ' og ' + b + ' ' + nafn(B, b) + '! 🎉',
          tala: toluord(a, A.kyn) + ' ' + nafn(A, a) + ' og ' + toluord(b, B.kyn) + ' ' + nafn(B, b),
        });
      } else {
        ctx.rangt({ takki, texti: 'Teldu bæði — hvar eru ' + lykilord + '? 🙂' });
      }
    }
    function lesa() { ctx.tala(spurningTexti); }

    ctx.lyklar((e, lykill) => {
      if (lykill === '1' || lykill === 'ArrowLeft') { e.preventDefault(); svara('vinstri', takkar[0]); return; }
      if (lykill === '2' || lykill === 'ArrowRight') { e.preventDefault(); svara('haegri', takkar[1]); return; }
      if (lykill === ' ') { e.preventDefault(); lesa(); }
    });

    return { lesa, visbending: synaFjolda };
  },
};
