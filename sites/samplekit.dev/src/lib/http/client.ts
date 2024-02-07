import { get, writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto, invalidateAll } from '$app/navigation';
import type { Result } from '$lib/utils/common';
import type { Method } from './common';

const stripGroup = (str: string) => str.replace(/\/\(.+\)/, '');

type LocalOpts = { invalidate?: boolean; preventDuplicateRequests?: boolean; abortSignal?: AbortSignal };
type GlobalOpts = { invalidate?: true; preventDuplicateRequests?: true };

const createFetcher =
	<RequestData, ResponseData>(fetching: Writable<boolean>, method: Method) =>
	async (url: string, body: RequestData, opts?: LocalOpts) => {
		if (opts?.preventDuplicateRequests && get(fetching))
			return { error: { status: 429, message: 'Too Many Requests' } } as Result<ResponseData>;

		if (browser) fetching.set(true);

		return fetch(stripGroup(url), { signal: opts?.abortSignal, method, body: body ? JSON.stringify(body) : undefined })
			.then((res) => {
				if (res.redirected && browser) return goto(res.url);
				return res.json();
			})
			.then(async (json) => {
				if (browser) {
					if (opts?.invalidate) await invalidateAll();
					fetching.set(false);
				}
				return json as Result<ResponseData>;
			})
			.catch((err) => {
				if (browser) fetching.set(false);
				if ((err instanceof DOMException && err.name === 'AbortError') || err?.status === 499) {
					return { error: { status: 499, message: 'The user aborted the request.' } } as Result<ResponseData>;
				}
				console.error(err);
				return { error: { status: 500, message: 'Internal Error' } } as Result<ResponseData>;
			});
	};

export const createClientFetch = <RouteId extends string, ResponseData, RequestData = void>(
	method: Method,
	staticUrl: RouteId,
	globalOpts?: GlobalOpts,
) => {
	return () => {
		const fetching = writable(false);
		const fetcher = createFetcher<RequestData, ResponseData>(fetching, method);

		const send = async (body: RequestData, localOpts?: LocalOpts): Promise<Result<ResponseData>> =>
			fetcher(staticUrl, body, { ...globalOpts, ...localOpts });

		return { ...fetching, send };
	};
};

export const createDynClientFetch = <ResponseData, RequestData = void, URLProps = void>(
	method: Method,
	urlCreator: (data: URLProps) => string,
	globalOpts?: GlobalOpts,
) => {
	return () => {
		const fetching = writable(false);
		const fetcher = createFetcher<RequestData, ResponseData>(fetching, method);

		const sendUrl = async (
			urlProps: URLProps,
			body: RequestData,
			localOpts?: LocalOpts,
		): Promise<Result<ResponseData>> => fetcher(urlCreator(urlProps), body, { ...globalOpts, ...localOpts });

		return { ...fetching, sendUrl };
	};
};
