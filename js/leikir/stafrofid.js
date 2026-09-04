/* Stafrófið — fjórir stafir í röð úr stafrófinu, einn þeirra vantar („a b _ d“) eða sá síðasti („a b d _“ → hvað kemur næst?).
   Barnið velur stafinn sem vantar úr reitunum. Leikurinn snýst um stafrófsröðina (nöfn stafanna), ekki hljóðin —
   því eru engar hljóðvísbendingar, aðeins stafrófsrunan sjálf.  Sjá SPEC §5 lið 12. */
const CSS = `
.l-stafrofid .spjald{padding:clamp(.8rem,2.4vh,1.4rem) clamp(1.2rem,4vw,2.4rem)}
.l-stafrofid .ord{flex-wrap:nowrap;gap:clamp(.3rem,1.2vw,.7rem);align-items:flex-end}
.l-stafrofid .stafur{font-size:clamp(2.4rem,min(14vw,11vh),5.5rem);min-width:.95em;padding:.06em .14em;line-height:1.15}
/* stafirnir eru vísbendingin sjálf — sýna þá skýrt, ekki dauft eins og leiðarstafi í stöfunarleik */
.l-stafrofid .stafur.sest{opacity:1}
.l-stafrofid .stafaval{grid-template-columns:repeat(var(--n,4),1fr);max-width:min(100%,calc(var(--n,4) * 7.5rem))}
@media (max-width:640px){.l-stafrofid .stafaval.margir{grid-template-columns:repeat(3,1fr)}}
.l-stafrofid .stafatakki{min-height:3.5rem}
`;

const LENGD = 4;                /* stafir í runu */
const LAGMARK_VAL = 2, HAMARK_VAL = 8;

