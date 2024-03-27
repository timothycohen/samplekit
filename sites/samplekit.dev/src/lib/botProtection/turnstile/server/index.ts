import { TURNSTILE_SECRET_KEY } from '$env/static/private';
import { logger } from '$lib/logging/server';

interface TurnstileTokenValidateResponse {
	'error-codes': string[];
	success: boolean;
	action: string;
	cdata: string;
}

export const validateTurnstile = async ({
	clientToken,
	ip,
}: {
	clientToken: string;
	ip: string | null;
}): Promise<{ success: boolean; error: string | null | undefined }> => {
	try {
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
	} catch (err) {
		logger.error(err);
		return { success: false, error: 'fetch-error' };
	}
};
