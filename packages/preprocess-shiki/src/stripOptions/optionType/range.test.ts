import { expect, test } from 'vitest';
import { parseIndexRange, parseLineRange, displayIndexRange, displayLineRange } from './range.js';

test('parseIndexRange', () => {
	expect(parseIndexRange('1')).toEqual([0, 1]);
	expect(parseIndexRange('13')).toEqual([12, 13]);
	expect(parseIndexRange('1-25')).toEqual([0, 25]);
	expect(parseIndexRange('3-12')).toEqual([2, 12]);

	expect(parseIndexRange('5-5')).toEqual([4, 5]);
	expect(parseIndexRange('')).toEqual(null);
	expect(parseIndexRange('0')).toEqual(null);
	expect(parseIndexRange('2.5')).toEqual(null);
	expect(parseIndexRange('-3')).toEqual(null);
	expect(parseIndexRange('foo')).toEqual(null);
	expect(parseIndexRange('2.5foo')).toEqual(null);
	expect(parseIndexRange('10e^1-12')).toEqual(null);
	expect(parseIndexRange('-')).toEqual(null);
	expect(parseIndexRange('12-3')).toEqual(null);
	expect(parseIndexRange('3-4-5')).toEqual(null);
	expect(parseIndexRange('foo-3')).toEqual(null);
	expect(parseIndexRange('3-bar')).toEqual(null);
});

test('parseLineRange', () => {
	expect(parseLineRange('1')).toEqual([0, 0]);
	expect(parseLineRange('13')).toEqual([12, 12]);
	expect(parseLineRange('1-3')).toEqual([0, 2]);
	expect(parseLineRange('3-12')).toEqual([2, 11]);

	expect(parseLineRange('5-5')).toEqual(null);
	expect(parseLineRange('')).toEqual(null);
	expect(parseLineRange('0')).toEqual(null);
	expect(parseLineRange('2.5')).toEqual(null);
	expect(parseLineRange('-3')).toEqual(null);
	expect(parseLineRange('foo')).toEqual(null);
	expect(parseLineRange('2.5foo')).toEqual(null);
	expect(parseLineRange('10e^1-12')).toEqual(null);
	expect(parseLineRange('-')).toEqual(null);
	expect(parseLineRange('12-3')).toEqual(null);
	expect(parseLineRange('3-4-5')).toEqual(null);
	expect(parseLineRange('foo-3')).toEqual(null);
	expect(parseLineRange('3-bar')).toEqual(null);
});

const surround = (s: string) => `\`${s}\``;

test('displayIndexRange', () => {
	const a = '1';
	expect(displayIndexRange(parseIndexRange(a)!)).toBe(surround(a));
	const b = '1-25';
	expect(displayIndexRange(parseIndexRange(b)!)).toBe(surround(b));
});

test('displayLineRange', () => {
	const a = '1';
	expect(displayLineRange(parseLineRange(a)!)).toBe(surround(a));
	const b = '1-25';
	expect(displayLineRange(parseLineRange(b)!)).toBe(surround(b));
});
