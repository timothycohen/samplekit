// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { SEOMeta } from '$lib/components/SEO.svelte';
import type { SessionHandler } from '$routes/(auth)/hooks.server';
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
			// search for export const actions =
			type _query = `&${string}` | '';
			type _next = `&next=${string}`;

			type Action =
				| null
				| `/login?/loginWithPassword`
				| `/login?/emailPassReset`
				| `/signup?/signupWithPassword`
				| `/account/delete?/deleteUserWithSeshConf`
				| `/account/security/auth?/updatePassFromCurrPass`
				| `/account/verify?/seshConfFromPassword${_next}`
				| `/account/verify?/seshConfFromSMS${_next}`
				| `/account/verify?/seshConfFromAuthenticator${_next}`
				| `/account/verify/email?/sendSeshConfToken${_next}`
				| `/change-to-google?/passwordToLinkGoogle`
				| `/change-to-password?/changeToEmailPassProvider`
				| `/signup/email-verification?/resendSignupEmailVerification`
				| `/oauth/google?/passToGoogleOAuth`
				| `/login/verify-mfa?/loginWithSMS`
				| `/login/verify-mfa?/loginWithAuthenticator`
				| `/logout?/logoutCurrent`
				| `/logout?/logoutSingle`
				| `/logout?/logoutAll`
				| `/mfa/sms?/sendSMSVeri`
				| `/mfa/update/register/authenticator?/registerMFA_Authenticator_WithSeshConf`
				| `/mfa/update/register/sms?/SMSSetupFromSeshConf${_query}` // ?phone=${string} | '' for resend with JS disabled
				| `/mfa/update/register/sms?/registerMFA_SMS_WithSeshConfAndSetupSMS`
				| `/mfa/update/remove/${DB.MFAs.Kind}?/removeMFAWithSeshConf`
				| `/password-update/${string}?/createNewPassFromPwReset`
				| `/account/profile?/updateName`
				| '/shop/collections/all'
				| '/deployment-access?/signin'
				| '/deployment-access?/signout'
				| '/deployment-access?/signoutAll';
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
