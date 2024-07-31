import { execSync } from 'child_process';
import fs from 'fs';
import path, { join } from 'path';
import { walk } from 'estree-walker';
import MagicString from 'magic-string';
import { parse, type Attribute, type SvelteNode } from 'svelte/compiler';

const markup = ({ content, filename }: { content: string; filename: string }) => {
	if (!filename) return {};
	const s = new MagicString(content);
	const ast = parse(content, { filename, modern: true });

	let count = 0;
	let dynamicRefs = 0;
	let expressionTags = 0;

	// @ts-expect-error – estree / svelte mismatch
	walk(ast.fragment, {
		enter(node: SvelteNode) {
			if (node.type !== 'RegularElement' || node.name !== 'a') return;

			const hasData = node.attributes.some((attr) => attr.type === 'Attribute' && attr.name === 'data-external');
			if (hasData) return;

			const href = node.attributes.find((attr) => attr.type === 'Attribute' && attr.name === 'href') as
				| Attribute
				| undefined;
			if (!href || href.value === true || !href.value[0]) {
				return;
			}

			if (href.value.length > 1) {
				// ignoring dynamic hrefs
				dynamicRefs++;
				return;
			}

			const val = href.value[0];

			if (val.type !== 'Text') {
				// ignoring ExpressionTag
				expressionTags++;
				return;
			}

			const hrefVal = val.raw;
			if (
				!hrefVal.startsWith('https:') &&
				!hrefVal.startsWith('http:') &&
				!hrefVal.startsWith('mailto:') &&
				!hrefVal.startsWith('tel:')
			)
				return;

			count++;
			const newAttrs = ' data-external';
			s.appendLeft(val.end + 1, newAttrs);
		},
	});

	const res = {} as { updatedCode?: string; count?: number; dynamicRefs?: number; expressionTags?: number };
	if (count) res.updatedCode = s.toString();
	if (count) res.count = count;
	if (dynamicRefs) res.dynamicRefs = dynamicRefs;
	if (expressionTags) res.expressionTags = expressionTags;
	return res;
};

const root = join(new URL(import.meta.url).pathname, '..', '..');
const articles = join(root, 'src', 'routes', 'articles');

async function* walkDir(dir: string): AsyncGenerator<string> {
	for await (const d of await fs.promises.opendir(dir)) {
		const entry = path.join(dir, d.name);
		if (d.isDirectory()) yield* walkDir(entry);
		else if (d.isFile()) yield entry;
	}
}

async function main() {
	let changed = false;
	for await (const p of walkDir(articles)) {
		if (p.endsWith('.svelte')) {
			const code = fs.readFileSync(p, { encoding: 'utf-8' });
			const res = markup({ content: code, filename: p });
			const { updatedCode, ...rest } = res;
			if (Object.keys(rest).length) console.log(`${p}: ${JSON.stringify(rest)}`);
			if (updatedCode) {
				fs.writeFileSync(p, updatedCode);
				changed = true;
			}
		}
	}
	if (changed) execSync('pnpm format:fix');
}

await main();
