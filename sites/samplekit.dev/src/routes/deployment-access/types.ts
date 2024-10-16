import type { Cookies } from '@sveltejs/kit';

export type DeploymentAccessRepository = {
	isAuthenticated: (
		a:
			| { cookies: Cookies; headers?: undefined }
			| { cookies?: undefined; headers: Headers }
			| { cookies: Cookies; headers: Headers },
	) => Promise<boolean>;
	createSession: (a: { accessToken: string; cookies: Cookies }) => Promise<{ success: boolean }>;
	deleteSession: (a: { cookies: Cookies }) => Promise<void>;
	deleteAllSessions: (a: { cookies: Cookies }) => Promise<void>;
	countAuthenticatedSessions: (a: {
		cookies: Cookies;
	}) => Promise<{ authenticated: false } | { authenticated: true; sessionCount: number }>;
};
