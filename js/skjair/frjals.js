/* Frjáls leikur — allir leikirnir í spjöldum (Lestur / Reikningur), erfiðleiki 🐣🐥🦅, og „Æfa stafina mína“. */
import { el } from '../kjarni/skraut.js';
import { hlj } from '../kjarni/hljod.js';
import { LEIKJA_ID } from '../leikir/index.js';
import { toppstika, opnaGlugga, ERFIDLEIKAR } from './sameiginlegt.js';
import { veikirStafir } from './bord.js';

const FLOKKAR = [{ id: 'lestur', nafn: 'Lestur', takn: '📖' }, { id: 'reikningur', nafn: 'Reikningur', takn: '🔢' }];

export function birtaFrjals(rot, app) {
  rot.innerHTML = '';
  const efni = el('div', { class: 'efni frjalsEfni' });
  const talnaByrjun = LEIKJA_ID.indexOf('telja');   /* leikir sem hlóðust ekki flokkast eftir röðinni í index.js */
  const flokkur = id => (app.LEIKIR[id] ? app.LEIKIR[id].flokkur : (LEIKJA_ID.indexOf(id) >= talnaByrjun ? 'reikningur' : 'lestur'));

  for (const f of FLOKKAR) {
    const spjold = el('div', { class: 'leikjaspjold' });
    LEIKJA_ID.filter(id => flokkur(id) === f.id).forEach(id => {
      const l = app.LEIKIR[id];
      if (!l) {
        spjold.appendChild(el('button', { class: 'leikjaspjald ivinnslu', type: 'button', onclick: () => opnaGlugga({ takn: '🚧', titill: 'Í vinnslu', texti: 'Þessi leikur er ekki tilbúinn ennþá — komdu aftur seinna!', takkar: [{ texti: 'Allt í lagi', adal: true }] }) },
          el('span', { class: 'takn', 'aria-hidden': 'true', text: '🚧' }), el('span', { class: 'nafn', text: id }), el('span', { class: 'lysing', text: 'Í vinnslu' })));
        return;
      }
      spjold.appendChild(el('button', { class: 'leikjaspjald', type: 'button', dataset: { leikur: id }, onclick: () => veljaErfidleika(l) },
        el('span', { class: 'takn', 'aria-hidden': 'true', text: l.takn }),
        el('span', { class: 'nafn', text: l.nafn }),
        el('span', { class: 'lysing', text: l.lysing })));
    });
    if (f.id === 'lestur' && app.LEIKIR['fyrsti-stafur']) {
      const veikir = veikirStafir();
      spjold.appendChild(el('button', { class: 'leikjaspjald aefa', type: 'button', dataset: { leikur: 'aefa' }, onclick: () => { hlj.smellur(); app.fara('#/frjals/aefa/lett'); } },
        el('span', { class: 'takn', 'aria-hidden': 'true', text: veikir.length >= 2 ? veikir.slice(0, 6).join(' ') : '💪' }),
        el('span', { class: 'nafn', text: 'Æfa stafina mína' }),
        el('span', { class: 'lysing', text: veikir.length >= 2 ? 'Stafirnir sem þú þarft að æfa mest.' : 'Leikurinn tekur eftir hvaða stafir eru erfiðir og æfir þá hér.' })));
    }
    efni.append(el('h2', { class: 'flokkurHaus' }, el('span', { 'aria-hidden': 'true', text: f.takn + ' ' }), f.nafn), spjold);
  }
  rot.appendChild(el('div', { class: 'skjar frjals' }, toppstika({ heim: () => app.fara('#/'), titill: 'Frjáls leikur' }), efni));

  function veljaErfidleika(l) {
    hlj.smellur();
    opnaGlugga({ takn: l.takn, titill: l.nafn, texti: l.lysing, klasi: 'kynning',
      efni: [el('div', { class: 'erfidleikar', role: 'group', 'aria-label': 'Veldu erfiðleika' },
        ERFIDLEIKAR.map((e, i) => el('button', { class: 'takki ' + e.litur, type: 'button', text: `${e.takn} ${e.nafn}`, dataset: i === 0 ? { adal: '1', erf: e.id } : { erf: e.id },
          onclick: () => { hlj.smellur(); app.fara(`#/frjals/${l.id}/${e.id}`); } })))],
      takkar: [{ texti: 'Hætta við', klasi: 'textatakki' }] });
  }
}
