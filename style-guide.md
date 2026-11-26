# Style guide

## Writing for the reader

- Describe how LightNet works today. Do not describe how it changed, what it used to do, or what is planned. Leave out phrases like "now supports", "previously", "new in", or "will soon". Version upgrade guides are the exception.
- Explain what the reader needs to do their task or make a decision, not how something works internally. Leave out internal mechanics unless the reader has to act on them.
- Keep it simple: short sentences, one idea per paragraph, and concrete examples over abstract explanations.
- **Developer Documentation**: Assume the reader knows common web development concepts, such as Git, npm packages, environment variables, and deployment. Use technical terms without explaining them, but don't explain LightNet internals beyond what is needed to configure, extend, or run a site.
- **Ministry Documentation**: Write for someone without a technical background. Use everyday language, explain each concept with a plain definition and an example, and describe what something means for their ministry, not how it is built. Leave out technical details such as `commonId`, GitHub, Cloudflare, or deployment unless the reader needs them to make a decision. If a technical step is unavoidable, say who does it, for example "your site administrator sets this up".

## Punctuation

- **Apostrophe**: Use `'`, for example in `let's`. Do not use `’`. We use `'` because it is easier to type on a non-English keyboard.

## Headings

- Use sentence case: capitalize the first word and proper names, and lowercase everything else. For example, use `Media item details page`.

## Terminology and capitalization

- Lowercase ordinary domain concepts, even when they have a [Glossary](/ministry/resources/glossary) entry: `ministry`, `content`, `media item`, `media library`, `media type`, `media collection`, `site language`, `content language`.
- Capitalize proper names, product names, and official component names: `LightNet`, `MediaWorks`, `Administration UI`.
- Use `terminal` consistently for a command-line interface.

## Formatting

- Bold a term only where it is first introduced or defined for the reader. Do not bold in headings, navigation lists, or diagrams, and do not re-bold a term later.
- Use backticks only for literal identifiers: types, properties, filenames, commands.
- Use site-relative links, such as `/ministry/resources/glossary`.

## Glossary page

- Entry headings and defined terms use canonical capitalization and bold.
- Link the first use of other Glossary terms in each definition. Do not link a term to its own entry.

## Lists

- Introduce a list with a short lead-in sentence. Use a colon when the sentence directly introduces the list.
- Use unordered lists for sets of items where the order does not matter.
- Use ordered lists or the Starlight `Steps` component only when the order matters.

### Bullet lists

- Keep all items in the same list grammatically parallel.
- Use one list style per list: either short fragments or full sentences.
- Do not mix fragments and full sentences in the same list.
- Use short fragments for simple references, options, paths, properties, or examples.
- Use full sentences when the list explains behavior, guidance, or outcomes.
- Fragment-style bullets do not use a period at the end.
- Full-sentence bullets use sentence case and end with a period.
- When a bullet starts with a label, use a colon after the label.
- Prefer `- **Label**: explanation` over `- **Label** - explanation`.
- Prefer `` - `option`: explanation `` over `` - `option` - explanation ``.

### Ordered lists

- Use ordered lists for steps, sequences, or ranked items.
- In Markdown ordered lists and inside Starlight `Steps`, write every item as `1.` and let Markdown handle the numbering.
- Keep each step action-first when possible.
- When a step starts with a label, prefer `1. **Do the thing**: explanation`.
