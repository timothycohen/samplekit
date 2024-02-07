import { createAuth, type TokenErr } from '@samplekit/auth/server';
import { fail as formFail } from '@sveltejs/kit';
import { message } from 'sveltekit-superforms/server';
import { jsonFail } from '$lib/http/server';
import { requiredConfig } from './config';
import { authDbAdapter } from './dbAdapter';
import type { SuperValidated, ZodValidation } from 'sveltekit-superforms';
import type { AnyZodObject } from 'zod';

const authLib = createAuth({ config: requiredConfig, dbAdapter: authDbAdapter });

const errMap: Record<TokenErr.All, { code: 403 | 429; msg: string }> = {
	send_timeout: { code: 429, msg: 'Please wait a moment before resending.' },
	send_max: { code: 429, msg: 'Too many attempts. Please try again later.' },
	expired_token: { code: 403, msg: 'Expired token' },
	invalid_token: { code: 403, msg: 'Invalid token' },
	max_attempts: { code: 429, msg: 'Too many verification attempts. Please try again later.' },
};

const authTokenErrHandler = {
	toFormFail: (err: TokenErr.All) => formFail(errMap[err].code, { fail: errMap[err].msg }),
	toJsonFail: (err: TokenErr.All) => jsonFail(errMap[err].code, errMap[err].msg),
	toMessage: <F extends SuperValidated<ZodValidation<AnyZodObject>>>(err: TokenErr.All, form: F) =>
		message(form, { fail: errMap[err].msg }, { status: errMap[err].code }),
};

// @ts-expect-error don't want to spread this in
authLib.token.err = authTokenErrHandler;

export const auth = authLib as typeof authLib & {
	token: (typeof authLib)['token'] & { err: typeof authTokenErrHandler };
};
