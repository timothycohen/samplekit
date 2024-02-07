import { assertUnreachable } from '../../utils/common/index.js';
import type { Auth, Config, DbAdapterToken, TokenErr } from '../types/index.js';

export const createGetOrCreate = ({ dbToken, config }: { dbToken: DbAdapterToken; config: Config }) => {
	const createTokenString = ({ tokenKind }: { tokenKind: Exclude<Auth.Token.Kind.All, 'passkey_challenge'> }) => {
		switch (tokenKind) {
			case 'email_veri':
			case 'pw_reset':
			case 'sms_veri':
			case 'setup_sms_veri': {
				const { size, alphabet } = config.tokenLimSend[tokenKind];
				return config.randomString.generate({ size, alphabet });
			}
			case 'setup_authenticator':
				return config.authenticator.generateSecret();
		}
		assertUnreachable(tokenKind);
	};

	const isLimSendToken = (token: Auth.Token.All): token is Auth.Token.LimSend =>
		typeof (token as Auth.Token.LimSend).sendCount === 'number' &&
		(token as Auth.Token.LimSend).sendTime instanceof Date;

	const incrementSendCount = async (a: {
		token: Auth.Token.LimSend;
		tokenKind: Auth.Token.Kind.LimSend;
		userId: string;
	}) => {
		const { token, tokenKind, userId } = a;
		if (token.sendCount >= config.tokenLimSend[tokenKind].maxSend) return { tokenErr: 'send_max' } as const;
		const timeoutMs = config.tokenLimSend[tokenKind].timeoutMs;
		const allowedResendTime = token.sendTime.getTime() + (timeoutMs[token.sendCount] ?? timeoutMs['max']);
		if (Date.now() < allowedResendTime) return { tokenErr: 'send_timeout' } as const;

		token.sendCount += 1;
		token.sendTime = new Date();

		await dbToken.updateLimSend({
			tokenKind,
			userId,
			values: { sendCount: token.sendCount, sendTime: token.sendTime },
		});

		return {};
	};

	const createOrReplacePasskeyChallengeToken = async (a: { userId: string; challenge: string }) => {
		const tokenKind = 'passkey_challenge';
		const newToken: Auth.Token.UnlimSendUnlimAttempt = {
			kind: tokenKind,
			expires: new Date(Date.now() + config.tokenExpiryTimes[tokenKind]),
			userId: a.userId,
			token: a.challenge,
		};
		await dbToken.upsert({ newToken });
	};

	async function getCreateOrReplaceSetupSMSVeri({
		userId,
		phoneNumber,
	}: {
		userId: string;
		phoneNumber: string;
	}): Promise<{ otp: string; tokenErr?: never } | { otp?: never; tokenErr: TokenErr.LimSend }> {
		const tokenKind = 'setup_sms_veri';
		const token = (await dbToken.getByUserId({ tokenKind, userId })) as Auth.Token.SetupSMSVeri | undefined;
		const tokenExpired = token && token.expires <= new Date();

		if (!token || tokenExpired) {
			const newToken: Auth.Token.SetupSMSVeri = {
				kind: tokenKind,
				expires: new Date(Date.now() + config.tokenExpiryTimes[tokenKind]),
				userId,
				token: createTokenString({ tokenKind }),
				phoneNumber,
				sendCount: 1,
				sendTime: new Date(),
				veriAttemptCount: 0,
				veriAttemptTime: null,
			};
			await dbToken.upsert({ newToken });
			return { otp: newToken.token };
		}

		const { tokenErr } = await incrementSendCount({ token, tokenKind: tokenKind as Auth.Token.Kind.LimSend, userId });
		if (tokenErr) return { tokenErr };

		if (phoneNumber !== token.phoneNumber) {
			await dbToken.updateSetupSMSPhoneNumber({ phoneNumber, userId });
		}

		return { otp: token.token };
	}

	type LimSendErr = { token?: never; tokenErr: TokenErr.LimSend };
	// prettier-ignore
	async function getOrCreateToken(a: { userId: string;	tokenKind: Auth.Token.Kind.UnlimSendLimAttempt }): Promise<{ token: string; tokenErr?: never }>;
	// prettier-ignore
	async function getOrCreateToken(a: { userId: string;	tokenKind: Auth.Token.Kind.LimSendUnlimAttempt }): Promise<{ token: string; tokenErr?: never } | LimSendErr>;
	// prettier-ignore
	async function getOrCreateToken(a: { userId: string;	tokenKind: Exclude<Auth.Token.Kind.LimSendLimAttempt, 'setup_sms_veri'>;}): Promise<{ token: string; tokenErr?: never } | LimSendErr>;
	async function getOrCreateToken({
		tokenKind,
		userId,
	}: {
		userId: string;
		tokenKind: Exclude<Auth.Token.Kind.All, 'passkey_challenge' | 'setup_sms_veri'>;
	}) {
		const token = await dbToken.getByUserId({ tokenKind, userId });
		const tokenExpired = token && token.expires <= new Date();

		if (!token || tokenExpired) {
			switch (tokenKind) {
				case 'email_veri':
				case 'pw_reset': {
					const newToken: Auth.Token.LimSendUnlimAttempt = {
						kind: tokenKind,
						expires: new Date(Date.now() + config.tokenExpiryTimes[tokenKind]),
						userId,
						token: createTokenString({ tokenKind }),
						sendCount: 1,
						sendTime: new Date(),
					};
					await dbToken.upsert({ newToken });
					return { token: newToken.token };
				}
				case 'setup_authenticator': {
					const newToken: Auth.Token.UnlimSendLimAttempt = {
						kind: tokenKind,
						expires: new Date(Date.now() + config.tokenExpiryTimes[tokenKind]),
						userId,
						token: createTokenString({ tokenKind }),
						veriAttemptCount: 0,
						veriAttemptTime: null,
					};
					await dbToken.upsert({ newToken });
					return { token: newToken.token };
				}
				case 'sms_veri': {
					const newToken: Auth.Token.LimSendLimAttempt = {
						kind: tokenKind,
						expires: new Date(Date.now() + config.tokenExpiryTimes[tokenKind]),
						userId,
						token: createTokenString({ tokenKind }),
						veriAttemptCount: 0,
						veriAttemptTime: null,
						sendCount: 1,
						sendTime: new Date(),
					};
					await dbToken.upsert({ newToken });
					return { token: newToken.token };
				}
			}
			assertUnreachable(tokenKind);
			return; // Make TS happy
		}

		if (isLimSendToken(token)) {
			const { tokenErr } = await incrementSendCount({ token, tokenKind: tokenKind as Auth.Token.Kind.LimSend, userId });
			if (tokenErr) return { tokenErr };
		}

		return { token: token.token };
	}

	return {
		createOrReplacePasskeyChallengeToken,
		getCreateOrReplaceSetupSMSVeri,
		getOrCreateToken,
	};
};
