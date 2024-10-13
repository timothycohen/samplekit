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
			meta?: Partial<import('$lib/components/SEO.svelte').SEOMeta>;
		}
		interface Locals extends Record<string, unknown> {
			seshHandler: import('./hooks.server').SessionHandler;
		}
		// interface PageState {}
		// interface Platform {}

		namespace Superforms {
			type Message = { success?: never; fail: string } | { fail?: never; success: string };
		}

		type CommonServerAction = import('@sveltejs/kit').Action<
			Record<string, never>,
			| import('@sveltejs/kit').ActionFailure<{ success?: undefined; fail: string }>
			| { fail?: undefined; success: string }
		>;

		/** Restrict a form element's action to known endpoints */
		namespace Form {
			// search for export const actions =
			type _query = `&${string}` | '';
			type _next = `&next=${string}`;

			type Action =
				| string
				| `/login?/loginWithPassword`
				| `/signup?/signupWithPassword`
				| `/account/delete?/deleteUserWithSeshConf`
				| `/account/security/auth?/updatePassFromCurrPass`
				| `/account/verify?/seshConfFromPassword${_next}`
				| `/account/verify?/seshConfFromSMS${_next}`
				| `/account/verify?/seshConfFromAuthenticator${_next}`
				| `/account/verify/email?/sendEmailVeriToSeshConfEmailLink${_next}`
				| `/change-to-google?/passwordToLinkGoogle`
				| `/change-to-password?/changeToEmailPassProvider`
				| `/email-verification?/resendEmailVeriToVerifyEmailLink`
				| `/login/google?/passToGoogleOAuth`
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
				| `/password-reset?/emailPassReset`
				| `/password-update/${string}?/createNewPassFromPwReset`
				| `/account/profile?/updateName`
				| '/shop/collections/all';
		}
	}

	namespace svelteHTML {
		interface IntrinsicElements {
			form: Omit<import('svelte/elements').HTMLFormAttributes, 'action'> & {
				action: App.Form.Action;
			};
		}
	}

	interface Window {
		/** loaded in Turnstile.svelte */
		turnstile: import('turnstile-types').TurnstileObject;
	}

	type Fetch = typeof globalThis.fetch;
}

export {};
