/* Rímorð — orð og mynd birtast, barnið finnur orðið sem rímar meðal myndaspjalda með texta.
   Rétt svar = annað orð úr sama RIM-hópi; truflanir = orð úr öðrum hópum (hóparnir ríma aldrei innbyrðis). */
const CSS = `
.l-rim .spjald{padding:clamp(.5rem,1.4vh,.9rem) clamp(1.4rem,5vw,2.6rem);gap:clamp(.1rem,.6vh,.35rem)}
.l-rim .stort-ord{font-size:clamp(1.9rem,min(8vh,9vw),4rem)}
.l-rim .stort-ord .rimhluti,.l-rim .ordtexti .rimhluti{color:var(--bleikur)}
.l-rim .valkostur{gap:clamp(.15rem,.6vh,.35rem)}
.l-rim .valkostur .ordtexti{color:var(--dokkt);font-size:clamp(1.05rem,min(3vw,3.4vh),1.7rem);line-height:1.15;
  overflow-wrap:anywhere;padding:0 .1rem;max-width:100%}
.l-rim .valkostir.fjorir .valkostur .emj{font-size:clamp(2.6rem,min(9vh,10vw),4.6rem)}
@media (max-width:700px){
  .l-rim .valkostir.thrir .valkostur .ordtexti{font-size:clamp(1rem,4.2vw,1.3rem)}
  .l-rim .valkostir.fjorir .valkostur .emj{font-size:clamp(2.6rem,min(9vh,14vw),4.6rem)}
}
@media (max-height:480px){
  .l-rim.svor .valkostir.fjorir{grid-template-columns:repeat(2,1fr);max-width:32rem}
  .l-rim .valkostur .ordtexti{font-size:clamp(1rem,3.6vh,1.25rem)}
  .l-rim .valkostir.fjorir .valkostur .emj,.l-rim .valkostir.thrir .valkostur .emj{font-size:clamp(1.9rem,14vh,3rem)}
  .l-rim .stort-ord{font-size:clamp(1.4rem,12vh,2.6rem)}
}
`;

const hastafur = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/* sameiginleg ending tveggja orða (rímhlutinn), t.d. mús/hús → „ús“ */
function rimEnding(a, b, stafir) {
  const x = stafir(a), y = stafir(b);
  let n = 0;
  while (n < x.length - 1 && n < y.length - 1 && x[x.length - 1 - n] === y[y.length - 1 - n]) n++;
  return n >= 2 ? x.slice(x.length - n).join('') : '';
}

/* orð með rímhlutann merktan: [ 'm', <span class="rimhluti">ús</span> ] */
function merktOrd(el, ord, ending) {
  if (!ending || !ord.endsWith(ending)) return [ord];
  return [ord.slice(0, ord.length - ending.length), el('span', { class: 'rimhluti', text: ending })];
}

