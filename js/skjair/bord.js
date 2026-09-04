/* Borð — keyrir leikjavélina fyrir eitt borð (af kortinu eða í frjálsum leik) og sýnir niðurstöðuskjáinn. */
import { keyraBord } from '../kjarni/leikjavel.js';
import { PROF, TIMI_STUDULL, atburdur } from '../kjarni/prof.js';
import { el, flugeldar } from '../kjarni/skraut.js';
import { hlj } from '../kjarni/hljod.js';
import { stada } from '../kjarni/stada.js';
import { EKKI_HLJODMARKMID } from '../kjarni/ordaval.js';
import { BORD } from '../data/bord.js';
import { stjornurEl, opnaGlugga, byrjaBord, heimurFyrir, fokusa, ERFIDLEIKAR, skilabod } from './sameiginlegt.js';

const T = ms => Math.round(ms * TIMI_STUDULL);
export const FRJALS_THROF = 10;

/** #/bord/<id> — skilar false ef vísað var annað */
export function birtaBord(rot, app, id) {
  const bord = BORD.find(b => b.id === id);
  if (!bord) { app.fara('#/kort'); return false; }
  if (!stada.opid(bord.id) && !PROF) { skilabod('Kláraðu fyrst borðið á undan 🔒'); app.fara('#/kort'); return false; }
  const leikur = app.LEIKIR[bord.leikur];
  if (!leikur) { skilabod('Þetta borð er í vinnslu 🚧'); app.fara('#/kort'); return false; }
  const h = keyraBord(bord, { rot, leikur, gogn: app.gogn,
    vidHeim: () => app.fara('#/kort'),
    vidLok: n => { app.setjaNuverandi(null); nidurstada(rot, app, bord, n, false); } });
  app.setjaNuverandi(h);
  return true;
}

/** stafirnir sem barnið á erfiðast með (fyrir „Æfa stafina mína“) */
export function veikirStafir() {
  const t = stada.tolfraedi();
  return t ? t.erfidir.filter(x => x.hlutfall < .9).map(x => x.stafur).filter(s => !EKKI_HLJODMARKMID.has(s)) : [];
}

/** frjálst borð fyrir leik + erfiðleika (eða 'aefa' = stafirnir mínir) */
export function frjalstBord(app, leikurId, erf) {
  if (leikurId === 'aefa') {
    const leikur = app.LEIKIR['fyrsti-stafur'];
    if (!leikur) return null;
    const veikir = veikirStafir();
    return { leikur, bord: { id: 'frjals-aefa', nafn: 'Æfa stafina mína', throf: FRJALS_THROF, st: { val: 4, stada: 'fyrsti', stafir: veikir.length >= 2 ? veikir.join('') : null } } };
  }
  const leikur = app.LEIKIR[leikurId];
  if (!leikur) return null;
  const e = ERFIDLEIKAR.some(x => x.id === erf) ? erf : 'lett';
  const st = Object.assign({}, (leikur.erfidleikar && leikur.erfidleikar[e]) || leikur.sjalfgefid || {});
  const bord = { id: `frjals-${leikurId}-${e}`, nafn: leikur.nafn, throf: FRJALS_THROF, st, erf: e };
  if (leikurId === 'hradi') { bord.throf = 0; bord.timi = 60; bord.markmid = [8, 12]; }
  return { leikur, bord };
}

/** #/frjals/<leikur>/<erf> — skilar false ef vísað var annað */
export function birtaFrjalsBord(rot, app, leikurId, erf) {
  const fb = frjalstBord(app, leikurId, erf);
  if (!fb) { app.fara('#/frjals'); return false; }
  const h = keyraBord(fb.bord, { rot, leikur: fb.leikur, gogn: app.gogn,
    vidHeim: () => app.fara('#/frjals'),
    vidLok: n => { app.setjaNuverandi(null); nidurstada(rot, app, fb.bord, n, true); } });
  app.setjaNuverandi(h);
  return true;
}

const TEXTI = {
  3: 'Þrjár stjörnur — snilld! 🌟',
  2: 'Tvær stjörnur — vel gert! Prófaðu aftur fyrir þrjár ⭐',
  1: 'Þú fékkst stjörnu! Prófaðu aftur fyrir fleiri ⭐',
};

