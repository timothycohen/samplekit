import { codeToDecoratedHtmlSync } from '@samplekit/preprocess-shiki';
import { opts } from '$lib/shiki';
import { splitAndProcess } from './common';
import type { ArticlePath } from '$lib/articles/schemas';
import type { CodeDefined, CodeProcessedEager, CodeProcessedLazy, ModuleDefinitions } from './types';

const processOne = <T extends string>(codeDefined: Omit<CodeDefined, 'title'> & { title: T }) => {
	const lang = codeDefined.lang ?? codeDefined.title.split('.').pop() ?? '';

	const rawHTML = (codeDefined.loadRaw() as Promise<{ default: string }>)
		.then(({ default: rawCode }) => {
			if (!rawCode) {
				return { error: new Error('Unable to load raw string') } as ReturnType<typeof codeToDecoratedHtmlSync>;
			}

			return codeToDecoratedHtmlSync({
				lang,
				code: rawCode.trim(),
				opts,
				transformName: 'block',
			});
		})
		.then(({ data, error }) => {
			if (error) throw error;
			return data!;
		});

	return { title: codeDefined.title, lang, rawHTML };
};

export const processCodeDefined = <T extends string>(codeDefined: Omit<CodeDefined, 'title'> & { title: T }) =>
	processOne(codeDefined).rawHTML.then((rawHTML) => ({
		title: codeDefined.title,
		lang: codeDefined.lang,
		rawHTML,
	}));

export const processCode = (moduleDefinitions: ModuleDefinitions): Array<CodeProcessedLazy> => {
	return moduleDefinitions.reduce<Array<CodeProcessedLazy>>((acc, curr, index) => {
		if (!curr.loadRaw) return acc;
		return [...acc, { ...processOne(curr), index }];
	}, []);
};

type ProcessedCode = {
	main?: Array<CodeProcessedEager>;
	mainPromise?: Array<CodeProcessedLazy>;
	lazy?: Record<string, CodeProcessedLazy[]>;
};

// the type cast adds an optional main field that doesn't exist yet so that we can
// await the main demo (and then cache it) when the article is actually requested
// this is to speed up the dev server
export const processedCodeMap = splitAndProcess(processCode) as Partial<Record<ArticlePath, ProcessedCode>>;

export const loadMainOnce = async (processedCode: ProcessedCode) => {
	if (processedCode.main || !processedCode.mainPromise) return;
	processedCode.main = await Promise.all(
		processedCode.mainPromise.map(async (mc) => ({ ...mc, rawHTML: await mc.rawHTML })),
	);
	delete processedCode.mainPromise;
};
