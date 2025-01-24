// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'LightNet Library',
			social: {
				github: 'https://github.com/LightNetDev/lightnet-library',
			},
			editLink: {
				baseUrl: 'https://github.com/LightNetDev/lightnet-library-docs/edit/main/',
			  },
			sidebar: [
				{
					label: 'Start Here',
					items: [
						{slug: "start-here/getting-started"},
						{slug:"start-here/overview"},
						{slug:"start-here/outline"}
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
						{slug: "content/administration-ui"},
					]
				},
				{
					label: "Ship",
					items: [
						{slug: "ship/hosting"},
						{slug: "ship/file-storage"}
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
		}),
	],
});
