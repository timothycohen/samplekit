export const assertUnreachable = (e: never): never => {
	throw new Error(`Unreachable code reached: ${e}`);
};

export const cap = <T extends string>(word: T): Capitalize<T> =>
	((word[0]?.toUpperCase() ?? '') + word.substring(1)) as Capitalize<T>;
