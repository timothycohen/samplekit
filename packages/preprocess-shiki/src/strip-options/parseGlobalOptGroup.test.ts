import { describe, expect, test } from 'vitest';
import { parseGlobalOptGroup } from './parseGlobalOptGroup.js';

describe('parseGlobalOptGroup', () => {
	test('happy path', () => {
		expect(parseGlobalOptGroup({ optStr: 'd"highlight" p', lastLineNum: 1 })).toEqual({
			kind: 'pre',
			val: { classes: [], datas: ['highlight'] },
		});
		expect(parseGlobalOptGroup({ optStr: 'd"highlight" l"1"', lastLineNum: 1 })).toEqual({
			kind: 'line-ranges',
			val: [{ lines: [0, 0], properties: { datas: ['highlight'], classes: [] } }],
		});
		expect(parseGlobalOptGroup({ optStr: 'd"highlight" L', lastLineNum: 1 })).toEqual({
			kind: 'all-lines',
			val: { classes: [], datas: ['highlight'] },
		});
		expect(parseGlobalOptGroup({ optStr: 'c"focus" c"now" l"1" i"3-5"', lastLineNum: 1 })).toEqual({
			kind: 'unveriLineWindows',
			val: { line: [0, 0], properties: { datas: [], classes: ['focus', 'now'] }, windows: [{ start: 2, end: 5 }] },
		});
		expect(parseGlobalOptGroup({ optStr: 'd"highlight" i"5-8"', lastLineNum: 1 })).toEqual({
			kind: 'unveriWindows',
			val: [{ start: 4, end: 8, properties: { datas: ['highlight'], classes: [] } }],
		});
		expect(parseGlobalOptGroup({ optStr: 'l"5" l"6" d"highlight"', lastLineNum: 8 })).toEqual({
			kind: 'line-ranges',
			val: [
				{ lines: [4, 4], properties: { classes: [], datas: ['highlight'] } },
				{ lines: [5, 5], properties: { classes: [], datas: ['highlight'] } },
			],
		});
		expect(parseGlobalOptGroup({ optStr: 'd"highlight" s"foo"', lastLineNum: 1 })).toEqual({
			kind: 'unveriSubstrs',
			val: [{ substr: 'foo', properties: { classes: [], datas: ['highlight'] } }],
		});
		expect(parseGlobalOptGroup({ optStr: 's"foo" l"3-5" d"highlight"', lastLineNum: 5 })).toEqual({
			kind: 'unveriLineSubstrs',
			val: { line: [2, 4], substrs: ['foo'], properties: { classes: [], datas: ['highlight'] } },
		});
		expect(
			parseGlobalOptGroup({ optStr: 'l"5-6" d"highlight" d"diff-add" s"foo" s#"dorame"#', lastLineNum: 8 }),
		).toEqual({
			kind: 'unveriLineSubstrs',
			val: { line: [4, 5], substrs: ['foo', 'dorame'], properties: { classes: [], datas: ['highlight', 'diff-add'] } },
		});
	});

	test('errors', () => {
		const t = (a: Parameters<typeof parseGlobalOptGroup>[0], m: string) =>
			expect((parseGlobalOptGroup(a).val as Error).message).toContain(m);

		t({ optStr: '', lastLineNum: 6 }, 'Empty');
		t({ optStr: 'l"5"', lastLineNum: 6 }, 'No value.');
		t({ optStr: 'x', lastLineNum: 6 }, 'Invalid char');
		t({ optStr: 'd"highlight" c"focus"', lastLineNum: 1 }, 'No location.');
		t({ optStr: 'd"', lastLineNum: 6 }, 'Invalid data');
		t({ optStr: 'l"5-5-', lastLineNum: 6 }, 'Invalid line');
		t({ optStr: 'l"3-', lastLineNum: 6 }, 'Invalid line');
		t({ optStr: 'l"7"', lastLineNum: 6 }, 'greater than code');
		t({ optStr: 'cfoo', lastLineNum: 6 }, 'Invalid class');
		t({ optStr: 's""', lastLineNum: 6 }, 'Invalid substring');
		t({ optStr: 'i"3-2"', lastLineNum: 6 }, 'Invalid index range');
		t({ optStr: 'p s"foo"', lastLineNum: 6 }, 'location type');
		t({ optStr: 's"foo" p', lastLineNum: 6 }, 'location type');
		t({ optStr: 'p i"1-2"', lastLineNum: 6 }, 'location type');
		t({ optStr: 'i"1-2" p', lastLineNum: 6 }, 'location type');
		t({ optStr: 'l"3" p', lastLineNum: 6 }, 'location type');
		t({ optStr: 'l"3" l"5" i"2"', lastLineNum: 6 }, 'one line');
		t({ optStr: 'l"3" l"5" s"foo"', lastLineNum: 6 }, 'one line');
		t({ optStr: 's"foo" i"2-3"', lastLineNum: 1 }, 'substring and index range');
		t({ optStr: 'i"2-3" s"foo"', lastLineNum: 1 }, 'substring and index range');
		t({ optStr: 'd"highlight" l"5,"', lastLineNum: 1 }, 'Invalid line range');
		t({ optStr: 'd"highlight" i"5', lastLineNum: 1 }, 'Invalid index range');
		t({ optStr: 'd"highlight" s"5', lastLineNum: 1 }, 'Invalid substring');
	});
});
