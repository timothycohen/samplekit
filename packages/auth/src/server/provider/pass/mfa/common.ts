import { assertUnreachable } from '../../../../utils/common/index.js';
import type { Auth, DbAdapterProvider, TransformProvider } from '../../../types/index.js';

export const createCommon = <P, PWOP, PCtx>({
	dbProvider,
	transformProvider,
}: {
	dbProvider: DbAdapterProvider<P, PWOP>;
	transformProvider: TransformProvider<P, PCtx>;
}) => {
	const enable = async (
		args: { userId: string } & (
			| { passkeys: NonNullable<Auth.MFAs['passkeys']>; sms?: never; authenticator?: never }
			| { passkeys?: never; sms: NonNullable<Auth.MFAs['sms']>; authenticator?: never }
			| { passkeys?: never; sms?: never; authenticator: NonNullable<Auth.MFAs['authenticator']> }
		),
	) => {
		const { userId, passkeys, sms, authenticator } = args;
		const values: Partial<Auth.MFAs> = passkeys ? { passkeys } : sms ? { sms } : { authenticator };
		await dbProvider.updateByUserId({ kind: 'pass', userId, values });
	};

	const disable = async ({ type, userId }: { userId: string; type: Auth.MFAs.Kind }) => {
		switch (type) {
			case 'passkeys':
				return dbProvider.updateByUserId({ kind: 'pass', userId, values: { passkeys: null } });
			case 'sms':
				return dbProvider.updateByUserId({ kind: 'pass', userId, values: { sms: null } });
			case 'authenticator':
				return dbProvider.updateByUserId({ kind: 'pass', userId, values: { authenticator: null } });
		}
		assertUnreachable(type);
	};

	const calcMFAsEnabled = (mfas?: Auth.MFAs): Auth.MFAs.Enabled => {
		const { authenticator, passkeys, sms } = mfas ?? {};
		return { authenticator: !!authenticator, passkeys: !!passkeys?.length, sms: !!sms };
	};

	const countMFAs = (mfasEnabled: Auth.MFAs.Enabled): number => Object.values(mfasEnabled).filter(Boolean).length;

	const isRequired = async (userId: string): Promise<boolean> => {
		const provider = await dbProvider.getByUserId({ kind: 'pass', userId });
		if (!provider) return false;
		const enabled = calcMFAsEnabled(transformProvider.toLib(provider));
		return enabled.authenticator || enabled.passkeys || enabled.sms;
	};

	return {
		enable,
		disable,
		isRequired,
		calcMFAsEnabled,
		countMFAs,
	};
};
