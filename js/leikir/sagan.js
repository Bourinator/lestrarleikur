/* Hvað gerðist? — sagan úr v1: hlutir birtast einn og einn á sviðinu, svo gerist eitthvað (blöðrur springa, epli eru
   borðuð, fuglar fljúga burt … eða fleiri bætast við). Dæmið byggist upp jafnóðum í .jafna („3 + 2 = ?“) og barnið
   svarar með tölureitunum sem birtast þegar sagan er búin. 🔁 Sjá aftur endursýnir söguna.
   Öll tímasetning fer um ctx.bida/ctx.timi svo hún stoppar sjálfkrafa þegar umferðinni lýkur. */
const CSS = `
.l-sagan .svid{width:100%;min-height:clamp(5rem,16vh,8rem);padding:clamp(.5rem,1.5vh,1rem) clamp(.8rem,2vw,1.4rem)}
.l-sagan .svidHlutir{font-size:clamp(1.6rem,min(6vh,6vw),3rem)}
.l-sagan .svidHlutir.margir{font-size:clamp(1.2rem,min(4.5vh,4.5vw),2.2rem)}
.l-sagan .saga{font-size:clamp(1rem,2.6vw,1.3rem);font-weight:800;color:var(--dauft);min-height:1.3em;line-height:1.25;max-width:100%}
.l-sagan .jafna{min-height:1.3em}
/* krossaði hluturinn: gráminn á innri spönnina svo ✖-ið haldi litnum */
.l-sagan .farinn{opacity:1;filter:none}
.l-sagan .farinn .inni{display:inline-block;opacity:.3;filter:grayscale(1)}
.l-sagan .jafna .spurn{display:inline-block;min-width:1.15em;padding:0 .12em;background:var(--bleikur-ljos);border-bottom:.08em solid var(--bleikur);
  border-radius:.22em .22em 0 0;animation:pulsa 1.1s ease-in-out infinite}
.l-sagan .jafna .spurn.buid{color:var(--graenn);background:var(--graenn-ljos);border-color:var(--graenn);animation:skella .35s ease}
.l-sagan .sjaAftur{min-height:3rem;font-size:1rem;padding:.4em 1em}
.l-sagan .tolur{display:flex;flex-wrap:wrap;justify-content:center;--g:clamp(.5rem,1.4vw,.8rem);--d:11;gap:var(--g);width:100%;max-width:58rem}
.l-sagan .tolur.t6{--d:6;max-width:34rem}
.l-sagan .tolur.t16{--d:8;max-width:48rem}
.l-sagan .tolutakki{flex:0 0 auto;width:calc((100% - (var(--d) - 1) * var(--g)) / var(--d));max-width:6.5rem;min-width:2.75rem}
.l-sagan .tolutakki.bidur{outline:4px dashed var(--blar);outline-offset:3px}
@media (max-width:700px){.l-sagan .tolur.t11,.l-sagan .tolur.t16,.l-sagan .tolur.t21{--d:6}}
@media (max-height:480px){
  .l-sagan .tolur.t11{--d:6}.l-sagan .tolur.t16{--d:8}.l-sagan .tolur.t21{--d:7}
  .l-sagan .svid{min-height:4rem;padding:.4rem .8rem}
  .l-sagan .svidHlutir{font-size:clamp(1.2rem,6vh,2rem)}
  .l-sagan .saga{font-size:1rem}
}
`;

/* sögurnar úr v1 — h = hluturinn, nafn = fleirtala, burt = hvað gerðist, hreyf = CSS-hreyfingin, tak = táknið í sögunni */
const SOGUR = [
  { h: '🎈', nafn: 'blöðrur',   burt: 'sprungu!',     hreyf: 'springa', tak: '💥' },
  { h: '🍎', nafn: 'epli',      burt: 'voru borðuð!', hreyf: 'borda',   tak: '😋' },
  { h: '🍪', nafn: 'smákökur',  burt: 'voru étnar!',  hreyf: 'borda',   tak: '😋' },
  { h: '🍓', nafn: 'jarðarber', burt: 'voru borðuð!', hreyf: 'borda',   tak: '😋' },
  { h: '🐦', nafn: 'fuglar',    burt: 'flugu burt!',  hreyf: 'burt',    tak: '💨' },
  { h: '🐟', nafn: 'fiskar',    burt: 'syntu burt!',  hreyf: 'burt',    tak: '💨' },
  { h: '🚗', nafn: 'bílar',     burt: 'keyrðu burt!', hreyf: 'burt',    tak: '💨' },
  { h: '🐝', nafn: 'býflugur',  burt: 'flugu burt!',  hreyf: 'burt',    tak: '💨' },
  { h: '🦆', nafn: 'endur',     burt: 'syntu burt!',  hreyf: 'burt',    tak: '💨' },
  { h: '⭐', nafn: 'stjörnur',  burt: 'slokknuðu!',   hreyf: 'hverfa',  tak: '✨' },
];
const slembi = n => Math.floor(Math.random() * n);

