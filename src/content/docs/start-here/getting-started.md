---
title: Getting Started
description: Learn the basics of how to use LightNet Library
---

Welcome to LightNet Library Developer Documentation. LightNet Library enables you
to build media distribution websites. This guide will help you set up your development environment and get started with building websites.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- Node.js (version 22 or higher)
- Git (for version control)

You can download Node.js and npm from [nodejs.org](https://nodejs.org). For Git, visit [git-scm.com](https://git-scm.com).

## Start with Sk8 Ministries example

Start building your media library as a copy of our [Sk8-Ministries example](https://sk8-ministries.pages.dev/). This will help
you learn on how things are done and get you up and running quickly.

To create your local copy of the example project run this command inside your terminal:

```bash
npm create astro@latest -- --template LightNetDev/lightnet-library/examples/sk8-ministries
```

The started wizards lets you choose the name of your project, if you want to install its dependencies and wether git should be initalized.

Next change directory into your newly created project.

Run this command to start the development server. This will give you quick feedback during working with the project:

```bash
npm run dev
```

As a first change you could change the page title to match your websites name.

Open the file `astro.config.mjs` and change `title` from "Sk8 Ministry" to your name. While `npm run dev` is running the page automatically updates the title of page which is visible inside the header. The title in front of the big skater image won't change. No worries later you will learn how to change this as well.

Let us build the page to be ready to ship it. Run inside your terminal

```bash
npm run build
```

This will produces some log output and create a new folder named `dist`. This folder contains the website as html files that could be deployed to a file server.

## Well done 🎉

Now that your page is running, let's explore what just has happened. Go to the next chapter to get an Overview on your new website.
