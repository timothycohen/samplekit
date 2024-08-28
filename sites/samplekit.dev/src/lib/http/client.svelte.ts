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

function createFetcher<RequestData, ResponseData>(
	mut_state: { submitting: boolean; delayed: boolean; timeout: boolean },
	method: Method,
) {
	return async (url: string, body: RequestData, opts?: LocalOpts) => {
		if (!browser) return { error: { status: 500, message: 'Client fetch called on server' } } as Result<ResponseData>;

		if (opts?.preventDuplicateRequests && mut_state.submitting)
			return { error: { status: 429, message: 'Too Many Requests' } } as Result<ResponseData>;

		mut_state.submitting = true;
		const delayTimeout = setTimeout(() => (mut_state.delayed = true), opts?.delayMs ?? 500);
		const timeoutTimeout = setTimeout(() => (mut_state.timeout = true), opts?.timeoutMs ?? 10000);

		const finish = () => {
			clearTimeout(delayTimeout);
			clearTimeout(timeoutTimeout);
			mut_state.submitting = false;
			mut_state.delayed = false;
			mut_state.timeout = false;
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
}

export class ClientFetcher<RouteId extends string, ResponseData, RequestData = void> {
	#boxed = $state({ submitting: false, delayed: false, timeout: false });
	#send: (body: RequestData, localOpts?: LocalOpts) => Promise<Result<ResponseData>>;

	constructor(method: Method, staticUrl: RouteId, globalOpts?: GlobalOpts) {
		const fetcher = createFetcher<RequestData, ResponseData>(this.#boxed, method);
		this.#send = async (body, localOpts) => fetcher(staticUrl, body, { ...globalOpts, ...localOpts });
	}

	get submitting() {
		return this.#boxed.submitting;
	}
	get delayed() {
		return this.#boxed.delayed;
	}
	get timeout() {
		return this.#boxed.timeout;
	}
	get send() {
		return this.#send;
	}
}

export class DynClientFetcher<ResponseData, RequestData = void, URLProps = void> {
	#boxed = $state({ submitting: false, delayed: false, timeout: false });
	#sendUrl: (urlProps: URLProps, body: RequestData, localOpts?: LocalOpts) => Promise<Result<ResponseData>>;

	constructor(method: Method, urlCreator: (data: URLProps) => string, globalOpts?: GlobalOpts) {
		const fetcher = createFetcher<RequestData, ResponseData>(this.#boxed, method);
		this.#sendUrl = async (urlProps, body, localOpts) =>
			fetcher(urlCreator(urlProps), body, { ...globalOpts, ...localOpts });
	}

	get submitting() {
		return this.#boxed.submitting;
	}
	get delayed() {
		return this.#boxed.delayed;
	}
	get timeout() {
		return this.#boxed.timeout;
	}
	get sendUrl() {
		return this.#sendUrl;
	}
}
