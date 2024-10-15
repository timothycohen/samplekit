import { createConfig } from '@samplekit/auth/server';
import { dev } from '$app/environment';
import { PUBLIC_EFFECTIVE_DOMAIN, PUBLIC_ORIGIN } from '$env/static/public';

export const config = createConfig({
	env: {
		secureCookie: !dev,
		PUBLIC_ORIGIN,
	},
	sessionExpiresIn: {
		activePeriod: 1000 * 60 * 60 * 24 * 1,
		idlePeriod: 1000 * 60 * 60 * 24 * 13,
	},
	lastSeen: {
		updateEvery: 1000 * 60 * 5,
	},
	authenticatorName: 'SampleKit',
	passkey: {
		rpName: 'SampleKit', // https://simplewebauthn.dev/docs/packages/server
		rpID: PUBLIC_EFFECTIVE_DOMAIN, // https://www.w3.org/TR/webauthn-2/#rp-id
	},
});
