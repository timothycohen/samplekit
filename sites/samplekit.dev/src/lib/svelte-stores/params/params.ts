import { get } from 'svelte/store';
import { createParam, createParams } from './paramsGeneric';

type BaseArgs<V, K extends string = string> = Pick<
	Parameters<typeof createParam<V, K>>[0],
	'paramName' | 'skipInitGoto'
> & { defaultValue?: V };

type BaseArgsP<V, K extends string = string> = Pick<
	Parameters<typeof createParams<V, K>>[0],
	'paramNameMap' | 'skipInitGoto'
> & { defaultValue?: Record<K, V> };

export const createStringParam = (a: BaseArgs<string | null>) => {
	return createParam<string | null>({
		defaultValue: null,
		...a,
		serialize: (cleanVal) => cleanVal,
		deserialize: (paramVal) => paramVal || null,
		clean: (uncleanVal) => (typeof uncleanVal === 'string' ? uncleanVal || null : null),
	});
};

export const createNullableBoolParam = (a: BaseArgs<boolean | null>) => {
	// ParamVal: 'true' | 'false' | null
	const param = createParam<boolean | null>({
		defaultValue: null,
		...a,
		serialize: (cleanVal) => (cleanVal === true ? 'true' : cleanVal === false ? 'false' : null),
		deserialize: (paramVal) => (paramVal === 'true' ? true : paramVal === 'false' ? false : null),
		clean: (uncleanVal) => (typeof uncleanVal === 'boolean' ? uncleanVal : null),
	}) as ReturnType<typeof createParam<boolean | null>> & {
		toggle: () => void;
		toggleNull: () => void;
	};

	param.toggle = () => param.set(get(param) === true ? false : true);
	param.toggleNull = () => param.set(get(param) === true ? null : true);

	return param;
};

export const createFlagParam = (a: BaseArgs<true | null>) => {
	// ParamVal: 'true' | null
	const param = createParam<true | null>({
		defaultValue: null,
		...a,
		serialize: (cleanVal) => (cleanVal === true ? 'true' : null),
		deserialize: (paramVal) => (paramVal === 'true' ? true : null),
		clean: (uncleanVal) => (uncleanVal === true ? true : null),
	}) as ReturnType<typeof createParam<true | null>> & {
		toggle: () => void;
	};

	param.toggle = () => param.set(get(param) === true ? null : true);

	return param;
};

export const createNumParam = (
	a: BaseArgs<number>,
	opts: { min?: number; max?: number; wrap?: never } | { min: number; max: number; wrap: true } = {},
) => {
	const { max, min, wrap } = opts;

	const clean = (uncleanVal: number): number => {
		if (typeof uncleanVal !== 'number' || isNaN(uncleanVal)) return min ?? 0;

		if (wrap) {
			if (uncleanVal === min - 1) return max;
			if (uncleanVal === max + 1) return min;
		}

		if (min !== undefined && uncleanVal < min) return min;
		if (max !== undefined && uncleanVal > max) return max;

		return uncleanVal;
	};

	const deserialize = (uncleanVal: string | null): number => {
		if (typeof uncleanVal !== 'string') return min ?? 0;
		const num = parseInt(uncleanVal, 10);
		return clean(num);
	};

	const param = createParam<number>({
		defaultValue: 0,
		...a,
		serialize: (val) => (val === 0 ? null : val.toString()),
		deserialize,
		clean,
	}) as ReturnType<typeof createParam<number>> & {
		prev: () => void;
		next: () => void;
	};

	param.prev = () => param.set(get(param) - 1);
	param.next = () => param.set(get(param) + 1);

	return param;
};

