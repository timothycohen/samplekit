import { getOrLoadOpts } from './defaultOpts.js';
import type { HighlightOpts, PropertyArrays, Result } from './types.js';

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
							const properties: { class?: string; [k: `data-window-${string}`]: '' } = p.classes?.length
								? { class: p.classes.join(' ') }
								: {};
							if (p.datas?.length) for (const d of p.datas) properties[`data-window-${d}`] = '';
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

						allLinesProperties?.datas?.forEach((option) => (el.properties[`data-${option}`] = ''));
						decorations?.datas?.forEach((option) => {
							if (option === 'hide') hasHidden = true;
							el.properties[`data-line-${option}`] = '';
						});

						lineNum++;
						return el;
					},
					code(el) {
						codeProperties?.datas?.forEach((option) => (el.properties[`data-${option}`] = ''));
						if (codeProperties?.classes?.length) el.properties['class'] = codeProperties.classes.join(' ');
					},
					pre(el) {
						delete el.properties['class'];
						delete el.properties['tabindex'];
						if (preProperties?.classes?.length) el.properties['class'] = preProperties.classes.join(' ');
						preProperties?.datas?.forEach((option) => (el.properties[`data-${option}`] = ''));

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
