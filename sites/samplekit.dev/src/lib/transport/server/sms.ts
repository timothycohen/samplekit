import twilio, { type Twilio } from 'twilio';
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_NUMBER } from '$env/static/private';
import { logger } from '$lib/logging/server';
import { INTERCEPT_TRANSPORTS } from './consts';

export const getTwilio = (() => {
	let twilioClient: Twilio | null = null;
	let disabled = false;

	const get = () => {
		if (twilioClient) return twilioClient;
		if (disabled) return;

		try {
			twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
			return twilioClient;
		} catch {
			disabled = true;
			return;
		}
	};

	return get;
})();

const from = TWILIO_NUMBER;

type Props = { phoneNumber: string; body: string };

const log = ({ phoneNumber, body }: Props) => {
	// eslint-disable-next-line no-console
	console.info(`
From: ${from}
To: ${phoneNumber}
Body: ${body}
`);
};

const safeSend = async ({ phoneNumber, body }: Props): Promise<{ transportErr: boolean }> => {
	try {
		await getTwilio()?.messages.create({ body, from, to: phoneNumber });
		return { transportErr: false };
	} catch (err) {
		logger.error(err);
		return { transportErr: true };
	}
};

export const sendSms = async ({ phoneNumber, body }: Props): Promise<{ transportErr: boolean }> => {
	if (INTERCEPT_TRANSPORTS) {
		log({ phoneNumber, body });
		return { transportErr: false };
	}
	return await safeSend({ phoneNumber, body });
};

export const lookupPhoneNumber = async (phoneNumber: string): Promise<string | null> =>
	(await getTwilio()
		?.lookups.v2.phoneNumbers(phoneNumber)
		.fetch()
		.then((res) => {
			if (res.valid) return res.phoneNumber;
			return null;
		})
		.catch(() => null)) ?? null;
