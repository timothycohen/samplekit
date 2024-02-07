// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message: string;
		}
		type JSONError = App.Error & { status: number };

		namespace Superforms {
			type Message = { success?: never; fail: string } | { fail?: never; success: string };
		}

		interface PageData {
			layout: { showFooter: boolean; showHeader: boolean };
		}
		interface Locals extends Record<string, unknown> {
			seshHandler: import('./hooks.server').SessionHandler;
		}
		// interface PageState {}
		// interface Platform {}

		namespace Superforms {
			type Message = { success?: never; fail: string } | { fail?: never; success: string };
		}
	}

	interface Window {
		/** loaded in Turnstile.svelte */
		turnstile: import('turnstile-types').TurnstileObject;
	}
}

export {};
