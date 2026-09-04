/* Hjálparföll: DOM, slembi, skraut (konfettí, ský) */
import { PROF, TIMI_STUDULL } from './prof.js';

export const $  = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/** el('div', {class:'x', text:'..', dataset:{a:1}, onclick:fn, 'aria-label':'..'}, ...börn) */
export function el(tag, attrs = {}, ...born) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'dataset') Object.assign(e.dataset, v);
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) e.setAttribute(k, '');
    else e.setAttribute(k, v);
  }
  baetaBornum(e, born);
  return e;
}
function baetaBornum(e, born) {
  for (const b of born) {
    if (b === null || b === undefined || b === false) continue;
    if (Array.isArray(b)) baetaBornum(e, b);
    else if (b instanceof Node) e.appendChild(b);
    else e.appendChild(document.createTextNode(String(b)));
  }
}

export const slembi   = n => Math.floor(Math.random() * n);
export const slembiUr = a => a[slembi(a.length)];
export function stokka(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = slembi(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
/** n slembin, ólík atriði úr lista sem uppfylla síu */
export function velja(listi, n, sia = () => true) { return stokka(listi.filter(sia)).slice(0, n); }
export const bida = ms => new Promise(r => setTimeout(r, Math.round(ms * TIMI_STUDULL)));
export const hlutfall = (n, m) => Math.min(100, m ? (n / m) * 100 : 0) + '%';
export const nfc = s => (typeof s === 'string' ? s.normalize('NFC') : s);
export const stafir = s => [...nfc(String(s))];
/** skiptir streng í emoji-tákn (grapheme clusters) — ❤️, 🐿️ og 👩‍🍳 verða eitt tákn hvert */
const skiptir = (typeof Intl !== 'undefined' && Intl.Segmenter) ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;
export function emojiListi(s) {
  s = String(s || '');
  if (skiptir) return [...skiptir.segment(s)].map(x => x.segment).filter(x => x.trim() && !/^[\s\u200d\ufe0f]+$/.test(x));
  return [...s].filter(x => x.trim());
}
export const hastafur = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

export const LIMMIDAR_SKRAUT = ['🌟','🍀','🦄','🚀','🍭','🐞','🌺','🎈','🏆','🐳','🍩','⚽','🎨','🦋','🍉','🎁'];

/** true ef hreyfingar eru leyfðar (stilling + kerfisstilling) */
export function hreyfing() {
  if (document.documentElement.classList.contains('kyrrt')) return false;
  return !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
}

let agnaLag = null;
export function flugeldar(fjoldi = 26) {
  if (PROF || !hreyfing()) return;
  if (!agnaLag) { agnaLag = el('div', { id: 'agnir', 'aria-hidden': 'true' }); document.body.appendChild(agnaLag); }
  for (let i = 0; i < fjoldi; i++) {
    const a = el('span', { class: 'agn', text: slembiUr(LIMMIDAR_SKRAUT) });
    a.style.left = Math.random() * 100 + 'vw';
    a.style.top = '-8vh';
    a.style.fontSize = (1.4 + Math.random() * 2.2) + 'rem';
    a.style.animationDuration = (1.6 + Math.random() * 1.6) + 's';
    agnaLag.appendChild(a);
    setTimeout(() => a.remove(), 3600);
  }
}

let himinnBuinn = false;
export function himinn() {
  if (himinnBuinn) return;
  himinnBuinn = true;
  const h = el('div', { id: 'himinn', 'aria-hidden': 'true' });
  const takn = ['☁️','⭐','🌈','🎈','☁️','✨','☁️'];
  for (let i = 0; i < 7; i++) {
    const s = el('div', { class: 'sky', text: takn[i % takn.length] });
    s.style.top = (5 + Math.random() * 80) + 'vh';
    s.style.animationDuration = (22 + Math.random() * 26) + 's';
    s.style.animationDelay = (-Math.random() * 30) + 's';
    h.appendChild(s);
  }
  document.body.prepend(h);
}

/** Setur <style> inn einu sinni fyrir gefið id */
export function cssEinuSinni(id, texti) {
  if (document.querySelector(`style[data-css="${id}"]`)) return;
  const s = el('style', { dataset: { css: id } });
  s.textContent = texti;
  document.head.appendChild(s);
}

/** Lítil hjálp: skjálfa (bæta klasa, fjarlægja við lok hreyfingar) */
export function skjalfa(e, klasi = 'rangt') {
  if (!e) return;
  e.classList.remove(klasi); void e.offsetWidth; e.classList.add(klasi);
  setTimeout(() => e.classList.remove(klasi), 450);
}
