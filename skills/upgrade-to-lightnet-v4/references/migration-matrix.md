# LightNet v4 Migration Matrix

Use this matrix after running `scripts/scan-project.mjs` against the target LightNet site repo.

| Migration item | Mode | Tool or action | Notes |
| --- | --- | --- | --- |
| Upgrade `astro` to v6 | manual | `scripts/update-package-json.mjs` plus Astro follow-up | The script only updates `package.json`. You still need to review Astro v6 follow-up changes in the target repo. |
| Remove `@astrojs/tailwind` | auto | `scripts/update-package-json.mjs` | Review leftover Tailwind config manually if the target repo customized it. |
| Review DaisyUI config and markup | manual | Agent-led edit | Treat this as a manual design-system decision. Keep DaisyUI with explicit config, replace it with site-owned component styles, or replace it with another design-system primitive. |
| Replace Decap admin with Sveltia admin | manual | Agent-led config rewrite plus `scripts/update-package-json.mjs` | Package updates are scriptable; Astro integration rewrites are not. |
| Remove `imagesFolder` option | mixed | Agent-led config rewrite plus `scripts/migrate-images-folder.mjs` | The script handles folder and JSON-path changes. Remove the obsolete option manually in `astro.config.*`. |
| Convert config inline translations to locale maps | manual | Agent-led config edits | Review `title`, `logo.alt`, `mainMenu[].label`, and `languages[].label` in `astro.config.*` and convert plain strings or translation-key strings to inline locale maps. |
| Move locale access to `Astro.locals.i18n.currentLocale` | manual | Agent-led source edits | The correct rewrite depends on the surrounding code. |
| Convert content label strings to locale maps | auto | `scripts/migrate-content-labels.mjs --default-locale <code>` | The script only touches supported JSON content collections. Its inspection uses the real default locale when it can derive one from `astro.config.*`, otherwise it warns that the result is locale-agnostic until `--default-locale <code>` is supplied. |
| Replace direct label-map reads with `tMap(...)` | manual | Agent-led source edits | Review code that reads migrated fields like `collection.data.label` directly and switch those reads to `Astro.locals.i18n.tMap(...)`. |
| Remove legacy `x.` prefixes from custom translation keys | verify | Manual review | Detect old prefixed custom keys, rename them consistently, update call sites, and delete obsolete translation entries after the migration. |
| Add `type` to media `content` entries | auto | `scripts/migrate-media-content-types.mjs` | The script infers `link` for `http/https` URLs and `upload` otherwise. |
| Move collection membership into `media-collections[].mediaItems` | auto | `scripts/migrate-media-collections.mjs` | The script stops if a referenced collection file is missing. |
| Move `detailsPage.coverStyle` to `coverImageStyle` | auto | `scripts/migrate-cover-image-style.mjs` | The script stops on conflicting values. |
| `commonId` becomes optional | verify | Manual review | No file rewrite is required. Only confirm the target site's expectations. |
| Rename `MediaGallerySection` props | manual | Agent-led source edits | Usage varies too much to rewrite generically. Old content-like `layout` values now map to `itemWidth`, and old `viewLayout` values now map to `layout` (`grid` or `carousel`). |
| Replace `mdi--` icons with Lucide names | mixed | `scripts/migrate-lucide-icons.mjs` plus manual review | The script only replaces known mappings and leaves every other `mdi--*` icon unchanged for manual review. |

Known scripted icon mappings:

- `mdi--book-open-blank-variant` -> `lucide--book-open-text`
- `mdi--video-outline` -> `lucide--video`
- `mdi--file-document-box-outline` -> `lucide--file-text`
- `mdi--headphones` -> `lucide--headphones`
- `mdi--fountain-pen-tip` -> `lucide--pen-tool`

Final verification after the scripted and manual passes:

- grep for remaining `mdi--`
- grep for remaining `viewLayout`
- grep for old gallery layout values like `book`, `video`, `portrait`, and `landscape`
- grep for remaining `./_images/`
