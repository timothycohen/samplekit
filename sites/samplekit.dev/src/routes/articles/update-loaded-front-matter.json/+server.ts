// it's just easier for the client to get it from the mounted page than for the server to have to transform the file again separately

import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import { dev } from '$app/environment';
import {
	loadedFrontMatter,
	rawFrontMatterSchema,
	type ArticlePath,
	type RawFrontMatter,
	type ReadingTime,
} from '$lib/articles/schema';
import { jsonFail, jsonOk } from '$lib/http/server';
import { logger } from '$lib/logging/server';
import prettierConfig from '../../../../prettier.config';
import { putReqSchema } from '.';
import type { Result } from '$lib/utils/common/types';
import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import type { Component } from 'svelte';

const WPM = 225;

//#region TOC
type FlatTocItem = { depth: number; title: string; href: string };
type TocItem = { title: string; href: string; children?: TocItem[] };

const createToc = ({ fileContents, articlePath }: { fileContents: string; articlePath: string }) => {
	const regex = /<HAnchor\s+tag="([^"]+)"\s+title="([^"]+)"\s*\/>/g;

	const results: FlatTocItem[] = [];

	let match;

	const hrefSet = new Set();

	while ((match = regex.exec(fileContents)) !== null) {
		const depth = +match[1]!.slice(1);

		const title = match[2]!;
		const href = articlePath + '/#' + title.toLowerCase().replace(/\s+/g, '-');
		if (hrefSet.has(href)) logger.warn(`Duplicate href \`${href}\``);
		hrefSet.add(href);

		results.push({ depth, title, href });
	}

	return createTree(results);
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
//#endregion TOC

const pages = Object.entries(
	import.meta.glob('/src/routes/articles/**/+page.svelte', { eager: true }) as Record<
		string,
		{ metadata: RawFrontMatter; default: Component }
	>,
).reduce(
	(acc, [url, { metadata }]) => {
		const articlePath = url.replace('/src/routes', '').replace('/+page.svelte', '') as ArticlePath;
		acc[articlePath] = { metadata };
		return acc;
	},
	{} as Record<ArticlePath, { metadata: RawFrontMatter }>,
);

const updateLoadedFrontMatter = async ({ request }: RequestEvent) => {
	if (!dev) return jsonFail(404);
	const validated = putReqSchema.safeParse(await request.json().catch(() => null));
	if (!validated.success) return jsonFail(400);

	const { wordCount, articlePath } = validated.data;
	const routesFilePath = path.join(import.meta.dirname, '..', '..', '..', '..', 'src', 'routes');
	const articleDirname = path.join(routesFilePath, articlePath);
	const articleUrlPath = path.join(articleDirname, '+page.svelte');

	const metadataRaw = pages[articlePath].metadata;
	if (!metadataRaw) {
		logger.error(`Missing metadata in \`${articleUrlPath}\``);
		return jsonFail(500);
	}
	const metadata = rawFrontMatterSchema.safeParse(metadataRaw);
	if (!metadata.success) {
		logger.error(`Malformed metadata in \`${articleUrlPath}\``);
		return jsonFail(500);
	}

	const generatedDirPath = path.join(articleDirname, 'generated');
	fs.mkdirSync(generatedDirPath, { recursive: true });
	const fileContents = fs.readFileSync(articleUrlPath, { encoding: 'utf-8' });
	const toc = createToc({ articlePath, fileContents });
	const readingTime: ReadingTime = { readingTime: Math.ceil(wordCount / WPM), wordCount };
	const frontMatter = loadedFrontMatter.safeParse({ ...metadata.data, articlePath, ...readingTime, toc });
	if (!frontMatter.success) {
		logger.error(`Error creating loadedFrontMatter for \`${articlePath}\``);
		return jsonFail(500);
	}

	const neu = await prettier.format(codeGen(frontMatter.data), { ...prettierConfig, parser: 'typescript' });

	const outFilePath = path.join(generatedDirPath, 'metadata.ts');
	const old = fs.existsSync(outFilePath) ? fs.readFileSync(outFilePath, { encoding: 'utf-8' }) : '';
	if (old === neu) return jsonOk<Result.Success>({ message: 'Success' });
	fs.writeFileSync(outFilePath, neu);
	logger.info(`Updated front matter for \`${articlePath}\``);
	return jsonOk<Result.Success>({ message: 'Success' });
};

export const PUT: RequestHandler = updateLoadedFrontMatter;

// save as TS code instead of JSON
// this is not strictly necessary but is a nice QOL.
// it allows us to import vite urls which otherwise would be hashed and lost on serialization. It also allows us to use Date objects
// If undesirable, the workaround for urls would be either to either put everything in the /static folder, or duplicate the import statements
// for Dates, we could simply wrap them in new Date() or import from the raw metadata directly

function codeGen(obj: object) {
	const entries = Object.entries(obj);
	let importStr = `import type { LoadedFrontMatter } from '$lib/articles/schema';\n`;

	const props = entries.map(([key, value]) => {
		if ((key === 'imgSm' || key === 'imgLg' || key === 'video') && value.startsWith('/src/')) {
			importStr += `import ${key} from "${value}";`;
			return key;
		} else if (value instanceof Date) {
			return `${key}: new Date('${value.toISOString()}')`;
		} else if (key === 'updates') {
			const updates = (value as { at: Date; descriptions: string[] }[])
				.sort((a, b) => b.at.getTime() - a.at.getTime())
				.map((u) => {
					return `{at: new Date("${u.at.toISOString()}"), descriptions: ${JSON.stringify(u.descriptions)}}`;
				});
			return `${key}: [${updates.join(', ')}]`;
		} else {
			return `${key}: ${JSON.stringify(value)}`;
		}
	});
	return importStr + `export default { ${props.join(', ')} } satisfies LoadedFrontMatter;`;
}

// function codeGen(frontMatter: LoadedFrontMatter) {
// 	let neu = `export default ${JSON.stringify(frontMatter)} as const;`;

// 	for (const [kind, media] of [
// 		['imgSm', frontMatter.imgSm],
// 		['imgLg', frontMatter.imgLg],
// 		['video', frontMatter.video],
// 	] as const) {
// 		if (media && media.startsWith('/src/')) {
// 			neu = `import ${kind} from '${media}';\n` + neu.replace(`"${kind}":"${media}"`, kind);
// 		}
// 	}

// 	neu = neu.replace(/"(\w+)":"([^"]+)"(,?)/g, (_, key, value, comma) => {
// 		if (key === 'publishedAt') return `"publishedAt":new Date("${value}")${comma}`;
// 		return `"${key}":"${value}"${comma}`;
// 	});

// 	return neu;
// }
