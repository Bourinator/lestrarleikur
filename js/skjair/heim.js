/* Heim — merki, leikmenn, Spila, Kortið / Frjáls leikur / Límmiðabók, hljóð og Foreldrar. */
import { el, slembiUr } from '../kjarni/skraut.js';
import { hlj } from '../kjarni/hljod.js';
import { stada, AVATARAR, LITIR } from '../kjarni/stada.js';
import { opnaGlugga, byrjaBord } from './sameiginlegt.js';

export function birtaHeim(rot, app) {
  rot.innerHTML = '';
  const virkur = stada.virkur();
  const profilar = stada.profilar();
  const naesta = stada.naestaBord();
  /* eini leikmaðurinn er sjálfgerði gesturinn → „＋“ breytir honum í stað þess að bæta við */
  const gestur = profilar.length === 1 && profilar[0].avatar === '🐣' && stada.stjornurAlls() === 0 ? profilar[0] : null;

  const profillTakki = pr => el('button', { class: 'profill' + (pr.id === virkur.id ? ' virkur' : ''), type: 'button', dataset: { litur: pr.litur, id: pr.id },
    'aria-pressed': String(pr.id === virkur.id), 'aria-label': pr.nafn + (pr.id === virkur.id ? ' — er að spila. Ýttu til að breyta.' : ''),
    onclick: () => {
      if (pr.id === virkur.id) { profilGluggi(pr); return; }
      stada.veljaProfil(pr.id); app.beitaStillingum(); hlj.smellur(); birtaHeim(rot, app);
    } },
    el('span', { class: 'avatar', 'aria-hidden': 'true', text: pr.avatar }),
    el('span', { class: 'nafn', text: pr.nafn }));

  const hljodTakki = () => {
    const a = stada.stillingar().hljod !== false;
    return el('button', { class: 'ikontakki', type: 'button', text: a ? '🔊' : '🔇', 'aria-label': a ? 'Hljóð: kveikt' : 'Hljóð: slökkt', 'aria-pressed': String(a),
      onclick: function () { const nu = stada.stillingar().hljod === false; stada.setjaStillingu('hljod', nu); app.beitaStillingum(); this.textContent = nu ? '🔊' : '🔇'; this.setAttribute('aria-label', nu ? 'Hljóð: kveikt' : 'Hljóð: slökkt'); this.setAttribute('aria-pressed', String(nu)); hlj.smellur(); } });
  };

  rot.appendChild(el('div', { class: 'skjar midja heim' }, el('div', { class: 'efni' },
    el('div', { class: 'kynningMyndir', 'aria-hidden': 'true', text: '🐶 🍎 ⭐' }),
    el('h1', { class: 'logo', text: 'Stafaleikur', tabindex: '-1' }),
    el('p', { class: 'undirtitill', text: 'Stafir, orð, setningar og tölur' }),
    el('div', { class: 'profilar', role: 'group', 'aria-label': 'Hver er að spila?' },
      profilar.map(profillTakki),
      profilar.length < 8 ? el('button', { class: 'profill nyr', type: 'button', 'aria-label': gestur ? 'Búa til leikmann' : 'Nýr leikmaður', onclick: () => profilGluggi(gestur) },
        el('span', { class: 'avatar', 'aria-hidden': 'true', text: '＋' }), el('span', { class: 'nafn', text: gestur ? 'Búa til' : 'Nýr' })) : null),
    el('button', { class: 'takki stor', type: 'button', 'data-fokus': '', text: 'Spila ▶', onclick: () => byrjaBord(naesta, app) }),
    el('div', { class: 'naestaRod' },
      el('span', { class: 'merki fjolublar', text: '⭐ ' + stada.stjornurAlls(), 'aria-label': stada.stjornurAlls() + ' stjörnur' }),
      el('span', { class: 'smatt', text: 'Næst: ' + naesta.nafn + ' ' + naesta.limmidi })),
    el('div', { class: 'heimTakkar' },
      el('button', { class: 'textatakki blar', type: 'button', text: '🗺️ Kortið', onclick: () => app.fara('#/kort') }),
      el('button', { class: 'textatakki graenn', type: 'button', text: '🎲 Frjáls leikur', onclick: () => app.fara('#/frjals') }),
      el('button', { class: 'textatakki bleikur', type: 'button', text: '📒 Límmiðabók', onclick: () => app.fara('#/limmidar') })),
    el('div', { class: 'heimFotur' },
      hljodTakki(),
      el('button', { class: 'ikontakki foreldraTakki', type: 'button', 'aria-label': 'Foreldrar', text: '⚙️', onclick: () => app.fara('#/foreldrar') })))));

  /** nýr leikmaður (pr = null) eða breyta (pr) — avatar, litur, nafn, stafagerð */
  function profilGluggi(pr) {
    let avatar = pr && AVATARAR.includes(pr.avatar) ? pr.avatar : slembiUr(AVATARAR);
    let litur = pr ? pr.litur : slembiUr(LITIR);
    let stafagerd = pr ? (pr.stillingar.stafagerd || 'litlir') : 'litlir';
    const synis = el('span', { class: 'avatar stor', 'aria-hidden': 'true', text: avatar });
    const avatarVal = el('div', { class: 'avatarVal', role: 'group', 'aria-label': 'Veldu mynd' },
      AVATARAR.map(a => el('button', { class: 'avatarKostur' + (a === avatar ? ' valinn' : ''), type: 'button', text: a, 'aria-label': 'Mynd ' + a, 'aria-pressed': String(a === avatar),
        onclick: function () { avatar = a; synis.textContent = a; avatarVal.querySelectorAll('button').forEach(b => { b.classList.toggle('valinn', b === this); b.setAttribute('aria-pressed', String(b === this)); }); hlj.plopp(); } })));
    const litaVal = el('div', { class: 'litaVal', role: 'group', 'aria-label': 'Veldu lit' },
      LITIR.map(l => el('button', { class: 'litaKostur' + (l === litur ? ' valinn' : ''), type: 'button', dataset: { litur: l }, 'aria-label': 'Litur ' + l, 'aria-pressed': String(l === litur),
        onclick: function () { litur = l; synisRammi.dataset.litur = l; litaVal.querySelectorAll('button').forEach(b => { b.classList.toggle('valinn', b === this); b.setAttribute('aria-pressed', String(b === this)); }); hlj.plopp(); } })));
    const synisRammi = el('div', { class: 'profill synis', dataset: { litur } }, synis);
    const nafnInp = el('input', { class: 'texti', type: 'text', maxlength: '20', placeholder: 'Nafn (má sleppa)', 'aria-label': 'Nafn', autocomplete: 'off', autocapitalize: 'words', spellcheck: 'false', value: pr && !gestur ? pr.nafn : '' });
    const stafaVal = el('div', { class: 'val', role: 'group', 'aria-label': 'Stafagerð' },
      [['litlir', 'Aa litlir'], ['storir', 'AA stórir']].map(([g, t]) => el('button', { class: 'textatakki' + (g === stafagerd ? ' virkur' : ''), type: 'button', text: t, 'aria-pressed': String(g === stafagerd),
        onclick: function () { stafagerd = g; stafaVal.querySelectorAll('button').forEach(b => { b.classList.toggle('virkur', b === this); b.setAttribute('aria-pressed', String(b === this)); }); hlj.smellur(); } })));
    const vista = () => {
      const nafn = nafnInp.value.trim() || 'Krakki';
      if (pr) stada.uppfaeraProfil(pr.id, { nafn, avatar, litur });
      else if (!stada.nyrProfill({ nafn, avatar, litur })) return;
      stada.setjaStillingu('stafagerd', stafagerd);
      app.beitaStillingum();
      hlj.rett();
    };
    opnaGlugga({ titill: pr && !gestur ? 'Breyta leikmanni' : 'Nýr leikmaður', klasi: 'profilGluggi',
      efni: [synisRammi, avatarVal, litaVal, nafnInp, el('p', { class: 'smatt', text: 'Stafagerð í leikjunum' }), stafaVal],
      takkar: [
        { texti: pr && !gestur ? 'Vista' : 'Byrja að spila ▶', adal: true, onclick: () => { vista(); if (pr && !gestur) birtaHeim(rot, app); else { birtaHeim(rot, app); byrjaBord(stada.naestaBord(), app); } } },
        { texti: 'Hætta við', klasi: 'textatakki' },
      ] });
  }
}
