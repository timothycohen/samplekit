import type { TokenErr } from '../types/errors.js';
import type { Auth, Config, DbAdapterToken } from '../types/index.js';

export const createValidate = ({ config, dbToken }: { dbToken: DbAdapterToken; config: Config }) => {
	const getValidUnlimSendUnlimAttempt = async (a: {
		tokenKind: Auth.Token.Kind.UnlimSendUnlimAttempt;
		userId: string;
		checkOnly?: true;
	}): Promise<
		| { storedToken?: never; tokenErr: TokenErr.All }
		| { storedToken: Auth.Token.UnlimSendUnlimAttempt; tokenErr?: never }
	> => {
		const { tokenKind, userId, checkOnly } = a;

		const storedToken = (await dbToken.getByUserId({ tokenKind, userId })) as Auth.Token.UnlimSendUnlimAttempt;

		if (!storedToken) return { tokenErr: 'invalid_token' };
		if (storedToken.expires <= new Date()) return { tokenErr: 'expired_token' };

		if (!checkOnly) await dbToken.deleteByUserId({ tokenKind, userId });

		return { storedToken };
	};

	const validateLimSendUnlimAttempt = async (a: {
		tokenKind: Auth.Token.Kind.LimSendUnlimAttempt;
		token: string;
		checkOnly?: true;
	}): Promise<{ userId?: never; tokenErr: TokenErr.Val } | { userId: string; tokenErr?: never }> => {
		const { tokenKind, token, checkOnly } = a;

		const storedToken = await dbToken.getByToken({ tokenKind, token });

		if (!storedToken) return { tokenErr: 'invalid_token' };
		if (storedToken.expires <= new Date()) return { tokenErr: 'expired_token' };

		if (!checkOnly) await dbToken.deleteByToken({ tokenKind, token });

		return { userId: storedToken.userId };
	};

	type A = { token: string; userId: string; checkOnly?: true };
	type LimAttemptErr = { validated?: never; tokenErr: TokenErr.All };
	// prettier-ignore
	async function validateLimAttemptToken(a: A & { tokenKind: Auth.Token.Kind.UnlimSendLimAttempt }): Promise<{ validated: Auth.Token.UnlimSendLimAttempt; tokenErr?: never } | LimAttemptErr>;
	// prettier-ignore
	async function validateLimAttemptToken(a: A & { tokenKind: Exclude<Auth.Token.Kind.LimSendLimAttempt, 'setup_sms_veri'> }): Promise<{ validated: Auth.Token.LimSendLimAttempt; tokenErr?: never } | LimAttemptErr>;
	// prettier-ignore
	async function validateLimAttemptToken(a: A & { tokenKind: 'setup_sms_veri' }): Promise<{ validated: Auth.Token.SetupSMSVeri; tokenErr?: never } | LimAttemptErr>;
	// prettier-ignore
	async function validateLimAttemptToken(a: A & { tokenKind: Auth.Token.Kind.LimAttempt }) {
	const { token, tokenKind, userId, checkOnly } = a;

	const storedToken = (await dbToken.getByUserId({ tokenKind, userId })) as
		| Auth.Token.UnlimSendLimAttempt
		| Auth.Token.LimSendLimAttempt
		| Auth.Token.SetupSMSVeri
		| undefined;

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

	return { getValidUnlimSendUnlimAttempt, validateLimSendUnlimAttempt, validateLimAttemptToken };
};
