/* eslint-disable no-console */
import type { IngestTransformsI, LogflareUserOptionsI } from './utils';

const defaultOptions = {
	apiBaseUrl: 'https://api.logflare.app',
	fromBrowser: false,
};

class NetworkError extends Error {
	override name = 'NetworkError';

	constructor(
		message: string,
		public response: Response,
		public data: unknown,
	) {
		super(message);
	}
}

export class LogflareHttpClient {
	protected readonly sourceToken: string;
	protected readonly transforms?: IngestTransformsI;
	protected readonly endpoint?: string;
	protected readonly apiKey: string;
	protected readonly fromBrowser: boolean;
	protected readonly apiBaseUrl: string;
	/**
	 * onError takes in an optional callback function to handle any errors returned by logflare
	 */
	protected readonly onError?: ((payload: { batch: object[] }, err: Error) => void) | undefined;

	public constructor(options: LogflareUserOptionsI) {
		const { sourceToken, apiKey, transforms, endpoint } = options;
		if (!sourceToken || sourceToken == '') {
			throw 'Logflare API logging transport source token is NOT configured!';
		}
		if (!apiKey || apiKey == '') {
			throw 'Logflare API logging transport api key is NOT configured!';
		}
		this.transforms = transforms;
		this.sourceToken = sourceToken;
		this.endpoint = endpoint;
		this.fromBrowser = options.fromBrowser ?? defaultOptions.fromBrowser;
		this.apiKey = apiKey;
		this.apiBaseUrl = options.apiBaseUrl || defaultOptions.apiBaseUrl;
		this.onError = options.onError;
	}

	public async addLogEvent(logEvent: object | object[]): Promise<object> {
		const logEvents = Array.isArray(logEvent) ? logEvent : [logEvent];
		return this.postLogEvents(logEvents);
	}

	async postLogEvents(batch: object[]) {
		let path;
		if (this.endpoint === 'typecasting') {
			path = `/logs/typecasts?api_key=${this.apiKey}&source=${this.sourceToken}`;
		} else {
			path = `/logs?api_key=${this.apiKey}&source=${this.sourceToken}`;
		}
		const payload = {
			batch,
		};
		try {
			const url = new URL(path, this.apiBaseUrl);

			const response = await fetch(url.toString(), {
				body: JSON.stringify(payload),
				method: 'POST',
				headers: {
					Accept: 'application/json, text/plain, */*',
					'Content-Type': 'application/json',
				},
			});

			const data = await response.json();

			if (!response.ok) {
				throw new NetworkError(`Network response was not ok for "${url}"`, response, data);
			}

			return data;
		} catch (e) {
			if (e && e instanceof Error) {
				if (e instanceof NetworkError && e.response) {
					console.error(`Logflare API request failed with ${e.response.status} status: ${JSON.stringify(e.data)}`);
				} else {
					console.error(e.message);
				}
				this.onError?.(payload, e);
			}

			return e;
		}
	}

	async addTypecasting() {
		const url = new URL('/sources/', this.apiBaseUrl);

		await fetch(url.toString(), {
			method: 'POST',
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
			},
		});
	}
}
