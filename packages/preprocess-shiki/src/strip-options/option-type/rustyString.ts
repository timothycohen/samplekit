/** Like a [rust raw string](https://doc.rust-lang.org/stable/reference/tokens.html#raw-string-literals)
 *
 * Front delimiter begins with 0 or more '#', ends with "
 *
 * Back delimiter begins with ", ends with same number of '#' as front delimiter
 */
export const takeRustyString = (s: string, startIdx = 0): { match: string; rest: string } | null => {
	let hash = '';

	while (startIdx < s.length && s[startIdx] === '#') {
		hash += '#';
		startIdx++;
	}

	if (s[startIdx] !== '"') return null;

	const frontDelimEnd = startIdx + 1;
	const backDelimStart = s.indexOf(`"${hash}`, frontDelimEnd);
	if (backDelimStart === -1) return null;

	const backDelimEnd = backDelimStart + 1 + hash.length;

	const match = s.slice(frontDelimEnd, backDelimStart);

	if (!match) return null;

	const rest = s.slice(backDelimEnd);

	return { match, rest };
};
