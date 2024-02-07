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

type DateStyle = Intl.DateTimeFormatOptions['dateStyle'];

export function formatDate(date: string | Date, dateStyle: DateStyle = 'medium', locales = 'en') {
	const formatter = new Intl.DateTimeFormat(locales, { dateStyle });
	return formatter.format(new Date(date));
}
