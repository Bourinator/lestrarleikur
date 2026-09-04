/* Vistun: prófílar, stillingar, framvinda (stjörnur), límmiðar og tölfræði — í localStorage */
import { BORD } from '../data/bord.js';

const LYKILL = 'stafaleikur.v2';
export const AVATARAR = ['🦊','🐼','🦄','🐸','🐙','🦁','🐧','🦋','🐬','🦖','🐨','🐯','🐰','🦉','🐢','🐝'];
export const LITIR = ['bleikur','blar','graenn','appelsinu','fjolublar','blagraenn'];

let gogn = null;

const sjalfgefnarStillingar = () => ({ stafagerd: 'litlir' });
const sjalfgefnarAlmennar = () => ({ hljod: true, hreyfing: true, klukka: true });   /* gilda fyrir öll börn á tækinu */
const tomTolfraedi = () => ({ stafir: {}, leikir: {}, timiMs: 0, spilad: 0, svor: 0, rett: 0, bordLokid: 0 });

function nyttId() { return 'p' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3); }

function lagaProfil(p) {
  if (!p || typeof p !== 'object') return null;
  return {
    id: String(p.id || nyttId()),
    nafn: String(p.nafn || 'Krakki').slice(0, 20),
    avatar: AVATARAR.includes(p.avatar) || p.avatar === '🐣' ? p.avatar : AVATARAR[0],   /* 🐣 = sjálfgerði gesturinn */
    litur: LITIR.includes(p.litur) ? p.litur : LITIR[0],
    stjornur: (p.stjornur && typeof p.stjornur === 'object') ? p.stjornur : {},
    limmidar: Array.isArray(p.limmidar) ? p.limmidar.filter(x => typeof x === 'string') : [],
    tolfraedi: Object.assign(tomTolfraedi(), p.tolfraedi || {}),
    stillingar: Object.assign(sjalfgefnarStillingar(), p.stillingar || {}),
    buidTil: p.buidTil || Date.now(),
    sidast: p.sidast || null,
    sidastSpilad: p.sidastSpilad || null,
  };
}

function lesa(lykill) {
  try { return JSON.parse(localStorage.getItem(lykill) || 'null'); } catch (e) { return null; }
}
function hlada() {
  if (gogn) return gogn;
  let t = null, hra = null;
  try { hra = localStorage.getItem(LYKILL); } catch (e) { hra = null; }
  try { t = JSON.parse(hra || 'null'); }
  catch (e) {
    /* bilað JSON: geyma það til hliðar og reyna afritið frá síðustu ræsingu */
    try { localStorage.setItem(LYKILL + '.bilad', hra); } catch (e2) { /* ekkert */ }
    t = lesa(LYKILL + '.afrit');
  }
  if (t && typeof t === 'object' && Array.isArray(t.profilar)) {
    try { localStorage.setItem(LYKILL + '.afrit', JSON.stringify(t)); } catch (e) { /* ekkert */ }   /* afrit einu sinni á ræsingu */
  }
  if (!t || typeof t !== 'object' || !Array.isArray(t.profilar)) t = { utgafa: 2, profilar: [], virkur: null, almennt: {} };
  t.almennt = Object.assign(sjalfgefnarAlmennar(), t.almennt || {});
  t.kynning = t.kynning || {};
  t.profilar = t.profilar.map(lagaProfil).filter(Boolean);
  if (!t.profilar.some(p => p.id === t.virkur)) t.virkur = t.profilar[0]?.id || null;
  gogn = t;
  return gogn;
}
function vista() {
  try { localStorage.setItem(LYKILL, JSON.stringify(gogn)); return true; }
  catch (e) { return false; }   /* einkahamur eða kvóti — leikurinn heldur áfram án vistunar */
}
function virkurProfill() { const g = hlada(); return g.profilar.find(p => p.id === g.virkur) || null; }

