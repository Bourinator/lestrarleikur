/* Hleður allar leikjaeiningar. Dýnamísk hleðsla svo villa í einum leik felli ekki allan leikinn:
   gallaður leikur lendir í VILLUR og birtist sem „í vinnslu“ á kortinu í stað þess að skjárinn verði auður. */
export const LEIKJA_ID = [
  /* lestur */
  'eins-stafur', 'fyrsti-stafur', 'hljoda-saman', 'stafa-ord', 'finna-mynd', 'rada-stofum', 'atkvaedi', 'rim',
  'ordid-vantar', 'lesa-setningu', 'rada-ordum', 'stafrofid', 'hradi',
  /* reikningur */
  'telja', 'fleiri-faerri', 'plus-minus', 'sagan',
];

export const LEIKIR = {};
export const VILLUR = {};

export async function hladaLeikjum() {
  const skil = await Promise.allSettled(LEIKJA_ID.map(id => import(`./${id}.js`)));
  skil.forEach((r, i) => {
    const id = LEIKJA_ID[i];
    if (r.status === 'fulfilled' && r.value && r.value.default && typeof r.value.default.umferd === 'function') {
      LEIKIR[id] = r.value.default;
      if (LEIKIR[id].id !== id) console.warn('Leikur', id, 'hefur annað id:', LEIKIR[id].id);
    } else {
      VILLUR[id] = r.status === 'rejected' ? String(r.reason && r.reason.message || r.reason) : 'Einingin er ekki gild leikjaeining';
      console.error('Leikur hlóðst ekki:', id, VILLUR[id]);
    }
  });
  return LEIKIR;
}
