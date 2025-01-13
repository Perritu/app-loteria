/**
 * Service worker. Install and cache the app shell.
 */
const CACHE = 'dev.angelgarcia.loteria-v1'

/**
 * Install bootstrap.
 */
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE).then(async function (CACHE) {
      // Purge cache (if any)
      await CACHE.keys().then(keys => {
        for(const key of keys) {
          CACHE.delete(key)
        }
      })

      // assets to cache
      let assets = [
        '/app/',
        '/app/app.css',
        '/app/app.js',
        '/app/cards-generic.svg',
        '/app/libs/font-awesome/css/all.min.css',
        '/app/libs/font-awesome/webfonts/fa-brands-400.ttf',
        '/app/libs/font-awesome/webfonts/fa-brands-400.woff2',
        '/app/libs/font-awesome/webfonts/fa-regular-400.ttf',
        '/app/libs/font-awesome/webfonts/fa-regular-400.woff2',
        '/app/libs/font-awesome/webfonts/fa-solid-900.ttf',
        '/app/libs/font-awesome/webfonts/fa-solid-900.woff2',
        '/app/libs/font-awesome/webfonts/fa-v4compatibility.ttf',
        '/app/libs/font-awesome/webfonts/fa-v4compatibility.woff2',
        '/app/libs/gwfh/fira-mono-v14-latin-regular.woff2',
        '/app/libs/gwfh/fira-sans-v17-latin-regular.woff2',
        '/app/libs/jQuery/jquery-3.7.1.slim.min.js',
        '/app/libs/materializecss/materialize.min.css',
        '/app/libs/materializecss/materialize.min.js',
      ]

      const Decks = await fetch('/app/decks/decks.json').then(res => res.json()),
        DeckIds = Object.keys(Decks)

      for (const id of DeckIds) {
        const Deck = Decks[id]
        // const BasePath = `/app/decks/clemente/1.gallo.webp
        const BasePath = `/app/decks/${Deck.path}/`
        for (const CardImage of Object.values(Deck.cards)) {
          assets.push(BasePath + CardImage)
        }
      }

      await CACHE.addAll(assets)
    })
  )
})

/**
 * Cache intercept.
 */
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(res => {
      return res || fetch(evt.request)
    })
  )
})
