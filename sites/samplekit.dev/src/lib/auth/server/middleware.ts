import { dev } from '$app/environment';
import type { Cookies, MiddlewareContext } from '@samplekit/auth/server';

export const sessionCookieName = 'samplekit_session' as const;

const sessionCookie = {
	name: sessionCookieName,
	attributes: {
		httpOnly: true,
		secure: !dev,
		path: '/' as const,
		sameSite: 'lax' as const,
	},
};

export const createAuthMiddleware = ({
	cookies,
}: {
	cookies: Pick<Cookies, 'get' | 'set' | 'delete'>;
}): MiddlewareContext => ({
	requestCookie: cookies.get(sessionCookie.name) ?? null,
	cookie: {
		setPersistent: ({ sessionId, expires }: { sessionId: string; expires: Date }): void => {
			cookies.set(sessionCookie.name, sessionId, { ...sessionCookie.attributes, expires });
		},
		setSession: ({ sessionId }: { sessionId: string }): void => {
			cookies.set(sessionCookie.name, sessionId, { ...sessionCookie.attributes });
		},
		delete: () => {
			cookies.delete(sessionCookie.name, { path: '/' });
		},
	},
});