export default {
  id: 'rim',
  nafn: 'Rímorð',
  lysing: 'Orð og mynd birtast — finndu orðið sem rímar við það!',
  takn: '🐭 → 🏠',
  flokkur: 'lestur',
  stafagerdFast: false,
  sjalfgefid: { val: 3, olikLengd: false },
  erfidleikar: {
    lett:     { val: 3, olikLengd: false },
    midlungs: { val: 4, olikLengd: false },
    erfitt:   { val: 4, olikLengd: true },
  },

  umferd(ctx) {
    const { st, el, stokka, gogn, stafir, emojiListi } = ctx;
    ctx.css('rim', CSS);
    const val = Math.max(2, Math.min(6, parseInt(st.val, 10) || 3));
    const notad = ctx.ordaval.notad;

    /* ---- gögn: hreinsa og henda ónýtum hópum ---- */
    const hreinsa = x => {
      if (typeof x === 'string') return { o: x.normalize('NFC').toLowerCase(), e: '❓' };
      if (!x || typeof x.o !== 'string') return null;
      const e = emojiListi(x.e || '')[0];
      return e ? { o: x.o.normalize('NFC').toLowerCase(), e } : null;
    };
    const hopar = (gogn.RIM || []).map(h => (Array.isArray(h) ? h.map(hreinsa).filter(Boolean) : [])).filter(h => h.length >= 2);
    if (hopar.length < 2) throw new Error('RIM: vantar rímhópa');

    /* ---- velja markorð + rétt svar ----
       öll (mark, svar)-pör; helst hópur sem hefur ekki verið notaður í borðinu, síðan ónotað markorð, annars hvað sem er.
       olikLengd (erfitt): helst pör þar sem orðin eru ólík að lengd (mús/hús er auðveldara en ís/grís). */
    const por = [];
    hopar.forEach(h => h.forEach(mark => h.forEach(svar => { if (mark !== svar) por.push({ mark, svar, hopur: h }); })));
    const onotadurHopur = p => p.hopur.every(o => !notad.has(o.o));
    const onotadMark = p => !notad.has(p.mark.o);
    const olikLengd = p => stafir(p.mark.o).length !== stafir(p.svar.o).length;
    const sidir = [
      p => onotadurHopur(p) && (!st.olikLengd || olikLengd(p)),
      p => onotadMark(p) && (!st.olikLengd || olikLengd(p)),
      onotadurHopur, onotadMark, () => true,
    ];
    let par = null;
    for (const sia of sidir) { const k = por.filter(sia); if (k.length) { par = k[Math.floor(Math.random() * k.length)]; break; } }
    const { mark, svar, hopur } = par;
    notad.add(mark.o);

    /* ---- truflanir: eitt orð úr hverjum af val-1 öðrum hópum, ólík emoji ---- */
    const emoji = new Set([mark.e, svar.e]);
    const ordin = new Set([mark.o, svar.o]);
    const truflanir = [];
    const baeta = o => { if (!emoji.has(o.e) && !ordin.has(o.o)) { emoji.add(o.e); ordin.add(o.o); truflanir.push(o); return true; } return false; };
    for (const h of stokka(hopar.filter(h => h !== hopur))) {
      if (truflanir.length >= val - 1) break;
      for (const o of stokka(h)) { if (baeta(o)) break; }
    }
    /* ef hóparnir duga ekki (mjög lítil gögn): fleiri orð úr sömu hópum */
    if (truflanir.length < val - 1) {
      for (const o of stokka(hopar.filter(h => h !== hopur).flat())) { if (truflanir.length >= val - 1) break; baeta(o); }
    }
    const kostir = stokka([svar, ...truflanir]);
    const ending = rimEnding(mark.o, svar.o, stafir);
    const spurningTexti = 'Hvað rímar við ' + mark.o + '?';

    /* ---- spurning ---- */
    const myndTakki = el('button', { class: 'mynd', text: mark.e, 'aria-label': 'Myndin sýnir ' + mark.o + ' — heyra orðið',
      onclick: e => { e.stopPropagation(); ctx.tala(mark.o); } });
    const ordEl = el('div', { class: 'stort-ord', text: mark.o, 'aria-label': 'Orðið ' + mark.o });
    const spjald = el('div', { class: 'spjald' }, myndTakki, ordEl);
    const spurning = el('div', { class: 'spurning l-rim' }, spjald, ctx.hljodTakki(() => spurningTexti));

    /* ---- svör ---- */
    const valkostir = el('div', { class: 'valkostir' + (kostir.length === 3 ? ' thrir' : kostir.length === 2 ? ' tveir' : kostir.length === 4 ? ' fjorir' : kostir.length >= 5 ? ' sex' : ''),
      role: 'group', 'aria-label': 'Veldu orðið sem rímar' });
    const ordTextar = new Map();
    kostir.forEach((o, i) => {
      const texti = el('div', { class: 'ordtexti', text: o.o });
      ordTextar.set(o.o, texti);
      const b = el('button', { class: 'valkostur medTexta', dataset: { gildi: o.o }, 'aria-label': o.o,
        onclick: () => svara(o.o, b) },
        el('span', { class: 'nr', text: String(i + 1), 'aria-hidden': 'true' }),
        el('span', { class: 'emj', text: o.e, 'aria-hidden': 'true' }),
        texti);
      valkostir.appendChild(b);
    });
    const svor = el('div', { class: 'svor l-rim' }, valkostir);
    ctx.rot.append(spurning, svor);

    const hjalpLina = () => el('span', {}, 'Hvað rímar við ', el('b', { text: mark.o }), '?');
    ctx.hjalp(hjalpLina());
    ctx.svar(svar.o, { texti: hastafur(mark.o) + ' og ' + svar.o + ' ríma!', tala: mark.o + ' og ' + svar.o + ' ríma' });
    ctx.timi(() => ctx.tala(spurningTexti), 400);

    /* rímhlutinn litaður í markorðinu og í rétta svarinu (vísbending) */
    function synaRimhluta() {
      if (!ending) return;
      ordEl.replaceChildren(...merktOrd(el, mark.o, ending));
      const t = ordTextar.get(svar.o);
      if (t) t.replaceChildren(...merktOrd(el, svar.o, ending));
    }

    function svara(ord, b) {
      if (ctx.laest() || !b || b.disabled) return;
      if (ord === svar.o) {
        synaRimhluta();
        ctx.rett({ texti: hastafur(mark.o) + ' og ' + svar.o + ' ríma! 🎉', tala: mark.o + ' og ' + svar.o + ' ríma!' });
      } else {
        ctx.rangt({ takki: b, texti: hastafur(ord) + ' rímar ekki við ' + mark.o + ' — prófaðu aftur! 🙂' });
        ctx.tala(ord + '… ' + mark.o);
      }
    }

    ctx.lyklar((e, lykill) => {
      if (lykill === ' ') { e.preventDefault(); ctx.tala(spurningTexti); return; }
      const takkar = [...valkostir.children].filter(x => !x.disabled);
      const n = parseInt(lykill, 10);
      if (n >= 1 && n <= valkostir.children.length) { e.preventDefault(); const t = valkostir.children[n - 1]; if (t && !t.disabled) svara(t.dataset.gildi, t); return; }
      /* bókstafur: velur kostinn sem byrjar á honum ef hann er ótvíræður */
      if (lykill.length === 1) {
        const med = takkar.filter(x => x.dataset.gildi.startsWith(lykill));
        if (med.length === 1) { e.preventDefault(); svara(med[0].dataset.gildi, med[0]); }
      }
    });

    return {
      lesa() { ctx.tala(spurningTexti); },
      visbending() {
        synaRimhluta();
        ctx.hjalp(el('span', {}, 'Heyrðu endinguna: ', el('b', { text: mark.o }), ' … ', el('b', { text: svar.o }), ' — þau ríma!'));
        ctx.tala(mark.o + '… ' + svar.o);
      },
    };
  },
};
