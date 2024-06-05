import { get, writable, type Readable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
page; // https://github.com/sveltejs/eslint-plugin-svelte/issues/652#issuecomment-2087008855

type Changed = { changed: boolean };
type GoOpts = { root?: string; deleteOtherParams?: true };
type MaybeGoOpts = { nogo: true; root?: never; deleteOtherParams?: never } | ({ nogo?: never } & GoOpts);

type ParamVal = string | null;

interface ParamGeneric<Val, ParamName extends string> {
	paramName: ParamName;
	getParam: () => ParamVal;
	subscribe: Readable<Val>['subscribe'];
	serialize: (cleanVal: Val) => ParamVal;
	deserialize: (uncleanParamVal: ParamVal) => Val;
	clean: (uncleanVal: Val) => Val;
	pushToUrl: (mutUrl: URL) => URL;
	pullFromUrl: () => void;
	setParam: (paramVal: ParamVal, opts?: MaybeGoOpts) => Changed;
	set: (uncleanVal: Val, opts?: MaybeGoOpts) => Changed;
	update: (cb: (old: Val) => Val) => void;
	setCleaned: (cleaned: Val, opts?: MaybeGoOpts) => Changed;
	isSynced: (a?: { paramVal?: ParamVal; val?: Val }) => boolean;
	initiallyOutOfSync: boolean;
}

const createUrl = ({ root, deleteOtherParams }: GoOpts = {}): URL => {
	const url = new URL(get(page).url);
	if (root) url.pathname = `${root.startsWith('/') ? '' : '/'}${root}`;
	if (deleteOtherParams) url.search = '';
	return url;
};

export const createParam = <Val, ParamName extends string = string>({
	paramName,
	defaultValue,
	skipInitGoto,
	serialize,
	deserialize,
	clean,
}: Pick<ParamGeneric<Val, ParamName>, 'clean' | 'serialize' | 'deserialize'> & {
	paramName: ParamName;
	defaultValue: Val;
	skipInitGoto?: true;
}): ParamGeneric<Val, ParamName> => {
	type Res = ParamGeneric<Val, ParamName>;

	const store = writable<Val>(defaultValue);

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

	const goImmediate = (opts?: GoOpts): void => {
		goto(pushToUrl(createUrl(opts)), { keepFocus: true, noScroll: true, replaceState: true });
	};

	const go = (() => {
		let timer: ReturnType<typeof setTimeout>;
		return (opts?: GoOpts) => {
			clearTimeout(timer);
			timer = setTimeout(() => goImmediate(opts), 50);
		};
	})();

	const isSynced: Res['isSynced'] = (a) => {
		const paramVal = a?.paramVal ?? getParam();
		const val = a?.val ?? get(store);
		return paramVal === serialize(val);
	};

	const setCleaned: Res['setCleaned'] = (cleaned, opts) => {
		store.set(cleaned);
		const changed = !isSynced();
		if (changed && !opts?.nogo) go(opts);
		return { changed };
	};

	const set: Res['set'] = (unclean, opts) => setCleaned(clean(unclean), opts);

	const update: Res['update'] = (cb) => set(cb(get(store)));

	const setParam: Res['setParam'] = (param, opts) => {
		return setCleaned(deserialize(param), opts);
	};

	const pullFromUrl: Res['pullFromUrl'] = () => {
		setParam(getParam());
	};

	const init = (): boolean => {
		const paramVals = getParam();
		store.set(deserialize(paramVals));
		const changed = !isSynced();
		if (changed && browser && !skipInitGoto) {
			goImmediate();
		}
		return changed;
	};

	return {
		paramName,
		getParam,
		subscribe: store.subscribe,
		serialize,
		clean,
		pushToUrl,
		pullFromUrl,
		setParam,
		set,
		update,
		deserialize,
		setCleaned,
		isSynced,
		initiallyOutOfSync: init(),
	};
};

interface ParamsGeneric<
	Val,
	ParamName extends string,
	Params = Record<ParamName, ParamVal>,
	Store = Record<ParamName, Val>,
> {
	paramNameMap: Record<ParamName, string>;
	paramKeys: ParamName[];
	getParams: () => Partial<Params>;
	subscribe: Readable<Store>['subscribe'];
	serializeOne: (cleanVal: Val) => ParamVal;
	deserialize: (uncleanParamVals: Partial<Params>) => Store;
	clean: (unclean: Partial<Store>) => Store;
	pushToUrl: (mutUrl: URL) => URL;
	pullFromUrl: () => void;
	setParams: (param: Partial<Params>, opts?: MaybeGoOpts) => Changed;
	set: (unclean: Partial<Store>, opts?: MaybeGoOpts) => Changed;
	update: (cb: (old: Store) => Store) => void;
	setCleaned: (cleaned: Store, opts?: MaybeGoOpts) => Changed;
	isSynced: (a?: { paramVal?: Partial<Params>; val?: Store }) => boolean;
	initiallyOutOfSync: boolean;
}

export const createParams = <Val, ParamName extends string = string>({
	clean,
	defaultValue,
	paramNameMap,
	serializeOne,
	deserialize: _deserialize,
	skipInitGoto,
}: Pick<ParamsGeneric<Val, ParamName>, 'serializeOne' | 'clean'> & {
	paramNameMap: Record<ParamName, string>;
	defaultValue: Record<ParamName, Val>;
	skipInitGoto?: true;
	deserialize: (a: {
		old: Record<ParamName, Val>;
		uncleanParamVals: Partial<Record<ParamName, ParamVal>>;
	}) => Record<ParamName, Val>;
}): ParamsGeneric<Val, ParamName> => {
	type Res = ParamsGeneric<Val, ParamName>;

	const deserialize = (uncleanParamVals: Partial<Record<ParamName, ParamVal>>) =>
		_deserialize({ old: get(store), uncleanParamVals });

	const paramKeys: Res['paramKeys'] = Object.keys(paramNameMap) as ParamName[];

	const store = writable<Record<ParamName, Val>>(defaultValue);

	const getParams: Res['getParams'] = () => {
		const url = get(page).url;
		return paramKeys.reduce((total, key) => ({ ...total, [key]: url.searchParams.get(paramNameMap[key]) }), {});
	};

	const pushToUrl: Res['pushToUrl'] = (mutUrl) => {
		const currentVal = get(store);
		paramKeys.forEach((key) => {
			const currentParam = serializeOne(currentVal[key]);
			const paramName = paramNameMap[key];
			if (currentParam === null) mutUrl.searchParams.delete(paramName);
			else mutUrl.searchParams.set(paramName, currentParam);
		});
		return mutUrl;
	};

	const isSynced: Res['isSynced'] = (a = {}) => {
		const paramVal = a.paramVal ?? getParams();
		const val = a.val ?? get(store);
		return paramKeys.every((key) => paramVal[key] === serializeOne(val[key]));
	};

	const goImmediate = (opts?: GoOpts): void => {
		goto(pushToUrl(createUrl(opts)), { keepFocus: true, noScroll: true, replaceState: true });
	};

	const go = (() => {
		let timer: ReturnType<typeof setTimeout>;
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

	const set: Res['set'] = (unclean, opts) => setCleaned(clean(unclean), opts);

	const update: Res['update'] = (cb) => set(cb(get(store)));

	const setParams: Res['setParams'] = (param, opts) => {
		return setCleaned(deserialize(param), opts);
	};

	const pullFromUrl: Res['pullFromUrl'] = () => {
		setParams(getParams());
	};

	const init = (): boolean => {
		const paramVals = getParams();
		store.set(deserialize(paramVals));
		const changed = !isSynced();
		if (changed && browser && !skipInitGoto) {
			goImmediate();
		}
		return changed;
	};

	return {
		paramNameMap,
		paramKeys,
		getParams,
		subscribe: store.subscribe,
		serializeOne,
		deserialize,
		clean,
		pushToUrl,
		pullFromUrl,
		setParams,
		set,
		update,
		setCleaned,
		isSynced,
		initiallyOutOfSync: init(),
	};
};
