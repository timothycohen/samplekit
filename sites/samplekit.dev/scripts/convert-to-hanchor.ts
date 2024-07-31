import { execSync } from 'child_process';
import fs from 'fs';
import path, { join } from 'path';
import { walk } from 'estree-walker';
import MagicString from 'magic-string';
import { parse, type SvelteNode } from 'svelte/compiler';

const markup = ({ content, filename }: { content: string; filename: string }) => {
	if (!filename) return {};
	const s = new MagicString(content);
	const ast = parse(content, { filename, modern: true });
	let count = 0;
	let dynamic = 0;
	let empty = 0;

	// @ts-expect-error – estree / svelte mismatch
	walk(ast.fragment, {
		enter(node: SvelteNode) {
			if (node.type !== 'RegularElement' || !['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.name)) return;

			const children = node.fragment.nodes;
			if (!children) return;
			const firstChild = children[0];
			if (!firstChild || firstChild.type !== 'Text') {
				dynamic++;
				return;
			}
			if (!firstChild.data.trim()) {
				empty++;
				return;
			}

			count++;
			s.remove(node.start, node.end);
			s.appendLeft(node.start, `<HAnchor tag=${node.name} title="${firstChild.data.trim()}" />`);
		},
	});

	const res = {} as { updatedCode?: string; count?: number; dynamic?: number; empty?: number };
	if (count) res.updatedCode = s.toString();
	if (count) res.count = count;
	if (dynamic) res.dynamic = dynamic;
	if (empty) res.empty = empty;
	return res;
};

const root = join(new URL(import.meta.url).pathname, '..', '..');
const articles = join(root, 'src', 'routes', 'articles');

async function* walkDir(dir: string): AsyncGenerator<string> {
	let depth = 2;
	for await (const d of await fs.promises.opendir(dir)) {
		const entry = path.join(dir, d.name);
		if (d.isDirectory()) {
			if (depth !== 0) {
				depth--;
				yield* walkDir(entry);
			}
		} else if (d.isFile()) yield entry;
	}
}

async function main() {
	let changed = false;
	for await (const p of walkDir(articles)) {
		if (p.endsWith('.svelte')) {
			if (p.endsWith('articles/+layout.svelte')) continue;
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
