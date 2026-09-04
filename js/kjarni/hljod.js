/* Hljóð: hljóðbrellur búnar til í vafranum (WebAudio) og tal ef íslensk rödd finnst.
   iOS: hljóð opnast aðeins við snertingu — við hlustum á hverja snertingu og vekjum hljóðvélina. */
import { PROF } from './prof.js';

let ac = null;
let kveikt = !PROF;
let snert = false;       /* hefur notandi snert/slegið? (tal er hunsað þangað til) */

export function setjaHljod(a) { kveikt = !!a && !PROF; }
export function erHljod() { return kveikt; }

/** Býr til / vekur AudioContext — kallað sjálfkrafa við hverja snertingu */
export function hljodvel() {
  try {
    if (!ac) {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      ac.addEventListener && ac.addEventListener('statechange', () => { if (ac.state === 'interrupted' || ac.state === 'suspended') ac.resume().catch(() => {}); });
    }
    if (ac.state !== 'running') ac.resume().catch(() => {});
  } catch (e) { ac = null; }
  return ac;
}
if (typeof document !== 'undefined') {
  const vekja = () => { snert = true; hljodvel(); };
  document.addEventListener('pointerdown', vekja, { capture: true, passive: true });
  document.addEventListener('keydown', vekja, { capture: true, passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && ac) ac.resume().catch(() => {}); });
}

function tonn(f, t0, lengd, gerd = 'sine', styrkur = .18) {
  if (!kveikt || !snert) return;
  const a = hljodvel();
  if (!a || a.state !== 'running') return;
  try {
    const o = a.createOscillator(), g = a.createGain();
    o.type = gerd; o.frequency.value = f;
    g.gain.setValueAtTime(0, a.currentTime + t0);
    g.gain.linearRampToValueAtTime(styrkur, a.currentTime + t0 + .02);
    g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + t0 + lengd);
    o.connect(g); g.connect(a.destination);
    o.start(a.currentTime + t0); o.stop(a.currentTime + t0 + lengd + .05);
  } catch (e) { /* hljóð er aldrei ástæða til að stoppa leikinn */ }
}

export const hlj = {
  plopp()   { tonn(880, 0, .12, 'triangle', .14); },
  rett()    { [523, 659, 784, 1047].forEach((f, i) => tonn(f, i * .075, .25, 'triangle', .16)); },
  rangt()   { tonn(220, 0, .18, 'sine', .10); tonn(165, .1, .22, 'sine', .09); },
  hvarf()   { tonn(700, 0, .10, 'square', .10); tonn(260, .05, .16, 'sine', .09); },
  bord()    { [523, 659, 784, 1047, 1319].forEach((f, i) => tonn(f, i * .11, .5, 'triangle', .18)); },
  tikk()    { tonn(1200, 0, .05, 'square', .06); },
  stjarna() { tonn(1568, 0, .18, 'triangle', .14); tonn(2093, .08, .3, 'triangle', .12); },
  smellur() { tonn(600, 0, .06, 'triangle', .10); },
  lokid()   { [392, 523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tonn(f, i * .09, .45, 'triangle', .16)); },
};

/* ---- tal ---- */
let raddir = [], islRodd = null, sidastaU = null, talTimer = null;
function finnaRodd() {
  if (!('speechSynthesis' in window)) return;
  try {
    raddir = speechSynthesis.getVoices();
    islRodd = raddir.find(r => /^is/i.test(r.lang)) || null;
  } catch (e) { islRodd = null; }
}
if (typeof window !== 'undefined') {
  finnaRodd();
  if ('speechSynthesis' in window) { try { speechSynthesis.onvoiceschanged = finnaRodd; } catch (e) { /* ekkert */ } }
}
export function erRodd() { return !!islRodd; }
export function radd() { return islRodd ? islRodd.name : null; }

/** Les texta upphátt með íslenskri rödd ef hún er til; hættir við fyrri lestur (Safari þarf smá bið á milli) */
export function tala(texti, hradi = .85) {
  if (!kveikt || !islRodd || !texti || !snert) return;
  try {
    speechSynthesis.cancel();
    clearTimeout(talTimer);
    talTimer = setTimeout(() => {
      try {
        const u = new SpeechSynthesisUtterance(String(texti));
        u.lang = 'is-IS'; u.rate = hradi; u.pitch = 1.15; u.voice = islRodd;
        sidastaU = u;   /* geymt svo utterance-hluturinn sé ekki hreinsaður í miðjum lestri */
        speechSynthesis.speak(u);
      } catch (e) { /* ekkert */ }
    }, 60);
  } catch (e) { /* ekkert */ }
}
export function thegja() { try { clearTimeout(talTimer); speechSynthesis.cancel(); } catch (e) { /* ekkert */ } }
