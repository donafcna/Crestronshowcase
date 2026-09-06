/* Service worker — Crestron GUI Showcase (outil démo marketing)
 * Stratégie simple et sûre :
 *  - network-first pour les documents et le bundle (toujours à jour en ligne)
 *  - network-first aussi pour les projets CH5 embarqués (/showcases/)
 *  - cache-first pour les assets statiques locaux (icônes, svg, images)
 *  - jamais de cache pour les vidéos et hôtes externes (mixkit, unsplash)
 */
const CACHE_NAME = "ftv-showcase-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(["/", "/manifest.webmanifest", "/icons/icon-192.png"])
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Never touch cross-origin requests (videos, unsplash thumbnails, fonts…)
  if (url.origin !== self.location.origin) return;

  // Never cache videos
  if (url.pathname.startsWith("/videos/")) return;

  const isDocument = req.mode === "navigate";
  const isBundle = url.pathname.startsWith("/assets/") && url.pathname.endsWith(".js");
  // Les projets CH5 embarqués évoluent (HTML + JS + config) : toujours réseau d'abord,
  // sinon un ancien config.js / local-feedback.js en cache casse la nouvelle page.
  const isShowcase = url.pathname.startsWith("/showcases/");

  if (isDocument || isBundle || isShowcase) {
    // Network-first: fresh when online, cached fallback offline
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match("/")))
    );
    return;
  }

  // Cache-first for other same-origin static assets
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
    )
  );
});
