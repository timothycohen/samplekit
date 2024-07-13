import fs from 'fs';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

type FlatTocItem = { depth: number; title: string; href: string };
type TocItem = { title: string; href: string; children?: TocItem[] };

const createToc = (filenames: { absolute: string; pathname: string }[]) => {
	const toc: Record<string, TocItem[]> = {};

	for (const { absolute, pathname } of filenames) {
		const str = fs.readFileSync(absolute, { encoding: 'utf-8' });

		const regex = /<HAnchor\s+tag="([^"]+)"\s+title="([^"]+)"\s*\/>/g;

		const results: FlatTocItem[] = [];

		let match;

		while ((match = regex.exec(str)) !== null) {
			const depth = +match[1]!.slice(1);

			const title = match[2]!;
			const href = pathname + '/#' + title.toLowerCase().replace(/\s+/g, '-');

			results.push({ depth, title, href });
		}

		toc[pathname] = createTree(results);
	}

	return toc;
};

function createTree(items: FlatTocItem[]): TocItem[] {
	const topLevelItems: TocItem[] = [];

	const depthMap = new Map<number, TocItem>();

	items.forEach((item) => {
		const newItem: TocItem = {
			title: item.title,
			href: item.href,
		};

		const parentDepth = item.depth - 1;
		if (depthMap.has(parentDepth)) {
			const parentItem = depthMap.get(parentDepth)!;
			if (!parentItem.children) {
				parentItem.children = [];
			}
			parentItem.children.push(newItem);
		} else {
			topLevelItems.push(newItem);
		}

		depthMap.set(item.depth, newItem);
	});

	return topLevelItems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const root = path.join(import.meta.dirname, '..');
	const out = path.join(root, 'src', 'lib', 'generated', 'toc.json');
	const docs = path.join(root, 'src', 'routes', 'docs');

	const filenames = fs
		.readdirSync(docs, { recursive: true })
		.filter((p) => typeof p === 'string')
		.filter((p) => p.endsWith('+page.svelte'))
		.map((relative) => ({
			absolute: path.join(docs, relative),
			pathname: path.join('/docs', relative.replace('+page.svelte', '')).slice(0, -1),
		}));

	const toc = createToc(filenames);
	fs.writeFileSync(out, JSON.stringify(toc));
}
