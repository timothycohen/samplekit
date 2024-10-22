import type { Range } from '../types.js';

export function findAllSubstrWindows(str: string, substr: string): Range[] {
	const indexes: Range[] = [];
	let i = -1;
	while ((i = str.indexOf(substr, i + 1)) !== -1) indexes.push([i, i + substr.length]);
	return indexes;
}
