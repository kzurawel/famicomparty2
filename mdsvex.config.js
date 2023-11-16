import { defineMDSveXConfig as defineConfig } from 'mdsvex';
import { createHighlighter } from '@bitmachina/highlighter';
import remarkHeadingID from 'remark-heading-id';
import ca65Grammar from './ca65.tmLanguage.json' assert { type: 'json' };
import fptheme from './famicom-party.json' assert { type: 'json' };

const ca65 = {
	id: 'ca65',
	scopeName: 'source.ca65',
	grammar: ca65Grammar,
	aliases: ['6502', 'asm6502']
};

const config = defineConfig({
	extensions: ['.svelte.md', '.md', '.svx'],

	layout: {
		book: 'src/routes/book/chapter.svelte'
	},

	smartypants: {
		dashes: 'oldschool'
	},

	remarkPlugins: [[remarkHeadingID, { defaults: true }]],
	rehypePlugins: [],
	highlight: {
		highlighter: await createHighlighter({
			theme: fptheme,
			langs: [ca65, 'shell'],
			wrap: true
		})
	}
});

export default config;
