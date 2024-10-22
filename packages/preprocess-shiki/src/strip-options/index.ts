import { findAllSubstrWindows } from './findAllSubstrWindows.js';
import { displayLineRange } from './option-type/range.js';
import { parseGlobalOptGroup } from './parseGlobalOptGroup.js';
import { parseLineOptGroup } from './parseLineOptGroup.js';
import { splitCodeFence } from './splitCodeFence.js';
import type { Range, PropertyArrays } from '../types.js';

const stripDecorationsFromLines = ({
	mut_codelines,
	addLineProperties,
	addWindowProperties,
	reportWarning,
}: {
	mut_codelines: string[];
	addLineProperties: (lineNum: number, properties: PropertyArrays) => void;
	addWindowProperties: (val: { start: number; end: number; properties: PropertyArrays }) => void;
	reportWarning?: (error: Error) => void;
}): { lineRanges: Range[] } => {
	let lineIdxStart = 0;
	const lineRanges = new Array(mut_codelines.length) as Range[];

	for (let lineNum = 0; lineNum < mut_codelines.length; lineNum++) {
		const line = mut_codelines[lineNum]!;
		let codeStr;
		const last = lineNum === mut_codelines.length - 1;

		const startIdx = line.search(/\/\/!p?/);
		if (startIdx === -1) {
			codeStr = line + (last ? '' : '\n');
		} else if (line[startIdx + 3] === 'p') {
			codeStr = line.replace('//!p', '//!') + (last ? '' : '\n');
		} else {
			codeStr = line.slice(0, startIdx) + (last ? '' : '\n');
			const optGroup = line.slice(startIdx + 3).trimStart();
			const { kind, val } = parseLineOptGroup({ codeStr, optGroup });

			if (kind === 'err') reportWarning?.(val);
			else if (kind === 'line') addLineProperties(lineNum, val.properties);
			else if (kind === 'window') {
				for (const [start, end] of val.indexRanges) {
					if (start === 0 && end === codeStr.length) {
						addLineProperties(lineNum, val.properties);
					} else {
						addWindowProperties({ start: lineIdxStart + start, end: lineIdxStart + end, properties: val.properties });
					}
				}
			}
		}
		mut_codelines[lineNum] = codeStr;
		lineRanges[lineNum] = [lineIdxStart, lineIdxStart + codeStr.length];
		lineIdxStart = lineIdxStart + codeStr.length;
	}

	return { lineRanges };
};

type CodeWindow = ({
	lines,
	indexRange,
}:
	| { lines: Range; indexRange: Range }
	| { lines?: never; indexRange: Range }
	| { lines: Range; indexRange?: never }) => { startIdx: number; endIdx: number; code: string };

const parseGlobalOptGroups = ({
	getCodeWindow,
	lastLineNum,
	lineRangeToIndexRange,
	addPreProperties,
	addAllLinesProperties,
	addLineProperties,
	addWindowProperties,
	optGroups,
	strippedCode,
	reportWarning,
}: {
	getCodeWindow: CodeWindow;
	lastLineNum: number;
	lineRangeToIndexRange: (lines: Range) => Range;
	optGroups: string[];
	strippedCode: string;
	addPreProperties: (p: PropertyArrays) => void;
	addAllLinesProperties: (p: PropertyArrays) => void;
	addLineProperties: (lineNum: number, properties: PropertyArrays) => void;
	addWindowProperties: (val: { start: number; end: number; properties: PropertyArrays }) => void;
	reportWarning?: (err: Error) => void;
}): void => {
	for (const optStr of optGroups) {
		const { kind, val } = parseGlobalOptGroup({ optStr, lastLineNum });

		if (kind === 'error') reportWarning?.(val);
		else if (kind === 'pre') addPreProperties(val);
		else if (kind === 'all-lines') addAllLinesProperties(val);
		else if (kind === 'line-ranges') {
			for (const { properties, lines } of val)
				for (let lineNum = lines[0]; lineNum <= lines[1]; lineNum++) addLineProperties(lineNum, properties);
		} else if (kind === 'unveriSubstrs') {
			for (const { properties, substr } of val) {
				const windows = findAllSubstrWindows(strippedCode, substr);
				if (!windows.length) reportWarning?.(Error(`Substring \`${substr}\` not found in codeblock.`));
				else for (const [start, end] of windows) addWindowProperties({ start, end, properties });
			}
		} else if (kind === 'unveriWindows') {
			for (const { properties, start, end } of val) {
				if (end > strippedCode.length)
					reportWarning?.(Error(`Index \`${end}\` greater than codeblock length \`${strippedCode.length}\`.`));
				else addWindowProperties({ start, end, properties });
			}
		} else if (kind === 'unveriLineWindows') {
			const { line, properties, windows } = val;
			const [startIdx, endIdx] = lineRangeToIndexRange(line);
			const width = endIdx - startIdx;
			for (const { start, end } of windows) {
				if (end > width)
					reportWarning?.(
						Error(`Index \`${end}\` greater than line range ${displayLineRange(line)} length \`${width}\`.`),
					);
				else addWindowProperties({ start: startIdx + start, end: startIdx + end, properties });
			}
		} else if (kind === 'unveriLineSubstrs') {
			const { line, properties, substrs } = val;
			const { code, startIdx: codeStart } = getCodeWindow({ lines: line });
			for (const substr of substrs) {
				const windows = findAllSubstrWindows(code, substr);
				if (!windows.length)
					reportWarning?.(Error(`Substring \`${substr}\` not found in line range ${displayLineRange(line)}.`));
				else
					for (const [windowStart, windowEnd] of windows)
						addWindowProperties({ start: codeStart + windowStart, end: codeStart + windowEnd, properties });
			}
		}
	}
};

