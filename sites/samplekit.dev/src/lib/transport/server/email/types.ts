export type Props = {
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

export type SendEmail = ({ dynamicTemplateData, to, from }: Props) => Promise<{
	transportErr: boolean;
}>;
