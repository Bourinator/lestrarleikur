/* Raðaðu orðunum — mynd birtist og orð setningarinnar eru í rugli; barnið smellir á orðin í réttri röð
   og þau fara í reitina. Stóri stafurinn fremst og punkturinn aftast halda röðinni ótvíræðri.
   Smellur á fylltan reit tekur orðin til baka (telst ekki mistök). */
const CSS = `
.l-rada-ordum .spjald.rod{padding:clamp(.5rem,1.4vh,.9rem) clamp(1rem,3vw,2rem);gap:clamp(.3rem,1.5vw,1rem)}
.l-rada-ordum .mynd.litil{line-height:1.15}
.l-rada-ordum .holf{gap:clamp(.35rem,1vw,.6rem) clamp(.4rem,1.2vw,.7rem);max-width:56rem}
.l-rada-ordum .holf .reitur-ord{min-width:3rem;min-height:3rem;cursor:default;transition:background .15s,color .15s;white-space:nowrap}
.l-rada-ordum .holf .reitur-ord:not(.fyllt){color:transparent}
.l-rada-ordum .holf .reitur-ord.fyllt{cursor:pointer}
.l-rada-ordum .flisar{max-width:52rem;gap:clamp(.45rem,1.4vw,.8rem)}
.l-rada-ordum .flis{padding:.35em .75em;white-space:nowrap}
@media (max-height:480px){
  .l-rada-ordum .spjald.rod{padding:.35rem .9rem;gap:.4rem}
  .l-rada-ordum .mynd.litil{font-size:2.2rem}
  .l-rada-ordum .holf{min-height:0;gap:.3rem .35rem}
  .l-rada-ordum .holf .reitur-ord{font-size:1.15rem;min-width:2.9rem;min-height:2.9rem}
  .l-rada-ordum .flis{font-size:1.15rem;min-height:2.9rem;min-width:2.9rem;padding:.3em .6em}
}
`;

