/* Plús og mínus — samlagning og frádráttur. Ein eining fyrir v1-leikina 4/5/6:
   st.snid = 'tolur'  → „3 + 2 = ?“
             'myndir' → sama dæmi með myndum (frádráttur sýndur með krossuðum hlutum)
             'vantar' → „4 + ? = 7“ — finna töluna sem vantar
   st.hamark = stærsta talan sem kemur fyrir (svarreitir 0..hamark).
   Rangt svar gefur „of hátt / of lágt“-vísbendingu; rétt svar setur töluna í stað ?. */
const CSS = `
.l-plus-minus .spjald{min-width:min(100%,15rem);gap:clamp(.25rem,.9vh,.5rem)}
.l-plus-minus .fyrirsogn{font-size:clamp(1rem,2.6vw,1.35rem);font-weight:800;color:var(--dauft);line-height:1.2}
.l-plus-minus .daemi .spurn{display:inline-block;min-width:1.15em;text-align:center;padding:0 .12em;line-height:1.1;
  background:var(--bleikur-ljos);border-bottom:.08em solid var(--bleikur);border-radius:.22em .22em 0 0;animation:pulsa 1.1s ease-in-out infinite}
.l-plus-minus .daemi .spurn.buid{color:var(--graenn);background:var(--graenn-ljos);border-color:var(--graenn);animation:skella .35s ease}
.l-plus-minus .daemiMyndir.margir{font-size:clamp(1.1rem,3.6vh,2rem)}
.l-plus-minus .daemiMyndir.visb{font-size:clamp(1.1rem,3.4vh,1.9rem);animation:svifaInn .3s ease}
.l-plus-minus .daemiMyndir .leita{background:var(--gulur-ljos);box-shadow:inset 0 0 0 3px var(--gulur);border-radius:.4em;padding:.06em .18em}
/* tölureitir: flex í stað grid svo síðasta röðin sé miðjuð (6+5, 6+6+6+3 …); --d = reitir í röð */
.l-plus-minus .tolur{display:flex;flex-wrap:wrap;justify-content:center;--g:clamp(.5rem,1.4vw,.8rem);--d:11;gap:var(--g);width:100%;max-width:58rem}
.l-plus-minus .tolur.t6{--d:6;max-width:34rem}
.l-plus-minus .tolur.t16{--d:8;max-width:48rem}
.l-plus-minus .tolutakki{flex:0 0 auto;width:calc((100% - (var(--d) - 1) * var(--g)) / var(--d));max-width:6.5rem;min-width:2.75rem}
.l-plus-minus .tolutakki.bidur{outline:4px dashed var(--blar);outline-offset:3px}
@media (max-width:700px){.l-plus-minus .tolur.t11,.l-plus-minus .tolur.t16,.l-plus-minus .tolur.t21{--d:6}}
@media (max-height:480px){
  .l-plus-minus .tolur.t11{--d:6}.l-plus-minus .tolur.t16{--d:8}.l-plus-minus .tolur.t21{--d:7}
  .l-plus-minus .fyrirsogn{font-size:1rem}
  .l-plus-minus .daemiMyndir{font-size:clamp(1.3rem,6vh,2rem)}
}
`;

/* öryggisnet ef HLUTIR vantar í gögnin */
const SJALFGEFNIR_HLUTIR = ['🍎', '🍌', '⭐', '🐟', '🎈', '🍓', '🐞', '🍪', '🌸', '🚗', '🦆', '🐝'];
const SNID = ['tolur', 'myndir', 'vantar'];
const TEKIN = { kk: 'teknir', kvk: 'teknar', hk: 'tekin' };

const hlutur = h => (typeof h === 'string' ? { e: h, ft: 'hlutir', kyn: 'kk' } : h);
const slembi = n => Math.floor(Math.random() * n);

