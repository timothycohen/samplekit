import fs from 'fs';

const syntaxes = {
	scopeName: 'shiki.line.pp-svelte',
	fileTypes: [],
	injectionSelector: 'L:source.svelte',
	patterns: [],
};

const langs = [
	['svelte', 'source.svelte'],
	['json', 'source.json'],
	['sh', 'source.shell'],
	['html', 'text.html.derivative'],
	['css', 'source.css'],
	['md', 'text.html.markdown'],
	['js', 'source.js'],
	['ts', 'source.ts'],
	['latex', 'text.tex.latex'],
	['graphql', 'source.graphql'],
];

for (const lang of langs) {
	syntaxes.patterns.push({
		match: `(<!--)\\s*(shiki-${lang[0]})((?:(?!-->).)*)(\\2)\\s*(-->)`,
		name: 'source.pp-svelte shiki.pp-svelte',
		captures: {
			2: { name: 'keyword.control.pp-svelte' },
			3: { patterns: [{ include: lang[1] }] },
			4: { name: 'keyword.control.pp-svelte' },
		},
	});
}

fs.writeFileSync('./syntaxes/generated/shiki-line.pp-svelte.tmLanguage.json', JSON.stringify(syntaxes));
