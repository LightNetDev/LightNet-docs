# Repository instructions

## Project

- This is an Starlight/Astro documentation site.
- Use `pnpm` for package management.
- Documentation pages live in `src/content/docs/`.
- All documentation pages use `.mdx`; non-MDX files in the docs tree are assets such as images.
- LightNet's three main lifecycle stages are Plan, Build, and Run. Organize documentation around these stages.

## Documentation audiences and roles

- The site has two documentation sections for different audiences and roles: Developer Documentation for Site Administrators, and Ministry Documentation for Ministries and Content Administrators.
- Ministry Documentation is written for a primarily non-technical Ministry reader who makes project decisions and approves purchases and subscriptions.
- A Content Administrator manages and uploads Content through the Administration UI. This reader may be somewhat technically comfortable, but is not expected to be a software developer.
- A Site Administrator is the software developer responsible for the technical setup and operation of a LightNet Site. The [setup checklist](https://docs.lightnet.community/start-here/setup-checklist/#how-to-use-the-checklist) describes this role and the skills and responsibilities involved.

## Editing content

- Preserve the existing frontmatter format.
- Use sentence case for headings: capitalize the first word, proper names, and canonical
  Glossary terms; lowercase other words. For example, use `Media Item details page`,
  `Language selection menu`, and `Site Language`.
- Preserve the project's terminology, but apply the domain terminology and capitalization
  rules below consistently. Glossary entry headings should use the canonical capitalization
  of the defined term.
- For the most important terms in Ministry Documentation, refer to the [Glossary](/ministry/resources/glossary), including `Ministry`, `Content`, `LightNet Site`, and `Administration UI`.
- Use site-relative links such as `/ministry/...`.
- Introduce concepts for non-technical Ministry readers with plain definitions and concrete examples. Keep implementation details such as `commonId`, GitHub, Cloudflare, and deployment mechanics in Developer Documentation unless they are essential to the Ministry reader's decision.
- Keep claims about prices, performance, hosting, and security consistent with the existing documentation.

## Domain terminology and capitalization

- Lowercase ordinary domain concepts in prose, even when they are defined in the Glossary. Examples include `ministry`, `content`, `media item`, `media library`, `media type`, `media collection`, `user`, `author`, `site language`, and `content language`.
- Capitalize proper names, product names, and official component names, including `LightNet`, `MediaWorks`, and `Administration UI`.
- Use bold only when first introducing or defining a domain concept for the intended audience. Do not re-bold terms that were already introduced earlier in the documentation flow.
- For official page and UI component names, bold the first explanatory use when it introduces the component in context. Do not bold names in headings, navigation lists, diagrams, or later references.
- Use Markdown backticks only for literal technical identifiers such as types, variables, properties, filenames, and commands.
- Glossary headings may retain canonical capitalization as labels, but glossary definitions and later prose references follow the lowercase domain-term rules.
- On the Glossary page, capitalize and bold each defined term so readers can recognize the shared vocabulary. Link the first use of related Glossary terms in each definition to their entries. Do not link a defined term to its own entry.
- Do not infer capitalization from a Glossary entry alone. Determine whether a term is a proper name, official component name, technical identifier, or ordinary domain concept.
- When reviewing terminology for the production Ministry site, skip pages with `draft: true` unless explicitly asked to include them.

## Verification

- CI runs CSpell against the repository using the configuration in `cspell.json`.
- Do not run CSpell locally during documentation tasks; rely on CI to report spelling issues.
- When CSpell reports a legitimate project-specific term, add the lowercase spelling to the `words` array in `cspell.json` rather than ignoring the file or disabling the check.
- Never run `pnpm build`.
- Ask the user to run `pnpm build` manually instead.
- Run only targeted checks that do not invoke `pnpm build`.

## Git

- Before making any edits, check the current branch with `git branch --show-current`.
- Use lowercase kebab-case for feature branch names. Do not use `/`; prefix new branches with `codex-` (for example, `codex-update-ministry-docs`).
- Ask the user to create branches; do not create branches yourself.
- Do not reset, discard, or overwrite unrelated user changes.
