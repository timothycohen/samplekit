import { get, writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto, invalidateAll } from '$app/navigation';
import { logger } from '$lib/logging/client';
import type { Result } from '$lib/utils/common';
import type { Method } from './common';

const stripGroup = (str: string) => str.replace(/\/\(.+\)/, '');

type LocalOpts = {
	invalidate?: boolean;
	preventDuplicateRequests?: boolean;
	delayMs?: number;
	timeoutMs?: number;
	abortSignal?: AbortSignal;
};
type GlobalOpts = { invalidate?: true; preventDuplicateRequests?: true };

const createFetcher =
	<RequestData, ResponseData>(
		{
			submitting,
			delayed,
			timeout,
		}: { submitting: Writable<boolean>; delayed: Writable<boolean>; timeout: Writable<boolean> },
		method: Method,
	) =>
	async (url: string, body: RequestData, opts?: LocalOpts) => {
		if (!browser) return { error: { status: 500, message: 'Client fetch called on server' } } as Result<ResponseData>;

		if (opts?.preventDuplicateRequests && get(submitting))
			return { error: { status: 429, message: 'Too Many Requests' } } as Result<ResponseData>;

		submitting.set(true);
		const delayTimeout = setTimeout(() => delayed.set(true), opts?.delayMs ?? 500);
		const timeoutTimeout = setTimeout(() => timeout.set(true), opts?.timeoutMs ?? 10000);

		const finish = () => {
			clearTimeout(delayTimeout);
			clearTimeout(timeoutTimeout);
			submitting.set(false);
			delayed.set(false);
			timeout.set(false);
		};

		let cleanBody;
		try {
			cleanBody = body ? JSON.stringify(body) : undefined;
		} catch (err) {
			logger.error(err);
			return { error: { status: 400, message: 'Unable to stringify body' } } as Result<ResponseData>;
		}

		try {
			const res = await fetch(stripGroup(url), { signal: opts?.abortSignal, method, body: cleanBody });
			if (res.redirected) {
				finish();
				await goto(res.url);
				return { error: { status: 302, message: 'Redirected' } } as Result<ResponseData>;
			} else {
				const json = await res.json();
				if (opts?.invalidate) await invalidateAll();
				finish();
				return json as Result<ResponseData>;
			}
		} catch (err) {
			finish();
			if ((err instanceof DOMException && err.name === 'AbortError') || (err as { status: number })?.status === 499) {
				return { error: { status: 499, message: 'The user aborted the request.' } } as Result<ResponseData>;
			}
			logger.error(err);
			return { error: { status: 500, message: 'Internal Error' } } as Result<ResponseData>;
		}
	};

export const createClientFetch = <RouteId extends string, ResponseData, RequestData = void>(
	method: Method,
	staticUrl: RouteId,
	globalOpts?: GlobalOpts,
) => {
	return () => {
		const submitting = writable(false);
		const delayed = writable(false);
		const timeout = writable(false);
		const fetcher = createFetcher<RequestData, ResponseData>({ submitting, delayed, timeout }, method);

		const send = async (body: RequestData, localOpts?: LocalOpts): Promise<Result<ResponseData>> =>
			fetcher(staticUrl, body, { ...globalOpts, ...localOpts });

		return {
			subscribe: submitting.subscribe,
			delayed: { subscribe: delayed.subscribe },
			timeout: { subscribe: timeout.subscribe },
			send,
		};
	};
};

export const createDynClientFetch = <ResponseData, RequestData = void, URLProps = void>(
	method: Method,
	urlCreator: (data: URLProps) => string,
	globalOpts?: GlobalOpts,
) => {
	return () => {
		const submitting = writable(false);
		const delayed = writable(false);
		const timeout = writable(false);
		const fetcher = createFetcher<RequestData, ResponseData>({ submitting, delayed, timeout }, method);

		const sendUrl = async (
			urlProps: URLProps,
			body: RequestData,
			localOpts?: LocalOpts,
		): Promise<Result<ResponseData>> => fetcher(urlCreator(urlProps), body, { ...globalOpts, ...localOpts });

		return {
			subscribe: submitting.subscribe,
			delayed: { subscribe: delayed.subscribe },
			timeout: { subscribe: timeout.subscribe },
			sendUrl,
		};
	};
};
