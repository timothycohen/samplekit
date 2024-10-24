import { fail as formFail, redirect, type Action } from '@sveltejs/kit';
import { PUBLIC_GOOGLE_OAUTH_CLIENT_ID } from '$env/static/public';
import { auth } from '$lib/auth/server';
import { checkedRedirect } from '$lib/http/server';
import { message, superValidate, zod } from '$lib/superforms/server';
import { confirmPassSchema } from '$routes/(auth)';
import { PUBLIC_GOOGLE_OAUTH_LINK_PATHNAME, type ChangeToGoogleError } from './consts';

export const load = async ({ locals, url }) => {
	const seshUser = await locals.seshHandler.getSessionUser();
	if (!seshUser) return checkedRedirect('/login');
	const authDetails = await auth.provider.pass.MFA.getDetailsOrThrow(seshUser.user.id);
	const method = authDetails.method;
	if (method === 'oauth') return checkedRedirect('/account/profile');

	const confirmPassForm = await superValidate(zod(confirmPassSchema), { id: 'confirmPassForm_/change-to-google' });

	const error = url.searchParams.get('error') as null | ChangeToGoogleError;
	let errMsg = null;
	if (error === 'auth-failed') errMsg = 'Authentication failed.';
	else if (error === 'email-mismatch') errMsg = `You are not logged into Google as ${seshUser.user.email}`;

	return {
		errMsg,
		mfaCount: authDetails.mfaCount,
		email: seshUser.user.email,
		confirmPassForm,
	};
};

const passwordToLinkGoogle: Action = async ({ locals, request, cookies }) => {
	const { user, session } = await locals.seshHandler.userOrRedirect();

	const authDetails = await auth.provider.pass.MFA.getDetailsOrThrow(user.id);
	if (authDetails.method === 'oauth') return checkedRedirect('/account/profile');
	if (authDetails.mfaCount) return checkedRedirect('/account/profile');

	const confirmPassForm = await superValidate(request, zod(confirmPassSchema));

	if (!confirmPassForm.valid) return formFail(400, { confirmPassForm });
	const password = confirmPassForm.data.password;

	const provider = await auth.provider.pass.email.get({ email: user.email, pass: password });
	if (!provider) return message(confirmPassForm, { fail: 'Invalid password.' }, { status: 403 });

	const googleLink = auth.provider.oauth.google.createStatelessUrl({
		redirectPathname: PUBLIC_GOOGLE_OAUTH_LINK_PATHNAME,
		clientId: PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
	});
	auth.provider.oauth.google.setState({ persistent: session.persistent, cookies, url: googleLink });

	return redirect(302, googleLink);
};

export const actions = { passwordToLinkGoogle };
