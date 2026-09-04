/* Þjónustuvirki Stafaleiksins.
   - Öll skrá útgáfunnar er forhlaðin sem EIN heild í skyndiminnið `stafaleikur-<UTGAFA>` (cache-first),
     svo einingar úr ólíkum útgáfum blandist aldrei saman.
   - Aðeins GET-beiðnir af sama uppruna eru meðhöndlaðar; letur og teljari fara beint á netið.
   - Ný útgáfa: hækka UTGAFA hér (og halda SKRAR í samræmi við skrárnar í repo-inu). */
const UTGAFA = 'v2.0.0';
const SKYNDIMINNI = 'stafaleikur-' + UTGAFA;
const SKRAR = [
  './', './index.html', './manifest.webmanifest', './404.html',
  './css/stafaleikur.css',
  './icons/favicon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './apple-touch-icon.png',
  './js/app.js',
  './js/skjair/sameiginlegt.js', './js/skjair/heim.js', './js/skjair/kort.js', './js/skjair/bord.js', './js/skjair/frjals.js', './js/skjair/limmidar.js', './js/skjair/foreldrar.js',
  './js/kjarni/prof.js', './js/kjarni/skraut.js', './js/kjarni/hljod.js', './js/kjarni/stada.js', './js/kjarni/ordaval.js', './js/kjarni/leikjavel.js',
  './js/data/ord.js', './js/data/rim.js', './js/data/setningar.js', './js/data/bord.js',
  './js/leikir/index.js',
  './js/leikir/eins-stafur.js', './js/leikir/fyrsti-stafur.js', './js/leikir/hljoda-saman.js', './js/leikir/stafa-ord.js', './js/leikir/finna-mynd.js',
  './js/leikir/rada-stofum.js', './js/leikir/atkvaedi.js', './js/leikir/rim.js', './js/leikir/ordid-vantar.js',
  './js/leikir/lesa-setningu.js', './js/leikir/rada-ordum.js', './js/leikir/stafrofid.js', './js/leikir/hradi.js',
  './js/leikir/telja.js', './js/leikir/fleiri-faerri.js', './js/leikir/plus-minus.js', './js/leikir/sagan.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SKYNDIMINNI)
      .then(c => c.addAll(SKRAR.map(s => new Request(s, { cache: 'reload' }))))
      .catch(err => { console.warn('SW: forhleðsla mistókst', err); })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(lyklar => Promise.all(lyklar.filter(k => k.startsWith('stafaleikur-') && k !== SKYNDIMINNI).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.tegund === 'virkja') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;          /* letur, teljari o.s.frv. fara beint á netið */

  /* leiðsögn (opna síðuna): skila index.html úr skyndiminni, uppfæra í bakgrunni */
  if (req.mode === 'navigate') {
    e.respondWith(
      caches.match('./index.html', { cacheName: SKYNDIMINNI, ignoreSearch: true })
        .then(svar => {
          const net = fetch(req).then(n => { if (n && n.ok) caches.open(SKYNDIMINNI).then(c => c.put('./index.html', n.clone())).catch(() => {}); return n; }).catch(() => null);
          return svar || net.then(n => n || new Response('<h1>Stafaleikur</h1><p>Ekkert netsamband.</p>', { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }));
        })
    );
    return;
  }

  e.respondWith(
    caches.match(req, { cacheName: SKYNDIMINNI, ignoreSearch: true }).then(svar => {
      if (svar) return svar;
      return fetch(req).then(n => {
        /* skrár sem ekki voru í listanum (t.d. nýr leikur) — geyma þær líka */
        if (n && n.ok && n.type === 'basic') caches.open(SKYNDIMINNI).then(c => c.put(req, n.clone())).catch(() => {});
        return n;
      }).catch(() => new Response('', { status: 503, statusText: 'Ekkert netsamband' }));
    })
  );
});
