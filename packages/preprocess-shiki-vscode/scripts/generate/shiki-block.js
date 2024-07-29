import fs from 'fs';

// TODO
// Open questions:

// I have the Svelte VS Code Extension installed, which has this file:
// https://github.com/sveltejs/language-tools/blob/master/packages/svelte-vscode/syntaxes/markdown-svelte.json

// It includes a #svelte-code-block and an injector into the text.html.markdown scope.
// This allows highlighting svelte in markdown code fences.

// ~~~svelte
// {#if true}{/if}
// ~~~

// That works the same as the following ts code fence:

// ~~~ts
// const foo = "bar";
// ~~~

// That all works. However, when inside a text.html.markdown scope created by another extension, the #svelte-code-block isn't used.
// Other scopes are highlighted correctly (like the ts code fence above).
// But the svelte code block is not highlighted despite definitely being inside the text.html.markdown scope. Why?

const syntaxes = {
	scopeName: 'shiki.block.pp-svelte',
	injectionSelector: 'L:source.svelte',
	fileTypes: [],
	patterns: [
		{
			begin: '<!--\\s*(shiki-start($|\\s+))',
			end: '\\s*(shiki-end)\\s*-->',
			name: 'source.pp-svelte',
			contentName: 'shiki.pp-svelte',
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

fs.writeFileSync('./syntaxes/generated/shiki-block.pp-svelte.tmLanguage.json', JSON.stringify(syntaxes));
