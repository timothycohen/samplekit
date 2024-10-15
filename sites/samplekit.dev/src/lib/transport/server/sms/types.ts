export type Props = { phoneNumber: string; body: string };

export type SendSMS = ({ phoneNumber, body }: Props) => Promise<{
	transportErr: boolean;
}>;
