import { isMdLang, mdCodeBlockToRawHtml } from '@samplekit/markdown';
import { logger } from '$lib/logging/server';
import { splitAndProcess } from './common';
import type { CodeProcessed, ModuleDefinitions } from './types';

export const processCode = (moduleDefinitions: ModuleDefinitions): Array<CodeProcessed> => {
	return moduleDefinitions.reduce<Array<CodeProcessed>>((acc, curr, index) => {
		if (!curr.loadRaw) return acc;

		const lang = curr.lang ?? curr.title.split('.').pop();
		if (!isMdLang(lang)) {
			logger.error(`Invalid language for code block ${curr.title}: ${lang}`);
			return acc;
		}

		const rawHTML = (curr.loadRaw() as Promise<{ default: string }>)
			.then(({ default: rawCode }) => {
				if (!rawCode) {
					return { error: new Error('Unable to load raw string') } as ReturnType<typeof mdCodeBlockToRawHtml>;
				}

				return mdCodeBlockToRawHtml({ lang, rawCode });
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
