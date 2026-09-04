/* Orðið sem vantar — myndir og setning með eyðu; barnið velur orðið sem vantar úr þremur orðaflísum.
   Gögn: SETNINGAR { s, e, eyda, val, efni? } (sjá SPEC §4). */
const CSS = `
.l-ordid-vantar .spjald.rod{gap:clamp(.5rem,2.2vw,1.4rem);padding:clamp(.5rem,1.4vh,.9rem) clamp(1rem,3vw,1.8rem)}
.l-ordid-vantar .mynd.litil{min-width:3.5rem;min-height:3.5rem;display:inline-flex;align-items:center;justify-content:center;border-radius:1rem}
.l-ordid-vantar .setning{padding:0 .3rem;max-width:min(100%,56rem);font-size:clamp(1.65rem,min(7vh,7.4vw),3.2rem)}
.l-ordid-vantar .eyda{display:inline-block;min-width:1.8em;line-height:1.15;vertical-align:bottom;padding:0 .2em;
  color:transparent;background:var(--fjolublar-ljos);border-bottom:.08em solid var(--fjolublar);border-radius:.25em .25em 0 0;
  animation:pulsa 1.1s ease-in-out infinite}
.l-ordid-vantar .eyda.visbending{background:var(--bleikur-ljos);border-color:var(--bleikur)}
.l-ordid-vantar .eyda.buid{color:var(--graenn);background:var(--graenn-ljos);border-color:var(--graenn);animation:skella .3s ease}
.l-ordid-vantar .flisar{max-width:44rem;gap:clamp(.5rem,1.4vw,.9rem)}
.l-ordid-vantar .flis{min-height:3.5rem;padding:.4em 1em}
@media (max-height:480px){
  .l-ordid-vantar .spjald.rod{gap:.6rem;padding:.4rem .9rem}
  .l-ordid-vantar .setning{font-size:clamp(1.2rem,10vh,2rem)}
  .l-ordid-vantar .flis{padding:.35em .8em}
}
`;

const hastafur = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const nfc = s => String(s || '').normalize('NFC');
const ord = s => nfc(s).trim().split(/\s+/).filter(Boolean);
/* orð án greinarmerkis í lokin: 'gras.' → { ord:'gras', merki:'.' } */
const kljufa = w => { const m = nfc(w).match(/^(.*?)([.!?,]*)$/); return { ord: m[1], merki: m[2] }; };

