/* Sameiginlegir hlutar skjáanna: gluggar, toppstika, stjörnur, skilaboð, fókus og ræsing borðs (með kynningu). */
import { el } from '../kjarni/skraut.js';
import { hlj } from '../kjarni/hljod.js';
import { stada } from '../kjarni/stada.js';
import { BORD, HEIMAR } from '../data/bord.js';

export const heimurFyrir = id => HEIMAR.find(h => h.id === id) || HEIMAR[0];
export const bordFyrir = id => BORD.find(b => b.id === id) || null;
export const ERFIDLEIKAR = [
  { id: 'lett',     nafn: 'Létt',     takn: '🐣', litur: 'graenn' },
  { id: 'midlungs', nafn: 'Miðlungs', takn: '🐥', litur: 'blar' },
  { id: 'erfitt',   nafn: 'Erfitt',   takn: '🦅', litur: 'fjolublar' },
];

/** ⭐⭐⭐ — n fullar af 3 */
export function stjornurEl(n, { stor = false } = {}) {
  const s = el('div', { class: 'stjornur' + (stor ? ' stor' : ''), role: 'img', 'aria-label': `${n} af 3 stjörnum` });
  for (let i = 0; i < 3; i++) s.appendChild(el('span', { class: 'stjarna' + (i < n ? ' full' : ''), text: '⭐', 'aria-hidden': 'true' }));
  return s;
}

/** límd toppstika með 🏠, titli (h1) og valfrjálsum hlutum hægra megin */
export function toppstika({ heim, titill, haegri = [] }) {
  return el('div', { class: 'toppstika' },
    el('div', { class: 'stika' },
      el('button', { class: 'ikontakki', type: 'button', 'aria-label': 'Heim', text: '🏠', onclick: heim }),
      el('h1', { class: 'titill', text: titill, tabindex: '-1' }),
      haegri));
}

/** færir fókus á [data-fokus] eða fyrstu fyrirsögn skjásins (án þess að skruna) */
export function fokusa(rot) {
  const m = rot.querySelector('[data-fokus]') || rot.querySelector('h1');
  if (!m) return;
  if (!m.hasAttribute('tabindex') && m.tagName !== 'BUTTON') m.setAttribute('tabindex', '-1');
  setTimeout(() => { try { m.focus({ preventScroll: true }); } catch (e) { /* ekkert */ } }, 30);
}

/**
 * opnaGlugga({ takn, titill, texti, efni:[Node], takkar:[{texti, klasi, adal, onclick}], lokaMedBak, vidLoka, klasi })
 * Escape lokar (ef lokaMedBak), Enter velur aðaltakkann. onclick sem skilar false heldur glugganum opnum.
 */
export function opnaGlugga({ takn, titill, texti, efni = [], takkar = [], lokaMedBak = true, vidLoka, klasi = '' }) {
  const id = 'gl' + Math.random().toString(36).slice(2, 8);
  const takkaEl = takkar.map(t => el('button', { class: t.klasi || 'takki', type: 'button', text: t.texti, dataset: t.adal ? { adal: '1' } : {},
    onclick: () => { const r = t.onclick ? t.onclick() : undefined; if (r !== false) loka(); } }));
  const gl = el('div', { class: ('gluggi ' + klasi).trim(), role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titill ? id : null },
    takn ? el('div', { class: 'takn', text: takn, 'aria-hidden': 'true' }) : null,
    titill ? el('h2', { id, text: titill }) : null,
    texti ? el('p', { class: 'smatt', text: texti }) : null,
    efni,
    takkaEl.length ? el('div', { class: 'takkar' }, takkaEl) : null);
  const yfir = el('div', { class: 'yfirlag skelGluggi' }, gl);
  function aLykil(e) {
    if (e.key === 'Escape') { if (lokaMedBak) { e.preventDefault(); e.stopPropagation(); loka(); } return; }
    if (e.key === 'Enter' && !/^(TEXTAREA|BUTTON)$/.test(e.target.tagName)) {
      const a = gl.querySelector('[data-adal]');
      if (a) { e.preventDefault(); e.stopPropagation(); a.click(); }
    }
  }
  let lokad = false;
  function loka() {
    if (lokad) return;
    lokad = true;
    document.removeEventListener('keydown', aLykil, true);
    yfir.remove();
    vidLoka && vidLoka();
  }
  if (lokaMedBak) yfir.addEventListener('click', e => { if (e.target === yfir) loka(); });
  document.addEventListener('keydown', aLykil, true);
  document.body.appendChild(yfir);
  setTimeout(() => { const a = gl.querySelector('[data-adal]') || gl.querySelector('input, button'); a && a.focus(); }, 40);
  return { loka, el: yfir, gluggi: gl };
}

/** staðfestingargluggi: skilar Promise<boolean> */
export function stadfesta({ takn = '❓', titill, texti, ja = 'Já', nei = 'Hætta við', haettulegt = false }) {
  return new Promise(r => {
    let svar = false;
    opnaGlugga({ takn, titill, texti, vidLoka: () => r(svar),
      takkar: [{ texti: nei, klasi: 'takki litill blar', adal: true }, { texti: ja, klasi: 'takki litill' + (haettulegt ? ' raudur' : ''), onclick: () => { svar = true; } }] });
  });
}

/** lítil tilkynning neðst á skjánum sem hverfur af sjálfu sér */
let skilabodTimer = null;
export function skilabod(texti, ms = 1900) {
  let t = document.querySelector('.skilabod');
  if (!t) { t = el('div', { class: 'skilabod', role: 'status', 'aria-live': 'polite' }); document.body.appendChild(t); }
  t.textContent = texti;
  t.classList.add('syna');
  clearTimeout(skilabodTimer);
  skilabodTimer = setTimeout(() => t.classList.remove('syna'), ms);
}

/** ræsir borð: leikur í vinnslu → vinalegur gluggi; fyrsta skipti → kynning; annars beint af stað */
export function byrjaBord(bord, app) {
  const leikur = app.LEIKIR[bord.leikur];
  if (!leikur) {
    opnaGlugga({ takn: '🚧', titill: 'Í vinnslu', texti: 'Þetta borð er ekki tilbúið ennþá — komdu aftur seinna!', takkar: [{ texti: 'Allt í lagi', adal: true }] });
    return;
  }
  if (stada.kynningSynd(bord.id)) { app.fara('#/bord/' + bord.id); return; }
  const heimur = heimurFyrir(bord.heimur);
  opnaGlugga({ takn: leikur.takn, titill: bord.nafn, texti: leikur.lysing, klasi: 'kynning',
    efni: [el('p', { class: 'smatt heimMerki', text: `${heimur.takn} ${heimur.nafn} · borð ${bord.nr}` + (bord.timi ? ` · ⏱️ ${bord.timi} sek` : '') })],
    takkar: [
      { texti: 'Byrja! ▶', adal: true, onclick: () => { stada.merkjaKynningu(bord.id); hlj.smellur(); app.fara('#/bord/' + bord.id); } },
      { texti: 'Ekki núna', klasi: 'textatakki' },
    ] });
}