function nidurstada(rot, app, bord, n, frjals) {
  const stj = Math.max(1, Math.min(3, n.stjornur | 0));
  let limmidiNyr = false, heimurKlar = null;
  if (!frjals) {
    const vist = stada.setjaStjornur(bord.id, stj);
    if (vist.nytt) limmidiNyr = stada.baetaLimmida(bord.limmidi);
    const yf = stada.stjornurIHeimi(bord.heimur);
    if (yf.bordLokid === yf.bord && !stada.kynningSynd('heimur:' + bord.heimur)) { stada.merkjaKynningu('heimur:' + bord.heimur); heimurKlar = heimurFyrir(bord.heimur); }
  }
  const hradi = n.timi > 0;
  const titill = hradi ? 'Tíminn er búinn! ⏱️' : frjals ? 'Vel gert!' : 'Borðinu lokið!';
  const undir = hradi ? `Þú svaraðir ${n.rett} rétt!` : `${n.rett} rétt af ${bord.throf}` + (n.rangarUmferdir ? ` · ${n.rangarUmferdir} ${n.rangarUmferdir === 1 ? 'umferð' : 'umferðir'} með mistökum` : ' — engin mistök!');
  const stjEl = stjornurEl(0, { stor: true });
  stjEl.setAttribute('aria-label', `${stj} af 3 stjörnum`);

  const naesta = frjals ? null : stada.naestaEftir(bord.id);
  const naestaOpid = naesta && (stada.opid(naesta.id) || PROF);
  const takkar = [];
  const aftur = () => app.fara(location.hash);
  if (!frjals && naestaOpid) takkar.push(el('button', { class: 'takki' + (stj === 3 ? '' : ' litill blar'), type: 'button', text: 'Næsta borð ▶', dataset: stj === 3 ? { fokus: '' } : {}, onclick: () => byrjaBord(naesta, app) }));
  takkar.push(el('button', { class: 'takki' + (stj === 3 && naestaOpid ? ' litill blar' : ''), type: 'button', text: '🔁 Aftur', dataset: stj === 3 && naestaOpid ? {} : { fokus: '' }, onclick: aftur }));
  if (!frjals) takkar.push(el('button', { class: 'takki litill fjolublar', type: 'button', text: '🗺️ Kortið', onclick: () => app.fara('#/kort') }));
  else {
    takkar.push(el('button', { class: 'takki litill fjolublar', type: 'button', text: '🎲 Annar leikur', onclick: () => app.fara('#/frjals') }));
    takkar.push(el('button', { class: 'takki litill bleikur', type: 'button', text: '🏠 Heim', onclick: () => app.fara('#/') }));
  }

  rot.innerHTML = '';
  rot.appendChild(el('div', { class: 'skjar midja nidurstada', dataset: { bord: bord.id, stjornur: String(stj) } }, el('div', { class: 'efni' },
    el('div', { class: 'takn', 'aria-hidden': 'true', text: stj === 3 ? '🏆' : '🎉' }),
    el('h1', { text: titill, tabindex: '-1' }),
    el('p', { class: 'undirtitill', text: bord.nafn }),
    stjEl,
    el('p', { class: 'nidurTexti', 'aria-live': 'polite', text: TEXTI[stj] }),
    el('p', { class: 'smatt', text: undir }),
    limmidiNyr ? el('div', { class: 'limmidiNyr', role: 'status' }, el('span', { class: 'emj', text: bord.limmidi }), el('span', { text: 'Nýr límmiði í bókina!' })) : null,
    el('div', { class: 'takkar' }, takkar))));
  rot.dataset.skjar = 'nidurstada';
  atburdur('skjar', { skjar: 'nidurstada', bord: bord.id, stjornur: stj, frjals });
  fokusa(rot);

  /* stjörnurnar fljúga inn ein og ein */
  const stjornuEls = [...stjEl.querySelectorAll('.stjarna')];
  const lifandi = () => rot.contains(stjEl);
  for (let i = 0; i < stj; i++) setTimeout(() => { if (!lifandi()) return; stjornuEls[i].classList.add('full', 'fljuga'); hlj.stjarna(); }, T(450 + i * 500));
  if (limmidiNyr) setTimeout(() => { if (!lifandi()) return; hlj.lokid(); flugeldar(30); }, T(500 + stj * 500));
  else if (stj === 3) setTimeout(() => { if (lifandi()) flugeldar(24); }, T(450 + stj * 500));
  if (heimurKlar) setTimeout(() => { if (lifandi()) fagnaHeimi(heimurKlar); }, T(1100 + stj * 500));
}

function fagnaHeimi(heimur) {
  hlj.bord();
  flugeldar(60);
  const sidasti = heimur === heimurFyrir('talnaeyja');
  opnaGlugga({ takn: heimur.takn, titill: `Þú kláraðir ${heimur.nafn}! 🎉`, klasi: 'fagnad',
    texti: sidasti ? 'Þú hefur klárað alla heimana — þú ert algjör snillingur! Þú getur samt alltaf spilað aftur og safnað fleiri stjörnum.' : 'Öll borðin í heiminum eru kláruð. Nýr heimur bíður þín á kortinu!',
    takkar: [{ texti: 'Áfram ▶', adal: true }] });
}
