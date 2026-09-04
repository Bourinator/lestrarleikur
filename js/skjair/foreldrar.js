/* Foreldrar — hlið (halda inni 2 s), tölfræði, stillingar, flutningur framvindu, leikmaður og um leikinn. */
import { PROF, TIMI_STUDULL } from '../kjarni/prof.js';
import { el } from '../kjarni/skraut.js';
import { hlj, erRodd, radd } from '../kjarni/hljod.js';
import { stada, AVATARAR, LITIR } from '../kjarni/stada.js';
import { toppstika, fokusa, stadfesta, skilabod } from './sameiginlegt.js';

let opnad = false;   /* hliðið er opið þar til síðan er endurhlaðin */
const T = ms => Math.round(ms * TIMI_STUDULL);

export function birtaForeldrar(rot, app) {
  rot.innerHTML = '';
  if (opnad) innihald(rot, app); else hlid(rot, app);
}

function hlid(rot, app) {
  let timer = null;
  const takki = el('button', { class: 'takki fjolublar halda', type: 'button', 'data-fokus': '', 'aria-label': 'Haltu takkanum inni í tvær sekúndur til að opna' },
    el('span', { class: 'fylla', 'aria-hidden': 'true' }), el('span', { class: 'haldTexti', text: 'Haltu inni' }));
  const byrja = e => {
    if (timer) return;
    if (e.cancelable && e.type !== 'keydown') e.preventDefault();
    takki.classList.add('virkur');
    timer = setTimeout(() => { timer = null; opnad = true; hlj.rett(); innihald(rot, app); }, PROF ? 50 : T(2000));
  };
  const haetta = () => { if (!timer) return; clearTimeout(timer); timer = null; takki.classList.remove('virkur'); };
  takki.addEventListener('pointerdown', byrja);
  ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach(ev => takki.addEventListener(ev, haetta));
  takki.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); byrja(e); } });
  takki.addEventListener('keyup', haetta);
  takki.addEventListener('contextmenu', e => e.preventDefault());
  rot.appendChild(el('div', { class: 'skjar midja foreldrar hlid' }, el('div', { class: 'efni throngt' },
    el('div', { class: 'takn', 'aria-hidden': 'true', text: '🔐' }),
    el('h1', { text: 'Foreldrar', tabindex: '-1' }),
    el('p', { class: 'undirtitill', text: 'Haltu takkanum inni í 2 sekúndur' }),
    takki,
    el('button', { class: 'textatakki', type: 'button', text: '← Til baka', onclick: () => app.fara('#/') }))));
}

const hluti = (titill, ...born) => el('section', { class: 'foreldraHluti' }, el('h2', { text: titill }), born);
const rod = (merki, stjorn) => el('div', { class: 'rod' }, el('span', { class: 'rodMerki', text: merki }), stjorn);
const tala = (takn, gildi, merki) => el('div', { class: 'tala' }, el('span', { 'aria-hidden': 'true', text: takn }), el('b', { text: String(gildi) }), el('span', { class: 'smatt', text: merki }));

function rofi(a, cb) {
  const texti = el('span', { class: 'rofiTexti', text: a ? 'Kveikt' : 'Slökkt' });
  const b = el('button', { class: 'rofi' + (a ? ' a' : ''), type: 'button', role: 'switch', 'aria-checked': String(a),
    onclick: () => { a = !a; b.classList.toggle('a', a); b.setAttribute('aria-checked', String(a)); texti.textContent = a ? 'Kveikt' : 'Slökkt'; cb(a); hlj.smellur(); } },
    el('span', { class: 'rofiBraut', 'aria-hidden': 'true' }, el('span', { class: 'rofiKula' })), texti);
  return b;
}
function val(kostir, valid, cb) {
  const hop = el('div', { class: 'val', role: 'group' });
  kostir.forEach(([g, t]) => hop.appendChild(el('button', { class: 'textatakki' + (g === valid ? ' virkur' : ''), type: 'button', text: t, 'aria-pressed': String(g === valid),
    onclick: function () { hop.querySelectorAll('button').forEach(x => { x.classList.toggle('virkur', x === this); x.setAttribute('aria-pressed', String(x === this)); }); cb(g); hlj.smellur(); } })));
  return hop;
}

