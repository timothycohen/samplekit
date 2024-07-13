import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { mdCodeBlockToRawHtml } from '@samplekit/preprocess-shiki';

const build = (outPath: string) => {
	const startBefore = `<span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279">1111</span>`;
	const startAfter = `<span style="--h-darker:#FBD93C;--h-rose-pine-dawn:#D2AFB4;">&lt;!--</span> <span style="--h-darker:#C586C0;--h-rose-pine-dawn:#286983;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:inherit">shiki-start</span>`;
	const endBefore = `<span style="--h-darker:#D4D4D4;--h-rose-pine-dawn:#575279">9999</span>`;
	const endAfter = `<span style="--h-darker:#C586C0;--h-rose-pine-dawn:#286983;--h-darker-font-style:italic;--h-rose-pine-dawn-font-style:inherit">shiki-end</span> <span style="--h-darker:#FBD93C;--h-rose-pine-dawn:#D2AFB4;">--&gt;</span>`;

	const writeExample = mdCodeBlockToRawHtml({
		lang: 'md',
		rawCode: `1111
\`\`\`ts
&tripslash;highlight:2
console.log('hello world');
const highlightedLine = true;
\`\`\`
9999`,
	})
		.data!.replace(startBefore, startAfter)
		.replace(endBefore, endAfter);

	fs.writeFileSync(path.join(outPath, 'codeblockWriteExample.svelte'), writeExample);

	const processedExampleInner = mdCodeBlockToRawHtml({
		lang: 'ts',
		rawCode: `///highlight:2
console.log('hello world');
const highlightedLine = true;`,
	});

	const processedExample = mdCodeBlockToRawHtml({
		lang: 'html',
		rawCode: processedExampleInner.data!,
	});

	fs.writeFileSync(path.join(outPath, 'codeblockProcessedExample.svelte'), processedExample.data!);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const root = path.join(import.meta.dirname, '..');
	build(path.join(root, 'src', 'lib', 'generated'));
}
