import { assertUnreachable } from '../../utils/common/index.js';
import type { Auth, Config, DbAdapterToken, ServerAuthToken, TokenErr } from '../../types/server/index.js';

type CreateGetOrCreate = {
	getOrCreateEmailVeri: ServerAuthToken['emailVeri']['createOrRefresh'];
	createOrReplacePasskeyChallengeToken: ServerAuthToken['passkeyChallenge']['createOrReplace'];
	getOrCreatePwReset: ServerAuthToken['pwReset']['createOrRefresh'];
	getCreateOrReplaceSetupSMSVeri: ServerAuthToken['setupSMSVeri']['createOrUpdate'];
	getOrCreateSmsVeri: ServerAuthToken['smsVeri']['createOrRefresh'];
	getOrCreateSetupAuthenticator: ServerAuthToken['setupAuthenticator']['createOrRefresh'];
};

export const createGetOrCreate = ({
	dbToken,
	config,
}: {
	dbToken: DbAdapterToken;
	config: Config;
}): CreateGetOrCreate => {
	return {
		createOrReplacePasskeyChallengeToken: async ({ userId, challenge }) => {
			const newToken = createToken({ config, userId }).passkeyChallenge(challenge);
			await dbToken.upsert({ newToken });
		},
		getCreateOrReplaceSetupSMSVeri: async ({ userId, phoneNumber }) => {
			const tokenKind = 'setup_sms_veri';
			const token = (await dbToken.getByUserId({ tokenKind, userId })) as Auth.Token.SetupSMSVeri | undefined;
			const tokenExpired = token && token.expires <= new Date();

			if (!token || tokenExpired) {
				const newToken = createToken({ config, userId }).setupSmsVeri(phoneNumber);
				await dbToken.upsert({ newToken });
				return { otp: newToken.token };
			}

			const { tokenErr } = await incrementSendCount({ token, tokenKind, userId, config, dbToken });
			if (tokenErr) return { tokenErr };

			if (phoneNumber !== token.phoneNumber) {
				await dbToken.updateSetupSMSPhoneNumber({ phoneNumber, userId });
			}

			return { otp: token.token };
		},
		getOrCreateEmailVeri: async ({ userId }) => {
			const tokenKind = 'email_veri';
			const token = await dbToken.getByUserId({ tokenKind, userId });
			const tokenExpired = token && token.expires <= new Date();
			if (!token || tokenExpired) {
				const newToken = createToken({ config: config, userId: userId }).limSendUnlimAttempt(tokenKind);
				await dbToken.upsert({ newToken });
				return { token: newToken.token };
			}
			return await incrementSendCount({ token, tokenKind, userId, dbToken, config });
		},
		getOrCreatePwReset: async ({ userId }) => {
			const tokenKind = 'pw_reset';
			const token = await dbToken.getByUserId({ tokenKind, userId });
			const tokenExpired = token && token.expires <= new Date();
			if (!token || tokenExpired) {
				const newToken = createToken({ config: config, userId: userId }).limSendUnlimAttempt(tokenKind);
				await dbToken.upsert({ newToken });
				return { token: newToken.token };
			}
			return await incrementSendCount({ token, tokenKind, userId, dbToken, config });
		},
		getOrCreateSmsVeri: async ({ userId }) => {
			const tokenKind = 'sms_veri';
			const token = await dbToken.getByUserId({ tokenKind, userId });
			const tokenExpired = token && token.expires <= new Date();
			if (!token || tokenExpired) {
				const newToken = createToken({ config, userId }).smsVeriToken();
				await dbToken.upsert({ newToken });
				return { otp: newToken.token };
			}
			const res = await incrementSendCount({ token, tokenKind, userId, config, dbToken });
			return res.tokenErr ? { tokenErr: res.tokenErr } : { otp: token.token };
		},
		getOrCreateSetupAuthenticator: async ({ userId }) => {
			const tokenKind = 'setup_authenticator';
			const token = await dbToken.getByUserId({ tokenKind, userId });
			const tokenExpired = token && token.expires <= new Date();
			if (!token || tokenExpired) {
				const newToken = createToken({ config, userId }).unlimSendLimAttempt(tokenKind);
				await dbToken.upsert({ newToken });
				return { secret: newToken.token };
			}
			return { secret: token.token };
		},
	};
};

function createTokenString({
	config,
	tokenKind,
}: {
	config: Config;
	tokenKind: Exclude<Auth.Token.Kind.All, 'passkey_challenge'>;
}) {
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
}

function createToken({ config, userId }: { config: Config; userId: string }) {
	const base = (tokenKind: Exclude<Auth.Token.Kind.All, 'passkey_challenge'>) => ({
		token: createTokenString({ config, tokenKind }),
		userId,
		expires: new Date(Date.now() + config.tokenExpiryTimes[tokenKind]),
	});
	const limSend = () => ({ sendCount: 1, sendTime: new Date() });
	const limAttempt = { veriAttemptCount: 0, veriAttemptTime: null };

	return {
		smsVeriToken: (): Auth.Token.SMSVeri => {
			const tokenKind = 'sms_veri';
			return { kind: tokenKind, ...base(tokenKind), ...limSend(), ...limAttempt };
		},
		limSendUnlimAttempt: (tokenKind: Auth.Token.Kind.LimSendUnlimAttempt): Auth.Token.LimSendUnlimAttempt => {
			return { kind: tokenKind, ...base(tokenKind), ...limSend() };
		},
		unlimSendLimAttempt: (tokenKind: Auth.Token.Kind.UnlimSendLimAttempt) => ({
			kind: tokenKind,
			...base(tokenKind),
			...limAttempt,
		}),
		setupSmsVeri: (phoneNumber: string): Auth.Token.SetupSMSVeri => {
			const tokenKind = 'setup_sms_veri';
			return {
				kind: tokenKind,
				...base(tokenKind),
				phoneNumber,
				...limSend(),
				...limAttempt,
			};
		},
		passkeyChallenge: (challenge: string): Auth.Token.UnlimSendUnlimAttempt => {
			const tokenKind = 'passkey_challenge';
			return {
				kind: tokenKind,
				expires: new Date(Date.now() + config.tokenExpiryTimes[tokenKind]),
				userId,
				token: challenge,
			};
		},
	};
}

async function incrementSendCount(a: {
	token: Auth.Token.LimSend;
	tokenKind: Auth.Token.Kind.LimSend;
	userId: string;
	dbToken: DbAdapterToken;
	config: Config;
}): Promise<{ token: string; tokenErr?: never } | { token?: never; tokenErr: TokenErr.LimSend }> {
	const { token, tokenKind, userId } = a;
	if (token.sendCount >= a.config.tokenLimSend[tokenKind].maxSend) return { tokenErr: 'send_max' } as const;
	const timeoutMs = a.config.tokenLimSend[tokenKind].timeoutMs;
	const allowedResendTime = token.sendTime.getTime() + (timeoutMs[token.sendCount] ?? timeoutMs['max']);
	if (Date.now() < allowedResendTime) return { tokenErr: 'send_timeout' } as const;

	token.sendCount += 1;
	token.sendTime = new Date();

	await a.dbToken.updateLimSend({
		tokenKind,
		userId,
		values: { sendCount: token.sendCount, sendTime: token.sendTime },
	});

	return { token: token.token };
}
