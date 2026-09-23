# Penida studio website

Faithful reconstruction of penida.io, retaining its visual assets, typography, layout and background animations. Production domain: https://penida.io. Static HTML site deployable to Cloudflare Pages.

## Run locally

Install from the committed npm lockfile, then run `npm run build` and `npm run dev`. The preview is available at http://localhost:4197.

## Build and content

- `build.mjs` creates complete HTML for the homepage, three articles, four legal pages, `/ai` and `/llms`. React renders the homepage at build time; hydration preserves its existing menu, tooltip, review easter egg and chat actions. Reading the main content never requires JavaScript.
- `source/app.js` preserves the original homepage components. `source/original.bundle.js` and `source/original.css` are retained reference inputs.
- `source/articles/*.md` is the source of the updated articles; `source/articles.json` contains their card metadata. The originals’ titles and routes remain unchanged.
- `source/legal.json` supplies the website policies. Product-specific policies are linked, without descriptions of each app’s corporate structure.
- Goat Badges and Bee Logo Showcase were sold. Their old policy URLs contain neutral retirement notices, are marked noindex and are excluded from the sitemap and navigation. No buyer or destination policy has been invented. Beez is a distinct bundle/subscription product and remains featured.
- `source/ai.md` contains the studio reference; `source/llms.md` explains available machine-readable formats. The build publishes `/llms.txt`, `/llms-full.txt`, and ten Markdown page equivalents with discoverable alternate links.
- No JSON-LD or other structured data was added. The original homepage positioning, heading and metadata remain unchanged.

## Images and fonts

All 26 original image assets are preserved in `source/media`; no new illustration was necessary. `optimize-assets.mjs` creates responsive WebP versions and retains SVG logos. Images below the fold load lazily, with dimensions to reserve their layout space.

At the largest available responsive size, the combined original image assets decreased from 4,743,098 bytes to approximately 556 KB (about 88%). Actual transfers depend on viewport and device pixel ratio. WOFF2 fonts with Latin and Latin Extended subsets total 196,848 bytes compared with 1,534,016 bytes of original TTF files (about 87%). Inter font files are reused across weights.

The logo marquee uses two identical 1,280 px groups and translates by exactly one group per cycle. Transparent edge masks replace the colored overlays that caused the rectangular patch. The existing hover pause and reduced-motion behavior remain available; other hero animations are unchanged.

## Chat

`source/enhancements.js` installs the exact requested Orka widget with app ID `677985e822ee3fdf7f2a2366`. It automatically loads `https://widget.orka.chat/app.js` once per page. There is no custom launcher or lazy-loading shim. Banner and Try now buttons invoke the native Orka API. Website privacy and cookie wording matches automatic loading.

## Cloudflare Pages

See [CLOUDFLARE.md](CLOUDFLARE.md) for the full connection guide in French.

| Setting | Value |
| --- | --- |
| Repository | `charlesmdp/penida` |
| Production branch | `main` |
| Framework preset | None |
| Root directory | Repository root (leave blank) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js | `22.22.3` (committed in `.node-version`) |
| Production environment | `SITE_PUBLIC=1`, `SITE_ORIGIN=https://penida.io` |
| Preview environment | `SITE_PUBLIC=0`, `SITE_ORIGIN=https://penida.io` |

Cloudflare installs dependencies from `package-lock.json`. No API key, database, server function or secret is required for this site. The Orka app ID is a public widget identifier.

For a local production build, run `SITE_PUBLIC=1 SITE_ORIGIN=https://penida.io npm run build`. The committed `dist/` contains that public build. Cloudflare should rebuild it from source on every push. Default builds without `SITE_PUBLIC=1` intentionally generate noindex HTML and a robots disallow rule; set the production variable so the live website can be indexed. Noindex is not an access restriction: use Cloudflare Access if preview pages need to be private.

Canonical URLs, sitemap URLs and machine-readable source links use `SITE_ORIGIN` (default: https://penida.io). Keep it aligned with the final domain. The build excludes the retired-app notices from the sitemap and always marks them noindex.

`llms.txt` follows a community proposal, not a requirement or promise of AI citation. HTML, Markdown and the combined file are generated together. Product features and pricing should be checked on official product pages; reference pages do not assert live counts or ratings.

## Sources and validation

Articles revised September 23, 2026. They link directly to current Shopify documentation for scaffolding, review, privacy, revenue share and review requests. Unsourced performance figures and growth guarantees from the old articles have been replaced by practical guidance and explicitly hypothetical examples. Existing homepage figures and reviews were retained from the original site at the user’s request; they are not independently live-verified.

Publisher identity was checked against the French public company directory: https://annuaire-entreprises.data.gouv.fr/entreprise/penida-880337084 . The actual website’s operational retention periods and full provider list were not supplied; the policies make no invented fixed retention promises.

Verification covers complete HTML content, unique page headings, local links and assets, Markdown equivalents, no schema markup, sold-app cleanup, native chat installation, desktop/mobile layouts and marquee group dimensions. This repository is independent of the original private preview host; Cloudflare only needs the generated `dist/` directory.
