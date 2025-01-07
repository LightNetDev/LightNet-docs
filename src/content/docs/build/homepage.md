---
title: Customize Home
---

The hompage is the first page that users see when they visit your site. You can customize the homepage to include a hero image, a call to action, or a content gallery.

The homepage is defined by the `src/pages/[locale]/index.astro` file. You can customize the homepage by editing this file.

## Basic file layout

This is the basic layout of the `index.astro` file:

```astro
---
export { getLocalePaths as getStaticPaths } from "@lightnet/library/i18n"
import { Page } from "@lightnet/library/components"
---
<Page>
    {/* Add your content here */}
</Page>
```

This file is a Astro component. Everything inside the `---` is the frontmatter. It will be executed while your site is being built. Use this part to import your components and define your page's variables. For example you will query media items here.

The export of `getLocalePaths` is used to generate the static paths for the site. This will export all available locales for the site. You need this because the homepage is a localized page that will be translated into all available user interface languages. 

Everything below the frontmatter is the actual content of the page. You can add any HTML here. We provide 
reusable components that you can use to build your page. More details below.

We provide you with a `Page` component that will handle the layout of the page. This will add the header, language switcher, menu system... You should use this component to ensure that your page is styled correctly.

This file is using the Astro templating language. You can learn more about Astro [here](https://astro.build/).








## Common Customizations

##

- SM wants to configure the home page