export default {
  id: 'plus-minus',
  nafn: 'Plús og mínus',
  lysing: 'Leggðu saman eða dragðu frá og finndu rétta tölu.',
  takn: '3 + 2 = ?',
  flokkur: 'reikningur',
  stafagerdFast: true,   /* engir bókstafir — Aa-rofinn á ekkert erindi */
  sjalfgefid: { snid: 'tolur', hamark: 5 },
  erfidleikar: {
    lett:     { snid: 'myndir', hamark: 5 },
    midlungs: { snid: 'tolur',  hamark: 10 },
    erfitt:   { snid: 'vantar', hamark: 20 },
  },

  umferd(ctx) {
    const { st, el, gogn } = ctx;
    ctx.css('plus-minus', CSS);
    const snid = SNID.includes(st.snid) ? st.snid : 'tolur';
    const hamark = Math.max(2, Math.min(99, parseInt(st.hamark, 10) || 5));

    /* dæmið (sömu reglur og í v1): plús → c ∈ 2..hamark, a ∈ 1..c−1;  mínus → a ∈ 2..hamark, b ∈ 1..a */
    const plus = Math.random() < .5;
    let a, b, c;
    if (plus) { c = 2 + slembi(hamark - 1); a = 1 + slembi(c - 1); b = c - a; }
    else { a = 2 + slembi(hamark - 1); b = 1 + slembi(a); c = a - b; }
    const tak = plus ? '+' : '−';
    const takOrd = plus ? 'plús' : 'mínus';
    const svar = snid === 'vantar' ? b : c;
    const er = n => (n <= 1 ? 'er' : 'eru');
    const fyrirsognTexti = snid === 'vantar' ? 'Hvaða tölu vantar?' : (plus ? 'Leggðu saman!' : 'Dragðu frá!');
    const lesaTexti = snid === 'vantar'
      ? `${fyrirsognTexti} ${a} ${takOrd} hvað ${er(c)} ${c}?`
      : `${fyrirsognTexti} ${a} ${takOrd} ${b}?`;

    /* hlutur fyrir myndirnar */
    const hlutir = (Array.isArray(gogn.HLUTIR) && gogn.HLUTIR.length ? gogn.HLUTIR : SJALFGEFNIR_HLUTIR).map(hlutur);
    const hl = hlutir[slembi(hlutir.length)];

    function hopur(fjoldi, burt = 0, klasi = '') {
      const d = el('div', { class: ('hopur ' + klasi).trim() });
      for (let i = 0; i < fjoldi; i++) d.appendChild(el('span', { class: i >= fjoldi - burt ? 'burt' : null, text: hl.e }));
      return d;
    }
    const adgerd = t => el('div', { class: 'adgerd', text: t });
    function myndir(klasi) {
      const lysing = plus
        ? `${a} ${hl.ft} og ${b} ${hl.ft}`
        : `${a} ${hl.ft}, ${b} ${TEKIN[hl.kyn] || 'tekin'} burt`;
      const m = el('div', { class: ('daemiMyndir ' + klasi + (Math.max(a, c) > 10 ? ' margir' : '')).trim(), role: 'img', 'aria-label': lysing });
      if (plus) m.append(hopur(a), adgerd('+'), hopur(b, 0, snid === 'vantar' ? 'leita' : ''));
      else m.append(hopur(a, b), adgerd(snid === 'vantar' ? '− ?' : '− ' + b));
      return m;
    }

    /* spurning: spjald með fyrirsögn, (myndum) og dæminu */
    const spurn = el('span', { class: 'spurn', text: '?' });
    const daemi = el('div', { class: 'daemi' });
    if (snid === 'vantar') daemi.append(`${a} ${tak} `, spurn, ` = ${c}`);
    else daemi.append(`${a} ${tak} ${b} = `, spurn);
    const spjald = el('div', { class: 'spjald' },
      el('div', { class: 'fyrirsogn', text: fyrirsognTexti }),
      snid === 'myndir' ? myndir('') : null,
      daemi);
    const spurning = el('div', { class: 'spurning l-plus-minus' }, spjald);

    /* svör: tölureitir 0..hamark */
    const fjoldi = hamark + 1;
    const hopKlasi = fjoldi <= 6 ? 't6' : fjoldi <= 11 ? 't11' : fjoldi <= 16 ? 't16' : 't21';
    const tolur = el('div', { class: 'tolur ' + hopKlasi, role: 'group', 'aria-label': 'Veldu tölu' });
    const takkar = [];
    for (let n = 0; n <= hamark; n++) {
      const t = el('button', { class: 'tolutakki', text: String(n), dataset: { gildi: String(n), litur: String(n % 8) },
        'aria-label': 'Talan ' + n, onclick: () => svara(n) });
      takkar.push(t);
      tolur.appendChild(t);
    }
    const svor = el('div', { class: 'svor l-plus-minus' }, tolur);
    ctx.rot.append(spurning, svor);
    ctx.svar(svar, { texti: `Rétta talan er ${svar} 🙂`, tala: String(svar) });

    function svara(n) {
      if (ctx.laest()) return;
      hreinsaBid();
      const takki = takkar[n];
      if (!takki || takki.disabled) return;
      if (n === svar) {
        spurn.textContent = String(n);
        spurn.classList.add('buid');
        takki.classList.add('rett');
        ctx.rett({ texti: `Rétt! ${a} ${tak} ${b} = ${c} 🎉`, tala: `${a} ${takOrd} ${b} ${er(c)} ${c}` });
      } else {
        ctx.rangt({ takki, texti: n > svar ? 'Aðeins of hátt — reyndu lægri tölu 🙂' : 'Aðeins of lágt — reyndu hærri tölu 🙂' });
      }
    }

    /* lyklaborð: tölustafir svara; þegar hamark > 9 er beðið 700 ms eftir öðrum tölustaf (t.d. „1“ + „2“ = 12) */
    let bid = null, bidTimer = null;
    function hreinsaBid() {
      if (bidTimer) clearTimeout(bidTimer);
      bidTimer = null;
      if (bid !== null && takkar[bid]) takkar[bid].classList.remove('bidur');
      bid = null;
    }
    function byrjaBid(n) {
      bid = n;
      takkar[n].classList.add('bidur');
      bidTimer = ctx.timi(() => { const v = bid; hreinsaBid(); if (v !== null) svara(v); }, 700);
    }
    ctx.lyklar((e, lykill) => {
      if (lykill === ' ') { e.preventDefault(); lesa(); return; }
      if (lykill === 'Backspace') { hreinsaBid(); return; }
      if (lykill === 'Enter' && bid !== null) { e.preventDefault(); const v = bid; hreinsaBid(); svara(v); return; }
      if (!/^[0-9]$/.test(lykill)) return;
      e.preventDefault();
      const n = parseInt(lykill, 10);
      if (hamark <= 9) { svara(n); return; }
      if (bid !== null) {
        const fyrri = bid, saman = fyrri * 10 + n;
        hreinsaBid();
        if (saman <= hamark) { svara(saman); return; }
        svara(fyrri);              /* „25“ þegar hamark er 20 → svara 2, og 5 verður nýr fyrsti tölustafur */
        if (ctx.laest()) return;
      }
      if (n === 0 || n * 10 > hamark) { svara(n); return; }
      byrjaBid(n);
    });

    function lesa() { ctx.tala(lesaTexti); }
    /* aukavísbending: í tölu-/vantar-sniði birtast myndir til að telja (vélin merkir sjálf rétta reitinn) */
    function visbending() {
      if (snid === 'myndir' || spjald.querySelector('.daemiMyndir') || Math.max(a, c) > 12) return;
      spjald.insertBefore(myndir('visb'), daemi);
    }
    return { lesa, visbending, haetta: hreinsaBid };
  },
};
