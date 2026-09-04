/* Stafapör — stór stafur birtist, barnið finnur sama staf (eða litla stafinn við stóra) meðal reita.
   FYRIRMYND fyrir aðrar leikjaeiningar: .spurning + .svor, data-gildi á svörum, ctx.svar(), ctx.rett()/rangt(). */
const CSS = `
.l-eins-stafur .storistafur{min-width:1.4em}
.l-eins-stafur .storistafur.litill{font-size:clamp(3.5rem,13vh,7rem)}
.l-eins-stafur .stafaval{max-width:40rem}
`;

const PAR_LIKIR = { b: 'dp', d: 'bð', p: 'bþ', m: 'n', n: 'mu', u: 'nú', a: 'á', á: 'a', o: 'óö', ó: 'o', ö: 'o', i: 'íl', í: 'i', l: 'i', e: 'é', é: 'e', ð: 'd', þ: 'p', æ: 'a', y: 'ý', ý: 'y' };

export default {
  id: 'eins-stafur',
  nafn: 'Stafapör',
  lysing: 'Stafur birtist — finndu sama stafinn á reitunum.',
  takn: 'A → a',
  flokkur: 'lestur',
  stafagerdFast: true,
  sjalfgefid: { val: 3, stafir: 'asólím', par: false, likir: false },
  erfidleikar: {
    lett:     { val: 3, stafir: 'asólímiuúren', par: false, likir: false },
    midlungs: { val: 4, stafir: 'asólímiuúrenotkfhbvdgj', par: true, likir: false },
    erfitt:   { val: 6, stafir: null, par: true, likir: true },
  },

  umferd(ctx) {
    const { st, el, stokka, gogn } = ctx;
    ctx.css('eins-stafur', CSS);
    const pool = [...(st.stafir || gogn.STAFROF.join(''))].map(s => s.toLowerCase());
    const rett = pool[Math.floor(Math.random() * pool.length)];
    const truflanir = ctx.ordaval.truflStafir(rett, st.val - 1, { likir: !!st.likir, ur: st.likir ? null : pool });
    /* í „líkir“-ham eru helst ruglstafir notaðir; í venjulegum ham stafir úr sama hópi */
    if (st.likir && PAR_LIKIR[rett]) {
      const ekki = new Set([rett, ...truflanir]);
      for (const s of [...PAR_LIKIR[rett]]) { if (truflanir.length >= st.val - 1) break; if (!ekki.has(s)) { truflanir.push(s); ekki.add(s); } }
    }
    const reitir = stokka([rett, ...truflanir.slice(0, st.val - 1)]);
    const synaStor = st.par ? true : Math.random() < .5;   /* par: sýndur stafur er stór, reitirnir litlir */
    const syndur = synaStor ? rett.toUpperCase() : rett;

    /* spurning */
    const stafurEl = el('div', { class: 'storistafur fast' + (st.val > 4 ? ' litill' : ''), text: syndur, 'aria-label': 'Stafurinn ' + syndur });
    const spjald = el('div', { class: 'spjald' }, stafurEl);
    const spurning = el('div', { class: 'spurning l-eins-stafur' }, spjald);

    /* svör */
    const stafaval = el('div', { class: 'stafaval faerri fast', role: 'group', 'aria-label': 'Veldu staf' });
    reitir.forEach((s, i) => {
      const texti = st.par ? s : (synaStor ? s.toUpperCase() : s);
      const b = el('button', { class: 'stafatakki fast', text: texti, dataset: { gildi: s, litur: String(i % 8) }, 'aria-label': 'Stafurinn ' + texti,
        onclick: () => svara(s, b) });
      stafaval.appendChild(b);
    });
    const svor = el('div', { class: 'svor l-eins-stafur' }, stafaval);
    ctx.rot.append(spurning, svor);

    ctx.hjalp(st.par ? 'Finndu litla stafinn sem passar við stóra stafinn!' : 'Finndu eins staf!');
    ctx.svar(rett, { texti: 'Hér er ' + syndur + ' — sami stafur!', stafur: rett });

    function svara(s, b) {
      if (ctx.laest()) return;
      if (s === rett) ctx.rett({ stafur: rett, texti: 'Rétt! ' + syndur + ' og ' + (st.par ? rett : (synaStor ? rett.toUpperCase() : rett)) + ' eru sami stafurinn 🎉' });
      else ctx.rangt({ stafur: rett, takki: b, texti: 'Þetta er ' + (st.par ? s : (synaStor ? s.toUpperCase() : s)) + ' — finndu ' + syndur + ' 🙂' });
    }
    ctx.lyklar((e, lykill) => {
      const b = [...stafaval.children].find(x => x.dataset.gildi === lykill && !x.disabled);
      if (b) { e.preventDefault(); svara(lykill, b); return; }
      const n = parseInt(lykill, 10);
      if (n >= 1 && n <= reitir.length) { e.preventDefault(); const t = stafaval.children[n - 1]; if (t && !t.disabled) svara(t.dataset.gildi, t); }
    });
    return {};
  },
};
