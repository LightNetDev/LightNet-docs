---
title: Media Collections
---

Use media collections to group media items that belong togther. For example a video playlist, a series of sermons, a music album or a book series could be modeled as a media collection.

Media Collections will show up on the details page of a media item. Allowing your user to quickly navigate to other media items of the collection.

Here is an example of a media collection:

```json title="src/content/media-collections/sermon-series-1.json"
{
  "label": "Sermon Series 1"
}
```

## Media Collection Structure

A media collection is a JSON file that describes a media collection. The collection identifier is its filename without the `.json` suffix. Here is the available properties.

### label

type: `string` \
example: `"Sermon Series 1"` \
optional: `false`

The name of the media collection. The label can either be a fixed string or a translation key to support multiple locales. LightNet will try to lookup the translation with the key. If it does not find a translation with this key, it will return the key itself (this is how fixed strings work).
