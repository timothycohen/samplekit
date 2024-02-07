import { TURNSTILE_SECRET_KEY } from '$env/static/private';

interface TurnstileTokenValidateResponse {
	'error-codes': string[];
	success: boolean;
	action: string;
	cdata: string;
}

export const validateTurnstile = async ({ clientToken, ip }: { clientToken: string; ip: string | null }) => {
	const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			secret: TURNSTILE_SECRET_KEY,
			response: clientToken,
			remoteip: ip,
		}),
	});

	const data: TurnstileTokenValidateResponse = await response.json();

	return {
		success: data.success,
		error: data['error-codes']?.length ? data['error-codes'][0] : null,
	};
};
