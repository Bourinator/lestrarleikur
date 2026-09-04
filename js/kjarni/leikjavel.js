/* Leikjavélin: keyrir eitt borð — umferðir, HUD, rétt/rangt, vísbendingar, stjörnur, tímataka.
   Sjá SPEC §3 fyrir samninginn við leikjaeiningarnar. */
import { el, stokka, velja, cssEinuSinni, flugeldar, skjalfa, slembiUr, hreyfing, emojiListi, stafir } from './skraut.js';
import { hlj, tala, erRodd, thegja } from './hljod.js';
import { stada } from './stada.js';
import { nyttOrdaval } from './ordaval.js';
import { PROF, TIMI_STUDULL, atburdur } from './prof.js';

const HROS = ['Frábært! 🎉', 'Vel gert! 👏', 'Snilld! 🌟', 'Þú ert klár! 💪', 'Rétt! 🥳', 'Glæsilegt! ✨', 'Flott hjá þér! 🙌'];
const RANGT_TEXTI = ['Ekki alveg — reyndu aftur! 🙂', 'Prófaðu aftur! 🙂', 'Næstum því — reyndu aftur! 🙂'];
const HLE_1 = 8000;    /* eftir 8 s án snertingar: vekja spurninguna og lesa aftur */
const HLE_2 = 20000;   /* eftir 20 s: sýna vísbendingu (telst ekki mistök) */
const NAD_MS = 350;    /* smellir fyrstu 350 ms eftir að ný umferð birtist eru hunsaðir */
const T = ms => Math.round(ms * TIMI_STUDULL);

/**
 * keyraBord(bord, { rot, leikur, gogn, vidLok, vidHeim })
 *  bord   = { id, nafn, throf, st, timi?, markmid? }
 *  leikur = leikjaeining
 *  gogn   = { ORD, STAFROF, HLUTIR, RIM, SETNINGAR }
 *  vidLok({ stjornur, rett, mistok, rangarUmferdir, ms, timi }) — þegar borðinu lýkur
 *  vidHeim()                                                     — barnið staðfesti að hætta
 * skilar { haetta(), lokid: Promise }
 */
