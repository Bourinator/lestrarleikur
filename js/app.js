/* Stafaleikur — skelin: ræsing, leiðarkerfi (#/…) og þjónustuvirki.
   Skjáirnir sjálfir eru í js/skjair/, leikirnir í js/leikir/ og vélin í js/kjarni/leikjavel.js. */
import { PROF, SW_OFF, SW_ON, atburdur } from './kjarni/prof.js';
import { el, himinn } from './kjarni/skraut.js';
import { setjaHljod } from './kjarni/hljod.js';
import { stada, LITIR } from './kjarni/stada.js';
import { HEIMAR, BORD } from './data/bord.js';
import { ORD, STAFROF, HLUTIR } from './data/ord.js';
import { RIM } from './data/rim.js';
import { SETNINGAR } from './data/setningar.js';
import { LEIKIR, VILLUR, hladaLeikjum } from './leikir/index.js';
import { fokusa } from './skjair/sameiginlegt.js';
import { birtaHeim } from './skjair/heim.js';
import { birtaKort } from './skjair/kort.js';
import { birtaBord, birtaFrjalsBord } from './skjair/bord.js';
import { birtaFrjals } from './skjair/frjals.js';
import { birtaLimmidar } from './skjair/limmidar.js';
import { birtaForeldrar } from './skjair/foreldrar.js';

const rot = document.getElementById('app');
const gogn = { ORD, STAFROF, HLUTIR, RIM, SETNINGAR };
let nuverandi = null;        /* borðið sem er í gangi: { haetta() } */
let bidUppfaersla = false;   /* ný útgáfa tilbúin — endurhlaða við næstu skjáskipti */

const app = {
  gogn, LEIKIR, VILLUR, BORD, HEIMAR,
  fara(hash) { if (location.hash === hash) birta(); else location.hash = hash; },
  setjaNuverandi(h) { nuverandi = h; },
  beitaStillingum,
};

/** hljóð og hreyfimyndir eftir stillingum (gilda fyrir allt tækið) */
function beitaStillingum() {
  const s = stada.stillingar();
  setjaHljod(s.hljod !== false);
  document.documentElement.classList.toggle('kyrrt', s.hreyfing === false);
}

const leid = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(x => { try { return decodeURIComponent(x); } catch (e) { return x; } });

function birta() {
  if (nuverandi) { try { nuverandi.haetta(); } catch (e) { /* ekkert */ } nuverandi = null; }
  document.querySelectorAll('.yfirlag').forEach(x => x.remove());
  document.querySelectorAll('.skilabod.syna').forEach(x => x.classList.remove('syna'));
  if (bidUppfaersla) { location.reload(); return; }
  const p = leid();
  const nafn = p[0] || 'heim';
  let skjar = nafn;
  switch (nafn) {
    case 'heim': birtaHeim(rot, app); break;
    case 'kort': birtaKort(rot, app); break;
    case 'bord': if (!birtaBord(rot, app, p[1])) return; break;
    case 'frjals':
      if (p[1]) { if (!birtaFrjalsBord(rot, app, p[1], p[2])) return; skjar = 'bord'; }
      else birtaFrjals(rot, app);
      break;
    case 'limmidar': birtaLimmidar(rot, app); break;
    case 'foreldrar': birtaForeldrar(rot, app); break;
    default: app.fara('#/'); return;
  }
  rot.dataset.skjar = skjar;
  atburdur('skjar', { skjar, leid: location.hash });
  if (skjar !== 'bord') fokusa(rot);
  try { rot.scrollTop = 0; } catch (e) { /* ekkert */ }
}

/* ---- þjónustuvirki: ekki á localhost (nema ?sw=1), aldrei í prófunarham eða með ?sw=0 ---- */
function skraSW() {
  if (!('serviceWorker' in navigator) || PROF || SW_OFF) return;
  const heima = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if (heima && !SW_ON) return;
  let vildiUppfaera = false;
  const synaUppfaerslu = reg => {
    if (document.querySelector('.uppfaersla')) return;
    const pilla = el('button', { class: 'uppfaersla', type: 'button', text: 'Ný útgáfa 🎈', 'aria-label': 'Ný útgáfa er tilbúin — ýttu til að uppfæra',
      onclick: () => {
        vildiUppfaera = true;
        pilla.disabled = true; pilla.textContent = 'Uppfæri…';
        if (reg.waiting) reg.waiting.postMessage({ tegund: 'virkja' }); else location.reload();
      } });
    document.body.appendChild(pilla);
  };
  navigator.serviceWorker.register('./sw.js').then(reg => {
    if (reg.waiting && navigator.serviceWorker.controller) synaUppfaerslu(reg);
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      if (!nw) return;
      nw.addEventListener('statechange', () => { if (nw.state === 'installed' && navigator.serviceWorker.controller) synaUppfaerslu(reg); });
    });
  }).catch(() => { /* leikurinn virkar án þjónustuvirkis */ });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!vildiUppfaera) return;
    if (nuverandi) bidUppfaersla = true;   /* ekki trufla barn í miðju borði */
    else location.reload();
  });
}

async function raesa() {
  himinn();
  stada.hlada();
  /* enginn leikmaður → sjálfgerður gestur svo það sé hægt að byrja að spila með einu ýti */
  if (stada.fjoldiProfila() === 0) stada.nyrProfill({ nafn: 'Krakki', avatar: '🐣', litur: LITIR[Math.floor(Math.random() * LITIR.length)] });
  beitaStillingum();
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist().catch(() => {}); } catch (e) { /* ekkert */ }
  await hladaLeikjum();
  window.__stafaleikur = Object.assign(window.__stafaleikur || {}, { stada, LEIKIR, VILLUR, BORD, HEIMAR, fara: app.fara });
  window.addEventListener('hashchange', () => {
    birta();
    try { window.goatcounter && window.goatcounter.count && window.goatcounter.count({ path: location.pathname + location.hash }); } catch (e) { /* ekkert */ }
  });
  if (!location.hash) history.replaceState(null, '', '#/');
  birta();
  skraSW();
}

raesa().catch(e => {
  console.error('Ræsing mistókst', e);
  rot.innerHTML = '';
  rot.appendChild(el('div', { class: 'skjar midja' },
    el('div', { class: 'takn', text: '😕', 'aria-hidden': 'true' }),
    el('h2', { text: 'Úps — leikurinn ræstist ekki' }),
    el('p', { class: 'smatt', text: String((e && e.message) || e) }),
    el('button', { class: 'takki', type: 'button', text: 'Reyna aftur', onclick: () => location.reload() })));
});
