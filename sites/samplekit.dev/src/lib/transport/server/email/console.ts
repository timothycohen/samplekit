import { EMAIL_DEFAULT_SENDER } from '$env/static/private';
import type { SendEmail } from './types';

export const consoleLogEmail: SendEmail = async ({ dynamicTemplateData, to, from }) => {
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

	return { transportErr: false };
};
