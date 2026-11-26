# Repository instructions

Starlight/Astro documentation site. Pages live in `src/content/docs/` and are all `.mdx`; other files in that tree are assets.

Before editing any page, read `style-guide.md`.

## Audiences

- **Ministry Documentation** is every page in `src/content/docs/ministry/`. **Developer Documentation** is every other page.
- Developer Documentation is for Site Administrators: the software developers who set up and run a LightNet site.
- Ministry Documentation is for ministries, who make project decisions and approve purchases, and for content administrators, who upload content through the Administration UI and aren't expected to be developers.
- Write each page for its audience as described in the "Writing for the reader" section of `style-guide.md`.

## Tasks

- When reviewing terminology, skip pages with `draft: true` unless asked otherwise.
- CI runs CSpell with `cspell.json`; don't run it locally. For a legitimate project term, add its lowercase spelling to `words` instead of disabling the check.
