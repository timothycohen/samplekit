import type { Range } from '../../types.js';

const parseRange = (base1IndexInclusiveStr: string, endInclusivity: 'inclusive' | 'exclusive'): Range | null => {
	if (!base1IndexInclusiveStr.match(/^[\s\-0-9]+$/)) return null;

	const trimmed = base1IndexInclusiveStr.trim();
	const split = trimmed.split('-');

	if (split.length === 1) {
		const start = Number.parseInt(split[0]!);
		if (!Number.isInteger(start)) return null;
		if (start < 1) return null;
		return [start - 1, endInclusivity === 'inclusive' ? start - 1 : start];
	}

	if (split.length === 2) {
		const start = Number.parseInt(split[0]!);
		const end = Number.parseInt(split[1]!);
		if (
			!Number.isInteger(start) ||
			!Number.isInteger(end) ||
			start < 1 ||
			(endInclusivity === 'inclusive' && start >= end) ||
			(endInclusivity === 'exclusive' && start > end)
		)
			return null;
		return [start - 1, endInclusivity === 'inclusive' ? end - 1 : end];
	}

	return null;
};

const displayRange = (lineRange: Range, endInclusivity: 'inclusive' | 'exclusive') => {
	const min = lineRange[0] + 1;
	const max = lineRange[1] + (endInclusivity === 'inclusive' ? 1 : 0);
	return min === max ? `\`${min}\`` : `\`${min}-${max}\``;
};

/**
 * Convert from either "one-based inclusive" or "one-based inclusive - one-based inclusive"
 * to [zero-based inclusive, zero-based exclusive]
 *
 * useful to match string.slice() or array.slice()
 */
export const parseIndexRange = (base1IndexInclusiveStr: string): Range | null =>
	parseRange(base1IndexInclusiveStr, 'exclusive');

/**
 * Convert from [zero-based inclusive, zero-based exclusive]
 * to "one-based inclusive" or "one-based inclusive - one-based inclusive"
 */
export const displayIndexRange = (lineRange: Range) => displayRange(lineRange, 'exclusive');

/**
 * Convert from either "one-based inclusive" or "one-based inclusive - one-based inclusive"
 * to [zero-based inclusive, zero-based inclusive]
 *
 * useful to match direct indexing
 */
export const parseLineRange = (base1IndexInclusiveStr: string): Range | null =>
	parseRange(base1IndexInclusiveStr, 'inclusive');

/**
 * Convert from [zero-based inclusive, zero-based inclusive]
 * to "one-based inclusive" or "one-based inclusive - one-based inclusive"
 */
export const displayLineRange = (lineRange: Range) => displayRange(lineRange, 'inclusive');

/**
 * Shiki complains if decoration indexes are partially overlapping
 *
 * (1-5 & 1-4 | 1-5 & 1-6 | 1-5 & 2-5 | 3-5 & 2-5)
 */
// export function indexesAreDisjoint(i1: Range, i2: Range) {
// 	if (i1[0] === i2[0] && i1[1] !== i2[1]) return false;
// 	if (i1[1] === i2[1] && i1[0] !== i2[0]) return false;
// 	return true;
// }
