import { assertUnreachable } from '../../utils/common/index.js';
import type { ServerAuthToken, Auth, Config, DbAdapterToken, TokenErr } from '../../types/server/index.js';

type LimAttemptErr = { validated?: never; tokenErr: TokenErr.All };

type Validate = {
	validateEmailVeri: ServerAuthToken['emailVeri']['validate'];
	getValidPasskeyChallenge: ServerAuthToken['passkeyChallenge']['getChallenge'];
	validatePwReset: ServerAuthToken['pwReset']['validate'];
	validateSetupSmsVeri: ServerAuthToken['setupSMSVeri']['validate'];
	validateSmsVeri: ServerAuthToken['smsVeri']['validate'];
	validateSetupAuthenticator: ServerAuthToken['setupAuthenticator']['validate'];
};

export const createValidate = ({ config, dbToken }: { dbToken: DbAdapterToken; config: Config }): Validate => {
	return {
		getValidPasskeyChallenge: async ({ userId }) => {
			const tokenKind = 'passkey_challenge';

			const storedToken = (await dbToken.getByUserId({ tokenKind, userId })) as Auth.Token.UnlimSendUnlimAttempt;

			if (!storedToken) return { tokenErr: 'invalid_token' };
			if (storedToken.expires <= new Date()) return { tokenErr: 'expired_token' };

			return { challenge: storedToken.token };
		},
		validatePwReset: (a) => validateLimSendUnlimAttempt({ dbToken, tokenKind: 'pw_reset', ...a }),
		validateEmailVeri: (a) => validateLimSendUnlimAttempt({ dbToken, tokenKind: 'email_veri', ...a }),
		validateSetupAuthenticator: async (a) => {
			const res = await validateLimAttemptToken({ ...a, config, dbToken, tokenKind: 'setup_authenticator' });
			return res.tokenErr ? { tokenErr: res.tokenErr } : { secret: res.validated.token };
		},
		validateSetupSmsVeri: async (a) => {
			const res = await validateLimAttemptToken({ ...a, config, dbToken, tokenKind: 'setup_sms_veri' });
			return res.tokenErr ? { tokenErr: res.tokenErr } : { phoneNumber: res.validated.phoneNumber };
		},
		validateSmsVeri: async (a) => {
			const res = await validateLimAttemptToken({ ...a, config, dbToken, tokenKind: 'sms_veri' });
			return res.tokenErr ? { tokenErr: res.tokenErr } : {};
		},
	};
};

async function validateLimSendUnlimAttempt({
	token,
	tokenKind,
	checkOnly,
	dbToken,
}: {
	tokenKind: Auth.Token.Kind.LimSendUnlimAttempt;
	token: string;
	checkOnly?: true;
	dbToken: DbAdapterToken;
}): Promise<{ tokenErr: TokenErr.Val; userId?: undefined } | { userId: string; tokenErr?: undefined }> {
	const storedToken = await dbToken.getByToken({ tokenKind, token });

	if (!storedToken) return { tokenErr: 'invalid_token' };
	if (storedToken.expires <= new Date()) return { tokenErr: 'expired_token' };

	if (!checkOnly) await dbToken.deleteByToken({ tokenKind, token });

	return { userId: storedToken.userId };
}

type Common = {
	token: string;
	checkOnly?: true;
	userId: string;
	dbToken: DbAdapterToken;
	config: Config;
};

// prettier-ignore
async function validateLimAttemptToken(a: Common & { tokenKind: 'setup_authenticator' }): Promise<{ validated: Auth.Token.UnlimSendLimAttempt; tokenErr?: never } | LimAttemptErr>;
// prettier-ignore
async function validateLimAttemptToken(a: Common & { tokenKind: 'sms_veri' }): Promise<{ validated: Auth.Token.SMSVeri; tokenErr?: never } | LimAttemptErr>;
// prettier-ignore
async function validateLimAttemptToken(a: Common & { tokenKind: 'setup_sms_veri' }): Promise<{ validated: Auth.Token.SetupSMSVeri; tokenErr?: never } | LimAttemptErr>;
// prettier-ignore
async function validateLimAttemptToken({ token, tokenKind, userId, checkOnly, dbToken, config }: Common & { tokenKind: Auth.Token.Kind.LimAttempt }) {
	let storedToken:
		| Auth.Token.UnlimSendLimAttempt
		| Auth.Token.LimSendLimAttempt
		| Auth.Token.SetupSMSVeri
		| null
		| undefined = undefined;

	if (tokenKind === 'setup_authenticator') {
		storedToken = await dbToken.getByUserId({ tokenKind, userId });
	} else if (tokenKind === 'setup_sms_veri') {
		storedToken = await dbToken.getByUserId({ tokenKind, userId });
	} else if (tokenKind === 'sms_veri') {
		storedToken = await dbToken.getByUserId({ tokenKind, userId });
	} else {
		assertUnreachable(tokenKind);
	}

	if (!storedToken) return { tokenErr: 'invalid_token' };
	if (storedToken.expires <= new Date()) return { tokenErr: 'expired_token' };

	if (storedToken.veriAttemptCount >= config.tokenMaxVeriAttempts) return { tokenErr: 'max_attempts' };

	const storedSecret =
		tokenKind === 'setup_authenticator'
			? config.authenticator.generateToken({ secret: storedToken.token })
			: storedToken.token;

	if (storedSecret !== token) {
		if (!checkOnly) {
			await dbToken.updateLimAttempt({
				tokenKind,
				userId,
				values: { veriAttemptCount: storedToken.veriAttemptCount + 1 },
			});
		}
		return { tokenErr: 'invalid_token' };
	}

	if (!checkOnly) await dbToken.deleteByUserId({ tokenKind, userId });

	return { validated: storedToken };
}
