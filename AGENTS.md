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
- A Site Administrator is the software developer who configures and deploys a LightNet Site. The [setup checklist](https://docs.lightnet.community/start-here/setup-checklist/#how-to-use-the-checklist) describes this role and the skills and responsibilities involved.

## Editing content

- Preserve the existing frontmatter format.
- Use sentence case for headings.
- Use the project's existing terminology and capitalization.
- For the most important terms in Ministry Documentation, refer to the [Glossary](/ministry-docs/resources/glossary), including `Ministry`, `Content`, `LightNet Site`, and `Administration UI`.
- Use site-relative links such as `/ministry-docs/...`.
- Keep claims about prices, performance, hosting, and security consistent with the existing documentation.

## Verification

- Never run `pnpm build`.
- Ask the user to run `pnpm build` manually instead.
- Run only targeted checks that do not invoke `pnpm build`.

## Git

- Do not reset, discard, or overwrite unrelated user changes.
- Ask the user to create a branch when one is required; do not create branches yourself.
