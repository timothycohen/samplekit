export * from './types';
export * from './language';

export const assertUnreachable = (e: never): never => {
	throw new Error(`Unreachable code reached: ${e}`);
};

export function debounce<A extends unknown[], R>(func: (...args: A) => R, timeout: number) {
	let timer: NodeJS.Timeout;

	return (...args: A) => {
		clearTimeout(timer);
		timer = setTimeout(() => func(...args), timeout);
	};
}
