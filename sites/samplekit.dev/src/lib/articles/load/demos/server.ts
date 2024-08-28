import { codeToDecoratedHtmlSync } from '@samplekit/preprocess-shiki';
import { opts } from '$lib/shiki';
import { splitAndProcess } from './common';
import type { CodeProcessed, ModuleDefinitions } from './types';
import type { CodeDefined } from './types';

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

export const processCode = (moduleDefinitions: ModuleDefinitions): Array<CodeProcessed> => {
	return moduleDefinitions.reduce<Array<CodeProcessed>>((acc, curr, index) => {
		if (!curr.loadRaw) return acc;
		return [...acc, { ...processOne(curr), index }];
	}, []);
};

export const processedCodeMap = splitAndProcess(processCode);

export const resolveMainPromise = async (mainCode: CodeProcessed[]) => {
	return await Promise.all(mainCode.map(async (mc) => ({ ...mc, rawHTML: await mc.rawHTML })));
};
