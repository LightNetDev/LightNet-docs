// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';


// https://astro.build/config
export default defineConfig({
	site: "https://lightnet-docs.pages.dev",
	integrations: [
		starlight({
			title: 'LightNet',
			social: {
				github: 'https://github.com/LightNetDev/lightnet',
			},
			editLink: {
				baseUrl: 'https://github.com/LightNetDev/lightnet-docs/edit/main/',
			  },
			sidebar: [
				{
					label: 'Start Here',
					items: [
						{slug: "start-here/getting-started"},
						{label:"Core Concepts", items: [
							{slug: "start-here/concepts/media-site-structure"},
							{slug: "start-here/concepts/architecture"},
							{slug: "start-here/concepts/collaboration"}
						]},
						{label: "Guides", items: [
							{slug: "start-here/guides/building-the-skills"},
							{slug: "start-here/guides/using-the-docs"}
						]}
					],
				},
				{
					label: "Build",
					items: [
						{slug: "build/configurations"},
						{slug: "build/homepage"},
						{slug: "build/custom-pages"},
						{slug: "build/i18n"}
					],
				},
				{
					label: "Add Content",
					items: [
						{slug: "content/overview"},
						{slug: "content/media-items"},
						{slug: "content/media-types"},
						{slug: "content/categories"},
						{slug: "content/media-collections"},
						{slug: "content/administration-ui", badge: "Beta"},
					]
				},
				{
					label: "Deploy",
					items: [
						{slug: "deploy/hosting"},
						{slug: "deploy/file-storage"}
					]
				},
				{
					label: "Run",
					items: [
						{slug: "run/update"},
						{slug: "run/monitor"}
					]
				},
				{
					label: 'Reference',
					items: [
						{slug: "reference/configuration"},
						{slug: "reference/components"}
					]
				},
				{
					label: "Advance Your Journey",
					items: [
						{slug: "advanced/internals"},
						{slug: "advanced/contribute"}
					]
				},
			],
			plugins: process.env.CHECK_LINKS
				? [
					starlightLinksValidator({
						errorOnFallbackPages: false,
						errorOnInconsistentLocale: true,
						errorOnLocalLinks: false
					}),
				]
				: [],
		}),
	],
});