export const createSelectParam = <Value extends { paramName: string | null }>(
	a: BaseArgs<{ label: string; value: Value }>,
	{ options }: { options: { label: string; value: Value }[] },
) => {
	type SortItem = { label: string; value: Value };

	const hasParamName = (maybe: unknown): maybe is { value: { paramName: string } } => {
		try {
			if (typeof ((maybe ?? {}) as { value: { paramName: string } })?.value?.paramName !== 'string') return false;
		} catch (_) {
			return false;
		}
		return true;
	};

	const defaultValue = a.defaultValue ?? options[0]!;

	const param = createParam<SortItem>({
		defaultValue,
		...a,
		serialize: (val) => val.value.paramName,
		deserialize: (paramVal) => options.find((i) => i.value.paramName === paramVal) ?? defaultValue,
		clean: (uncleanVal) => {
			if (!hasParamName(uncleanVal)) return defaultValue;
			return options.find((i) => i.value.paramName === uncleanVal.value.paramName) ?? defaultValue;
		},
	}) as ReturnType<typeof createParam<SortItem>> & {
		items: SortItem[];
	};

	param.items = options;

	return param;
};

const strToNum = (s?: string | null): number | null => {
	if (!s) return null;
	const stripped = s.replace(/[^0-9]/g, '');
	if (stripped === '') return null;
	const num = parseInt(stripped, 10);
	if (isNaN(num)) return null;
	return num;
};

const withinBounds = ({
	num,
	absMax,
	absMin,
}: {
	num: number | null;
	absMax?: number;
	absMin?: number;
}): number | null => {
	if (num === null) return null;
	return Math.max(absMin ?? 0, Math.min(absMax ?? Infinity, num));
};

export const cleanMinMax: (a: {
	absMax?: number;
	curMax?: number | null;
	curMin?: number | null;
	newMax?: number | null;
	newMin?: number | null;
}) => { min: number | null; max: number | null } = ({ absMax, curMax, curMin, newMax, newMin }) => {
	const cleanMin = withinBounds({ num: newMin === undefined ? (curMin ?? null) : newMin, absMax });
	const cleanMax = withinBounds({ num: newMax === undefined ? (curMax ?? null) : newMax, absMax });

	if (cleanMin === null || cleanMax === null || cleanMax >= cleanMin) {
		return { min: cleanMin, max: cleanMax };
	}

	if (newMin !== undefined && newMax !== undefined) {
		return { min: cleanMin, max: null }; // arbitrary choice
	}
	if (newMin !== undefined && newMax === undefined) {
		return { min: cleanMin, max: cleanMin };
	}
	if (newMin === undefined && newMax !== undefined) {
		return { min: cleanMax, max: cleanMax };
	}

	return { min: null, max: null }; // curMin and curMax are invalid
};

export const cleanMinMaxStr = (a: {
	absMax?: number;
	curMax?: number | null;
	curMin?: number | null;
	newMax?: string | null;
	newMin?: string | null;
}) => {
	return cleanMinMax({
		absMax: a.absMax,
		curMax: a.curMax,
		curMin: a.curMin,
		newMax: typeof a.newMax === 'string' ? strToNum(a.newMax) : a.newMax,
		newMin: typeof a.newMin === 'string' ? strToNum(a.newMin) : a.newMin,
	});
};

export const createMinMaxParams = (a: BaseArgsP<number | null, 'min' | 'max'>, { absMax }: { absMax: number }) => {
	type Key = 'min' | 'max';
	type Value = number | null;

	const res = createParams<Value, Key>({
		defaultValue: { min: null, max: null },
		...a,
		serializeOne: (a) => (a === null ? a : a.toString()),
		deserialize: ({ old, uncleanParamVals }) =>
			cleanMinMaxStr({
				curMin: old.min,
				curMax: old.max,
				absMax,
				newMin: uncleanParamVals.min,
				newMax: uncleanParamVals.max,
			}),
		clean: (unclean) => cleanMinMax({ absMax, newMax: unclean.max, newMin: unclean.min }),
	}) as ReturnType<typeof createParams<Value, Key>> & {
		absMax: number;
	};

	res.absMax = absMax;

	return res;
};