export default {
  id: 'sagan',
  nafn: 'Hvað gerðist?',
  lysing: 'Horfðu á það gerast — teldu svo hvað er eftir eða hvað þau eru orðin mörg.',
  takn: '🎈🎈🎈 💥',
  flokkur: 'reikningur',
  stafagerdFast: true,   /* engir bókstafir */
  sjalfgefid: { hamark: 5 },
  erfidleikar: {
    lett:     { hamark: 5 },
    midlungs: { hamark: 10 },
    erfitt:   { hamark: 15 },
  },

  umferd(ctx) {
    const { st, el } = ctx;
    ctx.css('sagan', CSS);
    const hamark = Math.max(4, Math.min(20, parseInt(st.hamark, 10) || 5));
    const sv = SOGUR[slembi(SOGUR.length)];
    /* sömu reglur og í v1: plús → c ∈ 4..hamark, a ∈ 2..c−2;  mínus → a ∈ 3..hamark, b ∈ 2..a−1 */
    const plus = Math.random() < .5;
    let a, b, svar;
    if (plus) { const c = 4 + slembi(hamark - 3); a = 2 + slembi(c - 3); b = c - a; svar = c; }
    else { a = 3 + slembi(hamark - 2); b = 2 + slembi(a - 2); svar = a - b; }
    const tak = plus ? '+' : '−', takOrd = plus ? 'plús' : 'mínus';
    /* hreyfimyndir af, eða kappborð: sagan gerist nærri samstundis */
    const T = ms => (ctx.hreyfing && !ctx.hradi ? ms : Math.min(ms, 40));

    /* ---- spurning: sviðið, dæmið, sögutextinn og 🔁 ---- */
    const svidHlutir = el('div', { class: 'svidHlutir' + (Math.max(a, a + b) > 10 ? ' margir' : '') });
    const svid = el('div', { class: 'svid', role: 'img', 'aria-label': 'Sagan er að byrja' }, svidHlutir);
    const jafna = el('div', { class: 'jafna', 'aria-hidden': 'true' });
    const saga = el('div', { class: 'saga', 'aria-live': 'polite' });
    const aftur = el('button', { class: 'textatakki sjaAftur falin', type: 'button', text: '🔁 Sjá aftur', onclick: () => spila() });
    const spurning = el('div', { class: 'spurning l-sagan' }, svid, jafna, saga, aftur);

    /* ---- svör: tölureitirnir 0..hamark birtast þegar sagan er búin ---- */
    const fjoldi = hamark + 1;
    const hopKlasi = fjoldi <= 6 ? 't6' : fjoldi <= 11 ? 't11' : fjoldi <= 16 ? 't16' : 't21';
    const tolur = el('div', { class: 'tolur ' + hopKlasi, role: 'group', 'aria-label': 'Veldu tölu' });
    const svor = el('div', { class: 'svor l-sagan' }, tolur);
    ctx.rot.append(spurning, svor);

    const takkar = [];
    let spurn = null, buid = false, iGangi = false;

    function jafnaBaeta(t, erSpurn) {
      const sp = el('span', { class: erSpurn ? 'spurn' : null, text: t });
      jafna.appendChild(sp);
      return sp;
    }
    function byggjaTolur() {
      for (let n = 0; n <= hamark; n++) {
        const t = el('button', { class: 'tolutakki', type: 'button', text: String(n), dataset: { gildi: String(n), litur: String(n % 8) }, 'aria-label': 'Talan ' + n, onclick: () => svara(n) });
        takkar.push(t);
        tolur.appendChild(t);
      }
    }
    function virkjaTolur(a) { takkar.forEach(t => { if (!t.classList.contains('rangur')) { t.disabled = !a; if (a) t.removeAttribute('aria-disabled'); else t.setAttribute('aria-disabled', 'true'); } }); }

    /** sýnir söguna (fyrst eða aftur); í lokin birtast tölurnar og vélin fær rétta svarið */
    async function spila() {
      if (iGangi || ctx.laest()) return;
      iGangi = true;
      aftur.classList.add('falin');
      if (buid) virkjaTolur(false);
      svidHlutir.innerHTML = ''; jafna.innerHTML = ''; saga.textContent = '';
      svid.setAttribute('aria-label', 'Sagan er að byrja');
      ctx.hjalp('Fylgstu með…');

      /* 1. hlutirnir birtast einn og einn */
      const hopA = el('div', { class: 'svidhopur' });
      svidHlutir.appendChild(hopA);
      for (let i = 0; i < a; i++) {
        hopA.appendChild(el('span', { class: 'birtast', text: sv.h }));
        ctx.hljod.plopp();
        await ctx.bida(T(150));
      }
      jafnaBaeta(String(a));
      ctx.hjalp(a + ' ' + sv.nafn + '!');
      await ctx.bida(T(800));

      /* 2. eitthvað gerist */
      if (plus) {
        const hopB = el('div', { class: 'svidhopur nyr' });
        svidHlutir.appendChild(el('div', { class: 'svidpar' }, el('div', { class: 'svidadgerd birtast', text: '+' }), hopB));
        jafnaBaeta('+');
        saga.textContent = '➕ ' + b + ' ' + sv.nafn + ' bættust við!';
        for (let i = 0; i < b; i++) {
          hopB.appendChild(el('span', { class: 'koma', text: sv.h }));
          ctx.hljod.plopp();
          await ctx.bida(T(220));
        }
        jafnaBaeta(String(b));
        ctx.hjalp('Teldu alla saman!');
        svid.setAttribute('aria-label', `${a} ${sv.nafn}, ${b} bættust við`);
      } else {
        jafnaBaeta('−');
        saga.textContent = sv.tak + ' ' + b + ' ' + sv.nafn + ' ' + sv.burt;
        const born = [...hopA.children];
        for (let i = 0; i < b; i++) {
          const sp = born[born.length - 1 - i];
          sp.classList.add(sv.hreyf);
          if (sv.hreyf === 'springa') ctx.timi(() => { sp.textContent = '💥'; }, T(200));
          ctx.hljod.hvarf();
          await ctx.bida(T(260));
        }
        await ctx.bida(T(700));
        /* þeir sem fóru verða gráir og krossaðir svo frádrátturinn sjáist áfram */
        born.slice(born.length - b).forEach(sp => { sp.className = 'farinn'; sp.textContent = ''; sp.appendChild(el('span', { class: 'inni', text: sv.h })); });
        jafnaBaeta(String(b));
        ctx.hjalp('Teldu þá sem eru eftir!');
        svid.setAttribute('aria-label', `${a} ${sv.nafn}, ${b} ${sv.burt}`);
      }

      /* 3. dæmið klárast og svarað */
      await ctx.bida(T(500));
      jafnaBaeta('=');
      spurn = jafnaBaeta('?', true);
      iGangi = false;
      aftur.classList.remove('falin');
      if (!buid) {
        buid = true;
        byggjaTolur();
        ctx.svar(svar, { texti: `${a} ${tak} ${b} = ${svar} — ýttu á ${svar}!`, tala: `${a} ${takOrd} ${b} ${svar === 1 ? 'er' : 'eru'} ${svar}` });
      } else virkjaTolur(true);
    }

    function svara(n) {
      if (ctx.laest() || !buid || iGangi) return;
      hreinsaBid();
      const takki = takkar[n];
      if (!takki || takki.disabled) return;
      if (n === svar) {
        if (spurn) { spurn.textContent = String(n); spurn.classList.add('buid'); }
        takki.classList.add('rett');
        ctx.rett({ texti: `Rétt — ${a} ${tak} ${b} = ${svar}! 🎉`, tala: `${a} ${takOrd} ${b} ${svar === 1 ? 'er' : 'eru'} ${svar}` });
      } else {
        ctx.rangt({ takki, texti: 'Teldu aftur — það er ' + (n > svar ? 'færra' : 'fleira') + ' en það 🙂' });
      }
    }

    /* lyklaborð: tölustafir svara; með hámark > 9 bíður fyrri tölustafurinn 700 ms eftir þeim seinni */
    let bid = null, bidTimer = null;
    function hreinsaBid() {
      if (bidTimer) clearTimeout(bidTimer);
      bidTimer = null;
      if (bid !== null && takkar[bid]) takkar[bid].classList.remove('bidur');
      bid = null;
    }
    ctx.lyklar((e, lykill) => {
      if (lykill === ' ') { e.preventDefault(); spila(); return; }
      if (!buid) return;
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
        svara(fyrri);
        if (ctx.laest()) return;
      }
      if (n === 0 || n * 10 > hamark) { svara(n); return; }
      bid = n;
      takkar[n].classList.add('bidur');
      bidTimer = ctx.timi(() => { const v = bid; hreinsaBid(); if (v !== null) svara(v); }, 700);
    });

    spila();
    return {
      lesa() { ctx.tala(saga.textContent || (a + ' ' + sv.nafn)); },
      haetta: hreinsaBid,
    };
  },
};