export default {
  id: 'stafrofid',
  nafn: 'Stafrófið',
  lysing: 'Fjórir stafir í stafrófsröð — einn vantar. Hvaða stafur er það?',
  takn: 'a b _ d',
  flokkur: 'lestur',
  stafagerdFast: false,
  sjalfgefid: { val: 4, gluggi: [0, 31] },
  erfidleikar: {
    lett:     { val: 3, gluggi: [0, 12] },   /* a … j */
    midlungs: { val: 4, gluggi: [0, 22] },   /* a … r */
    erfitt:   { val: 6, gluggi: [0, 31] },   /* allt stafrófið */
  },

  umferd(ctx) {
    const { st, el, stokka, gogn } = ctx;
    ctx.css('stafrofid', CSS);

    const STAFROF = Array.isArray(gogn.STAFROF) && gogn.STAFROF.length >= LENGD
      ? gogn.STAFROF.map(s => String(s).normalize('NFC').toLowerCase())
      : [...'aábdðeéfghiíjklmnoóprstuúvxyýþæö'];
    const sidasti = STAFROF.length - 1;

    /* glugginn [fra, til] — klemmdur við stafrófið og víkkaður svo fjórir stafir í röð komist fyrir */
    const g = Array.isArray(st.gluggi) && st.gluggi.length >= 2 ? st.gluggi : [0, sidasti];
    let fra = Math.min(Math.max(0, parseInt(g[0], 10) || 0), sidasti);
    let til = Math.min(Math.max(fra, parseInt(g[1], 10) || 0), sidasti);
    if (til - fra < LENGD - 1) til = Math.min(sidasti, fra + LENGD - 1);
    if (til - fra < LENGD - 1) fra = Math.max(0, til - (LENGD - 1));
    const val = Math.min(HAMARK_VAL, Math.max(LAGMARK_VAL, parseInt(st.val, 10) || 4));

    /* runan: fjórir stafir í röð innan gluggans */
    const byrjun = fra + Math.floor(Math.random() * (til - fra - (LENGD - 1) + 1));
    const runa = STAFROF.slice(byrjun, byrjun + LENGD);
    /* eyðan: í helmingi tilvika sá síðasti („hvað kemur næst?“), annars einn af hinum þremur */
    const eyda = Math.random() < .5 ? LENGD - 1 : Math.floor(Math.random() * (LENGD - 1));
    const kemurNaest = eyda === LENGD - 1;
    const rett = runa[eyda];
    const rettNr = byrjun + eyda;

    /* truflanir: aðrir stafir úr glugganum sem ekki sjást í runu — helst nágrannar (2–5 sæti frá rétta stafnum) */
    const synilegir = new Set(runa);
    const kandidatar = [];
    for (let i = fra; i <= til; i++) { if (!synilegir.has(STAFROF[i])) kandidatar.push({ s: STAFROF[i], d: Math.abs(i - rettNr) }); }
    const flokkur = k => (k.d >= 2 && k.d <= 5 ? 0 : k.d <= 8 ? 1 : 2);
    const rodud = [0, 1, 2].flatMap(f => stokka(kandidatar.filter(k => flokkur(k) === f)).map(k => k.s));
    const truflanir = rodud.slice(0, val - 1);
    if (truflanir.length < val - 1) {   /* örlítill gluggi: fylla upp með stöfum úr öllu stafrófinu */
      for (const s of stokka(STAFROF)) { if (truflanir.length >= val - 1) break; if (!synilegir.has(s) && !truflanir.includes(s)) truflanir.push(s); }
    }
    const reitir = stokka([rett, ...truflanir]);

    const spurningTexti = kemurNaest ? 'Hvað kemur næst?' : 'Hvaða stafur vantar í stafrófið?';
    const listi = () => runa.map(s => ctx.stafa(s));   /* stafirnir fjórir í þeirri stafagerð sem er sýnd */

    /* ---- spurning: spjald með fjórum stafareitum, einn auður ---- */
    const stafaReitir = runa.map((s, i) => (i === eyda
      ? el('span', { class: 'stafur reitur naest', text: s, role: 'img', 'aria-label': 'Reitur — hér vantar staf' })
      : el('span', { class: 'stafur sest', text: s, 'aria-label': 'Stafurinn ' + s })));
    const ordEl = el('div', { class: 'ord', role: 'group', 'aria-label': 'Fjórir stafir í stafrófsröð' }, stafaReitir);
    const spjald = el('div', { class: 'spjald' }, ordEl);
    const spurning = el('div', { class: 'spurning l-stafrofid' }, spjald, ctx.hljodTakki(spurningTexti));
    const eydaEl = stafaReitir[eyda];

    /* ---- svör: stafareitir ---- */
    const stafaval = el('div', { class: 'stafaval faerri' + (reitir.length > 4 ? ' margir' : ''), role: 'group', 'aria-label': 'Veldu stafinn sem vantar' });
    stafaval.style.setProperty('--n', String(reitir.length));   /* dálkafjöldi = fjöldi reita (sjá CSS) */
    reitir.forEach((s, i) => {
      const b = el('button', { class: 'stafatakki', text: s, dataset: { gildi: s, litur: String(i % 8) }, 'aria-label': 'Stafurinn ' + s,
        onclick: () => svara(s, b) });
      stafaval.appendChild(b);
    });
    const svor = el('div', { class: 'svor l-stafrofid' }, stafaval);
    ctx.rot.append(spurning, svor);

    ctx.hjalp(spurningTexti);
    ctx.svar(rett, { texti: 'Stafrófið: ' + listi().join(', ') + ' — það vantar ' + ctx.stafa(rett) + '!' });
    ctx.tala(spurningTexti);

    function svara(s, b) {
      if (ctx.laest()) return;
      if (s === rett) {
        eydaEl.classList.remove('reitur', 'naest', 'visbending');
        eydaEl.classList.add('buid');
        eydaEl.setAttribute('aria-label', 'Stafurinn ' + rett);
        const l = listi();
        const texti = kemurNaest
          ? l.slice(0, -1).join(', ') + ' … og næst kemur ' + l[LENGD - 1] + '! 🎉'
          : l.join(', ') + ' — rétt! 🎉';
        ctx.rett({ stafur: rett, texti });
      } else {
        ctx.rangt({ stafur: rett, takki: b, texti: 'Ekki ' + ctx.stafa(s) + ' — segðu stafrófið upphátt og reyndu aftur! 🙂' });
      }
    }

    ctx.lyklar((e, lykill) => {
      if (lykill === ' ') { e.preventDefault(); lesa(); return; }
      const b = [...stafaval.children].find(x => x.dataset.gildi === lykill && !x.disabled);
      if (b) { e.preventDefault(); svara(lykill, b); return; }
      const n = parseInt(lykill, 10);
      if (n >= 1 && n <= reitir.length) { e.preventDefault(); const t = stafaval.children[n - 1]; if (t && !t.disabled) svara(t.dataset.gildi, t); }
    });

    function lesa() { ctx.tala(spurningTexti); }
    /* vélin kallar eftir 20 s aðgerðaleysi eða ≥2 mistök (og lýsir þá sjálf upp rétta reitinn): sýna stafinn í eyðunni */
    function visbending() { if (!ctx.laest()) eydaEl.classList.add('visbending'); }

    return { lesa, visbending };
  },
};
