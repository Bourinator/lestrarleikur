/* Prófunarhamur: ?prof=1 (hraðar, engin hreyfing/tal, engin þjónustuvirki) og ?frae=123 (sáð slembitölum)
   Notað af sjálfvirkri prófun í höfuðlausum Chrome — hefur engin áhrif í venjulegri notkun. */
const q = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
export const PROF = q.has('prof');
export const FRAE = q.get('frae');
export const SW_OFF = q.get('sw') === '0';
export const SW_ON = q.get('sw') === '1';

/* villusafn sem prófanir lesa: window.__stafaleikur.villur */
if (typeof window !== 'undefined') {
  window.__stafaleikur = window.__stafaleikur || {};
  window.__stafaleikur.villur = window.__stafaleikur.villur || [];
  window.__stafaleikur.prof = PROF;
  window.addEventListener('error', e => window.__stafaleikur.villur.push(String(e.message || e)));
  window.addEventListener('unhandledrejection', e => window.__stafaleikur.villur.push('Promise: ' + String(e.reason && e.reason.message || e.reason)));
}

/* sáð slembitala (mulberry32) — skiptir Math.random út í prófunarham svo umferðir séu endurtakanlegar */
if (FRAE !== null && typeof Math !== 'undefined') {
  let a = (parseInt(FRAE, 10) || 1) >>> 0;
  Math.random = function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** senda lífsferilsatburð (stafaleikur:skjar | stafaleikur:umferd | stafaleikur:lok) */
export function atburdur(nafn, smaatridi = {}) {
  try { window.dispatchEvent(new CustomEvent('stafaleikur:' + nafn, { detail: smaatridi })); } catch (e) { /* ekkert */ }
}

/** margfaldari fyrir biðtíma: 0 í prófunarham */
export const TIMI_STUDULL = PROF ? 0 : 1;