export const stada = {
  hlada, vista,
  /** flytja framvindu á milli tækja: base64-kóði af öllum gögnunum */
  flytjaUt() { hlada(); try { return btoa(unescape(encodeURIComponent(JSON.stringify(gogn)))); } catch (e) { return ''; } },
  flytjaInn(kodi) {
    try {
      const t = JSON.parse(decodeURIComponent(escape(atob(String(kodi).trim()))));
      if (!t || !Array.isArray(t.profilar)) return false;
      gogn = null;
      localStorage.setItem(LYKILL, JSON.stringify(t));
      hlada();
      return true;
    } catch (e) { return false; }
  },
  vistunVirk() { try { localStorage.setItem(LYKILL + '.prof', '1'); localStorage.removeItem(LYKILL + '.prof'); return true; } catch (e) { return false; } },
  profilar() { return hlada().profilar.slice(); },
  virkur() { return virkurProfill(); },
  fjoldiProfila() { return hlada().profilar.length; },

  nyrProfill({ nafn, avatar, litur }) {
    const g = hlada();
    if (g.profilar.length >= 8) return null;
    const p = lagaProfil({ id: nyttId(), nafn, avatar, litur });
    g.profilar.push(p); g.virkur = p.id; vista();
    return p;
  },
  veljaProfil(id) { const g = hlada(); if (g.profilar.some(p => p.id === id)) { g.virkur = id; vista(); } return virkurProfill(); },
  eydaProfil(id) { const g = hlada(); g.profilar = g.profilar.filter(p => p.id !== id); if (g.virkur === id) g.virkur = g.profilar[0]?.id || null; vista(); },
  uppfaeraProfil(id, br) { const g = hlada(); const p = g.profilar.find(p => p.id === id); if (!p) return null; Object.assign(p, lagaProfil(Object.assign({}, p, br))); vista(); return p; },

  /** sameinaðar stillingar: almennar (hljod, hreyfing) + prófíls (stafagerd) */
  stillingar() { const g = hlada(); const p = virkurProfill(); return Object.assign(sjalfgefnarStillingar(), g.almennt, p ? p.stillingar : {}); },
  setjaStillingu(nafn, gildi) {
    const g = hlada();
    if (nafn in sjalfgefnarAlmennar()) { g.almennt[nafn] = gildi; vista(); return; }
    const p = virkurProfill(); if (!p) return; p.stillingar[nafn] = gildi; vista();
  },
  /** hefur kynningargluggi borðs verið sýndur? (einu sinni á tæki) */
  kynningSynd(bordId) { return !!hlada().kynning[bordId]; },
  merkjaKynningu(bordId) { hlada().kynning[bordId] = 1; vista(); },

  stjornur(bordId) { const p = virkurProfill(); return p ? (p.stjornur[bordId] || 0) : 0; },
  /** vistar hámark; skilar {adur, nu, nytt} */
  setjaStjornur(bordId, n) {
    const p = virkurProfill(); if (!p) return { adur: 0, nu: n, nytt: false };
    const adur = p.stjornur[bordId] || 0;
    const nu = Math.max(adur, Math.max(0, Math.min(3, n | 0)));
    p.stjornur[bordId] = nu; p.sidast = bordId; p.sidastSpilad = Date.now();
    if (adur === 0 && nu > 0) p.tolfraedi.bordLokid = (p.tolfraedi.bordLokid || 0) + 1;
    vista();
    return { adur, nu, nytt: adur === 0 && nu > 0 };
  },
  stjornurAlls() { const p = virkurProfill(); return p ? Object.values(p.stjornur).reduce((a, b) => a + b, 0) : 0; },
  stjornurIHeimi(heimurId) {
    const p = virkurProfill(); const b = BORD.filter(x => x.heimur === heimurId);
    return { fengnar: p ? b.reduce((a, x) => a + (p.stjornur[x.id] || 0), 0) : 0, alls: b.length * 3, bordLokid: p ? b.filter(x => (p.stjornur[x.id] || 0) > 0).length : 0, bord: b.length };
  },
  /** fyrsta borð hvers heims er alltaf opið; borð n opnast þegar borð n-1 í sama heimi hefur ≥1 stjörnu */
  opid(bordId) {
    const i = BORD.findIndex(b => b.id === bordId);
    if (i < 0) return false;
    const b = BORD[i];
    const fyrra = BORD.slice(0, i).reverse().find(x => x.heimur === b.heimur);
    if (!fyrra) return true;
    return this.stjornur(fyrra.id) > 0;
  },
  /** næsta borð sem á að spila: fyrsta opna borðið án stjörnu, annars fyrsta borðið */
  naestaBord() {
    const p = virkurProfill();
    const opin = BORD.filter(b => this.opid(b.id));
    const ospilad = opin.find(b => !(p && p.stjornur[b.id]));
    return ospilad || (p && p.sidast && BORD.find(b => b.id === p.sidast)) || BORD[0];
  },
  naestaEftir(bordId) {
    const i = BORD.findIndex(b => b.id === bordId);
    return i >= 0 && i < BORD.length - 1 ? BORD[i + 1] : null;
  },

  limmidar() { const p = virkurProfill(); return p ? p.limmidar.slice() : []; },
  baetaLimmida(e) { const p = virkurProfill(); if (!p || !e || p.limmidar.includes(e)) return false; p.limmidar.push(e); vista(); return true; },

  /** skrá eitt svar: {leikur, rett:boolean, stafur?:string} */
  skra({ leikur, rett, stafur }) {
    const p = virkurProfill(); if (!p) return;
    const t = p.tolfraedi;
    t.svor = (t.svor || 0) + 1; if (rett) t.rett = (t.rett || 0) + 1;
    if (leikur) { const l = t.leikir[leikur] = t.leikir[leikur] || { r: 0, v: 0 }; if (rett) l.r++; else l.v++; }
    if (stafur && typeof stafur === 'string' && stafur.length <= 2) {
      const s = stafur.toLowerCase(); const st = t.stafir[s] = t.stafir[s] || { r: 0, v: 0 }; if (rett) st.r++; else st.v++;
    }
    /* vistað þegar borði lýkur (lokaBordi) eða hér ef sjaldgæft */
    if (t.svor % 5 === 0) vista();
  },
  /** kallað þegar borði/umferð lýkur: bætir við tíma og fjölda spilana */
  lokaBordi({ ms }) {
    const p = virkurProfill(); if (!p) return;
    p.tolfraedi.timiMs = (p.tolfraedi.timiMs || 0) + Math.max(0, ms | 0);
    p.tolfraedi.spilad = (p.tolfraedi.spilad || 0) + 1;
    p.sidastSpilad = Date.now();
    vista();
  },
  tolfraedi(id) {
    const g = hlada(); const p = id ? g.profilar.find(x => x.id === id) : virkurProfill();
    if (!p) return null;
    const t = p.tolfraedi;
    const stafir = Object.entries(t.stafir).map(([s, v]) => ({ stafur: s, r: v.r, v: v.v, hlutfall: (v.r + v.v) ? v.r / (v.r + v.v) : 1 }));
    const erfidir = stafir.filter(x => x.r + x.v >= 3).sort((a, b) => a.hlutfall - b.hlutfall).slice(0, 6);
    return {
      stjornurAlls: Object.values(p.stjornur).reduce((a, b) => a + b, 0),
      bordLokid: Object.values(p.stjornur).filter(n => n > 0).length,
      bordAlls: BORD.length,
      timiMin: Math.round((t.timiMs || 0) / 60000),
      spilad: t.spilad || 0, svor: t.svor || 0, rett: t.rett || 0,
      leikir: t.leikir, stafir, erfidir, limmidar: p.limmidar.length,
    };
  },
  nullstilla(id) {
    const g = hlada(); const p = g.profilar.find(x => x.id === id); if (!p) return;
    p.stjornur = {}; p.limmidar = []; p.tolfraedi = tomTolfraedi(); p.sidast = null; vista();
  },
};