export const stripOptions = (str: string, reportWarning?: (error: Error) => void) => {
	const split = splitCodeFence(str);
	if (split instanceof Error) return split;
	const { tranName, globalOptGroups, fence, lang, codeAndOptGroupLines: mut_codelines } = split;

	const lineToProperties = new Map<number, PropertyArrays>();
	const addLineProperties = (lineNum: number, properties: PropertyArrays) => {
		const ref = lineToProperties.get(lineNum);
		if (ref) {
			ref.classes.push(...properties.classes);
			ref.datas.push(...properties.datas);
		} else {
			lineToProperties.set(lineNum, properties);
		}
	};

	const windowProperties: Array<{ start: number; end: number; properties: PropertyArrays }> = [];
	const addWindowProperties = (val: { start: number; end: number; properties: PropertyArrays }) =>
		windowProperties.push(val);

	const { lineRanges } = stripDecorationsFromLines({
		mut_codelines,
		addLineProperties,
		addWindowProperties,
		reportWarning,
	});

	const strippedCode = mut_codelines.join('');
	const lineRangeToIndexRange = (lines: Range): Range => [lineRanges[lines[0]]![0], lineRanges[lines[1]]![1]];
	const lastLineNum = lineRanges.length;

	const getCodeWindow: CodeWindow = ({ lines, indexRange }) => {
		if (lines && indexRange) {
			const range = lineRangeToIndexRange(lines);
			const startIdx = range[0] + indexRange[0];
			const endIdx = range[1] + indexRange[0] + indexRange[1];
			return { startIdx, endIdx, code: strippedCode.slice(startIdx, endIdx) };
		}

		if (lines) {
			const range = lineRangeToIndexRange(lines);
			const startIdx = range[0];
			const endIdx = range[1];
			return { startIdx, endIdx, code: strippedCode.slice(startIdx, endIdx) };
		}

		const [startIdx, endIdx] = indexRange;

		return { startIdx, endIdx, code: strippedCode.slice(indexRange[0], indexRange[1]) };
	};

	const preProperties: PropertyArrays = { classes: [], datas: [] };
	const addPreProperties = (properties: PropertyArrays) => {
		preProperties.classes.push(...properties.classes);
		preProperties.datas.push(...properties.datas);
	};

	const allLinesProperties: PropertyArrays = { classes: [], datas: [] };
	const addAllLinesProperties = (properties: PropertyArrays) => {
		allLinesProperties.classes.push(...properties.classes);
		allLinesProperties.datas.push(...properties.datas);
	};

	parseGlobalOptGroups({
		getCodeWindow,
		lastLineNum,
		lineRangeToIndexRange,
		addLineProperties,
		addWindowProperties,
		addPreProperties,
		addAllLinesProperties,
		optGroups: globalOptGroups,
		strippedCode,
		reportWarning,
	});

	return {
		tranName,
		fence,
		lang,
		strippedCode,
		lineToProperties,
		preProperties,
		windowProperties,
		allLinesProperties,
	};
};
