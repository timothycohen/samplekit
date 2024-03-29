export const cap = <T extends string>(word: T): Capitalize<T> =>
	((word[0]?.toUpperCase() ?? '') + word.substring(1)) as Capitalize<T>;

export const pluralize = (word: string, count: number): string => (count === 1 ? word : `${word}s`);

export const indefiniteArticle = (word: string): 'a' | 'an' => (word[0]?.match(/[aeiou]/i) ? 'an' : 'a');

export const toHumanReadableTime = (seconds: number) => {
	if (seconds < 60) return `${seconds} seconds`;
	if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
	return `${Math.floor(seconds / 3600)} hours`;
};

export const kebabToTitleCase = (str: string) =>
	str
		.split('-')
		.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
		.join(' ');
