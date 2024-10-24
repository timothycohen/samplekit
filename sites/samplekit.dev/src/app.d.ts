// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { SEOMeta } from '$lib/components/SEO.svelte';
import type { Action as AuthActionRoutes } from '$routes/(auth)';
import type { SessionHandler } from '$routes/(auth)/hooks.server';
import type { Action as DeployActionRoutes } from '$routes/deploymentAccess/actionsMap';
import type { Action, ActionFailure } from '@sveltejs/kit';
import type { HTMLFormAttributes } from 'svelte/elements';
import type { TurnstileObject } from 'turnstile-types';

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
			meta?: Partial<SEOMeta>;
		}
		interface Locals extends Record<string, unknown> {
			seshHandler: SessionHandler;
		}
		// interface PageState {}
		// interface Platform {}

		namespace Superforms {
			type Message = { success?: never; fail: string } | { fail?: never; success: string };
		}

		type CommonServerAction = Action<
			Record<string, never>,
			ActionFailure<{ success?: undefined; fail: string }> | { fail?: undefined; success: string }
		>;

		/** Restrict a form element's action to known endpoints */
		namespace Form {
			type Action = null | AuthActionRoutes | DeployActionRoutes;
		}
	}

	namespace svelteHTML {
		interface IntrinsicElements {
			form: Omit<HTMLFormAttributes, 'action'> & {
				action: App.Form.Action;
			};
		}
	}

	interface Window {
		/** loaded in Turnstile.svelte */
		turnstile: TurnstileObject;
	}

	type Fetch = typeof globalThis.fetch;
}

export {};
