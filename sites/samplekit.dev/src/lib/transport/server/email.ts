import { SESClient, SendTemplatedEmailCommand } from '@aws-sdk/client-ses';
import {
	AWS_SERVICE_REGION,
	EMAIL_DEFAULT_SENDER,
	IAM_ACCESS_KEY_ID,
	IAM_SECRET_ACCESS_KEY,
} from '$env/static/private';
import { PUBLIC_ORIGIN } from '$env/static/public';
import { logger, setupLogger } from '$lib/logging/server';
import { INTERCEPT_TRANSPORTS } from './consts';

const ses = new SESClient({
	region: AWS_SERVICE_REGION,
	credentials: { accessKeyId: IAM_ACCESS_KEY_ID, secretAccessKey: IAM_SECRET_ACCESS_KEY },
});
setupLogger.info('SESClient created.');

type Props = {
	from?: string;
	to: string;
	dynamicTemplateData: {
		subject: string;
		header: string;
		body: string;
		button_text: string;
		href: string;
		templateId: 'authEmails';
		PUBLIC_ORIGIN?: string;
	};
};

const log = ({ from, to, dynamicTemplateData }: Props) => {
	// eslint-disable-next-line no-console
	console.info(`
From: SampleKit <${from ?? EMAIL_DEFAULT_SENDER}>
To: ${to}
Subject: ${dynamicTemplateData.subject}
Header: ${dynamicTemplateData.header}
Body: ${dynamicTemplateData.body}
Button Text: ${dynamicTemplateData.button_text}
Button Link: ${dynamicTemplateData.href}
Template ID: ${dynamicTemplateData.templateId}
`);
};

const safeSend = async ({ from, to, dynamicTemplateData }: Props): Promise<{ transportErr: boolean }> => {
	try {
		const command = new SendTemplatedEmailCommand({
			Destination: { ToAddresses: [to] },
			Source: `SampleKit <${from ?? EMAIL_DEFAULT_SENDER}>`,
			Template: dynamicTemplateData.templateId,
			TemplateData: JSON.stringify({ ...dynamicTemplateData, PUBLIC_ORIGIN }),
		});

		await ses.send(command);
		return { transportErr: false };
	} catch (err) {
		logger.error(err);
		return { transportErr: true };
	}
};

export const sendEmail = async (props: Props): Promise<{ transportErr: boolean }> => {
	if (INTERCEPT_TRANSPORTS) {
		log(props);
		return { transportErr: false };
	}
	return await safeSend(props);
};
