export const cap = <T extends string>(word: T): Capitalize<T> =>
	((word[0]?.toUpperCase() ?? '') + word.substring(1)) as Capitalize<T>;

export const pluralize = (word: string, count: number): string => (count === 1 ? word : `${word}s`);

export const indefiniteArticle = (word: string): 'a' | 'an' => (word[0]?.match(/[aeiou]/i) ? 'an' : 'a');
