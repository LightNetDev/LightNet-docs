# Style guide

## Punctuation

- **Apostrophe**: Use `'`, for example in `let's`. Do not use `’`. We use `'` because it is easier to type on a non-English keyboard.

## Terms

Use these terms consistently throughout the docs:

- **Media Library**: A LightNet website.
- **Terminal**: A command-line interface.

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
- Prefer `- \`option\`: explanation` over `- \`option\` - explanation`.

### Ordered lists

- Use ordered lists for steps, sequences, or ranked items.
- In Markdown ordered lists and inside Starlight `Steps`, write every item as `1.` and let Markdown handle the numbering.
- Keep each step action-first when possible.
- When a step starts with a label, prefer `1. **Do the thing**: explanation`.
