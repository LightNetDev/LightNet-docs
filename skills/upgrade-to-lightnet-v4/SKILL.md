---
name: upgrade-to-lightnet-v4
description: Upgrade an existing downstream LightNet site repository to LightNet v4 and `@lightnet/sveltia-admin` v4. Use when a coding agent needs to audit a consumer LightNet site repo, run safe migration scripts against that target project, complete the remaining manual Astro/config/code changes, and verify the upgrade. This skill is distributed from the docs repo but should be used on a separate LightNet site repository, not on the docs repo itself.
---

# Upgrade To LightNet V4

Upgrade a downstream LightNet site repo to LightNet v4 in two passes: run the safe deterministic scripts first, then finish the project-specific source and config edits manually.

## Quick Start

1. Work against the target LightNet site repo, not this docs repo.
2. Run `node <skill-dir>/scripts/scan-project.mjs --project /absolute/path/to/site`.
3. Run only the migration scripts the scanner reports, preferably with `--dry-run` first.
4. Complete the manual migrations listed in [references/migration-matrix.md](references/migration-matrix.md).
5. Run the target repo's install, build, and test commands to verify the upgrade.

If you are already inside the target repo, you can omit `--project` and let the scripts use the current working directory.

## Workflow

### 1. Audit the target project

Start with:

```bash
node <skill-dir>/scripts/scan-project.mjs --project /path/to/lightnet-site
```

Use `--json` when another tool needs structured output.

The scanner looks for:

- package dependencies such as `lightnet`, `@lightnet/sveltia-admin`, `@lightnet/decap-admin`, and `@astrojs/tailwind`
- `astro.config.*`
- `src/content/**`
- legacy code patterns such as `Astro.currentLocale`, direct reads of inline locale maps that should move to `Astro.locals.i18n.tMap(...)`, Decap admin imports, old `MediaGallerySection` props, DaisyUI config and markup usage, legacy `x.`-prefixed custom translation keys, and `mdi--` icons

### 2. Run the safe deterministic scripts

Use these scripts only on the target LightNet site repo:

- `scripts/update-package-json.mjs`
  Bump `lightnet`, `astro`, and `@lightnet/sveltia-admin` package versions, remove `@lightnet/decap-admin`, and remove `@astrojs/tailwind`.
- `scripts/migrate-images-folder.mjs`
  Rename `src/content/media/_images` to `src/content/media/images` and rewrite `./_images/` references inside media JSON files.
- `scripts/migrate-media-content-types.mjs`
  Add `content[].type` as `upload` or `link`.
- `scripts/migrate-media-collections.mjs`
  Move legacy `media[].collections` membership into `media-collections[].mediaItems`.
- `scripts/migrate-cover-image-style.mjs`
  Move `detailsPage.coverStyle` to top-level `coverImageStyle`.
- `scripts/migrate-content-labels.mjs --default-locale <code>`
  Convert string label fields in JSON content collections to inline locale maps for the chosen default locale. The inspection step derives the default locale from `astro.config.*` when possible. The script skips `x.*` and `ln.*` translation-key strings and reports them for manual follow-up.
- `scripts/migrate-lucide-icons.mjs`
  Replace only these known Material Design icon ids with Lucide equivalents in real project files, then leave every other `mdi--*` icon untouched for manual mapping:
  `mdi--book-open-blank-variant` -> `lucide--book-open-text`,
  `mdi--video-outline` -> `lucide--video`,
  `mdi--file-document-box-outline` -> `lucide--file-text`,
  `mdi--headphones` -> `lucide--headphones`,
  `mdi--fountain-pen-tip` -> `lucide--pen-tool`.

Use `--dry-run` before mutating commands when you want a preview.

### 3. Finish the manual migrations

Keep these steps agent-led because they vary between site repos:

- Convert inline translation-capable config fields in `astro.config.*` such as `title`, `logo.alt`, `mainMenu[].label`, and `languages[].label` from strings or translation-key strings to locale maps.
- Rewrite the admin integration from Decap to `lightnetSveltiaAdmin(...)`, then remove obsolete `languages` and `imagesFolder` options.
- Update locale access from `Astro.currentLocale` to `Astro.locals.i18n.currentLocale`.
- Replace direct reads of migrated inline label maps with `Astro.locals.i18n.tMap(...)`.
- Review legacy custom translation keys that still use the `x.` prefix, rename them consistently, and remove obsolete translation entries after the migration.
- Review DaisyUI configuration and DaisyUI-style markup separately. This is a manual design-system decision: keep DaisyUI with explicit config, replace it with site-owned component styles, or replace it with another design-system primitive.
- Update `MediaGallerySection` usage from the old layout props to `itemWidth` and the new `layout` prop. Old content-like `layout` values such as `video`, `book`, `portrait`, and `landscape` now map to `itemWidth`, while old `viewLayout` values map to `layout`.
- Review any remaining `mdi--*` icon ids that are not in the known mapping list and map them to appropriate Lucide names yourself.

Use [references/migration-matrix.md](references/migration-matrix.md) while doing this pass.

### 4. Verify the target repo

After the migration:

- run the target repo's package-manager install command if `package.json` changed
- run the target repo's build and test commands
- smoke-test the administration UI if the site uses it
- review any scanner warnings or skipped translation-key labels before closing the task
- run final grep-style verification for remaining `mdi--`, `viewLayout`, old gallery layout values (`book`, `video`, `portrait`, `landscape`), and `./_images/`

## Guardrails

- Fail fast if the target project does not look like a LightNet site.
- Prefer `--project` when the current working directory is not the target repo.
- Do not run these scripts against this docs repo unless you are explicitly testing the skill itself.
- Treat script blockers as stop conditions. Resolve them before continuing with other migrations.
