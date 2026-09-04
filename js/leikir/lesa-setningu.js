/* Lestu setninguna — setning birtist á spjaldi; barnið les hana og velur myndina (emoji-tákn) sem passar.
   Truflanir eru aðrar setningar með ólíkri mynd. Þegar st.samiEfni er á er a.m.k. ein truflun um sama efni
   (sama efnistákn — eða sama fyrsta orð þegar ekkert slíkt finnst) svo það þurfi að lesa alla setninguna.
   Rangt svar sýnir setningu truflunarinnar undir myndinni (.ordtexti.syna). Tölustafir 1–N velja mynd, bilslá les. */
const CSS = `
.l-lesa-setningu .spjald{padding:clamp(.9rem,2.4vh,1.4rem) clamp(1.4rem,4.5vw,2.6rem);min-width:min(100%,16rem)}
.l-lesa-setningu .spjald.medHljodi{padding-right:clamp(2.8rem,6vw,3.6rem)}
.l-lesa-setningu .spjald.smellanlegt{cursor:pointer}
.l-lesa-setningu .valkostur{padding-left:.25rem;padding-right:.25rem}
.l-lesa-setningu .valkostur .emj{white-space:nowrap;letter-spacing:.04em}
.l-lesa-setningu .valkostur .emj .tvo{font-size:.76em}
.l-lesa-setningu .valkostur .emj .thrju{font-size:.54em}
.l-lesa-setningu .valkostur .ordtexti{font-size:clamp(1rem,2.2vw,1.15rem);overflow-wrap:anywhere;padding:0 .15rem}
.l-lesa-setningu .valkostur.rangur{animation:hrista .4s;background:var(--raudur-ljos);border-color:var(--raudur-ljos);box-shadow:none;pointer-events:none}
.l-lesa-setningu .valkostur.rangur .emj{opacity:.35;filter:grayscale(.7)}
.l-lesa-setningu .valkostur.rangur .nr{opacity:.45}
.l-lesa-setningu .valkostur.rangur .ordtexti{opacity:1}
@media (max-height:480px){
  .l-lesa-setningu.svor .valkostir.fjorir{grid-template-columns:repeat(2,1fr)}
  .l-lesa-setningu .valkostur .ordtexti{font-size:1rem}
}
`;

