import type { Config } from '../../../types/index.js';

export const createAuthenticator = ({ config }: { config: Config }) => {
	const generateClientSetupDetails = async ({ email, secret }: { email: string; secret: string }) => {
		const setupOtpUri = config.authenticator.keyuri({ email, secret });
		const key = setupOtpUri.split('=')[1]!.split('&')[0]!;
		const dataUrl = await config.authenticator.createDataUrl({ setupOtpUri });
		return { key, dataUrl };
	};

	return {
		generateClientSetupDetails,
	};
};
