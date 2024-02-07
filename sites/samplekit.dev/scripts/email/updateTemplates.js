import fs from 'fs';
import { SESClient, UpdateTemplateCommand } from '@aws-sdk/client-ses';

/**
 * @typedef {Object} EmailTemplate
 * @property {string} name
 * @property {string} location
 * @property {string} TextPart
 */

/**
 * @type {EmailTemplate[]}
 */
const templates = [];

const IAM_ACCESS_KEY_ID = process.env['IAM_ACCESS_KEY_ID'];
const IAM_SECRET_ACCESS_KEY = process.env['IAM_SECRET_ACCESS_KEY'];
const AWS_SERVICE_REGION = process.env['AWS_SERVICE_REGION'];

if (!IAM_ACCESS_KEY_ID) throw new Error('IAM_ACCESS_KEY_ID is not defined (are you running with env-cmd?)');
if (!IAM_SECRET_ACCESS_KEY) throw new Error('IAM_SECRET_ACCESS_KEY is not defined (are you running with env-cmd?)');
if (!AWS_SERVICE_REGION) throw new Error('AWS_SERVICE_REGION is not defined (are you running with env-cmd?)');

const ses = new SESClient({
	region: AWS_SERVICE_REGION,
	credentials: { accessKeyId: IAM_ACCESS_KEY_ID, secretAccessKey: IAM_SECRET_ACCESS_KEY },
});

// Templates:
// https://mc.sendgrid.com/design-library/your-designs
// https://stripo.email/templates/
// https://www.litmus.com/email-templates
// https://mjml.io/templates
// https://www.cerberusemail.com/templates

// https://docs.aws.amazon.com/ses/latest/dg/send-personalized-email-api.html
for (const template of templates) {
	const command = new UpdateTemplateCommand({
		Template: {
			TemplateName: template.name,
			HtmlPart: fs.readFileSync(template.location, 'utf8'),
			SubjectPart: '{{subject}}',
			TextPart: template.TextPart,
		},
	});

	const res = await ses.send(command);
	console.log(`${template.name}: ${res.$metadata.httpStatusCode}`);
}

ses.destroy();
