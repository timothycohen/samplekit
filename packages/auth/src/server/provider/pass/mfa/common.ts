import { assertUnreachable } from '../../../../utils/common/index.js';
import type {
	Auth,
	DbAdapterProvider,
	ServerAuthProviderMfaCommon,
	TransformProvider,
} from '../../../../types/server/index.js';

export const createCommon = <P, PWOP, PCtx>({
	dbProvider,
	transformProvider,
}: {
	dbProvider: DbAdapterProvider<P, PWOP>;
	transformProvider: TransformProvider<P, PCtx>;
}): ServerAuthProviderMfaCommon => {
	const calcMFAsEnabled = (mfas?: Auth.MFAs): Auth.MFAs.Enabled => {
		const { authenticator, passkeys, sms } = mfas ?? {};
		return { authenticator: !!authenticator, passkeys: !!passkeys?.length, sms: !!sms };
	};

	return {
		enable: async (args) => {
			const { userId, passkeys, sms, authenticator } = args;
			const values: Partial<Auth.MFAs> = passkeys ? { passkeys } : sms ? { sms } : { authenticator };
			await dbProvider.updateByUserId({ kind: 'pass', userId, values });
		},
		disable: async ({ type, userId }) => {
			switch (type) {
				case 'passkeys':
					return dbProvider.updateByUserId({ kind: 'pass', userId, values: { passkeys: null } });
				case 'sms':
					return dbProvider.updateByUserId({ kind: 'pass', userId, values: { sms: null } });
				case 'authenticator':
					return dbProvider.updateByUserId({ kind: 'pass', userId, values: { authenticator: null } });
			}
			assertUnreachable(type);
		},
		isRequired: async (userId) => {
			const provider = await dbProvider.getByUserId({ kind: 'pass', userId });
			if (!provider) return false;
			const enabled = calcMFAsEnabled(transformProvider.toLib(provider));
			return enabled.authenticator || enabled.passkeys || enabled.sms;
		},
		calcMFAsEnabled,
		countMFAs: (mfasEnabled) => Object.values(mfasEnabled).filter(Boolean).length,
	};
};
