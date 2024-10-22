import { parseIndexRange, parseLineRange } from './option-type/range.js';
import { takeRustyString } from './option-type/rustyString.js';
import { escapeOptGroup } from './option-type/utils.js';
import type { Range, PropertyArrays } from '../types.js';

const warn = (str: string, msg: string) => {
	return { kind: 'error', val: Error(`Invalid global option group \`${str}\`. ${msg}`) } as const;
};

export const parseGlobalOptGroup = ({
	optStr,
	lastLineNum,
}: {
	optStr: string;
	lastLineNum: number;
}):
	| { kind: 'error'; val: Error }
	| { kind: 'pre'; val: PropertyArrays }
	| { kind: 'all-lines'; val: PropertyArrays }
	| { kind: 'line-ranges'; val: Array<{ lines: Range; properties: PropertyArrays }> }
	| { kind: 'unveriSubstrs'; val: Array<{ substr: string; properties: PropertyArrays }> }
	| { kind: 'unveriWindows'; val: Array<{ start: number; end: number; properties: PropertyArrays }> }
	| { kind: 'unveriLineSubstrs'; val: { substrs: string[]; line: Range; properties: PropertyArrays } }
	| {
			kind: 'unveriLineWindows';
			val: { windows: { start: number; end: number }[]; line: Range; properties: PropertyArrays };
	  } => {
	let trimmed = escapeOptGroup(optStr);
	if (trimmed === '') return warn(trimmed, 'Empty line');

	const datas: PropertyArrays['datas'] = [];
	const classes: PropertyArrays['classes'] = [];
	const lines: Range[] = [];
	const substrs: string[] = [];
	const indexRanges: Range[] = [];

	let is: 'p' | 'L' | null = null;

	while (trimmed.length) {
		// properties
		if (trimmed.startsWith('d')) {
			const s = takeRustyString(trimmed, 1);
			if (!s) return warn(optStr, `Invalid data attribute.`);
			const [key, value] = s.match.split('=');
			if (value) datas.push([key!, value]);
			else datas.push(key!);
			trimmed = s.rest.trim();
			continue;
		}
		if (trimmed.startsWith('c')) {
			const s = takeRustyString(trimmed, 1);
			if (!s) return warn(optStr, `Invalid class`);
			classes.push(s.match);
			trimmed = s.rest.trim();
			continue;
		}
		// locations
		if (trimmed.startsWith('p')) {
			if (substrs.length || lines.length || indexRanges.length || is === 'L')
				return warn(optStr, 'Pre cannot be used with another location type.');

			is = 'p';
			trimmed = trimmed.slice(1).trimStart();
			continue;
		}
		if (trimmed.startsWith('L')) {
			if (is === 'p' || substrs.length || lines.length || indexRanges.length)
				return warn(optStr, 'All lines cannot be used with another location type.');

			is = 'L';
			trimmed = trimmed.slice(1).trimStart();
			continue;
		}
		if (trimmed.startsWith('l')) {
			if (is) return warn(optStr, 'Pre cannot be used with another location type.');
			if (lines.length && indexRanges.length) return warn(optStr, `Only one line range can be used with index ranges.`);
			if (lines.length && substrs.length) return warn(optStr, `Only one line range can be used with substrings.`);

			const s = takeRustyString(trimmed, 1);
			if (!s) return warn(optStr, 'Invalid line.');
			const parsed = parseLineRange(s.match);
			if (!parsed) return warn(optStr, `Invalid line range \`${s.match}\``);
			if (parsed[1] >= lastLineNum)
				return warn(optStr, `Line range \`${s.match}\` is greater than code lines \`${lastLineNum}\`.`);
			lines.push(parsed);
			trimmed = s.rest.trim();
			continue;
		}
		if (trimmed.startsWith('s')) {
			if (is) return warn(optStr, 'Pre cannot be used with another location type.');
			if (lines.length > 1) return warn(optStr, `Only one line range can be used with substrings.`);
			if (indexRanges.length) return warn(optStr, 'Cannot specify both substring and index range.');

			const s = takeRustyString(trimmed, 1);
			if (!s) return warn(optStr, `Invalid substring.`);
			substrs.push(s.match);
			trimmed = s.rest.trim();
			continue;
		}
		if (trimmed.startsWith('i')) {
			if (is) return warn(optStr, 'Pre cannot be used with another location type.');
			if (lines.length > 1) return warn(optStr, `Only one line range can be used with index ranges.`);
			if (substrs.length) return warn(optStr, 'Cannot specify both substring and index range.');

			const s = takeRustyString(trimmed, 1);
			if (!s) return warn(optStr, `Invalid index range.`);
			const parsed = parseIndexRange(s.match);
			if (!parsed) return warn(optStr, `Invalid index range \`${s.match}\``);
			indexRanges.push(parsed);
			trimmed = s.rest.trim();
			continue;
		}
		return warn(
			optStr,
			`Invalid char \`${trimmed[0]}\`. Use \`d\`: data | \`c\`: class | \`i\`: index | \`s\`: substring | \`l\`: line range | \`L\`: all lines | \`p\`: pre.`,
		);
	}

	if (!datas.length && !classes.length) return warn(optStr, 'No value. Use d for data attribute or c for class.');
	if (!is && !lines.length && !substrs.length && !indexRanges.length)
		return warn(
			optStr,
			'No location. Use l for line range, L for all lines, s for substring, i for index ranges, or p for pre.',
		);

	const properties = { datas, classes };

	// pre only
	if (is === 'p') return { kind: 'pre', val: properties };

	// All lines only
	if (is === 'L') return { kind: 'all-lines', val: properties };

	// lines only
	if (!substrs.length && !indexRanges.length)
		return { kind: 'line-ranges', val: lines.map((l) => ({ lines: l, properties })) };

	// substrs only
	if (!lines.length && !indexRanges.length) {
		return { kind: 'unveriSubstrs', val: substrs.map((substr) => ({ substr, properties })) };
	}

	// indexes only
	if (!lines.length && !substrs.length) {
		return { kind: 'unveriWindows', val: indexRanges.map(([start, end]) => ({ start, end, properties })) };
	}

	if (lines.length === 1 && substrs.length) {
		return { kind: 'unveriLineSubstrs', val: { line: lines[0]!, properties, substrs } };
	}
	if (lines.length === 1 && indexRanges.length) {
		return {
			kind: 'unveriLineWindows',
			val: { line: lines[0]!, properties, windows: indexRanges.map(([start, end]) => ({ start, end })) },
		};
	}
	throw new Error('unreachable');
};
