type Fence = '```' | '~~~';
const isFence = (s: string | null): s is Fence => s === '```' || s === '~~~';

type SplitFence = {
	tranName: string | null;
	globalOptGroups: string[];
	fence: Fence;
	lang: string;
	codeAndOptGroupLines: string[];
};

export const splitCodeFence = (rawMarkdown: string): Error | SplitFence => {
	const lines = rawMarkdown.trim().split('\n');

	let beforeFirstLine = lines[0]?.trim();
	if (!beforeFirstLine) return new Error('Codeblock empty');

	let tranName: string | null = null;
	const globalOptGroups = [];
	let fence: Fence | null = null;
	let startDelimIdx = 0;

	if (beforeFirstLine.startsWith('t-')) {
		tranName = beforeFirstLine.replace('t-', '');
		startDelimIdx = 1;
	}

	for (; startDelimIdx < lines.length; startDelimIdx++) {
		beforeFirstLine = lines[startDelimIdx]!.trim();
		fence = beforeFirstLine.startsWith('```') ? '```' : beforeFirstLine.startsWith('~~~') ? '~~~' : null;
		if (!fence && beforeFirstLine.length) globalOptGroups.push(beforeFirstLine);
		if (fence) break;
	}
	if (!isFence(fence)) return new Error(`Missing start code fence`);

	const startDelimLine = beforeFirstLine;
	if (startDelimLine.split(/\s+/).length > 2)
		return new Error(`Start code fence must be on separate line. Got \`${startDelimLine}\``);

	const endDelimIdx = lines.length - 1;
	if (lines.length === 1 || endDelimIdx === startDelimIdx) return new Error('Unbalanced code fence');

	const codeStartIdx = startDelimIdx + 1;
	const endDelimLine = lines[endDelimIdx]!.trim();

	if (endDelimLine !== fence) {
		if (endDelimLine.endsWith(fence)) {
			return new Error(`End code fence (${fence}) must be on separate line. Got \`${endDelimLine}\``);
		} else {
			return new Error(`Expected end code fence (${fence}). Got \`${endDelimLine}\``);
		}
	}

	const lang = startDelimLine.replace(fence, '').trim();
	const codeAndOptGroupLines = lines.slice(codeStartIdx, -1);

	return { globalOptGroups, fence, lang, codeAndOptGroupLines, tranName };
};
