export type Action = '/deployment-access?/signin' | '/deployment-access?/signout' | '/deployment-access?/signoutAll';

export const actionsMap = {
	signin: '/deployment-access?/signin',
	signout: '/deployment-access?/signout',
	signoutAll: '/deployment-access?/signoutAll',
} as const satisfies Record<string, Action>;
