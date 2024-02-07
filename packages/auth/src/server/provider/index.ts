import { createCommon } from './common.js';
import { createGithub } from './oauth/github.js';
import { createGoogle } from './oauth/google.js';
import { createEmail } from './pass/email.js';
import { createMFA } from './pass/mfa/index.js';
import type { Config, DbAdapterProvider, TransformProvider } from '../types/index.js';

export const createAuthProvider = <P, PWOP, PCtx>({
	config,
	dbProvider,
	transformProvider,
}: {
	config: Config;
	dbProvider: DbAdapterProvider<P, PWOP>;
	transformProvider: TransformProvider<P, PCtx>;
}) => {
	return {
		...createCommon({ config, dbProvider, transformProvider }),
		pass: {
			email: createEmail({ config, dbProvider, transformProvider }),
			MFA: createMFA({ config, dbProvider, transformProvider }),
		},
		oauth: {
			google: createGoogle({ config }),
			github: createGithub({ config }),
		},
	};
};
