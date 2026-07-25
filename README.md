# spears.network — interactive terminal (Hugo)

A modern, minimal, interactive-terminal site built with **Hugo**. Hybrid navigation
(type real shell commands *or* click), refined mono-dark theme, sticky always-visible
terminal, and window controls (red = home, yellow = hide terminal, green = full width).
URLs match the previous site 1:1 so existing public links keep working.

## Develop
```sh
hugo server
# http://localhost:1313
```

## Build
```sh
hugo --gc --minify   # output in ./public
```

## Deploy to Netlify
Push this folder to a Git repo and connect it in Netlify. Settings are already in
`netlify.toml` (build `hugo --gc --minify`, publish `public`, pinned `HUGO_VERSION`).
No other configuration needed.

## Structure
- `content/` — your markdown (posts, apps, about, links). Home text/params in `_index.md`.
- `layouts/` — the terminal theme: `_default/baseof|list|single`, `index.html`,
  `404.html`, `partials/head.html` + `partials/dock.html`, `shortcodes/youtube.html`.
- `static/assets/` — `style.css` and `app.js` (the terminal engine), served at `/assets/`.
- `hugo.toml` — title, nav menu, ASCII logo, markup settings.

## Editing
- **Menu:** `hugo.toml` → `[[params.navlinks]]`.
- **Home card / intro:** `content/_index.md` front-matter params + body.
- **New post:** `hugo new posts/my-title.md`. The filename becomes the URL slug.
- **Terminal commands / styling:** `static/assets/app.js` and `static/assets/style.css`.

## Apps directory
`/apps/` is a showcase of your iOS apps, built **additively** — the existing
`/apps/<app>-privacy/` and `/apps/<app>-support/` URLs (the ones linked from the App
Store) are never touched. Each app has a hub page at a new slug like `/apps/dns-forge/`.

Each hub lives in one file, e.g. `content/apps/dns-forge.md`. To finish them:

- **App Store link:** set `appstore = "https://apps.apple.com/…"` in the front matter.
  While it's empty, the download badge is simply hidden.
- **Icon:** drop a PNG in `static/apps/img/` and set `icon = "/apps/img/dns-forge.png"`.
  Until then a clean lettered glyph (`glyph = "DF"`) is used.
- **Screenshots:** add files to `static/apps/img/` and list them under
  `screenshots = ["/apps/img/dns-forge-1.png", …]` to get a scrolling gallery.
- **Copy:** edit `tagline`, `features`, and the body text.

The terminal knows the apps too: `apps`, `ls apps`, and `open dns-forge` all work, and
`open dns-forge-support` still resolves the legal pages.

## The `privacy` command
Typing `privacy` in the terminal shows a panel of everything a site passively detects —
browser, OS, screen, GPU (WebGL), timezone/region, connection, Do Not Track, and more —
all computed in the browser and sent nowhere.

The one value that can't come from the browser alone is your **public IP**, so it's read
from your own connection by a first-party Netlify function (`netlify/functions/ip.mjs`) —
no third-party API, no geolocation lookup, nothing logged. Under `hugo server` the IP line
shows "unavailable in local preview"; to test it end-to-end locally, run `netlify dev`
instead (Netlify CLI), or just deploy.
