import { codeToDecoratedHtmlSync } from '@samplekit/preprocess-shiki';
import { opts } from '$lib/shiki';
import { splitAndProcess } from './common';
import type { CodeProcessed, ModuleDefinitions } from './types';

export const processCode = (moduleDefinitions: ModuleDefinitions): Array<CodeProcessed> => {
	return moduleDefinitions.reduce<Array<CodeProcessed>>((acc, curr, index) => {
		if (!curr.loadRaw) return acc;

		const lang = curr.lang ?? curr.title.split('.').pop() ?? '';

		const rawHTML = (curr.loadRaw() as Promise<{ default: string }>)
			.then(({ default: rawCode }) => {
				if (!rawCode) {
					return { error: new Error('Unable to load raw string') } as ReturnType<typeof codeToDecoratedHtmlSync>;
				}

				return codeToDecoratedHtmlSync({
					lang,
					code: rawCode,
					opts,
					transformName: 'block',
				});
			})
			.then(({ data, error }) => {
				if (error) throw error;
				return data!;
			});

		return [...acc, { title: curr.title, lang, rawHTML, index }];
	}, []);
};

export const processedCodeMap = splitAndProcess(processCode);

export const resolveMainPromise = async (mainCode: CodeProcessed[]) => {
	return await Promise.all(mainCode.map(async (mc) => ({ ...mc, rawHTML: await mc.rawHTML })));
};
