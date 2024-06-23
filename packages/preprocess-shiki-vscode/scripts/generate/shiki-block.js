import fs from 'fs';

const syntaxes = {
	scopeName: 'shiki.block.svelte',
	fileTypes: [],
	injectionSelector: 'L:source.svelte',
	patterns: [
		{
			begin: '<!--\\s*(shiki-start($|\\s+))',
			end: '\\s*(shiki-end)\\s*-->',
			beginCaptures: { 1: { name: 'keyword.control.svelte' } },
			endCaptures: { 1: { name: 'keyword.control.svelte' } },
			patterns: [],
		},
	],
	repository: {
		'standard-code-block': { patterns: [{ include: 'text.html.markdown' }] },
	},
};

// https://github.com/sveltejs/language-tools/blob/master/packages/svelte-vscode/syntaxes/markdown-svelte.json
for (const lang of ['svelte', 'vue', 'graphql']) {
	syntaxes.patterns[0].patterns.push({ include: `#${lang}-code-block` });
	syntaxes.repository[`${lang}-code-block`] = {
		name: 'markup.fenced_code.block.markdown',
		begin: '(^|\\G)(\\s*)(\\`{3,}|~{3,})\\s*(?i:(' + lang + ')(\\s+[^`~]*)?$)',
		beginCaptures: {
			3: { name: 'punctuation.definition.markdown' },
			4: { name: 'fenced_code.block.language.markdown' },
			5: { name: 'punctuation.definition.markdown' },
		},
		end: '(^|\\G)(\\2|\\s{0,3})(\\3)\\s*$',
		endCaptures: {
			3: { name: 'punctuation.definition.markdown' },
		},
		patterns: [
			{
				begin: '(^|\\G)(\\s*)(.*)',
				while: '(^|\\G)(?!\\s*([`~]{3,})\\s*$)',
				contentName: 'meta.embedded.block.' + lang,
				patterns: [{ include: 'source.' + lang }],
			},
		],
	};
}

syntaxes.patterns[0].patterns.push({ include: '#standard-code-block' });

fs.writeFileSync('./syntaxes/generated/shiki-block.json', JSON.stringify(syntaxes));
