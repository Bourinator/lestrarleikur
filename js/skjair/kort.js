/* Kortið — heimarnir í röð með hlykkjóttum stíg af borðum, stjörnum, lásum og næsta borði sem pulsar. */
import { el } from '../kjarni/skraut.js';
import { hlj } from '../kjarni/hljod.js';
import { stada } from '../kjarni/stada.js';
import { BORD, HEIMAR } from '../data/bord.js';
import { toppstika, stjornurEl, skilabod, byrjaBord } from './sameiginlegt.js';

export function birtaKort(rot, app) {
  rot.innerHTML = '';
  const naesta = stada.naestaBord();
  const efni = el('div', { class: 'efni kortEfni' });

  for (const h of HEIMAR) {
    const yf = stada.stjornurIHeimi(h.id);
    const bordin = BORD.filter(b => b.heimur === h.id);
    const leid = el('ol', { class: 'leid', 'aria-label': 'Borðin í ' + h.nafn });
    bordin.forEach(b => {
      const opid = stada.opid(b.id);
      const stj = stada.stjornur(b.id);
      const leikur = app.LEIKIR[b.leikur];
      const klasar = ['hnutur', opid ? 'opid' : 'laest', stj > 0 ? 'lokid' : '', b.id === naesta.id ? 'naest' : '', !leikur ? 'ivinnslu' : ''].filter(Boolean).join(' ');
      const kula = el('span', { class: 'kula', 'aria-hidden': 'true' },
        el('span', { class: 'kulaTexti', text: !opid ? '🔒' : !leikur ? '🚧' : stj > 0 ? b.limmidi : String(b.nr) }),
        b.timi ? el('span', { class: 'timiMerki', text: '⏱️' }) : null);
      const hn = el('button', { class: klasar, type: 'button', dataset: { bord: b.id },
        'aria-label': `Borð ${b.nr}: ${b.nafn}${!opid ? ' — læst' : ''}${b.timi ? ' — kapp við klukkuna' : ''}, ${stj} af 3 stjörnum`,
        onclick: () => {
          if (!opid) { hn.classList.remove('hrista'); void hn.offsetWidth; hn.classList.add('hrista'); hlj.hvarf(); skilabod('Kláraðu fyrst borðið á undan 🔒'); return; }
          hlj.smellur(); byrjaBord(b, app);
        } },
        kula, el('span', { class: 'hnutNafn', text: b.nafn }), stjornurEl(stj));
      leid.appendChild(el('li', {}, hn));
    });
    const klarad = yf.bordLokid === yf.bord;
    efni.appendChild(el('section', { class: 'heimur' + (klarad ? ' klarad' : ''), dataset: { heimur: h.id, litur: h.litur }, 'aria-labelledby': 'h-' + h.id },
      el('div', { class: 'heimHaus' },
        el('span', { class: 'takn', 'aria-hidden': 'true', text: h.takn }),
        el('div', { class: 'heimTexti' }, el('h2', { id: 'h-' + h.id, text: h.nafn }), el('p', { class: 'lysing', text: h.lysing })),
        el('span', { class: 'merki', text: (klarad ? '🏆 ' : '⭐ ') + `${yf.fengnar}/${yf.alls}`, 'aria-label': `${yf.fengnar} af ${yf.alls} stjörnum` })),
      leid));
  }

  const skjar = el('div', { class: 'skjar kort' },
    toppstika({ heim: () => app.fara('#/'), titill: 'Kortið', haegri: [el('span', { class: 'merki fjolublar', text: '⭐ ' + stada.stjornurAlls(), 'aria-label': stada.stjornurAlls() + ' stjörnur alls' })] }),
    efni);
  rot.appendChild(skjar);
  /* skruna að borðinu sem er næst á dagskrá */
  requestAnimationFrame(() => {
    const n = skjar.querySelector('.hnutur.naest');
    if (n) { try { n.scrollIntoView({ block: 'center', behavior: 'instant' }); } catch (e) { n.scrollIntoView(); } }
  });
}
