import { SESClient, SendTemplatedEmailCommand } from '@aws-sdk/client-ses';
import {
	AWS_SERVICE_REGION,
	EMAIL_DEFAULT_SENDER,
	IAM_ACCESS_KEY_ID,
	IAM_SECRET_ACCESS_KEY,
} from '$env/static/private';
import { PUBLIC_ORIGIN } from '$env/static/public';
import { logger } from '$lib/logging/server';
import type { SendEmail } from './types';

export const getSES = (() => {
	let ses: SESClient | null = null;

	const get = () => {
		if (ses) return ses;

		ses = new SESClient({
			region: AWS_SERVICE_REGION,
			credentials: { accessKeyId: IAM_ACCESS_KEY_ID, secretAccessKey: IAM_SECRET_ACCESS_KEY },
		});

		return ses;
	};

	return get;
})();

export const sendSESEmail: SendEmail = async ({ dynamicTemplateData, to, from }) => {
	try {
		const command = new SendTemplatedEmailCommand({
			Destination: { ToAddresses: [to] },
			Source: `SampleKit <${from ?? EMAIL_DEFAULT_SENDER}>`,
			Template: dynamicTemplateData.templateId,
			TemplateData: JSON.stringify({ ...dynamicTemplateData, PUBLIC_ORIGIN }),
		});

		await getSES().send(command);
		return { transportErr: false };
	} catch (err) {
		logger.error(err);
		return { transportErr: true };
	}
};
