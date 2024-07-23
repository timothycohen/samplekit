import { findAllSubstrWindows } from './findAllSubstrWindows.js';
import { parseIndexRange } from './optionType/range.js';
import { takeRustyString } from './optionType/rustyString.js';
import { escapeOptGroup } from './optionType/utils.js';
import type { Range, PropertyArrays } from '../types.js';

const warn = (str: string, msg: string) => {
	return { kind: 'err', val: Error(`Invalid local option group \`${str}\`. ${msg}`) } as const;
};

export const parseLineOptGroup = ({
	codeStr,
	optGroup,
}: {
	codeStr: string;
	optGroup: string;
}):
	| { kind: 'err'; val: Error }
	| { kind: 'line'; val: { properties: PropertyArrays } }
	| { kind: 'window'; val: { indexRanges: Range[]; properties: PropertyArrays } } => {
	let trimmed = escapeOptGroup(optGroup);
	if (trimmed === '') return warn(optGroup, 'Empty.');

	const datas: string[] = [];
	const classes: string[] = [];
	const indexRanges: Range[] = [];

	while (trimmed.length) {
		// locations
		if (trimmed.startsWith('s')) {
			const s = takeRustyString(trimmed, 1);
			if (!s) return warn(optGroup, `Invalid substring.`);
			const windows = findAllSubstrWindows(codeStr, s.match);
			if (!windows.length) return warn(optGroup, `Substring \`${s.match}\` not found in \`${codeStr}\``);
			for (const indexRange of windows) indexRanges.push(indexRange);
			trimmed = s.rest.trim();
			continue;
		}
		if (trimmed.startsWith('i')) {
			const s = takeRustyString(trimmed, 1);
			if (!s) return warn(optGroup, `Invalid index range.`);
			const indexRange = parseIndexRange(s.match);
			if (!indexRange) return warn(optGroup, `Invalid index range \`${s.match}\``);
			if (indexRange[1] > codeStr.length)
				return warn(
					trimmed,
					`Index range (${indexRange[1]}) greater than line length (${codeStr.length}). Line: \`${codeStr}\``,
				);
			indexRanges.push(indexRange);
			trimmed = s.rest.trim();
			continue;
		}
		// values
		if (trimmed.startsWith('d')) {
			const s = takeRustyString(trimmed, 1);
			if (!s) return warn(optGroup, `Invalid data attribute.`);
			datas.push(s.match);
			trimmed = s.rest.trim();
			continue;
		}
		if (trimmed.startsWith('c')) {
			const s = takeRustyString(trimmed, 1);
			if (!s) return warn(optGroup, `Invalid class.`);
			classes.push(s.match);
			trimmed = s.rest.trim();
			continue;
		}
		return warn(
			optGroup,
			`Invalid char \`${trimmed[0]}\`. Use \`d\`: data | \`c\`: class | \`i\`: index | \`s\`: substring`,
		);
	}

	if (!datas.length && !classes.length) {
		return warn(optGroup, 'No value. Use d for data attribute or c for class.');
	}

	const properties = { datas, classes };

	if (indexRanges.length) return { kind: 'window', val: { indexRanges, properties } };

	return { kind: 'line', val: { properties } };
};
