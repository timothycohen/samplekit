import type { PropertiesHyphen as StyleObject } from 'csstype';

// https://github.com/melt-ui/runes/blob/develop/packages/helpers/src/lib/style.ts

/**
 * A utility function that converts a style object to a string.
 *
 * @param style - The style object to convert
 * @returns The style object as a string
 */
export function styleToString(style: StyleObject): string {
	return Object.keys(style).reduce((str, key) => {
		const value = style[key as keyof StyleObject];
		if (value === undefined) {
			return str;
		}
		return `${str}${key}:${value};`;
	}, '');
}
