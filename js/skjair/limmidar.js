/* Límmiðabók — allir límmiðar borðanna, raðaðir eftir heimum; óunnir eru „?“ og vísa á borðið. */
import { el } from '../kjarni/skraut.js';
import { hlj } from '../kjarni/hljod.js';
import { stada } from '../kjarni/stada.js';
import { BORD, HEIMAR } from '../data/bord.js';
import { toppstika, byrjaBord, skilabod } from './sameiginlegt.js';

export function birtaLimmidar(rot, app) {
  rot.innerHTML = '';
  const unnir = new Set(stada.limmidar());
  const efni = el('div', { class: 'efni limmidaEfni' });
  for (const h of HEIMAR) {
    const grid = el('div', { class: 'limmidar', role: 'list' });
    BORD.filter(b => b.heimur === h.id).forEach(b => {
      const a = unnir.has(b.limmidi);
      const opid = stada.opid(b.id);
      const t = el('button', { class: 'limmidi' + (a ? '' : ' olaest'), type: 'button', role: 'listitem', dataset: { bord: b.id },
        'aria-label': a ? `Límmiði ${b.limmidi} — ${b.nafn}` : `Óunninn límmiði — ${b.nafn}${opid ? '' : ' (læst)'}`,
        onclick: () => {
          if (a) { t.classList.remove('hopp'); void t.offsetWidth; t.classList.add('hopp'); hlj.stjarna(); skilabod(`${b.limmidi} ${b.nafn}`); return; }
          if (opid) { hlj.smellur(); byrjaBord(b, app); return; }
          hlj.hvarf(); skilabod('Kláraðu fyrst borðin á undan 🔒'); app.fara('#/kort');
        } }, el('span', { 'aria-hidden': 'true', text: a ? b.limmidi : '?' }));
      grid.appendChild(t);
    });
    const yf = stada.stjornurIHeimi(h.id);
    efni.appendChild(el('section', { class: 'heimur limmidaHeimur', dataset: { litur: h.litur } },
      el('div', { class: 'heimHaus' }, el('span', { class: 'takn', 'aria-hidden': 'true', text: h.takn }), el('div', { class: 'heimTexti' }, el('h2', { text: h.nafn })), el('span', { class: 'merki', text: `${yf.bordLokid}/${yf.bord}` })),
      grid));
  }
  rot.appendChild(el('div', { class: 'skjar limmidabok' },
    toppstika({ heim: () => app.fara('#/'), titill: 'Límmiðabók', haegri: [el('span', { class: 'merki bleikur', text: `📒 ${unnir.size}/${BORD.length}`, 'aria-label': `${unnir.size} af ${BORD.length} límmiðum` })] }),
    efni));
}
