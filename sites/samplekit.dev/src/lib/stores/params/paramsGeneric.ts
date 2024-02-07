import { get, writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { page } from '$app/stores';

// createParam<s>Base require the consumer to update by passing in the param value (setParam) or a validated value of the store type (setCleaned)
// the non-base versions of these functions require a clean function and extend functionality with .set, .update, and .clean methods

type Changed = { changed: boolean };
type GoOpts = { root?: string; deleteOtherParams?: true };
type MaybeGoOpts = { nogo: true; root?: never; deleteOtherParams?: never } | ({ nogo?: never } & GoOpts);

interface Base<T, ParamVal, StoreVal> {
	serialize: (cleanVal: T) => string | null;
	validateAndDeserialize: (uncleanParamVals: ParamVal) => StoreVal;
	subscribe: Writable<StoreVal>['subscribe'];
	getParam: () => ParamVal;
	pushToUrl: (mutUrl: URL) => URL;
	isSynced: (a?: { paramVal?: ParamVal; val?: StoreVal }) => boolean;
	setCleaned: (cleaned: StoreVal, opts?: MaybeGoOpts) => Changed;
	setParam: (param: ParamVal, opts?: MaybeGoOpts) => Changed;
	pullFromUrl: () => void;
	initiallyOutOfSync: boolean;
}

interface ParamBase<T, ParamName extends string> extends Base<T, string | null, T> {
	paramName: ParamName;
}

interface ParamsBase<T, ParamName extends string>
	extends Base<T, Partial<Record<ParamName, string | null>>, Record<ParamName, T>> {
	paramNameMap: Record<ParamName, string>;
	paramKeys: ParamName[];
}

const createUrl = ({ root, deleteOtherParams }: GoOpts = {}): URL => {
	const url = new URL(get(page).url);
	if (root) url.pathname = `${root.startsWith('/') ? '' : '/'}${root}`;
	if (deleteOtherParams) url.search = '';
	return url;
};

export const createParamBase = <V, K extends string = string>(a: {
	paramName: K;
	defaultValue: V;
	validateAndDeserialize: (uncleanParamVal?: string | null) => V;
	/** only called on validated values – does not need to validate */
	serialize: (cleanVal: V) => string | null;
	skipInitGoto?: true;
}): ParamBase<V, K> => {
	type Res = ParamBase<V, K>;

	const { paramName, defaultValue, validateAndDeserialize, serialize, skipInitGoto } = a;

	const store = writable<V>(defaultValue);

	const getParam: Res['getParam'] = () => {
		return get(page).url.searchParams.get(paramName);
	};

	const pushToUrl: Res['pushToUrl'] = (mutUrl) => {
		const currentVal = get(store);
		const currentParam = serialize(currentVal);
		if (currentParam === null) mutUrl.searchParams.delete(paramName);
		else mutUrl.searchParams.set(paramName, currentParam);
		return mutUrl;
	};

	const isSynced: Res['isSynced'] = (a) => {
		const paramVal = a?.paramVal ?? getParam();
		const val = a?.val ?? get(store);
		return paramVal === serialize(val);
	};

	const goImmediate = (opts?: GoOpts): void => {
		goto(pushToUrl(createUrl(opts)), { keepFocus: true, noScroll: true, replaceState: true });
	};

	const go = (() => {
		let timer: NodeJS.Timeout;
		return (opts?: GoOpts) => {
			clearTimeout(timer);
			timer = setTimeout(() => goImmediate(opts), 50);
		};
	})();

	const setCleaned: Res['setCleaned'] = (cleaned, opts) => {
		store.set(cleaned);
		const changed = !isSynced();
		if (changed && !opts?.nogo) go(opts);
		return { changed };
	};

	const setParam: Res['setParam'] = (param, opts) => {
		return setCleaned(validateAndDeserialize(param), opts);
	};

	const pullFromUrl: Res['pullFromUrl'] = () => {
		setParam(getParam());
	};

	const init = (): boolean => {
		const paramVals = getParam();
		store.set(validateAndDeserialize(paramVals));
		const changed = !isSynced();
		if (changed && browser && !skipInitGoto) {
			goImmediate();
		}
		return changed;
	};

	return {
		paramName,
		serialize,
		validateAndDeserialize,
		subscribe: store.subscribe,
		getParam,
		pushToUrl,
		isSynced,
		setCleaned,
		setParam,
		pullFromUrl,
		initiallyOutOfSync: init(),
	} satisfies Res;
};

export const createParamsBase = <V, K extends string = string>(a: {
	/** Key is the field and Value is the URL param.
	 *
	 * For example { foo: 'f', bar: 'b' } will expect an object { foo: V, bar: V } and the url params will be 'f' and 'b' */
	paramNameMap: Record<K, string>;
	defaultValue: Record<K, V>;
	validateAndDeserialize: (a: {
		old: Record<K, V>;
		uncleanParamVals: Partial<Record<K, string | null>>;
	}) => Record<K, V>;
	/** only called on validated values – does not need to validate */
	serialize: (cleanVal: V) => string | null;
	skipInitGoto?: true;
}): ParamsBase<V, K> => {
	type Res = ParamsBase<V, K>;

	const { paramNameMap, serialize, defaultValue, skipInitGoto } = a;

	const validateAndDeserialize: Res['validateAndDeserialize'] = (uncleanParamVals) =>
		a.validateAndDeserialize({ old: get(store), uncleanParamVals });

	const paramKeys: Res['paramKeys'] = Object.keys(paramNameMap) as K[];

	const store = writable<Record<K, V>>(defaultValue);

	const getParam: Res['getParam'] = () => {
		const url = get(page).url;
		return paramKeys.reduce<Partial<Record<K, string | null>>>(
			(total, key) => ({ ...total, [key]: url.searchParams.get(paramNameMap[key]) }),
			{},
		);
	};

	const pushToUrl: Res['pushToUrl'] = (mutUrl) => {
		const currentVal = get(store);
		paramKeys.forEach((key) => {
			const currentParam = serialize(currentVal[key]);
			const paramName = paramNameMap[key];
			if (currentParam === null) mutUrl.searchParams.delete(paramName);
			else mutUrl.searchParams.set(paramName, currentParam);
		});
		return mutUrl;
	};

	const isSynced: Res['isSynced'] = (a = {}) => {
		const paramVal = a.paramVal ?? getParam();
		const val = a.val ?? get(store);
		return paramKeys.every((key) => paramVal[key] === serialize(val[key]));
	};

	const goImmediate = (opts?: GoOpts): void => {
		goto(pushToUrl(createUrl(opts)), { keepFocus: true, noScroll: true, replaceState: true });
	};

	const go = (() => {
		let timer: NodeJS.Timeout;
		return (opts?: GoOpts) => {
			clearTimeout(timer);
			timer = setTimeout(() => goImmediate(opts), 50);
		};
	})();

	const setCleaned: Res['setCleaned'] = (cleaned, opts) => {
		store.set(cleaned);
		const changed = !isSynced();
		if (changed && !opts?.nogo) go(opts);
		return { changed };
	};

	const setParam: Res['setParam'] = (param, opts) => {
		return setCleaned(validateAndDeserialize(param), opts);
	};

	const pullFromUrl: Res['pullFromUrl'] = () => {
		setParam(getParam());
	};

	const init = (): boolean => {
		const paramVals = getParam();
		store.set(validateAndDeserialize(paramVals));
		const changed = !isSynced();
		if (changed && browser && !skipInitGoto) {
			goImmediate();
		}
		return changed;
	};

	return {
		paramNameMap,
		paramKeys,
		serialize,
		validateAndDeserialize,
		subscribe: store.subscribe,
		getParam,
		pushToUrl,
		isSynced,
		setCleaned,
		setParam,
		pullFromUrl,
		initiallyOutOfSync: init(),
	};
};

interface Param<T, ParamName extends string> extends ParamBase<T, ParamName> {
	clean: (unclean: T) => T;
	set: (unclean: T, opts?: MaybeGoOpts) => Changed;
	update: (cb: (old: T) => T) => void;
}

interface Params<T, ParamName extends string> extends ParamsBase<T, ParamName> {
	clean: (unclean: Partial<Record<ParamName, T>>) => Record<ParamName, T>;
	set: (unclean: Partial<Record<ParamName, T>>, opts?: MaybeGoOpts) => Changed;
	update: (cb: (old: Record<ParamName, T>) => Record<ParamName, T>) => void;
}

export const createParam = <V, K extends string = string>(
	a: Parameters<typeof createParamBase<V, K>>[0] & { clean: (uncleanVal: V) => V },
): Param<V, K> => {
	const param = createParamBase(a) as Param<V, K>;
	param.clean = a.clean;
	param.set = (unclean, opts) => param.setCleaned(param.clean(unclean), opts);
	param.update = (cb) => param.set(cb(get(param)));
	return param;
};

export const createParams = <V, K extends string = string>(
	a: Parameters<typeof createParamsBase<V, K>>[0] & { clean: (unclean: Partial<Record<K, V>>) => Record<K, V> },
): Params<V, K> => {
	const param = createParamsBase(a) as Params<V, K>;
	param.clean = a.clean;
	param.set = (unclean, opts) => param.setCleaned(param.clean(unclean), opts);
	param.update = (cb) => param.set(cb(get(param)));
	return param;
};