const ordafjoldi = s => s.trim().split(/\s+/).length;
const fyrstaOrd = s => s.trim().split(/\s+/)[0].toLowerCase().replace(/[.,!?„“"]/g, '');

export default {
  id: 'lesa-setningu',
  nafn: 'Lestu setninguna',
  lysing: 'Setning birtist — lestu hana og veldu myndina sem passar.',
  takn: '📖 → 🐱💤',
  flokkur: 'lestur',
  stafagerdFast: false,
  /* val = fjöldi mynda, samiEfni = a.m.k. ein truflun um sama efni, hamarkOrd = mest svona mörg orð í setningu (null = öll) */
  sjalfgefid: { val: 3, samiEfni: false, hamarkOrd: null },
  erfidleikar: {
    lett:     { val: 3, samiEfni: false, hamarkOrd: 3 },
    midlungs: { val: 4, samiEfni: false, hamarkOrd: 4 },
    erfitt:   { val: 4, samiEfni: true,  hamarkOrd: null },
  },

  umferd(ctx) {
    const { st, el, stokka, gogn, emojiListi } = ctx;
    ctx.css('lesa-setningu', CSS);

    const allar = (gogn.SETNINGAR || []).filter(x => x && typeof x.s === 'string' && x.s.trim() && x.e);
    if (allar.length < 2) throw new Error('Of fáar setningar fyrir „Lestu setninguna“');
    const n = Math.max(2, Math.min(6, parseInt(st.val, 10) || 3));
    const hamark = st.hamarkOrd > 0 ? st.hamarkOrd : Infinity;
    const takn = x => emojiListi(x.e);
    const efni = x => x.efni || takn(x)[0] || '';
    /* setningar endurtaka sig ekki innan borðs: notum „notad“-sett orðavalsins með forskeyti (rekst ekki á orðin) */
    const notad = ctx.ordaval.notad;
    const lykill = x => 'setning:' + x.s;

    /* markmið: helst ónotuð setning innan orðafjölda; síurnar víkka í fastri röð */
    const sior = [
      x => !notad.has(lykill(x)) && ordafjoldi(x.s) <= hamark,
      x => ordafjoldi(x.s) <= hamark,
      x => !notad.has(lykill(x)),
      () => true,
    ];
    let rett = null;
    for (const sia of sior) { const h = allar.filter(sia); if (h.length) { rett = h[Math.floor(Math.random() * h.length)]; break; } }
    notad.add(lykill(rett));
    const s = rett.s;

    /* truflanir: aðrar setningar, aldrei sama mynd */
    const rettTakn = takn(rett), rettSett = new Set(rettTakn), rettEfni = efni(rett), rettOrd = fyrstaOrd(s);
    const samaMynd = x => { const t = takn(x); return t.length === rettTakn.length && t.every(k => rettSett.has(k)); };
    const grunn = allar.filter(x => x !== rett && x.s !== s && x.e !== rett.e && !samaMynd(x));
    const truflanir = [];
    const notudE = new Set([rett.e]);
    const baeta = x => { if (truflanir.length < n - 1 && !notudE.has(x.e)) { notudE.add(x.e); truflanir.push(x); } };
    if (st.samiEfni) {
      const somuEfni = stokka(grunn.filter(x => efni(x) === rettEfni));
      const somuOrd = stokka(grunn.filter(x => efni(x) !== rettEfni && fyrstaOrd(x.s) === rettOrd));
      /* fléttað: eitt um sama efni, eitt með sama fyrsta orði … — mest tvær „líkar“ truflanir, hitt slembið */
      const likar = [];
      for (let i = 0; likar.length < 2 && (somuEfni[i] || somuOrd[i]); i++) {
        if (somuEfni[i]) likar.push(somuEfni[i]);
        if (somuOrd[i] && likar.length < 2) likar.push(somuOrd[i]);
      }
      likar.forEach(baeta);
      stokka(grunn).forEach(baeta);
    } else {
      /* léttari borð: helst myndir sem eiga ekkert tákn sameiginlegt með réttu myndinni */
      const olik = x => !takn(x).some(k => rettSett.has(k));
      stokka(grunn.filter(olik)).forEach(baeta);
      stokka(grunn.filter(x => !olik(x))).forEach(baeta);
    }
    const kort = stokka([rett, ...truflanir]);

    /* spurning: setningin á spjaldi + 🔊 */
    const spjald = el('div', { class: 'spjald' }, el('div', { class: 'setning', text: s }));
    const spurning = el('div', { class: 'spurning l-lesa-setningu' }, spjald, ctx.hljodTakki(s));
    if (ctx.erRodd()) {
      spjald.classList.add('medHljodi', 'smellanlegt');
      ctx.hlusta(spjald, 'click', () => ctx.tala(s));
    }

    /* svör: myndaspjöld */
    const fjoldaKlasi = kort.length === 2 ? 'tveir' : kort.length === 3 ? 'thrir' : kort.length === 4 ? 'fjorir' : 'sex';
    const valkostir = el('div', { class: 'valkostir ' + fjoldaKlasi, role: 'group', 'aria-label': 'Veldu myndina sem passar við setninguna' });
    kort.forEach((x, i) => {
      const t = takn(x);
      const inni = el('span', { class: t.length >= 3 ? 'thrju' : t.length === 2 ? 'tvo' : 'eitt', text: t.join('') });
      const b = el('button', { class: 'valkostur', dataset: { gildi: x.s }, 'aria-label': 'Mynd ' + (i + 1), onclick: () => svara(x, b) },
        el('span', { class: 'nr', 'aria-hidden': 'true', text: String(i + 1) }),
        el('span', { class: 'emj', 'aria-hidden': 'true' }, inni),
        el('span', { class: 'ordtexti', text: x.s }));
      valkostir.appendChild(b);
    });
    const svor = el('div', { class: 'svor l-lesa-setningu' }, valkostir);
    ctx.rot.append(spurning, svor);

    ctx.hjalp('Lestu setninguna — hvaða mynd passar?');
    ctx.svar(s, { texti: 'Setningin er „' + s + '“ — hvaða mynd sýnir það?', tala: s });

    function svara(x, b) {
      if (ctx.laest() || b.disabled) return;
      if (x === rett) {
        b.classList.add('rett', 'syna');
        ctx.rett({ texti: 'Rétt! ' + s + ' 🎉', tala: s });
      } else {
        b.classList.add('syna');
        ctx.rangt({ takki: b, texti: 'Þessi mynd passar við „' + x.s + '“ — lestu setninguna aftur! 🙂' });
      }
    }

    ctx.lyklar((e, lykill) => {
      if (lykill === ' ') { e.preventDefault(); ctx.tala(s); return; }
      const k = parseInt(lykill, 10);
      if (k >= 1 && k <= kort.length) {
        e.preventDefault();
        const b = valkostir.children[k - 1];
        if (b && !b.disabled) svara(kort[k - 1], b);
      }
    });

    return {
      lesa() { ctx.tala(s); },
      /* auka-vísbending: sýna setningarnar undir myndunum sem enn má velja */
      visbending() { [...valkostir.children].forEach(b => { if (!b.disabled) b.classList.add('syna'); }); },
    };
  },
};