export default {
  id: 'ordid-vantar',
  nafn: 'Orðið sem vantar',
  lysing: 'Skoðaðu myndina og finndu orðið sem vantar í setninguna.',
  takn: '🐱 __ sefur',
  flokkur: 'lestur',
  stafagerdFast: false,
  sjalfgefid: { hamarkOrd: 4 },
  erfidleikar: {
    lett:     { hamarkOrd: 3 },
    midlungs: { hamarkOrd: 4 },
    erfitt:   { hamarkOrd: 9 },
  },

  umferd(ctx) {
    const { st, el, stokka, gogn, emojiListi } = ctx;
    ctx.css('ordid-vantar', CSS);

    /* ---- velja setningu: fyrst þær sem eru innan orðafjölda og ekki notaðar í þessu borði ---- */
    const allar = (gogn.SETNINGAR || []).filter(x => x && typeof x.s === 'string' && ord(x.s).length >= 2 && x.eyda >= 0 && x.eyda < ord(x.s).length);
    if (!allar.length) throw new Error('engar setningar í gögnum');
    const notad = ctx.ordaval && ctx.ordaval.notad;      /* sett leikjavélarinnar fyrir þetta borð — sömu setningar ekki tvisvar */
    const lykill = x => 'setning:' + x.s;
    const innan = x => !st.hamarkOrd || ord(x.s).length <= st.hamarkOrd;
    const ony = x => !notad || !notad.has(lykill(x));
    const hopar = [allar.filter(x => innan(x) && ony(x)), allar.filter(innan), allar.filter(ony), allar];
    const setn = stokka(hopar.find(h => h.length))[0];
    if (notad) notad.add(lykill(setn));

    const ordin = ord(setn.s);
    const eyda = setn.eyda;
    const { ord: rettOrd, merki } = kljufa(ordin[eyda]);
    const fyrsta = eyda === 0;
    const snid = w => (fyrsta ? hastafur(w) : w);
    const rett = snid(rettOrd);

    /* truflunarorð: val úr gögnunum, annars orð í sömu stöðu úr öðrum setningum */
    const lagt = s => nfc(s).toLowerCase();
    let trufl = (Array.isArray(setn.val) ? setn.val : []).map(w => snid(kljufa(w).ord)).filter(w => w && lagt(w) !== lagt(rett));
    trufl = [...new Set(trufl)];
    if (trufl.length < 2) {
      const onnur = stokka(allar.filter(x => x !== setn).map(x => { const o = ord(x.s); return o[Math.min(eyda, o.length - 1)]; }))
        .map(w => snid(kljufa(w).ord)).filter(w => w && lagt(w) !== lagt(rett) && !trufl.some(t => lagt(t) === lagt(w)));
      trufl = [...new Set(trufl.concat(onnur))];
    }
    const flisarOrd = stokka([rett, ...trufl.slice(0, 2)]);

    /* myndir: emoji setningarinnar, annars efni */
    let myndir = emojiListi(setn.e || '');
    if (!myndir.length && setn.efni) myndir = emojiListi(setn.efni);

    const heilSetning = nfc(setn.s);
    const lesaTexti = 'Hvaða orð vantar? ' + ordin.filter((_, i) => i !== eyda).map(w => kljufa(w).ord).join(' ');

    /* ---- spurning ---- */
    const spjald = el('div', { class: 'spjald rod' });
    myndir.forEach(m => {
      spjald.appendChild(el('button', { class: 'mynd litil', text: m, 'aria-label': 'Mynd — heyra setninguna', onclick: () => ctx.tala(lesaTexti) }));
    });
    const eydaEl = el('span', { class: 'eyda', text: rettOrd, 'aria-label': 'eyða', role: 'img' });
    const setning = el('div', { class: 'setning', 'aria-label': 'Setning með eyðu' });
    ordin.forEach((w, i) => {
      if (i > 0) setning.appendChild(document.createTextNode(' '));
      if (i === eyda) { setning.appendChild(eydaEl); if (merki) setning.appendChild(document.createTextNode(merki)); }
      else setning.appendChild(document.createTextNode(nfc(w)));
    });
    const spurning = el('div', { class: 'spurning l-ordid-vantar' }, spjald, setning, ctx.hljodTakki(() => lesaTexti));

    /* ---- svör ---- */
    const flisar = el('div', { class: 'flisar', role: 'group', 'aria-label': 'Veldu orðið sem vantar' });
    flisarOrd.forEach((w, i) => {
      const b = el('button', { class: 'flis', text: w, dataset: { gildi: w, litur: String((i * 3 + 1) % 8) }, 'aria-label': 'Orðið ' + w, onclick: () => svara(w, b) });
      flisar.appendChild(b);
    });
    const svor = el('div', { class: 'svor l-ordid-vantar' }, flisar);
    ctx.rot.append(spurning, svor);

    ctx.hjalp('Hvaða orð vantar í setninguna?');
    ctx.svar(rett, { texti: 'Orðið sem vantar er „' + rett + '“', tala: rett });
    if (ctx.umferd === 0) ctx.tala('Hvaða orð vantar?');

    function svara(w, b) {
      if (ctx.laest()) return;
      if (w === rett) {
        eydaEl.textContent = rettOrd;
        eydaEl.setAttribute('aria-label', rettOrd);
        eydaEl.classList.remove('visbending');
        eydaEl.classList.add('buid');
        flisar.querySelectorAll('.flis').forEach(f => { if (f !== b) f.classList.add('valin'); });
        b.classList.add('rett');
        ctx.rett({ texti: heilSetning + ' 🎉', tala: heilSetning });
      } else {
        ctx.rangt({ takki: b, texti: 'Ekki „' + w + '“ — skoðaðu myndina vel 🙂' });
      }
    }

    ctx.lyklar((e, lykill) => {
      const virkar = [...flisar.children].filter(x => !x.disabled);
      if (lykill === ' ') { e.preventDefault(); ctx.tala(lesaTexti); return; }
      const n = parseInt(lykill, 10);
      if (n >= 1 && n <= flisar.children.length) { e.preventDefault(); const t = flisar.children[n - 1]; if (t && !t.disabled) svara(t.dataset.gildi, t); return; }
      if (lykill.length === 1) {
        const med = virkar.filter(x => lagt(x.dataset.gildi).startsWith(lykill));
        if (med.length === 1) { e.preventDefault(); svara(med[0].dataset.gildi, med[0]); }
      }
    });

    return {
      lesa() { ctx.tala(lesaTexti); },
      visbending() { eydaEl.classList.add('visbending'); },
    };
  },
};
