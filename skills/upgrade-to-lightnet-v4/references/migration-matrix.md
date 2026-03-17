# LightNet v4 Migration Matrix

Use this matrix after running `scripts/scan-project.mjs` against the target LightNet site repo.

| Migration item | Mode | Tool or action | Notes |
| --- | --- | --- | --- |
| Upgrade `astro` to v6 | manual | `scripts/update-package-json.mjs` plus Astro follow-up | The script only updates `package.json`. You still need to review Astro v6 follow-up changes in the target repo. |
| Remove `@astrojs/tailwind` | auto | `scripts/update-package-json.mjs` | Review leftover Tailwind config manually if the target repo customized it. |
| Reconfigure DaisyUI | manual | Agent-led edit | Only needed when the target repo still uses DaisyUI classes or plugin config. |
| Replace Decap admin with Sveltia admin | manual | Agent-led config rewrite plus `scripts/update-package-json.mjs` | Package updates are scriptable; Astro integration rewrites are not. |
| Remove `imagesFolder` option | mixed | Agent-led config rewrite plus `scripts/migrate-images-folder.mjs` | The script handles folder and JSON-path changes. Remove the obsolete option manually in `astro.config.*`. |
| Replace `languages` with `siteLanguages` and language entries | manual | Agent-led config and content edits | Create `src/content/languages/*.json` entries manually for the target site. |
| Move locale access to `Astro.locals.i18n.currentLocale` | manual | Agent-led source edits | The correct rewrite depends on the surrounding code. |
| Convert content label strings to locale maps | auto | `scripts/migrate-content-labels.mjs --default-locale <code>` | The script only touches supported JSON content collections and skips `x.*` and `ln.*` strings. |
| Convert config label strings to locale maps | manual | Agent-led config edits | `astro.config.*` is too variable to rewrite safely with a generic script. |
| Drop the `x.` prefix from custom translation keys | verify | Manual review | Only update keys when the target site still depends on the old prefix. |
| Add `type` to media `content` entries | auto | `scripts/migrate-media-content-types.mjs` | The script infers `link` for `http/https` URLs and `upload` otherwise. |
| Move collection membership into `media-collections[].mediaItems` | auto | `scripts/migrate-media-collections.mjs` | The script stops if a referenced collection file is missing. |
| Move `detailsPage.coverStyle` to `coverImageStyle` | auto | `scripts/migrate-cover-image-style.mjs` | The script stops on conflicting values. |
| `commonId` becomes optional | verify | Manual review | No file rewrite is required. Only confirm the target site's expectations. |
| Rename `MediaGallerySection` props | manual | Agent-led source edits | Usage varies too much to rewrite generically. |
| Replace `mdi--` icons with Lucide names | mixed | `scripts/migrate-lucide-icons.mjs` plus manual review | The script only replaces known mappings and leaves every other `mdi--*` icon unchanged for manual review. |

Known scripted icon mappings:

- `mdi--book-open-blank-variant` -> `lucide--book-open-text`
- `mdi--video-outline` -> `lucide--video`
- `mdi--file-document-box-outline` -> `lucide--file-text`
- `mdi--headphones` -> `lucide--headphones`
- `mdi--fountain-pen-tip` -> `lucide--pen-tool`
