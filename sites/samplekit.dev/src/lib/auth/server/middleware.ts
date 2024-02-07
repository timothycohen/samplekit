import { dev } from '$app/environment';
import type { MiddlewareContext } from '@samplekit/auth/server';
import type { Handle } from '@sveltejs/kit';

const sessionCookie = {
	name: 'samplekit_session' as const,
	attributes: {
		httpOnly: true,
		secure: !dev,
		path: '/' as const,
		sameSite: 'lax' as const,
	},
};

export const createAuthMiddleware = ({ event }: { event: Parameters<Handle>['0']['event'] }): MiddlewareContext => ({
	requestCookie: event.cookies.get(sessionCookie.name) ?? null,
	cookie: {
		setPersistent: ({ sessionId, expires }: { sessionId: string; expires: Date }): void => {
			event.cookies.set(sessionCookie.name, sessionId, { ...sessionCookie.attributes, expires });
		},
		setSession: ({ sessionId }: { sessionId: string }): void => {
			event.cookies.set(sessionCookie.name, sessionId, { ...sessionCookie.attributes });
		},
		delete: () => {
			event.cookies.delete(sessionCookie.name, { path: '/' });
		},
	},
});
