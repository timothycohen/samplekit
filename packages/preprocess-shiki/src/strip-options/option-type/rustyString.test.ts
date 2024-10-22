import { expect, test } from 'vitest';
import { takeRustyString } from './rustyString.js';

test('takeRustyString', () => {
	expect(takeRustyString('#"foo"#')).toEqual({ match: 'foo', rest: '' });
	expect(takeRustyString('##"foo"##baz')).toEqual({ match: 'foo', rest: 'baz' });
	expect(takeRustyString('##"foo"##"##baz')).toEqual({ match: 'foo', rest: '"##baz' });

	expect(takeRustyString('')).toBe(null);
	expect(takeRustyString('')).toBe(null);
	expect(takeRustyString('""')).toBe(null);
	expect(takeRustyString('#""#f')).toBe(null);
	expect(takeRustyString('##foo"##baz')).toBe(null);
	expect(takeRustyString('##"foo##baz')).toBe(null);
});
