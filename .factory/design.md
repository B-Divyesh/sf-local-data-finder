# Local Data Finder — visual thesis

## Direction: luminous glass data landscape

Personal archives are usually presented as a file tree or an opaque chat box. Local Data Finder instead treats an archive as a dark, navigable landscape: source records are solid glass strata, extraction paths are fine luminous threads, and the search field is a focused beam across them. The atmosphere makes a large, private corpus feel explorable without implying that an AI understands it. Decoration appears only in the landing-page hero and small evidence-line motifs; the working app gives priority to filenames, snippets, dates, and paths.

## Palette

| Token | Dark | Light | Purpose |
| --- | --- | --- | --- |
| `--ink` | `#071014` | `#F3F8F7` | page field, like an unlit archive |
| `--surface` | `#0F2024` | `#FFFFFF` | glass strata and controls |
| `--surface-raised` | `#173038` | `#E7F0EE` | selected and nested regions |
| `--text` | `#F2F9F7` | `#102126` | primary copy |
| `--muted` | `#A7BCB8` | `#506A69` | metadata (minimum 4.5:1) |
| `--beam` | `#64FFD1` | `#006C58` | search, focus, active source |
| `--violet` | `#B9A8FF` | `#6346C7` | evidence/extraction timestamps |
| `--success` | `#72E6A5` | `#147A48` | indexed/current |
| `--warning` | `#FFD37A` | `#8B5600` | stale/skipped |
| `--danger` | `#FF8C91` | `#A52D38` | parser/index failures |

Dark is the authored treatment and default because the luminous paths need a deep field. Light is a complete utilitarian treatment, available from the theme control and OS preference. Color never carries status alone; every state has text and/or an icon.

## Typography

- Interface and prose: `Inter`-compatible system sans (`ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`), 16px minimum. No font download or runtime CDN.
- Paths, counts, extensions, and timestamps: `ui-monospace, "SFMono-Regular", Consolas, monospace`, with tabular figures.
- Scale: 14 metadata, 16 body, 20 section, 28 page, clamp(40–68) landing display. One `h1` per document; 60–72ch reading measure.

## Spacing and shape

An 8px base rhythm (4px only for optical adjustment): 8 / 16 / 24 / 32 / 48 / 64. Working surfaces use 14px corners; the primary search beam uses a 20px corner; pills use full rounding only for true filters. Hairline borders are translucent cyan-grey, never generic neutral card grids. Controls and hit areas are at least 44px.

## Interaction grammar

- Search is the visual and keyboard center (`/` or `Ctrl/Cmd+K`). Results appear as stacked evidence strata rather than floating cards.
- Selecting a result illuminates its source trail and reveals actions in place. `Enter` opens; arrow keys move through results; `Esc` clears/returns.
- Indexing progresses from the source row toward the corpus count. Failures stay attached to their source with a plain-language remedy.
- The mobile layout drops the persistent source rail, replacing it with an explicit Sources sheet; result metadata stacks before any text is truncated.

## Motion policy

UI transitions last 160–240ms and animate only opacity/transform: search focus brightens, new results settle downward from the query field, and the source panel enters from its actual edge. There are no ambient loops. Under `prefers-reduced-motion: reduce`, movement and smooth scrolling are removed and state changes are immediate; depth remains through borders, shadow, scale, and contrast.

## Asset plan and provenance

- `assets/src/archive-landscape.png`: original generated landing illustration: abstract translucent archive plates, local file fragments, and one luminous retrieval thread. No people, brands, screens, legible text, logos, or watermark.
- Optimized responsive derivatives ship as AVIF/WebP (desktop and mobile crop), each with dimensions and the mobile hero below 300 KB.
- `public/assets/local-data-finder-social.jpg`: a dedicated 1200×630, 102 KB editorial crop derived from the inspected original archive illustration for Open Graph and Twitter previews; it retains the mint source trail and contains no text or third-party marks. `public/apple-touch-icon.png` is a 180×180 PNG rasterization of the hand-authored product mark for Apple touch surfaces.
- Product mark and UI icons are hand-authored SVG strokes derived from a search beam passing through three archive layers.

### Prompt sheet

**Use case:** stylized-concept. **Subject:** an abstract private archive landscape formed from horizontal translucent glass strata and small paper-like data fragments, connected by one precise mint retrieval beam that terminates at a highlighted source record. **World/materials:** smoked glass, etched edges, subtle paper fibers, fine dust, no literal cloud. **Light:** low-key cinematic internal glow with focused mint and violet refraction. **Lens/composition:** wide 3:2 editorial still life, landscape concentrated on the right with calm negative space on the left, gentle isometric depth. **Palette words:** midnight teal, mineral black, luminous mint, quiet lavender, warm evidence amber. **Negative list:** people, faces, hands, brands, copyrighted characters, UI screenshots, readable text, letters, logos, watermark, generic gradient, neon cyberpunk city, circuit boards, padlocks, robots.

Generation: Azure AI Foundry factory image model via `/opt/fleet/lib/gen-image.sh`, 2026-08-28. Generated imagery is original to this product. Final candidate is visually inspected for stray text, marks, misleading UI, and composition before use.

Visitor disclosure: every public footer says, “The landing artwork was generated for this product.”

The three landing-page walkthrough frames (`public/assets/walkthrough-01-start.png`, `walkthrough-02-sample.png`, and `walkthrough-03-result.png`) are original screenshots captured from the local desktop UI using `scripts/capture-walkthrough.mjs` on 2026-09-01. They show the actual first-run, bundled sample, and source-result states; each is captioned in nearby HTML, so no required text is baked into the image.
