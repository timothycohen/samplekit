import { PUBLIC_ORIGIN } from '$env/static/public';
import { SECURITY_EMAIL } from '$lib/consts';
import type { RequestHandler } from '@sveltejs/kit';

const security: RequestHandler = () => {
	const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999).toISOString();
	const canonicalLink = `${PUBLIC_ORIGIN}/.well-known/security.txt`;
	const policyLink = `${PUBLIC_ORIGIN}/security-policy`;

	return new Response(
		`Contact: mailto:${SECURITY_EMAIL}
Expires: ${endOfYear}
Canonical: ${canonicalLink}
Policy: ${policyLink}`,
		{
			headers: {
				'Cache-Control': 'max-age=0, s-maxage=3600',
				'Content-Type': 'text/plain',
			},
		},
	);
};

export const GET = security;
