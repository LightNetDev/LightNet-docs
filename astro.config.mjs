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
						{slug:"start-here/whats-next"}
					],
				},
				{
					label: 'Build your Library',
					items: [
						{slug: "build/configurations"},
						{slug: "build/customize-home"},
						{slug: "build/add-custom-pages"},
						{slug: "build/internationalization"}
					],
				},
				{
					label: "Add content",
					items: [
						{slug: "add-content/understand-content"},
						{slug: "add-content/media-items"},
						{slug: "add-content/media-types"},
						{slug: "add-content/categories"},
						{slug: "add-content/media-collections"},
						{slug: "add-content/use-admin-ui"},
					]
				},
				{
					label: "Run your Library",
					items: [
						{slug: "run/deploy"},
						{slug: "run/maintain"}
					]
				},
				{
					label: 'Reference',
					items: [
						{slug: "reference/lightnet-configuration"},
						{slug: "reference/components"}
					]
				},
				{
					label: "Contribute to LightNet",
					items: [
						{slug: "contribute/contribute"},
						{slug: "contribute/understand-sdk"}
					]
				},
			],
		}),
	],
});