export function keyraBord(bord, { rot, leikur, gogn, vidLok, vidHeim }) {
  const st = Object.assign({}, leikur.sjalfgefid || {}, bord.st || {});
  const stillingar = stada.stillingar();
  let stafagerd = stillingar.stafagerd === 'storir' ? 'storir' : 'litlir';
  const erHradi = !!bord.timi && stillingar.klukka !== false;   /* foreldrar geta slökkt á klukkunni */
  const throf = erHradi ? Infinity : (bord.throf || 10);
  const visbendingEftir = st.visbending ?? 2;       /* mistök áður en rétta svarið er sýnt */
  const hamarkMistok = st.hamarkMistok ?? 4;        /* mistök áður en vélin sýnir svarið og heldur áfram */
  const ordaval = nyttOrdaval(gogn.ORD, gogn.STAFROF);

  let umferd = 0, rettAlls = 0, mistokAlls = 0, mistokUmferd = 0, mistokSkref = 0, rangarUmferdir = 0;
  let laest = false, virk = true, hle = false, lyklaFn = null, umferdSkil = null, svarNu = null, umferdMerki = null;
  let hleTimer1 = null, hleTimer2 = null, naestaTimer = null;
  let byrjadi = Date.now(), hleByrjadi = 0;
  /* hraðaborð: einhalla klukka, stoppar í hléi, þegar flipinn er falinn og á milli umferða */
  let eftirMs = (bord.timi || 0) * 1000, sidastaTikk = 0, timiTimer = null, klukkaStopp = false;

  let leysaLokid; const lokid = new Promise(r => { leysaLokid = r; });

  /* ---- HUD ---- */
  const heimTakki = el('button', { class: 'ikontakki', 'aria-label': 'Hlé — hætta eða halda áfram', text: '🏠', onclick: spyrjaHaetta });
  const titill = el('div', { class: 'titill', text: bord.nafn || leikur.nafn });
  const punktar = el('div', { class: 'punktar', role: 'progressbar', 'aria-label': 'Framvinda', 'aria-valuemin': 0, 'aria-valuemax': erHradi ? 100 : (bord.throf || 10) });
  if (!erHradi) {
    for (let i = 0; i < throf; i++) punktar.appendChild(el('span', { class: 'punktur' }));
    if (throf > 14) punktar.classList.add('margir');
  } else {
    punktar.classList.add('timi');
    punktar.appendChild(el('span', { class: 'timiFyllt' }));
  }
  const stigMerki = el('div', { class: 'merki fjolublar', text: '⭐ 0', 'aria-label': 'Rétt svör' });
  const stafaTakki = el('button', { class: 'ikontakki stafaTakki', 'aria-label': 'Stórir eða litlir stafir', 'aria-pressed': String(stafagerd === 'storir'), text: 'Aa', onclick: () => setjaStafagerd(stafagerd === 'storir' ? 'litlir' : 'storir') });
  const stika = el('div', { class: 'stika' }, heimTakki, titill, punktar, erHradi ? stigMerki : null, stafaTakki);
  if (leikur.stafagerdFast) stafaTakki.classList.add('falin');

  const svaedi = el('div', { class: 'leiksvaedi', tabindex: '-1' });
  const hjalpEl = el('div', { class: 'hjalp', 'aria-live': 'polite' });
  const skjar = el('div', { class: 'skjar leikskjar', dataset: { bord: bord.id || '', leikur: leikur.id } }, stika, svaedi, hjalpEl);
  rot.innerHTML = '';
  rot.appendChild(skjar);

  function setjaStafagerd(g) {
    stafagerd = g;
    svaedi.classList.toggle('hastafir', g === 'storir');
    stafaTakki.setAttribute('aria-pressed', String(g === 'storir'));
    stafaTakki.textContent = g === 'storir' ? 'AA' : 'Aa';
    hlj.smellur();
  }
  if (!leikur.stafagerdFast) setjaStafagerd(stafagerd);

  function uppfaeraHud() {
    if (erHradi) { stigMerki.textContent = '⭐ ' + rettAlls; return; }
    [...punktar.children].forEach((p, i) => p.classList.toggle('fullur', i < umferd));
    punktar.setAttribute('aria-valuenow', umferd);
  }
  function uppfaeraTima() {
    if (!erHradi) return;
    const f = punktar.firstChild;
    f.style.width = Math.max(0, eftirMs / (bord.timi * 1000) * 100) + '%';
    punktar.classList.toggle('litid', eftirMs <= 10000);
    punktar.setAttribute('aria-valuenow', Math.round(eftirMs / (bord.timi * 10)));
  }

  /* ---- hlé / staðfesting á að hætta ---- */
  function spyrjaHaetta() {
    if (!virk || hle) return;
    hle = true; hleByrjadi = Date.now();
    stoppaHleTimera();
    const halda = el('button', { class: 'takki', text: 'Halda áfram ▶', onclick: () => loka(false) });
    const haettaT = el('button', { class: 'takki litill bleikur', text: '🏠 Hætta', onclick: () => loka(true) });
    const gluggi = el('div', { class: 'gluggi', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Hlé' },
      el('div', { class: 'takn', text: '⏸️' }),
      el('h2', { text: 'Hlé' }),
      el('p', { class: 'smatt', text: 'Viltu halda áfram að spila?' }),
      el('div', { class: 'takkar' }, halda, haettaT));
    const yfir = el('div', { class: 'yfirlag hleGluggi' }, gluggi);
    function aLykilHle(e) { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); loka(false); } }
    function loka(haettaNu) {
      document.removeEventListener('keydown', aLykilHle, true);
      yfir.remove();
      hle = false;
      if (haettaNu) { haetta(); vidHeim && vidHeim(); return; }
      byrjadi += Date.now() - hleByrjadi;   /* hléið telst ekki spilatími */
      hlj.smellur();
      byrjaHleTimera();
    }
    document.addEventListener('keydown', aLykilHle, true);
    document.body.appendChild(yfir);
    setTimeout(() => halda.focus(), 50);
  }

  /* ---- lyklaborð ---- */
  function aLykil(e) {
    if (!virk || hle) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.querySelector('.yfirlag')) return;          /* gluggi (t.d. kynning) á lyklaborðið */
    if (e.key === 'Escape') { e.preventDefault(); spyrjaHaetta(); return; }
    if (e.repeat || e.isComposing || e.key === 'Dead') return;
    snerting();
    if (laest || !lyklaFn) return;
    const lykill = e.key.length === 1 ? e.key.normalize('NFC').toLowerCase() : e.key;
    lyklaFn(e, lykill);
  }
  document.addEventListener('keydown', aLykil);

  /* ---- hlé-vísbendingar (barn sem situr og veit ekki hvað það á að gera) ---- */
  function stoppaHleTimera() { clearTimeout(hleTimer1); clearTimeout(hleTimer2); hleTimer1 = hleTimer2 = null; }
  function byrjaHleTimera() {
    stoppaHleTimera();
    if (laest || !virk || PROF) return;
    hleTimer1 = setTimeout(() => {
      if (!virk || laest || hle) return;
      const sp = svaedi.querySelector('.spurning') || svaedi.querySelector('.spjald');
      if (sp && hreyfing()) { sp.classList.remove('vekja'); void sp.offsetWidth; sp.classList.add('vekja'); }
      if (umferdSkil && typeof umferdSkil.lesa === 'function') { try { umferdSkil.lesa(); } catch (e) { /* ekkert */ } }
    }, HLE_1);
    hleTimer2 = setTimeout(() => { if (virk && !laest && !hle) synaVisbendingu(); }, HLE_2);
  }
  function snerting() { if (!laest && virk && !hle) byrjaHleTimera(); }
  svaedi.addEventListener('pointerdown', snerting, true);

  /* ---- vísbendingar: vélin merkir rétta svarið ([data-gildi]) ---- */
  function svarTakki() {
    if (!svarNu) return null;
    if (svarNu.el) return typeof svarNu.el === 'function' ? svarNu.el() : svarNu.el;
    const g = String(svarNu.gildi);
    return [...svaedi.querySelectorAll('[data-gildi]')].find(b => b.dataset.gildi === g && !b.classList.contains('rangur') && !b.disabled) || null;
  }
  function synaVisbendingu() {
    const b = svarTakki();
    if (b) b.classList.add('visbending');
    if (svarNu && svarNu.texti) ctxHjalp(svarNu.texti);
    if (svarNu && svarNu.tala) tala(svarNu.tala, .7);
    if (umferdSkil && typeof umferdSkil.visbending === 'function') { try { umferdSkil.visbending(); } catch (e) { /* ekkert */ } }
  }
  function ctxHjalp(t) { hjalpEl.innerHTML = ''; if (t instanceof Node) hjalpEl.appendChild(t); else hjalpEl.textContent = t || ''; }

  /* ---- tímataka (hraðaborð) ---- */
  function tikka() {
    if (!virk) return;
    const nu = performance.now();
    if (!klukkaStopp && !hle && !document.hidden && !laest) {
      eftirMs -= (nu - sidastaTikk);
      const sek = Math.ceil(eftirMs / 1000);
      if (sek <= 5 && sek > 0 && Math.ceil((eftirMs + (nu - sidastaTikk)) / 1000) !== sek) hlj.tikk();
      uppfaeraTima();
      if (eftirMs <= 0) { eftirMs = 0; uppfaeraTima(); timinnUti(); return; }
    }
    sidastaTikk = nu;
  }
  function timinnUti() {
    if (!virk) return;
    laest = true; lyklaFn = null;
    slokkvaUmferd();
    ctxHjalp('Tíminn er búinn! ⏱️');
    naestaTimer = setTimeout(lok, T(900));
  }
  if (erHradi) { uppfaeraTima(); sidastaTikk = performance.now(); timiTimer = setInterval(tikka, 250); }

  /* stjörnur: aðeins EIN röng umferð telur á móti hverri umferð (ekki hvert einasta rangt slag) */
  function stjornurUt() {
    if (erHradi) {
      const [n2, n3] = bord.markmid || [8, 12];
      return rettAlls >= n3 ? 3 : rettAlls >= n2 ? 2 : 1;
    }
    const n = bord.throf || 10;
    if (rangarUmferdir <= Math.max(1, Math.floor(n * .13))) return 3;
    if (rangarUmferdir <= Math.ceil(n * .5)) return 2;
    return 1;
  }

  function slokkvaUmferd() {
    try { umferdMerki && umferdMerki.abort(); } catch (e) { /* ekkert */ }
    try { umferdSkil && umferdSkil.haetta && umferdSkil.haetta(); } catch (e) { /* ekkert */ }
    umferdSkil = null;
    svaedi.querySelectorAll('button').forEach(b => { b.disabled = true; b.setAttribute('aria-disabled', 'true'); });
  }
  function hreinsa() {
    virk = false;
    document.removeEventListener('keydown', aLykil);
    svaedi.removeEventListener('pointerdown', snerting, true);
    clearInterval(timiTimer); clearTimeout(naestaTimer); stoppaHleTimera();
    thegja();
    slokkvaUmferd();
    document.querySelectorAll('.hleGluggi').forEach(x => x.remove());
  }
  function lok() {
    if (!virk) return;
    hreinsa();
    const ms = Date.now() - byrjadi;
    stada.lokaBordi({ ms });
    const n = { stjornur: stjornurUt(), rett: rettAlls, mistok: mistokAlls, rangarUmferdir, ms, timi: bord.timi || 0, bord: bord.id, leikur: leikur.id };
    atburdur('lok', n);
    leysaLokid(n);
    vidLok && vidLok(n);
  }
  function haetta() {
    if (!virk) return;
    hreinsa();
    stada.lokaBordi({ ms: Date.now() - byrjadi });
    leysaLokid(null);
  }

  function afram() {
    clearTimeout(naestaTimer);
    if (!virk) return;
    if (!erHradi && umferd >= throf) lok(); else nyUmferd();
  }

  /* ---- umferð ---- */
  function nyUmferd() {
    if (!virk) return;
    laest = false; mistokUmferd = 0; mistokSkref = 0; lyklaFn = null; umferdSkil = null; svarNu = null;
    umferdMerki = new AbortController();
    const merki = umferdMerki.signal;
    svaedi.innerHTML = '';
    delete svaedi.dataset.svar;
    svaedi.dataset.umferd = umferd;
    hjalpEl.textContent = '';
    /* náðartími: fyrstu 350 ms eftir að umferð birtist er ekki hægt að smella */
    svaedi.classList.add('nad');
    setTimeout(() => svaedi.classList.remove('nad'), T(NAD_MS));
    klukkaStopp = false;

    const ctx = {
      rot: svaedi, st, gogn, umferd, throf: erHradi ? null : throf, hradi: erHradi, merki, ordaval,
      get stafagerd() { return stafagerd; },
      get hreyfing() { return hreyfing(); },
      hljod: hlj, tala: (t, h) => { if (!merki.aborted) tala(t, h); }, stokka, el, velja, erRodd, emojiListi, stafir,
      bida: ms => new Promise(r => { const t = setTimeout(r, T(ms)); merki.addEventListener('abort', () => clearTimeout(t), { once: true }); }),
      timi: (fn, ms) => { const t = setTimeout(() => { if (!merki.aborted) fn(); }, T(ms)); merki.addEventListener('abort', () => clearTimeout(t), { once: true }); return t; },
      hlusta: (target, ev, fn, opts) => target.addEventListener(ev, fn, Object.assign({ signal: merki }, opts || {})),
      stafa: t => (stafagerd === 'storir' ? String(t).toUpperCase() : String(t)),
      css: cssEinuSinni,
      hjalp: ctxHjalp,
      lyklar: fn => { lyklaFn = fn; },
      laest: () => laest,
      /** leikurinn segir vélinni hvert rétta svarið er núna: svar(gildi, {texti, tala, el}) */
      svar(gildi, { texti, tala: talaTexti, el: takki } = {}) {
        svarNu = { gildi, texti, tala: talaTexti, el: takki };
        svaedi.dataset.svar = String(gildi);
      },
      /** fjölþrepa leikir (stafa orð, raða): nýtt þrep → vísbendingateljari byrjar upp á nýtt */
      skref() { mistokSkref = 0; svaedi.querySelectorAll('.visbending').forEach(x => x.classList.remove('visbending')); byrjaHleTimera(); },
      /** 🔊-takki sem les texta upphátt — falinn ef engin íslensk rödd er á tækinu */
      hljodTakki(texti, klasi = '') {
        const b = el('button', { class: 'ikontakki hljodTakki ' + klasi, 'aria-label': 'Heyra aftur', text: '🔊',
          onclick: e => { e.stopPropagation(); tala(typeof texti === 'function' ? texti() : texti); } });
        if (!erRodd()) b.classList.add('falin');
        return b;
      },
      rett({ texti, tala: talaTexti, stafur } = {}) {
        if (laest || !virk || merki.aborted) return;
        laest = true; lyklaFn = null; stoppaHleTimera();
        rettAlls++;
        if (mistokUmferd > 0) rangarUmferdir++;
        hlj.rett();
        flugeldar(erHradi ? 8 : 18);
        ctxHjalp(texti || slembiUr(HROS));
        stada.skra({ leikur: leikur.id, rett: true, stafur });
        if (talaTexti) tala(talaTexti);
        umferd++;
        uppfaeraHud();
        svaedi.querySelectorAll('button:not(.hljodTakki)').forEach(b => { b.disabled = true; b.setAttribute('aria-disabled', 'true'); });
        svaedi.querySelectorAll('.visbending').forEach(x => x.classList.remove('visbending'));
        atburdur('umferd', { bord: bord.id, leikur: leikur.id, nr: umferd, rett: true });
        const bidtimi = T(erHradi ? 650 : 1300);
        const byrjadiFagn = Date.now();
        /* smellur á meðan fagnað er styttir biðina (en fyrstu 500 ms eru alltaf sýnd) */
        const stytta = () => { if (Date.now() - byrjadiFagn > T(500)) { svaedi.removeEventListener('pointerdown', stytta, true); afram(); } };
        svaedi.addEventListener('pointerdown', stytta, true);
        merki.addEventListener('abort', () => svaedi.removeEventListener('pointerdown', stytta, true), { once: true });
        naestaTimer = setTimeout(afram, bidtimi);
      },
      rangt({ texti, stafur, takki } = {}) {
        if (laest || !virk || merki.aborted) return mistokUmferd;
        mistokUmferd++; mistokSkref++; mistokAlls++;
        hlj.rangt();
        skjalfa(svaedi.querySelector('.spurning .spjald') || svaedi.querySelector('.spjald'));
        if (takki) { takki.classList.add('rangur'); takki.disabled = true; takki.setAttribute('aria-disabled', 'true'); }
        ctxHjalp(texti || RANGT_TEXTI[Math.min(mistokUmferd - 1, RANGT_TEXTI.length - 1)]);
        stada.skra({ leikur: leikur.id, rett: false, stafur });
        atburdur('umferd', { bord: bord.id, leikur: leikur.id, nr: umferd, rett: false });
        if (mistokSkref >= visbendingEftir) synaVisbendingu();
        if (mistokSkref >= hamarkMistok && svarNu) {
          /* aldrei blindgata: vélin sýnir svarið og heldur áfram — telst röng umferð */
          const b = svarTakki();
          if (b) { b.classList.add('rett'); }
          ctxHjalp(svarNu.texti || 'Svarið var hér — áfram með næsta! 🙂');
          laest = true; lyklaFn = null; stoppaHleTimera();
          rangarUmferdir++; umferd++; uppfaeraHud();
          svaedi.querySelectorAll('button').forEach(x => { x.disabled = true; });
          naestaTimer = setTimeout(afram, T(1600));
          return mistokUmferd;
        }
        byrjaHleTimera();
        return mistokUmferd;
      },
    };
    if (typeof window !== 'undefined') {
      window.__stafaleikur = window.__stafaleikur || {};
      window.__stafaleikur.umferd = { bord: bord.id, leikur: leikur.id, nr: umferd, ctx };
    }
    let skil = null;
    try { skil = leikur.umferd(ctx); }
    catch (e) {
      console.error('Villa í leik', leikur.id, e);
      window.__stafaleikur && window.__stafaleikur.villur && window.__stafaleikur.villur.push('leikur ' + leikur.id + ': ' + (e && e.message));
      ctxHjalp('Úps — eitthvað fór úrskeiðis. Næsta!');
      laest = true;
      naestaTimer = setTimeout(() => { umferd++; uppfaeraHud(); afram(); }, T(1200));
      return;
    }
    const taka = r => { if (r && typeof r === 'object' && !merki.aborted) umferdSkil = r; };
    if (skil && typeof skil.then === 'function') skil.then(taka).catch(e => { console.error('Villa í leik', leikur.id, e); window.__stafaleikur.villur.push('leikur ' + leikur.id + ': ' + (e && e.message)); });
    else taka(skil);
    byrjaHleTimera();
    try { svaedi.focus({ preventScroll: true }); } catch (e) { /* ekkert */ }
  }

  uppfaeraHud();
  nyUmferd();
  return { haetta, lokid };
}