export default {
  id: 'rada-ordum',
  nafn: 'Raðaðu orðunum',
  lysing: 'Orðin í setningunni eru í rugli — raðaðu þeim í rétta röð.',
  takn: '🐱 → Kisan sefur.',
  flokkur: 'lestur',
  stafagerdFast: false,
  /* hamarkOrd = flest orð í setningu, lagmarkOrd = fæst (aldrei færri en 3 svo röðunin sé þraut) */
  sjalfgefid: { hamarkOrd: 4, lagmarkOrd: 3 },
  erfidleikar: {
    lett:     { hamarkOrd: 3, lagmarkOrd: 3 },
    midlungs: { hamarkOrd: 4, lagmarkOrd: 3 },
    erfitt:   { hamarkOrd: 6, lagmarkOrd: 4 },
  },

  umferd(ctx) {
    const { st, el, stokka, gogn, emojiListi } = ctx;
    ctx.css('rada-ordum', CSS);

    /* ---- velja setningu ---- */
    const nfc = s => String(s).normalize('NFC');
    const ordin = x => nfc(x.s).trim().split(/\s+/).filter(Boolean);
    const hamark = Math.max(3, parseInt(st.hamarkOrd, 10) || 4);
    const lagmark = Math.min(hamark, Math.max(3, parseInt(st.lagmarkOrd, 10) || 3));
    const allar = (gogn.SETNINGAR || []).filter(x => x && typeof x.s === 'string' && ordin(x).length >= 2);
    if (!allar.length) throw new Error('engar setningar í gögnum');
    const innan = (x, a, b) => { const n = ordin(x).length; return n >= a && n <= b; };
    /* víkka síuna í fastri röð ef of fáar setningar finnast */
    let hopur = allar.filter(x => innan(x, lagmark, hamark));
    if (!hopur.length) hopur = allar.filter(x => innan(x, 3, hamark));
    if (!hopur.length) hopur = allar.filter(x => innan(x, 3, 99));
    if (!hopur.length) hopur = allar;
    /* setningar endurtaka sig ekki innan borðs — notum notað-settið úr orðavalinu með forskeyti */
    const notad = ctx.ordaval.notad;
    const lykill = x => 'setning:' + x.s;
    const ferskar = hopur.filter(x => !notad.has(lykill(x)));
    const setning = ctx.velja(ferskar.length ? ferskar : hopur, 1)[0];
    notad.add(lykill(setning));

    const ord = ordin(setning);                 /* orðin með stórum staf fremst og punkti aftast */
    const texti = ord.join(' ');
    let rod = stokka(ord);
    for (let i = 0; i < 12 && rod.join(' ') === texti; i++) rod = stokka(ord);
    if (rod.join(' ') === texti) rod = ord.slice(1).concat(ord[0]);
    const myndir = emojiListi(setning.e || setning.efni || '🖼️');
    const lesaUpp = () => ctx.tala(texti);

    /* ---- spurning: mynd + reitir ---- */
    const spjald = el('div', { class: 'spjald rod' },
      myndir.map((m, i) => el('button', { class: 'mynd litil', text: m, 'aria-label': 'Heyra setninguna',
        style: { animationDelay: (i * .25) + 's' }, onclick: lesaUpp })));
    const reitir = ord.map((o, i) => el('button', { class: 'reitur-ord', text: o, disabled: true,
      'aria-label': 'Reitur ' + (i + 1) + ' af ' + ord.length, onclick: () => afturkalla(i) }));
    const holf = el('div', { class: 'holf', role: 'group', 'aria-label': 'Setningin' }, reitir);
    const spurning = el('div', { class: 'spurning l-rada-ordum' }, ctx.hljodTakki(texti), spjald, holf);

    /* ---- svör: orðaflísar (staðsetning fest fyrir umferðina) ---- */
    const flisar = el('div', { class: 'flisar', role: 'group', 'aria-label': 'Orðin' });
    const flisEl = rod.map((o, i) => {
      const b = el('button', { class: 'flis', text: o, dataset: { gildi: o, litur: String(i % 8) }, 'aria-label': 'Orðið ' + o,
        onclick: () => svara(b) });
      flisar.appendChild(b);
      return b;
    });
    const svor = el('div', { class: 'svor l-rada-ordum' }, flisar);
    ctx.rot.append(spurning, svor);

    /* ---- staða umferðar ---- */
    let nr = 0;               /* næsti reitur sem á að fylla */
    const valdar = [];        /* flísarnar sem sitja í reitunum, í röð */
    const erValin = b => b.classList.contains('valin');
    const naestaFlis = () => flisEl.find(b => !erValin(b) && b.dataset.gildi === ord[nr]) || null;

    function lysa() {
      reitir.forEach((r, i) => r.classList.toggle('naest', i === nr));
      if (nr < ord.length) ctx.svar(ord[nr], { texti: 'Næsta orð er „' + ord[nr] + '“', tala: ord[nr].replace(/\.$/, ''), el: naestaFlis });
    }

    function svara(b) {
      if (ctx.laest() || erValin(b) || nr >= ord.length) return;
      const o = b.dataset.gildi;
      if (o === ord[nr]) {
        b.classList.remove('rangt', 'visbending');
        b.classList.add('valin');
        const r = reitir[nr];
        r.classList.add('fyllt', 'buid');
        r.disabled = false;
        r.setAttribute('aria-label', 'Taka orðið „' + o + '“ til baka');
        valdar.push(b);
        nr++;
        if (nr >= ord.length) { ctx.rett({ texti: 'Frábært! „' + texti + '“ 🎉', tala: texti }); return; }
        ctx.hljod.plopp();
        ctx.skref();
        lysa();
        ctx.hjalp('Flott — næsta orð! 👉');
      } else {
        let skyring = 'Ekki þetta orð — prófaðu annað! 🙂';
        if (/\.$/.test(o) && nr < ord.length - 1) skyring = 'Orðið með punktinum kemur síðast! 🙂';
        else if (nr === 0 && ctx.stafagerd !== 'storir') skyring = 'Setningin byrjar á orðinu með stóra stafnum! 🙂';
        b.classList.remove('rangt'); void b.offsetWidth; b.classList.add('rangt');
        ctx.timi(() => b.classList.remove('rangt'), 450);
        ctx.rangt({ texti: skyring });
      }
    }

    /* taka til baka að reit k (k og allt sem kom eftir hann fer aftur í flísarnar) */
    function afturkalla(k) {
      if (ctx.laest() || k < 0 || k >= nr) return;
      for (let j = nr - 1; j >= k; j--) {
        const r = reitir[j];
        r.classList.remove('fyllt', 'buid');
        r.disabled = true;
        r.setAttribute('aria-label', 'Reitur ' + (j + 1) + ' af ' + ord.length);
        const f = valdar[j];
        if (f) f.classList.remove('valin', 'visbending');
      }
      valdar.length = k;
      nr = k;
      ctx.rot.querySelectorAll('.visbending').forEach(x => x.classList.remove('visbending'));
      ctx.hljod.hvarf();
      lysa();
      ctx.hjalp('Allt í lagi — hvaða orð kemur hér? 🙂');
    }

    /* lyklaborð: 1–9 velur flís nr. N, stafur velur flísina sem byrjar á honum (ef hún er ein), Backspace tekur til baka, bilslá les */
    ctx.lyklar((e, lykill) => {
      if (lykill === ' ') { e.preventDefault(); lesaUpp(); return; }
      if (lykill === 'Backspace') { e.preventDefault(); afturkalla(nr - 1); return; }
      const n = parseInt(lykill, 10);
      if (lykill.length === 1 && n >= 1 && n <= flisEl.length) {
        e.preventDefault();
        const b = flisEl[n - 1];
        if (!erValin(b)) svara(b);
        return;
      }
      if (lykill.length === 1 && /\p{L}/u.test(lykill)) {
        const kandidatar = flisEl.filter(b => !erValin(b) && ctx.stafir(b.dataset.gildi)[0].toLowerCase() === lykill);
        if (kandidatar.length === 1) { e.preventDefault(); svara(kandidatar[0]); }
      }
    });

    ctx.hjalp('Raðaðu orðunum í rétta röð!');
    lysa();
    ctx.timi(lesaUpp, 400);

    return { lesa: lesaUpp };
  },
};