function innihald(rot, app) {
  rot.innerHTML = '';
  const p = stada.virkur();
  const t = stada.tolfraedi();
  const s = stada.stillingar();
  const efni = el('div', { class: 'efni foreldraEfni' });
  const endur = () => innihald(rot, app);

  /* leikmenn */
  efni.appendChild(hluti('Leikmaður',
    el('div', { class: 'profilar litil', role: 'group', 'aria-label': 'Veldu leikmann' }, stada.profilar().map(pr =>
      el('button', { class: 'profill' + (pr.id === p.id ? ' virkur' : ''), type: 'button', dataset: { litur: pr.litur }, 'aria-pressed': String(pr.id === p.id),
        onclick: () => { stada.veljaProfil(pr.id); app.beitaStillingum(); hlj.smellur(); endur(); } },
        el('span', { class: 'avatar', 'aria-hidden': 'true', text: pr.avatar }), el('span', { class: 'nafn', text: pr.nafn })))),
    el('p', { class: 'smatt', text: 'Tölfræðin og stafagerðin hér að neðan eiga við leikmanninn sem er valinn. Nýir leikmenn eru búnir til á heimaskjánum.' })));

  /* tölfræði */
  const nak = t.svor ? Math.round(t.rett / t.svor * 100) : null;
  const leikjaNofn = id => (app.LEIKIR[id] ? app.LEIKIR[id].nafn : id);
  const erfidir = t.erfidir.filter(x => x.hlutfall < .9);   /* stafir með < 90% rétt eftir a.m.k. 3 svör */
  const leikir = Object.entries(t.leikir || {}).map(([id, v]) => ({ id, r: v.r, v: v.v, n: v.r + v.v })).filter(x => x.n > 0).sort((a, b) => b.n - a.n);
  efni.appendChild(hluti(`Tölfræði — ${p.nafn}`,
    el('div', { class: 'tolfraedi' },
      tala('⭐', t.stjornurAlls, 'stjörnur'), tala('🏁', `${t.bordLokid}/${t.bordAlls}`, 'borð kláruð'), tala('⏱️', t.timiMin, t.timiMin === 1 ? 'mínúta' : 'mínútur'),
      tala('🎯', nak === null ? '–' : nak + '%', 'rétt svör'), tala('📒', t.limmidar, 'límmiðar'), tala('🎮', t.spilad, 'borð spiluð')),
    el('h3', { text: 'Nákvæmni eftir leikjum' }),
    leikir.length ? el('div', { class: 'leikjaListi' }, leikir.map(x => {
      const h = Math.round(x.r / x.n * 100);
      return el('div', { class: 'leikjaRod' }, el('span', { class: 'leikjaNafn', text: leikjaNofn(x.id) }),
        el('span', { class: 'sula', role: 'img', 'aria-label': `${h}% rétt af ${x.n} svörum` }, el('span', { style: { width: h + '%' } })),
        el('span', { class: 'leikjaTala', text: `${h}% · ${x.n}` }));
    })) : el('p', { class: 'smatt', text: 'Engin svör skráð ennþá.' }),
    el('h3', { text: 'Stafir sem þarf að æfa' }),
    erfidir.length ? el('div', { class: 'stafaChips' }, erfidir.map(x => el('span', { class: 'merki bleikur', text: `${x.stafur} · ${Math.round(x.hlutfall * 100)}% rétt` })))
      : el('p', { class: 'smatt', text: 'Engir í augnablikinu — hér birtast stafir sem barnið hefur svarað a.m.k. þrisvar og fær sjaldnar en 9 af 10 rétta.' }),
    el('p', { class: 'smatt', text: '„Æfa stafina mína“ í Frjálsum leik notar þessa stafi.' })));

  /* stillingar */
  const setja = (n, v) => { stada.setjaStillingu(n, v); app.beitaStillingum(); };
  efni.appendChild(hluti('Stillingar',
    rod(`Stafagerð í leikjum (${p.nafn})`, val([['litlir', 'Aa litlir'], ['storir', 'AA stórir']], s.stafagerd === 'storir' ? 'storir' : 'litlir', v => setja('stafagerd', v))),
    rod('Hljóð', rofi(s.hljod !== false, v => setja('hljod', v))),
    rod('Hreyfimyndir', rofi(s.hreyfing !== false, v => setja('hreyfing', v))),
    rod('Klukka í kappborðum', rofi(s.klukka !== false, v => setja('klukka', v))),
    el('p', { class: 'smatt', text: 'Hljóð, hreyfimyndir og klukka gilda fyrir alla leikmenn á þessu tæki. Stafagerðin er stillt fyrir hvern leikmann — barnið getur líka skipt með Aa-takkanum inni í leiknum. Þegar klukkan er slökkt eru kappborðin spiluð án tímamarka.' })));

  /* flytja framvindu */
  const utKodi = el('textarea', { class: 'kodi', readonly: true, rows: '3', 'aria-label': 'Kóði með framvindunni' });
  const innKodi = el('textarea', { class: 'kodi', rows: '3', placeholder: 'Límdu kóða hér …', 'aria-label': 'Kóði til að flytja inn' });
  efni.appendChild(hluti('Flytja framvindu á annað tæki',
    el('p', { class: 'smatt', text: 'Framvindan er vistuð í vafranum á þessu tæki. Til að taka hana með: búðu til kóða hér, sendu hann (t.d. í tölvupósti) og límdu hann inn á hinu tækinu.' }),
    el('div', { class: 'takkar vinstri' },
      el('button', { class: 'textatakki blar', type: 'button', text: '📤 Búa til kóða', onclick: () => { utKodi.value = stada.flytjaUt(); utKodi.classList.remove('falin'); utKodi.focus(); utKodi.select(); } }),
      el('button', { class: 'textatakki blar', type: 'button', text: '📋 Afrita', onclick: async () => {
        if (!utKodi.value) utKodi.value = stada.flytjaUt();
        utKodi.classList.remove('falin');
        try { await navigator.clipboard.writeText(utKodi.value); skilabod('Kóðinn var afritaður ✓'); }
        catch (e) { utKodi.focus(); utKodi.select(); skilabod('Veldu textann og afritaðu hann'); }
      } })),
    utKodi,
    innKodi,
    el('div', { class: 'takkar vinstri' }, el('button', { class: 'textatakki graenn', type: 'button', text: '📥 Flytja inn', onclick: async () => {
      const k = innKodi.value.trim();
      if (!k) { skilabod('Límdu kóða í reitinn fyrst'); innKodi.focus(); return; }
      if (!await stadfesta({ takn: '📥', titill: 'Flytja inn framvindu?', texti: 'Þetta skiptir út öllum leikmönnum og framvindu á þessu tæki fyrir það sem er í kóðanum.', ja: 'Flytja inn' })) return;
      if (stada.flytjaInn(k)) { app.beitaStillingum(); skilabod('Framvindan var flutt inn ✓'); endur(); }
      else skilabod('Kóðinn er ekki gildur ✗');
    } }))));
  utKodi.classList.add('falin');

  /* leikmaðurinn: nafn, byrja upp á nýtt, eyða */
  const nafnInp = el('input', { class: 'texti', type: 'text', maxlength: '20', value: p.nafn, 'aria-label': 'Nafn leikmanns', autocomplete: 'off' });
  efni.appendChild(hluti(`Breyta leikmanni — ${p.nafn}`,
    el('div', { class: 'rod' }, nafnInp, el('button', { class: 'textatakki blar', type: 'button', text: 'Vista nafn', onclick: () => { const n = nafnInp.value.trim(); if (!n) { nafnInp.focus(); return; } stada.uppfaeraProfil(p.id, { nafn: n }); skilabod('Nafnið var vistað ✓'); endur(); } })),
    el('div', { class: 'takkar vinstri haettulegt' },
      el('button', { class: 'textatakki raudur', type: 'button', text: '↺ Byrja upp á nýtt', onclick: async () => {
        if (!await stadfesta({ takn: '↺', titill: `Byrja upp á nýtt fyrir ${p.nafn}?`, texti: 'Allar stjörnur, límmiðar og tölfræði þessa leikmanns hverfa. Leikmaðurinn sjálfur helst.', ja: 'Byrja upp á nýtt', haettulegt: true })) return;
        stada.nullstilla(p.id); skilabod('Framvindan var hreinsuð'); endur();
      } }),
      el('button', { class: 'textatakki raudur', type: 'button', text: '🗑️ Eyða leikmanni', onclick: async () => {
        if (!await stadfesta({ takn: '🗑️', titill: `Eyða ${p.nafn}?`, texti: 'Leikmaðurinn og öll framvinda hans hverfa af þessu tæki. Þetta er ekki hægt að taka til baka.', ja: 'Eyða', haettulegt: true })) return;
        stada.eydaProfil(p.id);
        if (stada.fjoldiProfila() === 0) stada.nyrProfill({ nafn: 'Krakki', avatar: '🐣', litur: LITIR[Math.floor(Math.random() * LITIR.length)] });
        app.beitaStillingum(); skilabod('Leikmanninum var eytt'); endur();
      } }))));

  /* um leikinn */
  const ios = /iP(hone|ad|od)/.test(navigator.userAgent) && !navigator.standalone && !stada.kynningSynd('ios-heimaskjar');
  efni.appendChild(hluti('Um leikinn',
    el('p', { class: 'smatt', text: 'Stafaleikur er íslenskur lestrar- og reikningsleikur fyrir börn sem eru að læra stafina, hljóða saman, lesa orð og setningar og telja. Leikurinn fylgir hljóðaaðferðinni: stafirnir eru kenndir sem hljóð og í þeirri röð sem er algeng í íslenskri lestrarkennslu (a s ó l í m · i u ú r e n · o t k f h b · v d g j á æ · p é y ý þ ö).' }),
    el('p', { class: 'smatt', text: erRodd() ? `Íslensk rödd fannst á tækinu (${radd()}) og er notuð til að lesa orð og setningar upphátt.` : 'Engin íslensk rödd fannst á þessu tæki, svo orðin eru ekki lesin upphátt. Á iPhone/iPad og Mac er hægt að bæta íslenskri rödd við í stillingum tækisins (Aðgengi → Talað efni → Raddir).' }),
    el('p', { class: 'smatt', text: 'Leikurinn virkar án nettengingar eftir að hann hefur verið opnaður einu sinni. Engum gögnum er safnað um börnin — framvindan er aðeins vistuð í vafranum á þessu tæki. Heimsóknir eru taldar með GoatCounter án persónugreinanlegra upplýsinga.' }),
    ios ? el('div', { class: 'abending', role: 'note' },
      el('p', { text: '📲 Á iPhone/iPad: ýttu á „Deila“ í Safari og svo „Bæta á heimaskjá“ — þá opnast leikurinn eins og app, á öllum skjánum.' }),
      el('button', { class: 'textatakki', type: 'button', text: 'Loka', onclick: function () { stada.merkjaKynningu('ios-heimaskjar'); this.parentElement.remove(); } })) : null,
    el('p', { class: 'smatt', text: 'Útgáfa 2.0' })));

  rot.appendChild(el('div', { class: 'skjar foreldrar' }, toppstika({ heim: () => app.fara('#/'), titill: 'Foreldrar' }), efni));
  fokusa(rot);
}
