import { getOrLoadOpts } from './defaultOpts.js';
import type { HighlightOpts, PropertyArrays, Result, Properties } from './types.js';

type CodeToDecoratedHtml = {
	code: string;
	lang: string;
	opts: HighlightOpts;
	transformName?: string;
	lineToProperties?: Map<number, Partial<PropertyArrays>>;
	windowProperties?: Array<{ start: number; end: number; properties: Partial<PropertyArrays> }>;
	allLinesProperties?: Partial<PropertyArrays>;
	codeProperties?: Partial<PropertyArrays>;
	preProperties?: Partial<PropertyArrays>;
};

function addDatas(
	p: Properties,
	properties: PropertyArrays['datas'] | undefined,
	prefix?: '-window' | '-line',
	cb?: (k: string, v: string) => void,
) {
	properties?.forEach((option) => {
		const key = typeof option === 'string' ? option : option[0];
		const value = typeof option === 'string' ? '' : option[1];
		p[`data${prefix ?? ''}-${key}`] = value;
		cb?.(key, value);
	});
}

export const codeToDecoratedHtmlSync = ({
	lineToProperties,
	windowProperties,
	preProperties = {},
	allLinesProperties = {},
	codeProperties = {},
	lang,
	code,
	opts,
	transformName,
}: CodeToDecoratedHtml): Result<string> => {
	try {
		let lineNum = 0;
		let hasHidden = false;

		const transform = transformName ? opts.transformMap[transformName] : undefined;

		if (typeof transformName === 'string' && transform?.addDefaultProps) {
			transform?.addDefaultProps({
				mut_allLines: allLinesProperties,
				mut_code: codeProperties,
				mut_pre: preProperties,
				lang,
				transformName,
			});
		}

		const highlightedHtml = opts.highlighterCore.codeToHtml(code, {
			lang,
			themes: opts.cssVarToThemeName,
			defaultColor: false,
			cssVariablePrefix: opts.cssVarPrefix,
			transformers: [
				{
					preprocess(_code, options) {
						options.decorations = windowProperties?.map(({ start, end, properties: p }) => {
							const properties: { class?: string; [k: `data-window-${string}`]: string } = p.classes?.length
								? { class: p.classes.join(' ') }
								: {};

							addDatas(properties, p.datas, '-window');
							return { start, end, properties };
						});
					},
					// tokens(tokens) {},
					// span(el, line, col, lineEl) {},
					line(el, _line) {
						delete el.properties['class'];
						const decorations = lineToProperties?.get(lineNum);

						if (allLinesProperties?.classes?.length && decorations?.classes?.length) {
							el.properties['class'] = `${allLinesProperties.classes.join(' ')} ${decorations.classes.join(' ')}`;
						} else if (allLinesProperties.classes?.length) {
							el.properties['class'] = allLinesProperties.classes.join(' ');
						} else if (decorations?.classes?.length) {
							el.properties['class'] = decorations.classes.join(' ');
						}

						addDatas(el.properties, allLinesProperties?.datas);
						addDatas(el.properties, decorations?.datas, '-line', (k) => {
							if (k === 'hide') hasHidden = true;
						});

						lineNum++;
						return el;
					},
					code(el) {
						addDatas(el.properties, codeProperties?.datas);
						if (codeProperties?.classes?.length) el.properties['class'] = codeProperties.classes.join(' ');
					},
					pre(el) {
						delete el.properties['class'];
						delete el.properties['tabindex'];
						if (preProperties?.classes?.length) el.properties['class'] = preProperties.classes.join(' ');
						addDatas(el.properties, preProperties?.datas);

						if (!hasHidden) return;
						// remove hidden lines and collapse the resulting whitespace
						// must do this after code(), because that's when decorations are added
						// the point of this is to be able to provide surrounding code to shiki to correctly highlight, but hide it from the user
						// simply adding a class of hidden wouldn't remove the "\n" text
						const codeEl = el.children[0];
						if (codeEl?.type !== 'element') return;
						const newChildren = [];
						for (let i = 0; i < codeEl.children.length; i++) {
							const child = codeEl.children[i]!;
							if (child.type === 'element' && Object.keys(child.properties).includes('data-line-hide')) {
								const next = codeEl.children[i + 1];
								if (next?.type === 'text') next.value = ''; // remove next newline alongside this node
							} else {
								newChildren.push(child);
							}
						}
						codeEl.children = newChildren;

						return el;
					},
					// root(el) {},
					// postprocess: (html: string) => {}
				},
				...(transform?.transforms ?? []),
			],
		});

		return { data: opts.escapeSvelte({ highlightedHtml }) };
	} catch (err) {
		if (err instanceof Error) return { error: err };
		return { error: new Error(`Unable to highlight`) };
	}
};

export const codeToDecoratedHtml = async (args: Omit<CodeToDecoratedHtml, 'opts'>): Promise<Result<string>> =>
	codeToDecoratedHtmlSync({ ...args, opts: await getOrLoadOpts() });
